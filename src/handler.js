'use strict';

const crypto = require('crypto');
const { getSession, updateSession, clearSession } = require('./sessions');
const { sendText, sendButtons } = require('./whatsapp');
const { appendRequisition, updateRequisitionStatus, getRequisition, listUsers } = require('./sheets');

// ─────────────────────────────────────────────────────────────────────────────
// Admin & User Configuration
// ─────────────────────────────────────────────────────────────────────────────

const getAdmins = () => ({
    PRIMARY: (process.env.PRIMARY_ADMIN || '').trim(),
    PH_1: (process.env.PH_ADMIN_1 || '').trim(),
    PH_2: (process.env.PH_ADMIN_2 || '').trim(),
    ABUJA_1: (process.env.ABUJA_ADMIN_1 || '').trim(),
    ABUJA_2: (process.env.ABUJA_ADMIN_2 || '').trim(),
});

function sanitizePhone(raw) {
    if (!raw) return '';
    // Handle Baileys JID or plain phone
    return String(raw).split('@')[0].replace(/\D/g, '');
}

function getAdminRole(phone) {
    const cleanPhone = sanitizePhone(phone);
    const admins = getAdmins();

    if (cleanPhone === sanitizePhone(admins.PRIMARY)) return { role: 'PRIMARY', label: 'Primary Admin' };
    if (cleanPhone === sanitizePhone(admins.PH_1) || cleanPhone === sanitizePhone(admins.PH_2)) 
        return { role: 'REGIONAL', label: 'Admin (Port Harcourt)' };
    if (cleanPhone === sanitizePhone(admins.ABUJA_1) || cleanPhone === sanitizePhone(admins.ABUJA_2)) 
        return { role: 'REGIONAL', label: 'Admin (Abuja)' };
    
    return null;
}

function isAdmin(phone) {
    return getAdminRole(phone) !== null;
}

/**
 * Parse Baileys message structure.
 */
