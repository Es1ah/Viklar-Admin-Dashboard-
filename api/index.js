'use strict';

// Require the main application file (index.js).
// Since it exports the 'app' instance, Vercel will use it as the entry point.
const app = require('../index');

// Vercel serverless functions must export the Express app
module.exports = app;
