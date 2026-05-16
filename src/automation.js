'use strict';

const cron = require('node-cron');
const { listAutomatedMessages, listUsers } = require('./sheets');
const { sendText } = require('./whatsapp');

/**
 * Initialize automated message scheduling.
 */
function initAutomation() {
    console.log('⏰ Initializing Automation System...');

    // Every minute check for scheduled messages
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const currentDay = dayNames[now.getDay()];
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            const messages = await listAutomatedMessages();
            const users = await listUsers();

            for (const msg of messages) {
                if (msg.status !== 'Active') continue;

                let shouldSend = false;

                if (msg.frequency === 'Daily') {
                    shouldSend = (msg.time === currentTime);
                } else if (msg.frequency === 'Weekly') {
                    shouldSend = (msg.day === currentDay && msg.time === currentTime);
                }

                if (shouldSend) {
                    console.log(`[Automation] Sending scheduled message: ${msg.name}`);
                    
                    const recipients = users.filter(u => {
                        if (msg.recipient === 'All') return true;
                        return u.department === msg.recipient || u.role === msg.recipient;
                    });

                    for (const user of recipients) {
                        try {
                            const customized = msg.message.replace('{name}', user.name);
                            await sendText(user.phone, `⏰ *Automated Reminder*\n\n${customized}`);
                        } catch (e) {
                            console.warn(`[Automation] Failed for ${user.phone}:`, e.message);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[Automation] Error:', err.message);
        }
    });
}

module.exports = { initAutomation };