function parseMessage(m) {
    try {
        const from = m.key.remoteJid;
        const fromMe = m.key.fromMe;
        if (fromMe || !from) return null;

        const type = Object.keys(m.message || {})[0];
        let text = '';

        if (type === 'conversation') {
            text = m.message.conversation;
        } else if (type === 'extendedTextMessage') {
            text = m.message.extendedTextMessage.text;
        } else if (type === 'buttonsResponseMessage') {
            text = m.message.buttonsResponseMessage.selectedDisplayText;
        } else if (type === 'templateButtonReplyMessage') {
            text = m.message.templateButtonReplyMessage.selectedId;
        }

        return { from, text: (text || '').trim(), type };
    } catch (err) {
        console.error('[parseMessage] Error:', err.message);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin flows
// ─────────────────────────────────────────────────────────────────────────────

async function handleAdminMessage(from, text) {
    const lower = (text || '').toLowerCase().trim();
    const admin = getAdminRole(from);

    const approveMatch = lower.match(/(?:done|approve|approved)\s+(req-[a-z0-9-]+)/i);
    const sentMatch = lower.match(/sent\s+(req-[a-z0-9-]+)/i);

    if (approveMatch) {
        const requestId = approveMatch[1].toUpperCase();
        
        if (admin.role === 'REGIONAL') {
            try {
                const reqData = await getRequisition(requestId);
                if (!reqData) return await sendText(from, `⚠️ Request *${requestId}* not found.`);

                const status = `Approved (${admin.label})`;
                const updated = await updateRequisitionStatus(requestId, status);
                if (updated) {
                    await sendText(from, `✅ Requisition *${requestId}* approved and forwarded to Primary Admin.`);
                    
                    const admins = getAdmins();
                    if (admins.PRIMARY) {
                        const info = `🔔 *Approval Alert*\n*ID:* ${requestId}\n*By:* ${admin.label}\n*Amt:* ${reqData.amount}\n*For:* ${reqData.purpose}`;
                        await sendButtons(admins.PRIMARY, info, `sent ${requestId}`, `Cancel ${requestId}`);
                    }
                }
            } catch (err) {
                console.error('[Admin] Approval error:', err.message);
            }
        } else if (admin.role === 'PRIMARY') {
            await handleSentAction(from, requestId);
        }
        return;
    }

    if (sentMatch) {
        if (admin.role !== 'PRIMARY') return await sendText(from, '⛔ Only Primary Admin can finalize.');
        await handleSentAction(from, sentMatch[1].toUpperCase());
        return;
    }

    // Handle Intercompany Chat Command
    if (lower.startsWith('/chat')) {
        await handleIntercompanyChat(from, text);
        return;
    }

    let help = '👋 *ViKLAR Admin Panel*\n\n';
    if (admin.role === 'REGIONAL') help += 'Reply with:\n`done REQ-XXXX` to approve.\n\n';
    else help += 'Reply with:\n`sent REQ-XXXX` when paid.\n\n';
    
    help += '🚀 *New Features:*\n';
    help += '`/chat [message]` - Broadcast to all employees.';
    
    await sendText(from, help);
}

async function handleSentAction(from, requestId) {
    try {
        const reqData = await getRequisition(requestId);
        if (!reqData) return await sendText(from, `⚠️ Request *${requestId}* not found.`);

        const updated = await updateRequisitionStatus(requestId, 'Funds Sent');
        if (updated) {
            await sendText(from, `💰 Requisition *${requestId}* finalized.`);
            if (reqData.phone) await sendText(reqData.phone, `✅ *Payment Sent*\nYour requisition *${requestId}* has been paid.`);
            
            const admins = getAdmins();
            const regionalGroup = [admins.PH_1, admins.PH_2, admins.ABUJA_1, admins.ABUJA_2].filter(p => !!p);
            for (const p of regionalGroup) {
                await sendText(p, `✅ *Finalized*\nREQ- ${requestId} was paid.`);
            }
        }
    } catch (err) {
        console.error('[Admin] Sent error:', err.message);
    }
}

/**
 * Handle /chat [message] command for broadcasting.
 */
async function handleIntercompanyChat(from, fullText) {
    const message = fullText.slice(5).trim();
    if (!message) {
        return await sendText(from, '📝 Usage: `/chat [message]`\nExample: `/chat Hi team, meeting at 3pm`');
    }

    try {
        const users = await listUsers();
        const admin = getAdminRole(from);
        const senderLabel = admin ? admin.label : sanitizePhone(from);

        let sentCount = 0;
        for (const user of users) {
            if (sanitizePhone(user.phone) !== sanitizePhone(from)) {
                try {
                    await sendText(user.phone, `📨 *Internal Message [${senderLabel}]*\n\n${message}`);
                    sentCount++;
                } catch (e) {
                    console.warn(`[Chat] Failed to send to ${user.phone}`);
                }
            }
        }

        await sendText(from, `✅ Message broadcasted to ${sentCount} employees.`);
    } catch (err) {
        console.error('[Chat] Error:', err.message);
        await sendText(from, '❌ Failed to broadcast message.');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Requester flow
// ─────────────────────────────────────────────────────────────────────────────

async function handleRequesterMessage(from, text) {
    const phone = sanitizePhone(from);
    const session = await getSession(phone);

    switch (session.step) {
        case 'GREETING':
        case 'DONE': {
            if (session.step === 'DONE') await clearSession(phone);
            await sendText(from, '👋 Welcome to *Viklar Requisition Bot*!\n\nEnter your *Persona Name*:');
            await updateSession(phone, { step: 'AWAIT_PERSONA' });
            break;
        }
        case 'AWAIT_PERSONA': {
            if (!text) return;
            await updateSession(phone, { persona: text, step: 'AWAIT_PURPOSE' });
            await sendText(from, `✅ Persona: *${text}*\n\nEnter the *Purpose*:`);
            break;
        }
        case 'AWAIT_PURPOSE': {
            if (!text) return;
            await updateSession(phone, { purpose: text, step: 'AWAIT_AMOUNT' });
            await sendText(from, `✅ Purpose noted.\n\nEnter the *Amount*:`);
            break;
        }
        case 'AWAIT_AMOUNT': {
            const cleaned = (text || '').replace(/[^\d.]/g, '');
            if (!cleaned) return await sendText(from, '⚠️ Enter numbers only.');
            const formatted = `₦${Number(cleaned).toLocaleString()}`;
            await updateSession(phone, { amount: formatted, step: 'AWAIT_CONFIRM' });
            const s = await getSession(phone);
            const summary = `📋 *Requisition Summary*\n👤 *Persona:* ${s.persona}\n📌 *Purpose:* ${s.purpose}\n💰 *Amount:* ${formatted}\n\nIs this correct?`;
            await sendButtons(from, summary, 'Yes, Submit', 'No, Cancel');
            break;
        }
        case 'AWAIT_CONFIRM': {
            if (text.toLowerCase().includes('yes')) {
                const requestId = 'REQ-' + crypto.randomBytes(4).toString('hex').toUpperCase();
                const s = await getSession(phone);
                await updateSession(phone, { requestId, step: 'DONE' });
                await appendRequisition({ phone, persona: s.persona, purpose: s.purpose, amount: s.amount, requestId });
                await sendText(from, `🎉 Submitted! ID: *${requestId}*`);
                await notifyAdmins(phone, s.persona, s.purpose, s.amount, requestId);
            } else {
                await clearSession(phone);
                await sendText(from, '❌ Cancelled.');
            }
            break;
        }
        default:
            await clearSession(phone);
            await sendText(from, '🔄 Reset. Send anything to start.');
    }
}

async function notifyAdmins(requesterPhone, persona, purpose, amount, requestId) {
    const admins = getAdmins();
    const allAdmins = [admins.PRIMARY, admins.PH_1, admins.PH_2, admins.ABUJA_1, admins.ABUJA_2].filter(p => !!p);
    const msg = `🔔 *New Requisition Alert*\n📞 *Requester:* +${requesterPhone}\n👤 *Persona:* ${persona}\n📌 *Purpose:* ${purpose}\n💰 *Amount:* ${amount}\n🔖 *ID:* ${requestId}`;

    for (const p of allAdmins) {
        try {
            await sendButtons(p, msg, `done ${requestId}`, `Reject ${requestId}`);
        } catch (err) {
            console.error(`[Notify] Failed for ${p}:`, err.message);
        }
    }
}

/**
 * Main entry point for Baileys incoming messages.
 */
async function handleWebhook(m, sock) {
    try {
        const parsed = parseMessage(m);
        if (!parsed) return;
        const { from, text } = parsed;

        if (isAdmin(from)) {
            await handleAdminMessage(from, text || '');
        } else {
            await handleRequesterMessage(from, text);
        }
    } catch (err) {
        console.error('[handleIncoming] Error:', err.message);
    }
}

module.exports = { handleWebhook };
