const prisma = require('../config/prisma');
const { generateTrackingCode } = require('../utils/generateTrackingCode');

/**
 * Sanitasi string sederhana untuk membersihkan tag HTML dan karakter berbahaya
 * @param {string} str 
 * @returns {string}
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Menghapus tag HTML/XSS
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Menghapus control characters
    .trim();
};

/**
 * Deteksi jenis layanan / formulir asal berdasarkan parameter atau isi pengaduan & kode tracking
 * @param {string} jenisLayanan 
 * @param {string} isiPengaduan 
 * @param {string} kodeTracking 
 * @returns {string}
 */
const detectJenisLayanan = (jenisLayanan, isiPengaduan = '', kodeTracking = '') => {
  if (jenisLayanan && typeof jenisLayanan === 'string' && jenisLayanan.trim()) {
    return sanitizeInput(jenisLayanan);
  }
  const text = (isiPengaduan || '').toLowerCase();
  const code = (kodeTracking || '').toUpperCase();
  if (text.includes('narasumber') || code.startsWith('NAR')) return 'Permohonan Narasumber';
  if (text.includes('magang') || text.includes('pkl') || text.includes('bimbingan teknis') || code.startsWith('MAGANG')) return 'Permohonan Magang';
  if (text.includes('kunjungan') || text.includes('wisma') || text.includes('eduwisata') || code.startsWith('KUN')) return 'Permohonan Kunjungan';
  if (text.includes('konsultasi') || code.startsWith('KON')) return 'Permohonan Konsultasi';
  if (text.includes('informasi publik') || text.includes('ppid') || code.startsWith('PPID')) return 'Informasi Publik (PPID)';
  if (text.includes('pengaduan') || code.startsWith('PGD')) return 'Pengaduan Masyarakat';
  return 'Pengaduan Masyarakat';
};

// ==========================================
// PUBLIC CONTROLLERS (Akses Publik)
// ==========================================

/**
 * POST /api/public/pengaduan
 * Mengirim formulir pengaduan / permohonan layanan masyarakat dengan kode tracking otomatis
 */
