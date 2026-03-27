const express = require('express');
const { handleWebhook } = require('../src/handler');
const mainApp = require('../index'); // Import the full dashboard application

const app = express();
app.use(express.json());

// 1. Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2. Webhook Handler
app.post('/webhook', async (req, res) => {
  await handleWebhook(req, res);
});

// 3. Fallback to Dashboard
app.all('*', (req, res) => {
  return mainApp(req, res);
});

// For Vercel Serverless
module.exports = app;
