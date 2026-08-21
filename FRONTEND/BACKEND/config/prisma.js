const DEFAULT_DATABASE_URL = "mysql://brmy4429_usertest:UMy%5E%40cbv_7%5Ec%248%26t@202.10.43.84:3306/brmy4429_brmp_db";
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

const { PrismaClient } = require('@prisma/client');
const config = require('./env');

// Inisialisasi Prisma Client (Singleton) dengan fallback URL hosting langsung
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    },
  },
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;

