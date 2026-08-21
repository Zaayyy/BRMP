const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_DATABASE_URL = "mysql://brmy4429_usertest:UMy%5E%40cbv_7%5Ec%248%26t@202.10.43.84:3306/brmy4429_brmp_db";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'production',
  databaseUrl: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  cors: {
    publicUrl: process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000',
    internalUrl: process.env.FRONTEND_INTERNAL_URL || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'brmp_secret_key_super_secure_2026_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};

module.exports = config;

