-- ============================================================
-- DATABASE DUMP: BRMP DIY
-- Database: brmy4429_brmp_db
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: users
DROP TABLE IF EXISTS `pengaduan`;
DROP TABLE IF EXISTS `lab_trackings`;
DROP TABLE IF EXISTS `benih`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('Admin', 'PetugasLab', 'PetugasLayanan', 'PetugasBenih') NOT NULL DEFAULT 'PetugasLab',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: benih
CREATE TABLE `benih` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_benih` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `gambar_url` MEDIUMTEXT NULL,
    `created_by_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `benih_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: lab_trackings
CREATE TABLE `lab_trackings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `no_reg` VARCHAR(50) NULL,
    `spk` VARCHAR(100) NULL,
    `kode_tracking` VARCHAR(50) NOT NULL,
    `nama_pemohon` VARCHAR(150) NOT NULL,
    `sampel_tanah` VARCHAR(100) NULL,
    `sampel_air` VARCHAR(100) NULL,
    `sampel_pupuk` VARCHAR(100) NULL,
    `sampel_tanaman` VARCHAR(100) NULL,
    `telepon` VARCHAR(50) NULL,
    `biaya` VARCHAR(100) NULL,
    `status_uji` ENUM('Diterima', 'Proses', 'Selesai') NOT NULL DEFAULT 'Diterima',
    `hasil_dokumen_url` MEDIUMTEXT NULL,
    `keterangan` TEXT NULL,
    `petugas_id` INTEGER NULL,
    `tanggal_masuk` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_selesai` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `lab_trackings_kode_tracking_key`(`kode_tracking`),
    INDEX `lab_trackings_spk_idx`(`spk`),
    PRIMARY KEY (`id`),
    CONSTRAINT `lab_trackings_petugas_id_fkey` FOREIGN KEY (`petugas_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: pengaduan
CREATE TABLE `pengaduan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_tracking` VARCHAR(50) NOT NULL,
    `jenis_layanan` VARCHAR(100) NULL DEFAULT 'Pengaduan Masyarakat',
    `nama_pelapor` VARCHAR(150) NOT NULL,
    `email_pelapor` VARCHAR(150) NULL,
    `no_telp_pelapor` VARCHAR(30) NULL,
    `isi_pengaduan` TEXT NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status_tanggapan` ENUM('Menunggu', 'Diproses', 'Selesai', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
    `tanggapan_petugas` TEXT NULL,
    `ditanggapi_oleh_id` INTEGER NULL,
    `tanggal_tanggapan` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `pengaduan_kode_tracking_key`(`kode_tracking`),
    PRIMARY KEY (`id`),
    CONSTRAINT `pengaduan_ditanggapi_oleh_id_fkey` FOREIGN KEY (`ditanggapi_oleh_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA AWAL
-- ============================================================

-- Akun User: 4 Role (Password: Password123!)
INSERT INTO `users` (`id`, `nama`, `email`, `password_hash`, `role`) VALUES
(1, 'Administrator BRMP DIY', 'admin@brmpdiy.go.id', '$2b$10$Jd.E3VdQjSck3cu4fhAqje2XP3pCaM0a4lQed/R6CrH.BvTgqhZ4C', 'Admin'),
(2, 'Petugas Laboratorium', 'petugaslab@brmpdiy.go.id', '$2b$10$Jd.E3VdQjSck3cu4fhAqje2XP3pCaM0a4lQed/R6CrH.BvTgqhZ4C', 'PetugasLab'),
(3, 'Petugas Layanan & Pengaduan', 'petugaslayanan@brmpdiy.go.id', '$2b$10$Jd.E3VdQjSck3cu4fhAqje2XP3pCaM0a4lQed/R6CrH.BvTgqhZ4C', 'PetugasLayanan'),
(4, 'Petugas Perbenihan', 'petugasbenih@brmpdiy.go.id', '$2b$10$Jd.E3VdQjSck3cu4fhAqje2XP3pCaM0a4lQed/R6CrH.BvTgqhZ4C', 'PetugasBenih');

