// Serverless function as fallback for root path
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Smartcar API is running',
    status: 'online',
    env: process.env.NODE_ENV || 'development'
  });
}; 