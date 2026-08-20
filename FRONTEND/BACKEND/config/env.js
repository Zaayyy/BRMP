const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    publicUrl: process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000',
    internalUrl: process.env.FRONTEND_INTERNAL_URL || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret_brmp_diy_jwt_key_2026_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};

module.exports = config;
