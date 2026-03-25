'use strict';

// Require the main application file
const app = require('../index');

// Vercel serverless functions must export the Express app
module.exports = app;
