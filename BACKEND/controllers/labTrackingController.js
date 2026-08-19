const prisma = require('../config/prisma');

// ==========================================
// PUBLIC CONTROLLERS (Akses Publik)
// ==========================================

/**
 * GET /api/public/tracking/:kode_tracking
 * Mencari status uji laboratorium berdasarkan kode tracking unik
 */
const getTrackingByCodePublic = async (req, res, next) => {
  try {
    const { kode_tracking } = req.params;

    if (!kode_tracking || !kode_tracking.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Kode tracking wajib disertakan.',
      });
    }

    const trackingData = await prisma.labTracking.findUnique({
      where: { kode_tracking: kode_tracking.trim() },
      select: {
        kode_tracking: true,
        nama_pemohon: true,
        status_uji: true,
        keterangan: true,
        hasil_dokumen_url: true,
        tanggal_masuk: true,
        tanggal_selesai: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!trackingData) {
      return res.status(404).json({
        success: false,
        message: `Status uji lab dengan kode tracking '${kode_tracking.trim()}' tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status uji laboratorium berhasil ditemukan.',
      data: trackingData,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// INTERNAL CONTROLLERS (PetugasLab & Admin)
// ==========================================

/**
 * GET /api/internal/tracking
 * Mengambil daftar seluruh data tracking laboratorium (Internal)
 */
const getAllTrackingInternal = async (req, res, next) => {
  try {
    const { status_uji, search } = req.query;

    const where = {};
    if (status_uji) {
      where.status_uji = status_uji;
    }
    if (search) {
      where.OR = [
        { kode_tracking: { contains: search } },
        { nama_pemohon: { contains: search } },
      ];
    }

    const list = await prisma.labTracking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        petugas: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar pengujian laboratorium berhasil diambil.',
      total: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/internal/tracking/:id
 * Mengambil detail pengujian lab berdasarkan ID internal
 */
const getTrackingByIdInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trackingId = parseInt(id, 10);

    if (isNaN(trackingId)) {
      return res.status(400).json({
        success: false,
        message: 'ID tracking harus berupa angka valid.',
      });
    }

    const data = await prisma.labTracking.findUnique({
      where: { id: trackingId },
      include: {
        petugas: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Data tracking dengan ID ${trackingId} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail tracking laboratorium berhasil diambil.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/internal/tracking
 * Membuat permohonan/entri pengujian laboratorium baru (PetugasLab / Admin)
 */
const createTrackingInternal = async (req, res, next) => {
  try {
    const { kode_tracking, nama_pemohon, keterangan, status_uji, hasil_dokumen_url } = req.body;

    if (!nama_pemohon) {
      return res.status(400).json({
        success: false,
        message: 'Nama pemohon wajib diisi.',
      });
    }

    // Generate kode tracking otomatis jika tidak disediakan (Format: LAB-YYYYMMDD-RANDOM)
    let generatedCode = kode_tracking;
    if (!generatedCode || !generatedCode.trim()) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      generatedCode = `LAB-${dateStr}-${randomSuffix}`;
    } else {
      generatedCode = generatedCode.trim();
    }

    // Periksa duplikasi kode tracking
    const existing = await prisma.labTracking.findUnique({
      where: { kode_tracking: generatedCode },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Kode tracking '${generatedCode}' sudah terdaftar dalam sistem.`,
      });
    }

    const newTracking = await prisma.labTracking.create({
      data: {
        kode_tracking: generatedCode,
        nama_pemohon: nama_pemohon.trim(),
        status_uji: status_uji || 'Diterima',
        keterangan: keterangan ? keterangan.trim() : null,
        hasil_dokumen_url: hasil_dokumen_url ? hasil_dokumen_url.trim() : null,
        petugas_id: req.user ? req.user.id : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Data pengujian laboratorium berhasil dibuat.',
      data: newTracking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/internal/tracking/:id
 * Mengupdate status uji laboratorium & hasil dokumen (PetugasLab / Admin)
 */
const updateTrackingStatusInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trackingId = parseInt(id, 10);

    if (isNaN(trackingId)) {
      return res.status(400).json({
        success: false,
        message: 'ID tracking harus berupa angka yang valid.',
      });
    }

    const existing = await prisma.labTracking.findUnique({
      where: { id: trackingId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Data tracking dengan ID ${trackingId} tidak ditemukan.`,
      });
    }

    const { status_uji, hasil_dokumen_url, keterangan, tanggal_selesai, nama_pemohon } = req.body;

    const allowedStatus = ['Diterima', 'Proses', 'Selesai'];
    if (status_uji && !allowedStatus.includes(status_uji)) {
      return res.status(400).json({
        success: false,
        message: `Status uji tidak valid. Pilihan status yang diperbolehkan: ${allowedStatus.join(', ')}`,
      });
    }

    const updateData = {};
    if (status_uji !== undefined) {
      updateData.status_uji = status_uji;
      // Jika status diubah menjadi 'Selesai' dan tanggal_selesai belum diset, otomatis set tanggal hari ini
      if (status_uji === 'Selesai' && !tanggal_selesai && !existing.tanggal_selesai) {
        updateData.tanggal_selesai = new Date();
      }
    }
    if (hasil_dokumen_url !== undefined) updateData.hasil_dokumen_url = hasil_dokumen_url ? hasil_dokumen_url.trim() : null;
    if (keterangan !== undefined) updateData.keterangan = keterangan ? keterangan.trim() : null;
    if (nama_pemohon !== undefined) updateData.nama_pemohon = nama_pemohon.trim();
    if (tanggal_selesai !== undefined) updateData.tanggal_selesai = tanggal_selesai ? new Date(tanggal_selesai) : null;

    // Update petugas yang memodifikasi jika petugas belum tercatat
    if (!existing.petugas_id && req.user) {
      updateData.petugas_id = req.user.id;
    }

    const updated = await prisma.labTracking.update({
      where: { id: trackingId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: `Status uji laboratorium [${existing.kode_tracking}] berhasil diperbarui.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrackingByCodePublic,
  getAllTrackingInternal,
  getTrackingByIdInternal,
  createTrackingInternal,
  updateTrackingStatusInternal,
};
