const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/prisma');

/**
 * Middleware untuk memverifikasi JWT dari Header Authorization
 * Format Header yang diharapkan: "Authorization: Bearer <token>"
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak valid.',
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Ambil data user terkini dari database untuk memastikan akun masih aktif
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna yang terkait dengan token ini tidak lagi ditemukan.',
      });
    }

    // Sematkan data user ke objek request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi telah berakhir (Token Expired). Silakan login kembali.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau telah dimodifikasi.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan verifikasi autentikasi.',
      error: error.message,
    });
  }
};

/**
 * Middleware Role-Based Access Control (RBAC)
 * Memastikan hanya role tertentu yang dapat mengakses endpoint
 * @param {...string} allowedRoles - Daftar role yang diizinkan (misal: 'Admin', 'PetugasLab')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan sebelum mengakses resource ini.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses terlarang. Role '${req.user.role}' tidak memiliki hak akses untuk resource ini.`,
        allowedRoles,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
