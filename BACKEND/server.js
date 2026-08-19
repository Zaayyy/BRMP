const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const { corsOptions, allowedOrigins } = require('./config/cors');
const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. Security Headers Middleware (Helmet)
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS) Middleware
app.use(cors(corsOptions));

// 3. Request Logging Middleware (Morgan)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BRMP DIY Backend Server is Active',
    docs: '/api',
  });
});

// 6. API Routes
app.use('/api', apiRoutes);

// 7. 404 Handler & Global Error Handler
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 BRMP DIY Server running on port ${PORT}`);
  console.log(`🌱 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Allowed CORS Origins:`);
  allowedOrigins.forEach((origin) => console.log(`   - ${origin}`));
  console.log(`=========================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
