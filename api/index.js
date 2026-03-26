const express = require('express');
const app = express();
const { handleWebhook } = require('../src/handler');

app.use(express.json());

// Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Webhook Handler
app.post('/webhook', async (req, res) => {
  await handleWebhook(req, res);
});

// For Vercel Serverless
module.exports = app;
