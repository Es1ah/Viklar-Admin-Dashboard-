# Viklar Requisition Bot 🤖

A WhatsApp Cloud API chatbot that lets employees submit requisitions through WhatsApp and automatically logs them to Google Sheets, with instant admin notifications and approval.

---

## Project Structure

```
Viklar Bot/
├── index.js              ← Express server + webhook routes
├── src/
│   ├── handler.js        ← Core conversation & admin logic
│   ├── sessions.js       ← In-memory session store
│   ├── whatsapp.js       ← WhatsApp Cloud API helpers
│   └── sheets.js         ← Google Sheets append/update helpers
├── .env.example          ← Copy to .env and fill in values
├── .gitignore
└── package.json
```

---

## Setup Guide

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd "Viklar Bot"
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in all values:
```bash
cp .env.example .env
```

| Variable | Where to get it |
|---|---|
| `WHATSAPP_TOKEN` | Meta Developer Portal → System User → Permanent Token |
| `PHONE_NUMBER_ID` | Meta Developer App → WhatsApp → API Setup |
| `VERIFY_TOKEN` | Any string you choose (used to verify webhook) |
| `ADMIN_PHONE` | Admin's number in E.164 without `+` e.g. `2348012345678` |
| `GOOGLE_SHEETS_ID` | From the Sheet URL: `/spreadsheets/d/<ID>/edit` |
| `GOOGLE_CREDENTIALS` | Paste the full JSON content of your Service Account key as a single-line string |

### 3. Google Sheets Setup
1. Create a new Google Sheet with these **exact column headers** in row 1:
   ```
   Timestamp | Requester Phone | Persona | Purpose | Amount | Status | Request ID
   ```
2. Go to [Google Cloud Console](https://console.cloud.google.com) → Create Project
3. Enable **Google Sheets API**
4. Create a **Service Account** → Download JSON key
5. **Share the sheet** with the Service Account email (give it **Editor** access)
6. Paste the JSON key content into `GOOGLE_CREDENTIALS` in your `.env`

### 4. Meta (WhatsApp) Setup
1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → Business
2. Add **WhatsApp** product
3. Under API Setup, note your **Phone Number ID**
4. Create a **System User** with `whatsapp_business_messaging` permission → Generate permanent token
5. In the Webhook config, set URL to `https://<your-domain>/webhook` and verify token to match `VERIFY_TOKEN`
6. Subscribe to the **messages** field

### 5. Local Development with Ngrok
```bash
# Terminal 1 — start the bot
npm run dev

# Terminal 2 — expose local server
ngrok http 3000
```
Copy the Ngrok HTTPS URL and paste it as your Webhook URL in the Meta Dashboard.

### 6. Production Deployment
```bash
# Push to GitHub then deploy on Heroku/Railway/Render
heroku create viklar-bot
heroku config:set WHATSAPP_TOKEN=... PHONE_NUMBER_ID=... # etc.
git push heroku main
```
Update the Meta Webhook URL to your live domain.

---

## Conversation Flow

```
Employee → "Hi"
Bot      → "Enter your Persona Name"
Employee → "Finance Dept"
Bot      → "Enter Purpose"
Employee → "Office Supplies"
Bot      → "Enter Amount"
Employee → "25000"
Bot      → [Summary card + Yes/No buttons]
Employee → ✅ Yes, Submit
Bot      → "Request logged! ID: REQ-A1B2C3"
Admin    ← "New Requisition Alert with all details"
```

**Admin approves:**
```
Admin → "done REQ-A1B2C3"
Bot   → "Requisition marked as Completed ✅"
```

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with hot-reload (Node 18+ watch mode) |
