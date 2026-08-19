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

// ----------------------------------------------------
// Terapkan verifikasi token JWT untuk SEMUA rute internal
// ----------------------------------------------------
router.use(verifyToken);

// ==========================================
// 1. MANAJEMEN KATALOG BENIH (Hanya Admin)
// ==========================================
// GET /api/internal/benih -> List seluruh benih internal
router.get('/benih', requireRole('Admin'), getAllBenihInternal);

// POST /api/internal/benih -> Tambah data benih baru (Hanya Admin)
router.post('/benih', requireRole('Admin'), createBenih);

// PUT /api/internal/benih/:id -> Update data benih (Hanya Admin)
router.put('/benih/:id', requireRole('Admin'), updateBenih);

// DELETE /api/internal/benih/:id -> Hapus data benih (Hanya Admin)
router.delete('/benih/:id', requireRole('Admin'), deleteBenih);

// ==========================================
// 2. MANAJEMEN LAB TRACKING (PetugasLab & Admin)
// ==========================================
// GET /api/internal/tracking -> List pengujian lab
router.get('/tracking', requireRole('PetugasLab', 'Admin'), getAllTrackingInternal);

// GET /api/internal/tracking/:id -> Detail pengujian lab
router.get('/tracking/:id', requireRole('PetugasLab', 'Admin'), getTrackingByIdInternal);

// POST /api/internal/tracking -> Buat data tracking lab baru
router.post('/tracking', requireRole('PetugasLab', 'Admin'), createTrackingInternal);

// PUT /api/internal/tracking/:id -> Update status lab (PetugasLab & Admin)
router.put('/tracking/:id', requireRole('PetugasLab', 'Admin'), updateTrackingStatusInternal);

// ==========================================
// 3. MANAJEMEN PENGADUAN MASYARAKAT (Hanya Admin)
// ==========================================
// GET /api/internal/pengaduan -> Melihat daftar pengaduan masuk (Hanya Admin)
router.get('/pengaduan', requireRole('Admin'), getAllPengaduanInternal);

// GET /api/internal/pengaduan/:id -> Melihat detail pengaduan (Hanya Admin)
router.get('/pengaduan/:id', requireRole('Admin'), getPengaduanByIdInternal);

// PUT /api/internal/pengaduan/:id/tanggapan -> Memberikan tanggapan pengaduan (Hanya Admin)
router.put('/pengaduan/:id/tanggapan', requireRole('Admin'), tanggapPengaduanInternal);

// DELETE /api/internal/pengaduan/:id -> Menghapus pengaduan (Hanya Admin)
router.delete('/pengaduan/:id', requireRole('Admin'), deletePengaduanInternal);

module.exports = router;
