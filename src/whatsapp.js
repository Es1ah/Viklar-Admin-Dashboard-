'use strict';

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');

let sock = null;

/**
 * Initialize WhatsApp connection using Baileys.
 * This will handle QR code generation and session management.
 */
async function connectWhatsApp(handleIncomingMessage) {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth_info_baileys'));

    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
        browser: ['ViKLAR Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n⚠️  ACTION REQUIRED: Scan the QR code below with your WhatsApp (MTN SIM phone):');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? 
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
            
            console.log('🔄 Connection closed. Reason:', lastDisconnect.error?.message, 'Reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                connectWhatsApp(handleIncomingMessage);
            }
        } else if (connection === 'open') {
            console.log('\n✅ ViKLAR Bot Connected - MTN SIM Ready');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
            for (const msg of m.messages) {
                if (!msg.key.fromMe && handleIncomingMessage) {
                    await handleIncomingMessage(msg, sock);
                }
            }
        }
    });

    return sock;
}

/**
 * Send a plain-text message.
 */
async function sendText(to, text) {
    if (!sock) throw new Error('WhatsApp socket not initialized.');
    const jid = to.includes('@') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
}

/**
 * Send interactive buttons.
 */
async function sendButtons(to, bodyText, btn1Title, btn2Title) {
    if (!sock) throw new Error('WhatsApp socket not initialized.');
    const jid = to.includes('@') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
    
    // Note: Baileys interactive buttons are sometimes tricky depending on the WhatsApp version.
    // Using a simpler template message or just plain text with instructions if buttons fail.
    try {
        await sock.sendMessage(jid, {
            text: `${bodyText}\n\n1️⃣ ${btn1Title}\n2️⃣ ${btn2Title}`,
            footer: 'ViKLAR Requisition Bot'
        });
    } catch (err) {
        console.error('[WhatsApp] Failed to send buttons:', err.message);
        await sendText(jid, `${bodyText}\n\nType "${btn1Title}" or "${btn2Title}" to respond.`);
    }
}

module.exports = { connectWhatsApp, sendText, sendButtons };
