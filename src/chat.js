const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'chat.json');

// Ensure data file exists
function initChatDB() {
    if (!fs.existsSync(DATA_FILE)) {
        if (!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE));
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify({ messages: [] }, null, 2));
    }
}

initChatDB();

/**
 * Gets all messages between two users
 */
function getMessages(user1, user2) {
    initChatDB();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    // Fetch messages where both users are involved
    const conversation = data.messages.filter(m => 
        (m.sender === user1 && m.recipient === user2) || 
        (m.sender === user2 && m.recipient === user1)
    );
    
    return conversation;
}

/**
 * Gets all recent chats for a user to display in the chat list
 */
function getRecentChats(userId) {
    initChatDB();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const recent = {};
    
    data.messages.forEach(m => {
        if (m.sender === userId || m.recipient === userId) {
            const otherUser = m.sender === userId ? m.recipient : m.sender;
            
            // Keep the latest message
            if (!recent[otherUser] || new Date(m.timestamp) > new Date(recent[otherUser].timestamp)) {
                recent[otherUser] = m;
            }
        }
    });
    
    // Convert to array and sort by time desc
    return Object.values(recent).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Sends a message
 */
function sendMessage(sender, recipient, content, attachmentUrl = null, attachmentType = null) {
    initChatDB();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const newMessage = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        sender,
        recipient,
        content,
        attachmentUrl,
        attachmentType, // 'image', 'video', 'audio', 'file'
        timestamp: new Date().toISOString(),
        read: false
    };
    
    data.messages.push(newMessage);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    return newMessage;
}

/**
 * Mark messages from sender to recipient as read
 */
function markAsRead(sender, recipient) {
    initChatDB();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let updated = false;
    
    data.messages.forEach(m => {
        if (m.sender === sender && m.recipient === recipient && !m.read) {
            m.read = true;
            updated = true;
        }
    });
    
    if (updated) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    }
}

module.exports = {
    getMessages,
    getRecentChats,
    sendMessage,
    markAsRead
};
