'use strict';

/**
 * Clean Vercel Entry Point.
 * We simply export the main 'app' instance from index.js. 
 * This ensures that the Dashboard, Webhooks, and Settings all work in sync.
 */
const app = require('../index');

module.exports = app;
