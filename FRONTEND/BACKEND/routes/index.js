const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const publicRoutes = require('./publicRoutes');
const internalRoutes = require('./internalRoutes');

// Root API welcome endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BRMP DIY API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      public: '/api/public',
      internal: '/api/internal',
    },
  });
});

// Register modular sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/internal', internalRoutes);

module.exports = router;
