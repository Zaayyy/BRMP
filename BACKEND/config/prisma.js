const { PrismaClient } = require('@prisma/client');
const config = require('./env');

// Inisialisasi Prisma Client (Singleton)
const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
