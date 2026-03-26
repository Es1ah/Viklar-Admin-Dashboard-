'use strict';

const { v4: uuidv4 } = require('uuid');
const { getSession, updateSession, clearSession } = require('./sessions');
const { sendText, sendButtons } = require('./whatsapp');
const { appendRequisition, updateRequisitionStatus, getRequisition } = require('./sheets');

// ─────────────────────────────────────────────────────────────────────────────
// Admin Configuration
// ─────────────────────────────────────────────────────────────────────────────

const getAdmins = () => ({
    PRIMARY: (process.env.PRIMARY_ADMIN || '').trim(),
    PH_1: (process.env.PH_ADMIN_1 || '').trim(),
    PH_2: (process.env.PH_ADMIN_2 || '').trim(),
    ABUJA_1: (process.env.ABUJA_ADMIN_1 || '').trim(),
    ABUJA_2: (process.env.ABUJA_ADMIN_2 || '').trim(),
});

function sanitizePhone(raw) {
    return String(raw).replace(/\D/g, '');
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseMessage(body) {
    try {
        // WATI sends a flatter structure than Meta
        const from = sanitizePhone(body.waId || body.from || '');
        const text = (body.text || '').trim();
        const type = body.type || 'text';
        const msgId = body.id || '';

        if (!from) return null;

        // For WATI, button replies often come as 'text' type with the button label
        // We'll treat the text as the primary signal.
        return { from, type, text, msgId };
    } catch (err) {
        console.error('[parseMessage] WATI Parse Error:', err.message);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin flows
// ─────────────────────────────────────────────────────────────────────────────

async function handleAdminMessage(from, text) {
    const lower = (text || '').toLowerCase().trim();
    const admin = getAdminRole(from);

    // WATI Buttons return the button label as the text.
    // However, we still need the REQ-XXXX ID. 
    // Usually, admins will type "done REQ-XXXX" or click a button IF we can embed the ID.
    // If the button text is just "Approve", we might need to store the "Current Request" in session.
    // For simplicity, we'll suggest admins reply with the command or we include the ID in the button text.

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

    let help = '👋 *ViKLAR Admin Panel*\n\n';
    if (admin.role === 'REGIONAL') help += 'Reply with:\n`done REQ-XXXX` to approve.';
    else help += 'Reply with:\n`sent REQ-XXXX` when paid.';
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

// ─────────────────────────────────────────────────────────────────────────────
// Requester flow
// ─────────────────────────────────────────────────────────────────────────────

async function handleRequesterMessage(from, text) {
    const session = await getSession(from);

    switch (session.step) {
        case 'GREETING':
        case 'DONE': {
            if (session.step === 'DONE') await clearSession(from);
            await sendText(from, '👋 Welcome to *Viklar Requisition Bot*!\n\nEnter your *Persona Name*:');
            await updateSession(from, { step: 'AWAIT_PERSONA' });
            break;
        }
        case 'AWAIT_PERSONA': {
            if (!text) return;
            await updateSession(from, { persona: text, step: 'AWAIT_PURPOSE' });
            await sendText(from, `✅ Persona: *${text}*\n\nEnter the *Purpose*:`);
            break;
        }
        case 'AWAIT_PURPOSE': {
            if (!text) return;
            await updateSession(from, { purpose: text, step: 'AWAIT_AMOUNT' });
            await sendText(from, `✅ Purpose noted.\n\nEnter the *Amount*:`);
            break;
        }
        case 'AWAIT_AMOUNT': {
            const cleaned = (text || '').replace(/[^\d.]/g, '');
            if (!cleaned) return await sendText(from, '⚠️ Enter numbers only.');
            const formatted = `₦${Number(cleaned).toLocaleString()}`;
            await updateSession(from, { amount: formatted, step: 'AWAIT_CONFIRM' });
            const s = await getSession(from);
            const summary = `📋 *Requisition Summary*\n👤 *Persona:* ${s.persona}\n📌 *Purpose:* ${s.purpose}\n💰 *Amount:* ${formatted}\n\nIs this correct?`;
            await sendButtons(from, summary, 'Yes, Submit', 'No, Cancel');
            break;
        }
        case 'AWAIT_CONFIRM': {
            if (text.toLowerCase().includes('yes')) {
                const requestId = 'REQ-' + uuidv4().split('-')[0].toUpperCase();
                const s = await getSession(from);
                await updateSession(from, { requestId, step: 'DONE' });
                await appendRequisition({ phone: from, persona: s.persona, purpose: s.purpose, amount: s.amount, requestId });
                await sendText(from, `🎉 Submitted! ID: *${requestId}*`);
                await notifyAdmins(from, s.persona, s.purpose, s.amount, requestId);
            } else {
                await clearSession(from);
                await sendText(from, '❌ Cancelled.');
            }
            break;
        }
        default:
            await clearSession(from);
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

async function handleWebhook(req, res) {
    try {
        await handleIncoming(req.body);
        if (!res.headersSent) res.sendStatus(200);
    } catch (err) {
        console.error('[handleWebhook] Error:', err.message);
        if (!res.headersSent) res.status(500).send(err.message);
    }
}

async function handleIncoming(body) {
    const parsed = parseMessage(body);
    if (!parsed) return;
    const { from, text } = parsed;

    if (isAdmin(from)) {
        await handleAdminMessage(from, text || '');
    } else {
        await handleRequesterMessage(from, text);
    }
}

module.exports = { handleWebhook };
