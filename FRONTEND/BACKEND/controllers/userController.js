const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const VALID_ROLES = ['Admin', 'PetugasLab', 'PetugasLayanan', 'PetugasBenih'];

/**
 * GET /api/internal/users
 * Mengambil daftar seluruh user pegawai/admin (Khusus Admin)
 */
const getAllUsersInternal = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const whereClause = {};

    if (role && VALID_ROLES.includes(role)) {
      whereClause.role = role;
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { nama: { contains: search.trim() } },
        { email: { contains: search.trim() } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar user berhasil diambil.',
      total: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/internal/users/:id
 * Mengambil detail user berdasarkan ID (Khusus Admin)
 */
const getUserByIdInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID user tidak valid.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID #${userId} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail user berhasil diambil.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/internal/users
 * Membuat akun user baru (Khusus Admin)
 */
const createUserInternal = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    // 1. Validasi field wajib
    if (!nama || !nama.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap wajib diisi.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password wajib diisi minimal 6 karakter.',
      });
    }

    const assignedRole = role || 'PetugasLab';
    if (!VALID_ROLES.includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: `Role '${assignedRole}' tidak valid. Pilihan role: ${VALID_ROLES.join(', ')}`,
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Email '${cleanEmail}' sudah terdaftar dalam sistem. Gunakan email lain.`,
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        nama: nama.trim(),
        email: cleanEmail,
        password_hash: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `User '${newUser.nama}' dengan role '${newUser.role}' berhasil dibuat.`,
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/internal/users/:id
 * Mengupdate data user (Khusus Admin)
 */
const updateUserInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID user tidak valid.',
      });
    }

    const { nama, email, password, role } = req.body;

    // 1. Cek keberadaan user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID #${userId} tidak ditemukan.`,
      });
    }

    const updateData = {};

    // 2. Validasi & update nama
    if (nama && nama.trim()) {
      updateData.nama = nama.trim();
    }

    // 3. Validasi & update email
    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== existingUser.email) {
        const emailCollision = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (emailCollision) {
          return res.status(409).json({
            success: false,
            message: `Email '${cleanEmail}' sudah digunakan oleh user lain.`,
          });
        }
        updateData.email = cleanEmail;
      }
    }

    // 4. Validasi & update role
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Role '${role}' tidak valid. Pilihan role: ${VALID_ROLES.join(', ')}`,
        });
      }

      // Cegah Admin terakhir mengubah rolenya sendiri jika hanya tersisa 1 admin
      if (existingUser.role === 'Admin' && role !== 'Admin') {
        const adminCount = await prisma.user.count({ where: { role: 'Admin' } });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Tidak dapat mengubah role satu-satunya Administrator dalam sistem.',
          });
        }
      }

      updateData.role = role;
    }

    // 5. Validasi & hash password jika diisi
    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password baru minimal 6 karakter.',
        });
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // 6. Jalankan update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Data user '${updatedUser.nama}' berhasil diperbarui.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/internal/users/:id
 * Menghapus akun user (Khusus Admin)
 */
const deleteUserInternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID user tidak valid.',
      });
    }

    // 1. Cek apakah user yang akan dihapus adalah akun sendiri
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.',
      });
    }

    // 2. Cek keberadaan user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID #${userId} tidak ditemukan.`,
      });
    }

    // 3. Cegah menghapus jika merupakan satu-satunya Admin
    if (existingUser.role === 'Admin') {
      const adminCount = await prisma.user.count({ where: { role: 'Admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus satu-satunya Administrator dalam sistem.',
        });
      }
    }

    // 4. Hapus user
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      success: true,
      message: `User '${existingUser.nama}' (${existingUser.email}) berhasil dihapus.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsersInternal,
  getUserByIdInternal,
  createUserInternal,
  updateUserInternal,
  deleteUserInternal,
  VALID_ROLES,
};
