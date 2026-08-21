const express = require('express');
const router = express.Router();

const { verifyToken, requireRole } = require('../middlewares/auth');

const {
  getAllBenihInternal,
  createBenih,
  updateBenih,
  deleteBenih,
} = require('../controllers/benihController');

const {
  getAllTrackingInternal,
  getTrackingByIdInternal,
  createTrackingInternal,
  updateTrackingStatusInternal,
} = require('../controllers/labTrackingController');

const {
  getAllPengaduanInternal,
  getPengaduanByIdInternal,
  tanggapPengaduanInternal,
  deletePengaduanInternal,
} = require('../controllers/pengaduanController');

const {
  getAllUsersInternal,
  getUserByIdInternal,
  createUserInternal,
  updateUserInternal,
  deleteUserInternal,
} = require('../controllers/userController');

// ----------------------------------------------------
// Terapkan verifikasi token JWT untuk SEMUA rute internal
// ----------------------------------------------------
router.use(verifyToken);

// ==========================================
// 1. MANAJEMEN USER (Hanya Admin)
// ==========================================
// GET /api/internal/users -> List seluruh user
router.get('/users', requireRole('Admin'), getAllUsersInternal);

// GET /api/internal/users/:id -> Detail 1 user
router.get('/users/:id', requireRole('Admin'), getUserByIdInternal);

// POST /api/internal/users -> Tambah user baru
router.post('/users', requireRole('Admin'), createUserInternal);

// PUT /api/internal/users/:id -> Update data user
router.put('/users/:id', requireRole('Admin'), updateUserInternal);

// DELETE /api/internal/users/:id -> Hapus user
router.delete('/users/:id', requireRole('Admin'), deleteUserInternal);

// ==========================================
// 2. MANAJEMEN KATALOG BENIH (Admin & PetugasBenih)
// ==========================================
// GET /api/internal/benih -> List seluruh benih internal
router.get('/benih', requireRole('Admin', 'PetugasBenih'), getAllBenihInternal);

// POST /api/internal/benih -> Tambah data benih baru
router.post('/benih', requireRole('Admin', 'PetugasBenih'), createBenih);

// PUT /api/internal/benih/:id -> Update data benih
router.put('/benih/:id', requireRole('Admin', 'PetugasBenih'), updateBenih);

// DELETE /api/internal/benih/:id -> Hapus data benih
router.delete('/benih/:id', requireRole('Admin', 'PetugasBenih'), deleteBenih);

// ==========================================
// 3. MANAJEMEN LAB TRACKING (PetugasLab & Admin)
// ==========================================
// GET /api/internal/tracking -> List pengujian lab
router.get('/tracking', requireRole('PetugasLab', 'Admin'), getAllTrackingInternal);

// GET /api/internal/tracking/:id -> Detail pengujian lab
router.get('/tracking/:id', requireRole('PetugasLab', 'Admin'), getTrackingByIdInternal);

// POST /api/internal/tracking -> Buat data tracking lab baru
router.post('/tracking', requireRole('PetugasLab', 'Admin'), createTrackingInternal);

// PUT /api/internal/tracking/:id -> Update status lab
router.put('/tracking/:id', requireRole('PetugasLab', 'Admin'), updateTrackingStatusInternal);

// ==========================================
// 4. MANAJEMEN PENGADUAN MASYARAKAT (Admin & PetugasLayanan)
// ==========================================
// GET /api/internal/pengaduan -> Melihat daftar pengaduan masuk
router.get('/pengaduan', requireRole('Admin', 'PetugasLayanan'), getAllPengaduanInternal);

// GET /api/internal/pengaduan/:id -> Melihat detail pengaduan
router.get('/pengaduan/:id', requireRole('Admin', 'PetugasLayanan'), getPengaduanByIdInternal);

// PUT /api/internal/pengaduan/:id/tanggapan -> Memberikan tanggapan pengaduan
router.put('/pengaduan/:id/tanggapan', requireRole('Admin', 'PetugasLayanan'), tanggapPengaduanInternal);

// DELETE /api/internal/pengaduan/:id -> Menghapus pengaduan
router.delete('/pengaduan/:id', requireRole('Admin', 'PetugasLayanan'), deletePengaduanInternal);

module.exports = router;
