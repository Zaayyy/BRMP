// Controller untuk health check dan status server
const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BRMP DIY Backend API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = {
  getHealthStatus,
};
