'use strict';

const axios = require('axios');

// WATI uses a different base URL structure
// Note: Some WATI regions use local URLs like https://api.wati.io/
const BASE_URL = `https://api.wati.io/api/v1`;

/**
 * Low-level POST to the WATI API.
 */
async function callWATI(endpoint, payload, params = {}) {
    const url = `${BASE_URL}/${endpoint}`;
    try {
        const res = await axios.post(url, payload, {
            params,
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    } catch (err) {
        const msg = err.response?.data || err.message;
        console.error('[WATI API Error]', JSON.stringify(msg, null, 2));
        throw err;
    }
}

/**
 * Send a plain-text session message.
 * @param {string} to   Recipient phone without '+'
 * @param {string} text Message body
 */
async function sendText(to, text) {
    return callWATI(`sendSessionMessage/${to}`, {
        messageText: text
    });
}

/**
 * Send interactive buttons.
 * @param {string} to
 * @param {string} bodyText   Main message body
 * @param {string} btn1Title  Label for button 1
 * @param {string} btn2Title  Label for button 2
 */
async function sendButtons(to, bodyText, btn1Title, btn2Title) {
    // WATI uses a slightly different endpoint for interactive buttons
    return callWATI(`sendInteractiveButtonsMessage`, {
        body: bodyText,
        buttons: [
            { text: btn1Title },
            { text: btn2Title }
        ]
    }, { whatsappNumber: to });
}

module.exports = { sendText, sendButtons };
