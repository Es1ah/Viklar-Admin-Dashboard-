'use strict';

const { google } = require('googleapis');
const fs = require('fs');

/**
 * Upload a file to a specific Google Drive folder.
 */
async function uploadToDrive(filePath, fileName, mimeType) {
    try {
        const raw = (process.env.GOOGLE_CREDENTIALS || '').trim();
        const credentials = JSON.parse(raw);
        
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Ensure this is in .env
        };

        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath),
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        console.log(`[Drive] File uploaded: ${file.data.id}`);
        return file.data.webViewLink;
    } catch (err) {
        console.error('[Drive] Upload Error:', err.message);
        throw err;
    }
}

module.exports = { uploadToDrive };
