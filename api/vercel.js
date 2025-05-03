// Serverless function entry point for Vercel deployment
const app = require('./index');

// Export for Vercel serverless deployment
module.exports = (req, res) => {
  // This is a catch-all handler
  app(req, res);
}; 