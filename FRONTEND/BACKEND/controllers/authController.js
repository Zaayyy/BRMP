const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/prisma');

/**
 * Helper untuk men-generate JSON Web Token (JWT)
 * @param {Object} user - Objek user dari database
 * @returns {string} Signed JWT Token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    nama: user.nama,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * POST /api/auth/login
 * Logika autentikasi user dan penerbitan JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    // 2. Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid. Email atau password salah.',
      });
    }

    // 3. Verifikasi password hash menggunakan bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid. Email atau password salah.',
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user);

    // 5. Response data (menghapus password_hash dari response)
    const userResponse = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: config.jwt.expiresIn,
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Mengambil profil user yang sedang login (Terproteksi)
 */
const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profil user berhasil diambil.',
    data: {
      user: req.user,
    },
  });
};

module.exports = {
  login,
  getProfile,
  generateToken,
};