-- Data Katalog Benih
INSERT INTO `benih` (`id`, `nama_benih`, `deskripsi`, `stok`, `gambar_url`, `created_by_id`) VALUES
(1, 'Padi Inpari 32 HDB', 'Benih padi bersertifikat tahan wereng batang coklat dan penyakit hawar daun bakteri.', 150, '/images/seed_padi.png', 1),
(2, 'Jagung Hibrida Bisi 18', 'Benih jagung hibrida potensi hasil tinggi dengan adaptasi lingkungan yang sangat baik.', 85, '/images/seed_jagung.png', 1),
(3, 'Kedelai Anjasmoro', 'Varietas unggul nasional berbiji besar dengan adaptasi luas di lahan sawah maupun tegalan.', 60, '/images/seed_kedelai.png', 1),
(4, 'Bawang Merah Bima Brebes', 'Varietas unggul adaptif dataran rendah, anakan produktif dan aroma tajam.', 40, '/images/seed_bawang.png', 1);

-- Data Tracking Lab (Sesuai Register Logbook)
INSERT INTO `lab_trackings` (`id`, `no_reg`, `spk`, `kode_tracking`, `nama_pemohon`, `sampel_tanah`, `sampel_air`, `sampel_pupuk`, `sampel_tanaman`, `telepon`, `biaya`, `status_uji`, `hasil_dokumen_url`, `keterangan`, `petugas_id`, `tanggal_masuk`) VALUES
(1, '279', 'CE-3/08-26/279', 'CE-3/08-26/279', 'SMKN 1 Cangkringan', NULL, '274-275', NULL, NULL, '085743250777', 'Rp 150.000', 'Proses', NULL, 'Pengujian sampel air irigasi', 2, '2026-08-19 09:00:00'),
(2, '280', 'CE-3/08-26/280', 'CE-3/08-26/280', 'Suryandaru Rizky Pangestu', NULL, NULL, NULL, '327-333', '087843586570', 'Rp 200.000', 'Proses', NULL, 'Pengujian jaringan tanaman', 2, '2026-08-20 10:15:00'),
(3, '283', 'CE-3/08-26/283', 'CE-3/08-26/283', 'Aidi Putra Hasiholan', '1089', NULL, NULL, NULL, '081398155269', 'Rp 175.000', 'Selesai', 'https://example.com/lhu-283.pdf', 'Pengujian unsur hara tanah lengkap', 2, '2026-08-21 11:30:00'),
(4, '285', 'CE-3/08-26/285', 'CE-3/08-26/285', 'Eko Hartono', NULL, NULL, 'PA. 196', NULL, '085729110138', 'Rp 120.000', 'Proses', NULL, 'Uji pupuk anorganik', 2, '2026-08-21 14:00:00'),
(5, '290', 'CE-3/08-26/290', 'CE-3/08-26/290', 'Nindy Nava Hapsari', '1105-1252', NULL, NULL, NULL, '081226571495', 'Rp 350.000', 'Proses', NULL, '', 2, '2026-08-27 08:45:00');

-- Data Pengaduan
INSERT INTO `pengaduan` (`id`, `kode_tracking`, `jenis_layanan`, `nama_pelapor`, `email_pelapor`, `no_telp_pelapor`, `isi_pengaduan`, `status_tanggapan`, `tanggapan_petugas`, `ditanggapi_oleh_id`, `tanggal_tanggapan`) VALUES
(1, 'PGD-2026-001', 'Pengaduan Masyarakat', 'Budi Santoso', 'budi@example.com', '081234567890', 'Mohon informasi ketersediaan benih kedelai untuk musim tanam mendatang di Sleman.', 'Diproses', 'Terima kasih atas laporannya. Tim kami sedang melakukan pengecekan stok di gudang.', 1, NOW());

SET FOREIGN_KEY_CHECKS = 1;