const createPengaduanPublic = async (req, res, next) => {
  try {
    const { nama_pelapor, email_pelapor, no_telp_pelapor, isi_pengaduan, jenis_layanan, asal_form } = req.body;

    // 1. Validasi field wajib
    if (!nama_pelapor || !isi_pengaduan) {
      return res.status(400).json({
        success: false,
        message: 'Nama pelapor dan isi pengaduan wajib diisi.',
      });
    }

    // 2. Bersihkan & sanitasi input
    const cleanNama = sanitizeInput(nama_pelapor);
    const cleanIsi = sanitizeInput(isi_pengaduan);
    const cleanEmail = email_pelapor ? sanitizeInput(email_pelapor).toLowerCase() : null;
    const cleanNoTelp = no_telp_pelapor ? sanitizeInput(no_telp_pelapor) : null;

    if (!cleanNama || !cleanIsi) {
      return res.status(400).json({
        success: false,
        message: 'Isi pengaduan atau nama pelapor tidak boleh kosong setelah dibersihkan.',
      });
    }

    // Validasi format email jika diisi
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Format email pelapor tidak valid.',
        });
      }
    }

    // 3. Generate kode tracking unik (Format: PGD-YYYYMMDD-RandomString)
    let kodeTracking = generateTrackingCode('PGD', 5);
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await prisma.pengaduan.findUnique({
        where: { kode_tracking: kodeTracking },
      });
      if (!existing) {
        isUnique = true;
      } else {
        kodeTracking = generateTrackingCode('PGD', 5);
        attempts++;
      }
    }

    // 4. Deteksi dan sanitasi Jenis Layanan / Asal Formulir
    const cleanJenisLayanan = detectJenisLayanan(jenis_layanan || asal_form, cleanIsi, kodeTracking);

    // 5. Simpan ke database
    const newPengaduan = await prisma.pengaduan.create({
      data: {
        kode_tracking: kodeTracking,
        jenis_layanan: cleanJenisLayanan,
        nama_pelapor: cleanNama,
        email_pelapor: cleanEmail,
        no_telp_pelapor: cleanNoTelp,
        isi_pengaduan: cleanIsi,
        status_tanggapan: 'Menunggu',
        tanggal: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Laporan permohonan/pengaduan Anda berhasil dikirim. Simpan kode tracking berikut untuk memeriksa status permohonan Anda.',
      data: {
        id: newPengaduan.id,
        kode_tracking: newPengaduan.kode_tracking,
        jenis_layanan: newPengaduan.jenis_layanan,
        nama_pelapor: newPengaduan.nama_pelapor,
        tanggal: newPengaduan.tanggal,
        status_tanggapan: newPengaduan.status_tanggapan,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/pengaduan/track/:kode_tracking
 * Mengecek status dan balasan/tanggapan pengaduan berdasarkan kode tracking unik
 * Respon hanya mengembalikan tanggal, status_tanggapan, dan tanggapan_petugas demi privasi pelapor.
 */
const getPengaduanByTrackingCodePublic = async (req, res, next) => {
  try {
    const { kode_tracking } = req.params;

    if (!kode_tracking || !kode_tracking.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Parameter kode tracking wajib disertakan.',
      });
    }

    // 1. Sanitasi parameter kode_tracking untuk mencegah potensi SQLi / karakter berbahaya
    const cleanKode = sanitizeInput(kode_tracking).toUpperCase();

    // Validasi format kode (hanya alfanumerik dan tanda hubung '-')
    const codeFormatRegex = /^[A-Z0-9\-]{3,50}$/;
    if (!codeFormatRegex.test(cleanKode)) {
      return res.status(400).json({
        success: false,
        message: 'Format kode tracking tidak valid. Hanya karakter alfanumerik dan tanda hubung yang diperbolehkan.',
      });
    }

    // 2. Cari data pengaduan di database
    const pengaduan = await prisma.pengaduan.findUnique({
      where: { kode_tracking: cleanKode },
      select: {
        kode_tracking: true,
        jenis_layanan: true,
        tanggal: true,
        status_tanggapan: true,
        tanggapan_petugas: true,
        tanggal_tanggapan: true,
      },
    });

    // 3. Jika tidak ditemukan, kembalikan 404 Not Found standar
    if (!pengaduan) {
      return res.status(404).json({
        success: false,
        message: `Pengaduan dengan kode tracking '${cleanKode}' tidak ditemukan. Silakan periksa kembali kode Anda.`,
      });
    }

    // 4. Kembalikan data status & tanggapan (tanpa nama atau kontak pelapor demi privasi)
    return res.status(200).json({
      success: true,
      message: 'Status pengaduan berhasil ditemukan.',
      data: {
        kode_tracking: pengaduan.kode_tracking,
        jenis_layanan: pengaduan.jenis_layanan || 'Pengaduan Masyarakat',
        tanggal_masuk: pengaduan.tanggal,
        status_tanggapan: pengaduan.status_tanggapan,
        tanggapan_petugas: pengaduan.tanggapan_petugas || 'Belum ada tanggapan dari petugas/admin.',
        tanggal_tanggapan: pengaduan.tanggal_tanggapan,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// INTERNAL CONTROLLERS (Khusus Admin)
// ==========================================

/**
 * GET /api/internal/pengaduan
 * Melihat daftar seluruh pengaduan yang masuk (Admin)
 * Query params: status, jenis_layanan, search, page, limit
 */
const getAllPengaduanInternal = async (req, res, next) => {
  try {
    const { status, jenis_layanan, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'Semua') {
      where.status_tanggapan = status;
    }
    if (jenis_layanan && jenis_layanan !== 'Semua') {
      where.jenis_layanan = jenis_layanan;
    }
    if (search) {
      where.OR = [
        { kode_tracking: { contains: search } },
        { nama_pelapor: { contains: search } },
        { isi_pengaduan: { contains: search } },
        { jenis_layanan: { contains: search } },
      ];
    }

    const [total, rawList] = await Promise.all([
      prisma.pengaduan.count({ where }),
      prisma.pengaduan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { tanggal: 'desc' },
        include: {
          ditanggapiOleh: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Format list dan pastikan jenis_layanan selalu terisi (fallback cerdas untuk data lama)
    const list = rawList.map((item) => ({
      ...item,
      jenis_layanan: item.jenis_layanan || detectJenisLayanan('', item.isi_pengaduan, item.kode_tracking),
    }));

    return res.status(200).json({
      success: true,
      message: 'Daftar pengaduan masyarakat berhasil diambil.',
      pagination: {
        totalItems: total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/internal/pengaduan/:id
 * Mengambil detail pengaduan berdasarkan ID (Admin)
 */
const getPengaduanByIdInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pengaduanId = parseInt(id, 10);

    if (isNaN(pengaduanId)) {
      return res.status(400).json({
        success: false,
        message: 'ID pengaduan harus berupa angka valid.',
      });
    }

    const pengaduan = await prisma.pengaduan.findUnique({
      where: { id: pengaduanId },
      include: {
        ditanggapiOleh: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });

    if (!pengaduan) {
      return res.status(404).json({
        success: false,
        message: `Pengaduan dengan ID ${pengaduanId} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail pengaduan berhasil diambil.',
      data: {
        ...pengaduan,
        jenis_layanan: pengaduan.jenis_layanan || detectJenisLayanan('', pengaduan.isi_pengaduan, pengaduan.kode_tracking),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/internal/pengaduan/:id/tanggapan
 * Menanggapi dan memperbarui status laporan pengaduan (Hanya Admin)
 */
const tanggapPengaduanInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pengaduanId = parseInt(id, 10);

    if (isNaN(pengaduanId)) {
      return res.status(400).json({
        success: false,
        message: 'ID pengaduan harus berupa angka valid.',
      });
    }

    const existing = await prisma.pengaduan.findUnique({
      where: { id: pengaduanId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Pengaduan dengan ID ${pengaduanId} tidak ditemukan.`,
      });
    }

    const { status_tanggapan, tanggapan_petugas, isi_tanggapan } = req.body;

    const allowedStatus = ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'];
    if (status_tanggapan && !allowedStatus.includes(status_tanggapan)) {
      return res.status(400).json({
        success: false,
        message: `Status tanggapan tidak valid. Pilihan: ${allowedStatus.join(', ')}`,
      });
    }

    const tanggapanContent = tanggapan_petugas !== undefined ? tanggapan_petugas : isi_tanggapan;

    const updateData = {
      status_tanggapan: status_tanggapan || 'Selesai',
      tanggapan_petugas: tanggapanContent ? sanitizeInput(tanggapanContent) : existing.tanggapan_petugas,
      ditanggapi_oleh_id: req.user ? req.user.id : null,
      tanggal_tanggapan: new Date(),
    };

    const updated = await prisma.pengaduan.update({
      where: { id: pengaduanId },
      data: updateData,
      include: {
        ditanggapiOleh: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Tanggapan untuk pengaduan [${existing.kode_tracking}] berhasil disimpan.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/internal/pengaduan/:id
 * Menghapus data laporan pengaduan (Hanya Admin)
 */
const deletePengaduanInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pengaduanId = parseInt(id, 10);

    if (isNaN(pengaduanId)) {
      return res.status(400).json({
        success: false,
        message: 'ID pengaduan harus berupa angka valid.',
      });
    }

    const existing = await prisma.pengaduan.findUnique({
      where: { id: pengaduanId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Pengaduan dengan ID ${pengaduanId} tidak ditemukan.`,
      });
    }

    await prisma.pengaduan.delete({
      where: { id: pengaduanId },
    });

    return res.status(200).json({
      success: true,
      message: `Laporan pengaduan #${pengaduanId} [${existing.kode_tracking}] berhasil dihapus.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPengaduanPublic,
  getPengaduanByTrackingCodePublic,
  getAllPengaduanInternal,
  getPengaduanByIdInternal,
  tanggapPengaduanInternal,
  deletePengaduanInternal,
};
