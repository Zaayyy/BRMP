const prisma = require('../config/prisma');

module.exports = {
  prisma,
  // Helper shortcuts untuk setiap model
  User: prisma.user,
  Benih: prisma.benih,
  LabTracking: prisma.labTracking,
  Pengaduan: prisma.pengaduan,
};
