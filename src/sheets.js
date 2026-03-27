'use strict';

const { google } = require('googleapis');

const SHEET_NAME = 'Sheet1'; // Change if your tab has a different name

/**
 * Build an authorized Sheets client from the GOOGLE_CREDENTIALS env var.
 */
function getSheetsClient() {
  try {
    let raw = (process.env.GOOGLE_CREDENTIALS || '').trim();
    
    // Auto-repair missing braces (common paste error)
    if (raw && !raw.startsWith('{')) raw = '{' + raw;
    if (raw && !raw.endsWith('}')) raw = raw + '}';

    const credentials = JSON.parse(raw);
    
    // Ensure the private key handles newlines correctly
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  } catch (err) {
    console.error('[Sheets] CRITICAL: Failed to parse GOOGLE_CREDENTIALS.', err.message);
    throw new Error('GOOGLE_CREDENTIALS_PARSE_FAILED: ' + err.message);
  }
}

/**
 * Append a new requisition row.
 * Columns: Timestamp | Requester Phone | Persona | Purpose | Amount | Status | Request ID
 *
 * @param {object} data
 * @param {string} data.phone
 * @param {string} data.persona
 * @param {string} data.purpose
 * @param {string} data.amount
 * @param {string} data.requestId
 * @returns {Promise<void>}
 */
async function appendRequisition({ phone, persona, purpose, amount, requestId }) {
  const sheets = getSheetsClient();
  const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${SHEET_NAME}!A:G`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[timestamp, phone, persona, purpose, amount, 'Pending', requestId]],
    },
  });

  console.log(`[Sheets] Appended row for request ${requestId}`);
}

/**
 * Update the Status column of the row matching a given Request ID.
 *
 * @param {string} requestId
 * @param {string} status The new status value (e.g. 'Completed', 'Approved', 'Funds Sent')
 * @returns {Promise<boolean>} true if found and updated, false otherwise
 */
async function updateRequisitionStatus(requestId, status) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  // Read all Request IDs (column G)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!G:G`,
  });

  const rows = res.data.values || [];
  let targetRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === requestId) {
      targetRow = i + 1; // 1-indexed
      break;
    }
  }

  if (targetRow === -1) {
    console.warn(`[Sheets] Request ID ${requestId} not found.`);
    return false;
  }

  // Update Status column (F = column 6)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!F${targetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status]] },
  });

  console.log(`[Sheets] Marked row ${targetRow} (${requestId}) as ${status}.`);
  return true;
}

/**
 * Fetch a single requisition by ID.
 *
 * @param {string} requestId
 * @returns {Promise<object|null>}
 */
async function getRequisition(requestId) {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A:G`,
    });

    const rows = res.data.values || [];
    const row = rows.find(r => r[6] === requestId);
    if (!row) return null;

    return {
        timestamp: row[0] || '',
        phone: row[1] || '',
        persona: row[2] || '',
        purpose: row[3] || '',
        amount: row[4] || '',
        status: row[5] || '',
        requestId: row[6] || '',
    };
}

/**
 * Fetch all requisitions from Google Sheets.
 *
 * @returns {Promise<Array<object>>}
 */
async function listRequisitions() {
    try {
        const sheets = getSheetsClient();
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:G`,
        });

        const rows = res.data.values || [];
        if (rows.length === 0) return [];

        // Assuming headers are in row 1
        const headers = rows[0];
        const dataRows = rows.slice(1);

        return dataRows.map(row => ({
            timestamp: row[0] || '',
            phone: row[1] || '',
            persona: row[2] || '',
            purpose: row[3] || '',
            amount: row[4] || '',
            status: row[5] || '',
            requestId: row[6] || '',
        })).reverse(); // latest first
    } catch (err) {
        console.error('[Sheets] listRequisitions error:', err.message);
        return [];
    }
}

module.exports = { appendRequisition, updateRequisitionStatus, listRequisitions, getRequisition };
