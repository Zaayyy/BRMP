const { PrismaClient } = require('@prisma/client');
const config = require('./env');

// Inisialisasi Prisma Client (Singleton) dengan fallback URL hosting langsung
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;

