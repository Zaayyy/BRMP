const prisma = require('../config/prisma');

// ==========================================
// PUBLIC CONTROLLERS (Akses Terbuka)
// ==========================================

/**
 * GET /api/public/benih
 * Menampilkan daftar seluruh katalog benih untuk publik
 * Query params: search, page, limit
 */
const getAllBenihPublic = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Filter pencarian jika ada parameter search
    const where = search
      ? {
          OR: [
            { nama_benih: { contains: search } },
            { deskripsi: { contains: search } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.benih.count({ where }),
      prisma.benih.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nama_benih: true,
          deskripsi: true,
          stok: true,
          gambar_url: true,
          createdAt: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data katalog benih berhasil diambil.',
      pagination: {
        totalItems: total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/benih/:id
 * Menampilkan detail spesifik benih
 */
const getBenihByIdPublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const benihId = parseInt(id, 10);

    if (isNaN(benihId)) {
      return res.status(400).json({
        success: false,
        message: 'ID benih harus berupa angka yang valid.',
      });
    }

    const benih = await prisma.benih.findUnique({
      where: { id: benihId },
      select: {
        id: true,
        nama_benih: true,
        deskripsi: true,
        stok: true,
        gambar_url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!benih) {
      return res.status(404).json({
        success: false,
        message: `Benih dengan ID ${benihId} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail benih berhasil diambil.',
      data: benih,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// INTERNAL CONTROLLERS (Khusus Admin)
// ==========================================

/**
 * GET /api/internal/benih
 * Mengambil seluruh data benih untuk manajemen admin beserta informasi pembuat
 */
const getAllBenihInternal = async (req, res, next) => {
  try {
    const benihList = await prisma.benih.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
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
      message: 'Data seluruh benih berhasil diambil.',
      total: benihList.length,
      data: benihList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/internal/benih
 * Menambahkan data benih baru (Hanya Admin)
 */
const createBenih = async (req, res, next) => {
  try {
    const { nama_benih, deskripsi, stok, gambar_url } = req.body;

    if (!nama_benih || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: 'Field nama_benih dan deskripsi wajib diisi.',
      });
    }

    const parsedStok = stok !== undefined ? parseInt(stok, 10) : 0;
    if (isNaN(parsedStok) || parsedStok < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stok harus berupa bilangan bulat positif.',
      });
    }

    const newBenih = await prisma.benih.create({
      data: {
        nama_benih: nama_benih.trim(),
        deskripsi: deskripsi.trim(),
        stok: parsedStok,
        gambar_url: gambar_url ? gambar_url.trim() : null,
        created_by_id: req.user ? req.user.id : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Data benih berhasil ditambahkan.',
      data: newBenih,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/internal/benih/:id
 * Mengupdate data benih (Hanya Admin)
 */
const updateBenih = async (req, res, next) => {
  try {
    const { id } = req.params;
    const benihId = parseInt(id, 10);

    if (isNaN(benihId)) {
      return res.status(400).json({
        success: false,
        message: 'ID benih harus berupa angka yang valid.',
      });
    }

    // Pastikan benih ada
    const existing = await prisma.benih.findUnique({
      where: { id: benihId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Benih dengan ID ${benihId} tidak ditemukan.`,
      });
    }

    const { nama_benih, deskripsi, stok, gambar_url } = req.body;
    const updateData = {};

    if (nama_benih !== undefined) updateData.nama_benih = nama_benih.trim();
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi.trim();
    if (stok !== undefined) {
      const parsedStok = parseInt(stok, 10);
      if (isNaN(parsedStok) || parsedStok < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stok harus berupa bilangan bulat positif.',
        });
      }
      updateData.stok = parsedStok;
    }
    if (gambar_url !== undefined) updateData.gambar_url = gambar_url ? gambar_url.trim() : null;

    const updatedBenih = await prisma.benih.update({
      where: { id: benihId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Data benih berhasil diperbarui.',
      data: updatedBenih,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/internal/benih/:id
 * Menghapus data benih (Hanya Admin)
 */
const deleteBenih = async (req, res, next) => {
  try {
    const { id } = req.params;
    const benihId = parseInt(id, 10);

    if (isNaN(benihId)) {
      return res.status(400).json({
        success: false,
        message: 'ID benih harus berupa angka yang valid.',
      });
    }

    const existing = await prisma.benih.findUnique({
      where: { id: benihId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Benih dengan ID ${benihId} tidak ditemukan.`,
      });
    }

    await prisma.benih.delete({
      where: { id: benihId },
    });

    return res.status(200).json({
      success: true,
      message: `Data benih '${existing.nama_benih}' berhasil dihapus.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBenihPublic,
  getBenihByIdPublic,
  getAllBenihInternal,
  createBenih,
  updateBenih,
  deleteBenih,
};
