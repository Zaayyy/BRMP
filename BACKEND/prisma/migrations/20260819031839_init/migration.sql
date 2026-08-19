-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('Admin', 'PetugasLab') NOT NULL DEFAULT 'PetugasLab',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `benih` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_benih` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `gambar_url` VARCHAR(500) NULL,
    `created_by_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_trackings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_tracking` VARCHAR(50) NOT NULL,
    `nama_pemohon` VARCHAR(150) NOT NULL,
    `status_uji` ENUM('Diterima', 'Proses', 'Selesai') NOT NULL DEFAULT 'Diterima',
    `hasil_dokumen_url` VARCHAR(500) NULL,
    `keterangan` TEXT NULL,
    `petugas_id` INTEGER NULL,
    `tanggal_masuk` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_selesai` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lab_trackings_kode_tracking_key`(`kode_tracking`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengaduan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_tracking` VARCHAR(50) NOT NULL,
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
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengaduan_kode_tracking_key`(`kode_tracking`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `benih` ADD CONSTRAINT `benih_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_trackings` ADD CONSTRAINT `lab_trackings_petugas_id_fkey` FOREIGN KEY (`petugas_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengaduan` ADD CONSTRAINT `pengaduan_ditanggapi_oleh_id_fkey` FOREIGN KEY (`ditanggapi_oleh_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
