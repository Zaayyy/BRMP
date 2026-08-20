const express = require('express');
const router = express.Router();

const {
  getAllBenihPublic,
  getBenihByIdPublic,
} = require('../controllers/benihController');

const {
  getTrackingByCodePublic,
} = require('../controllers/labTrackingController');

const {
  createPengaduanPublic,
  getPengaduanByTrackingCodePublic,
} = require('../controllers/pengaduanController');

// ==========================================
// 1. KATALOG BENIH PUBLIK
// ==========================================
// GET /api/public/benih -> Menampilkan semua informasi katalog benih
router.get('/benih', getAllBenihPublic);

// GET /api/public/benih/:id -> Menampilkan detail spesifik benih
router.get('/benih/:id', getBenihByIdPublic);

// ==========================================
// 2. STATUS UJI LABORATORIUM PUBLIK
// ==========================================
// GET /api/public/tracking/:kode_tracking -> Mencari status lab berdasarkan kode tracking
router.get('/tracking/:kode_tracking', getTrackingByCodePublic);

// ==========================================
// 3. PENGADUAN MASYARAKAT PUBLIK
// ==========================================
// POST /api/public/pengaduan -> Mengirim form laporan pengaduan (ter-sanitasi)
router.post('/pengaduan', createPengaduanPublic);

// GET /api/public/pengaduan/track/:kode_tracking -> Mengecek status & balasan pengaduan berdasarkan kode tracking
router.get('/pengaduan/track/:kode_tracking', getPengaduanByTrackingCodePublic);
router.get('/pengaduan/:kode_tracking', getPengaduanByTrackingCodePublic);

module.exports = router;
