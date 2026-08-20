const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// 1. Public Authentication Routes
router.post('/login', login);

// 2. Protected Routes (Semua pengguna terotentikasi)
router.get('/me', verifyToken, getProfile);

// 3. Role-Protected Routes Contoh:
// Khusus role Admin
router.get('/admin-only', verifyToken, requireRole('Admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Selamat datang di area khusus Administrator BRMP DIY.',
    user: req.user,
  });
});

// Khusus role PetugasLab atau Admin
router.get('/lab-area', verifyToken, requireRole('PetugasLab', 'Admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Selamat datang di area operasional Laboratorium Pengujian Benih.',
    user: req.user,
  });
});

module.exports = router;
