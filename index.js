'use strict';

require('dotenv').config();

// Global Repair for Google Credentials
if (process.env.GOOGLE_CREDENTIALS) {
  let raw = process.env.GOOGLE_CREDENTIALS.trim();
  if (raw && !raw.startsWith('{')) raw = '{' + raw;
  if (raw && !raw.endsWith('}')) raw = raw + '}';
  process.env.GOOGLE_CREDENTIALS = raw;
}

const fs = require('fs');
const path = require('path');
const express = require('express');
const { connectWhatsApp, sendText, sendButtons } = require('./src/whatsapp');
const { handleWebhook } = require('./src/handler');
const { listRequisitions, listUsers, logAudit, appendRequisition } = require('./src/sheets');
const { initAutomation } = require('./src/automation');
const { authenticate } = require('./src/auth');
const { uploadToDrive } = require('./src/drive');
const chatDB = require('./src/chat');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Dashboard / Health Check ──────────────────────────────────────────────────
app.get('/', async (req, res) => {
    let requisitions = [];
    let error = null;

    try {
        if (process.env.GOOGLE_CREDENTIALS && process.env.GOOGLE_SHEETS_ID) {
            requisitions = await listRequisitions();
        }
    } catch (err) {
        error = err.message;
    }

    const renderDashboard = require('./src/dashboardView');
    const html = renderDashboard({ requisitions, env: process.env });
    res.send(html);
});

// ── API: Web Requisition (Quick Create) ──────────────────────────────────────
app.post('/api/requisition', upload.single('file'), async (req, res) => {
    try {
        const { purpose, amount, phone, persona } = req.body;
        let finalPurpose = purpose;
        
        if (req.file) {
            const fileLink = await uploadToDrive(req.file.path, `ReqImage_${Date.now()}_${phone}`, req.file.mimetype);
            fs.unlinkSync(req.file.path);
            finalPurpose += ` (Image Attached: ${fileLink})`;
        }

        const requestId = Math.floor(1000 + Math.random() * 9000).toString();
        
        await appendRequisition({
            phone: phone || 'Web User',
            persona: persona || 'Employee',
            purpose: finalPurpose,
            amount: amount,
            requestId: requestId
        });

        await logAudit(phone, 'Requisition', `Created web requisition for ${amount}`);
        res.json({ success: true, requestId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ── API: Job Forms (Upload) ──────────────────────────────────────────────────
app.post('/api/upload-form', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
        
        const { jobName, phone } = req.body;
        const fileLink = await uploadToDrive(req.file.path, `JobForm_${jobName}_${phone}`, req.file.mimetype);
        
        // Cleanup local temp file
        fs.unlinkSync(req.file.path);
        
        await logAudit(phone, 'Upload', `Uploaded job form for ${jobName}`);
        res.json({ success: true, link: fileLink });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Auth ──────────────────────────────────────────────────────────────
app.post('/api/auth', async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await authenticate(phone);
        if (user) {
            await logAudit(user.phone, 'Login', `User logged in as ${user.role}`);
            res.json(user);
        } else {
            res.status(401).json({ error: 'User not found or not authorized.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Users ──────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
    try {
        const users = await listUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Automated Messages ──────────────────────────────────────────────────
app.get('/api/automated-messages', async (req, res) => {
    try {
        const messages = await listAutomatedMessages();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Chat ──────────────────────────────────────────────────────────────
app.get('/api/chat/recent/:userId', (req, res) => {
    try {
        const chats = chatDB.getRecentChats(req.params.userId);
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/chat/:user1/:user2', (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = chatDB.getMessages(user1, user2);
        chatDB.markAsRead(user2, user1);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat', (req, res) => {
    try {
        const { sender, recipient, content } = req.body;
        if (!sender || !recipient || !content) return res.status(400).json({ error: 'Missing required fields' });
        
        const msg = chatDB.sendMessage(sender, recipient, content);
        res.json({ success: true, message: msg });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat/upload', upload.single('file'), async (req, res) => {
    try {
        const { sender, recipient, type } = req.body; // 'image', 'video', 'audio', 'file'
        if (!req.file || !sender || !recipient) return res.status(400).json({ error: 'Missing required fields' });
        
        const fileLink = await uploadToDrive(req.file.path, `Chat_${type}_${Date.now()}`, req.file.mimetype);
        fs.unlinkSync(req.file.path);
        
        const msg = chatDB.sendMessage(sender, recipient, '', fileLink, type || 'file');
        res.json({ success: true, message: msg });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Update Settings ─────────────────────────────────────────────────────
app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        const isServerless = !!process.env.VERCEL || !!process.env.AWS_REGION;

        if (!isServerless) {
            const envPath = path.join(__dirname, '.env');
            let envContent = '';
            for (const [key, value] of Object.entries(settings)) {
                envContent += `${key}=${value}\n`;
            }
            fs.writeFileSync(envPath, envContent);
        }
        
        for (const [key, value] of Object.entries(settings)) {
            process.env[key] = value;
        }

        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Webhook HANDLER (GET) - Verification
// ─────────────────────────────────────────────────────────────────────────────
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Webhook] Verification successful.');
        return res.status(200).send(challenge);
    }

    if (mode !== 'subscribe') {
        console.warn(`[Webhook] Verification failed. Mode mismatch. Expected 'subscribe', got '${mode}'.`);
    } else if (token !== VERIFY_TOKEN) {
        console.warn(`[Webhook] Verification failed. Token mismatch. Expected '${VERIFY_TOKEN}', got '${token}'.`);
    }

    return res.sendStatus(403);
});

// Webhook HANDLER (POST) - Messages
// ─────────────────────────────────────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
    try {
        await handleWebhook(req, res);
    } catch (err) {
        console.error('[POST /webhook] Error processing message:', err.message);
    }
});

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`\n🚀 ViKLAR Requisition Bot running on port ${PORT}`);
        console.log(`   Dashboard:   http://localhost:${PORT}/`);
        
        try {
            await connectWhatsApp(handleWebhook);
            initAutomation();
        } catch (err) {
            console.error('❌ Failed to initialize WhatsApp:', err.message);
        }
    });
}

module.exports = app;
