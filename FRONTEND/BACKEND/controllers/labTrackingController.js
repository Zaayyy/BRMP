const prisma = require('../config/prisma');

// ==========================================
// PUBLIC CONTROLLERS (Akses Publik)
// ==========================================

/**
 * GET /api/public/tracking/:kode_tracking
 * Mencari status uji laboratorium berdasarkan kode tracking, nomor SPK, atau telepon
 */
const getTrackingByCodePublic = async (req, res, next) => {
  try {
    const { kode_tracking } = req.params;

    if (!kode_tracking || !kode_tracking.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Kode tracking atau Nomor SPK wajib disertakan.',
      });
    }

    const searchKey = kode_tracking.trim();

    const trackingData = await prisma.labTracking.findFirst({
      where: {
        OR: [
          { kode_tracking: searchKey },
          { spk: searchKey },
          { no_reg: searchKey },
          { telepon: searchKey },
        ],
      },
      select: {
        id: true,
        no_reg: true,
        spk: true,
        kode_tracking: true,
        nama_pemohon: true,
        sampel_tanah: true,
        sampel_air: true,
        sampel_pupuk: true,
        sampel_tanaman: true,
        telepon: true,
        biaya: true,
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
        message: `Status uji lab dengan kode tracking / SPK '${searchKey}' tidak ditemukan.`,
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
        { spk: { contains: search } },
        { nama_pemohon: { contains: search } },
        { telepon: { contains: search } },
      ];
    }

    const list = await prisma.labTracking.findMany({
      where,
      orderBy: { id: 'desc' },
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
    const {
      no_reg,
      spk,
      kode_tracking,
      nama_pemohon,
      sampel_tanah,
      sampel_air,
      sampel_pupuk,
      sampel_tanaman,
      telepon,
      biaya,
      keterangan,
      status_uji,
      hasil_dokumen_url,
      tanggal_masuk,
    } = req.body;

    if (!nama_pemohon || !nama_pemohon.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama pemohon wajib diisi.',
      });
    }

    const spkClean = spk ? spk.trim() : null;
    let generatedCode = kode_tracking;
    if (!generatedCode || !generatedCode.trim()) {
      generatedCode = spkClean || `LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      generatedCode = generatedCode.trim();
    }

    // Periksa duplikasi kode tracking jika bukan auto
    const existing = await prisma.labTracking.findUnique({
      where: { kode_tracking: generatedCode },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Kode tracking / SPK '${generatedCode}' sudah terdaftar dalam sistem.`,
      });
    }

    const newTracking = await prisma.labTracking.create({
      data: {
        no_reg: no_reg ? no_reg.toString().trim() : null,
        spk: spkClean,
        kode_tracking: generatedCode,
        nama_pemohon: nama_pemohon.trim(),
        sampel_tanah: sampel_tanah ? sampel_tanah.trim() : null,
        sampel_air: sampel_air ? sampel_air.trim() : null,
        sampel_pupuk: sampel_pupuk ? sampel_pupuk.trim() : null,
        sampel_tanaman: sampel_tanaman ? sampel_tanaman.trim() : null,
        telepon: telepon ? telepon.trim() : null,
        biaya: biaya ? biaya.trim() : null,
        status_uji: status_uji || 'Diterima',
        keterangan: keterangan ? keterangan.trim() : null,
        hasil_dokumen_url: hasil_dokumen_url ? hasil_dokumen_url.trim() : null,
        petugas_id: req.user ? req.user.id : null,
        ...(tanggal_masuk && { tanggal_masuk: new Date(tanggal_masuk) }),
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
 * Mengupdate data & status uji laboratorium (PetugasLab / Admin)
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

    const {
      no_reg,
      spk,
      nama_pemohon,
      sampel_tanah,
      sampel_air,
      sampel_pupuk,
      sampel_tanaman,
      telepon,
      biaya,
      status_uji,
      hasil_dokumen_url,
      keterangan,
      tanggal_selesai,
    } = req.body;

    const allowedStatus = ['Diterima', 'Proses', 'Selesai'];
    if (status_uji && !allowedStatus.includes(status_uji)) {
      return res.status(400).json({
        success: false,
        message: `Status uji tidak valid. Pilihan status yang diperbolehkan: ${allowedStatus.join(', ')}`,
      });
    }

    const updateData = {};
    if (no_reg !== undefined) updateData.no_reg = no_reg ? no_reg.toString().trim() : null;
    if (spk !== undefined) updateData.spk = spk ? spk.trim() : null;
    if (nama_pemohon !== undefined) updateData.nama_pemohon = nama_pemohon.trim();
    if (sampel_tanah !== undefined) updateData.sampel_tanah = sampel_tanah ? sampel_tanah.trim() : null;
    if (sampel_air !== undefined) updateData.sampel_air = sampel_air ? sampel_air.trim() : null;
    if (sampel_pupuk !== undefined) updateData.sampel_pupuk = sampel_pupuk ? sampel_pupuk.trim() : null;
    if (sampel_tanaman !== undefined) updateData.sampel_tanaman = sampel_tanaman ? sampel_tanaman.trim() : null;
    if (telepon !== undefined) updateData.telepon = telepon ? telepon.trim() : null;
    if (biaya !== undefined) updateData.biaya = biaya ? biaya.trim() : null;

    if (status_uji !== undefined) {
      updateData.status_uji = status_uji;
      if (status_uji === 'Selesai' && !tanggal_selesai && !existing.tanggal_selesai) {
        updateData.tanggal_selesai = new Date();
      }
    }
    if (hasil_dokumen_url !== undefined) updateData.hasil_dokumen_url = hasil_dokumen_url ? hasil_dokumen_url.trim() : null;
    if (keterangan !== undefined) updateData.keterangan = keterangan ? keterangan.trim() : null;
    if (tanggal_selesai !== undefined) updateData.tanggal_selesai = tanggal_selesai ? new Date(tanggal_selesai) : null;

    if (!existing.petugas_id && req.user) {
      updateData.petugas_id = req.user.id;
    }

    const updated = await prisma.labTracking.update({
      where: { id: trackingId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: `Data pengujian laboratorium [${existing.spk || existing.kode_tracking}] berhasil diperbarui.`,
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
