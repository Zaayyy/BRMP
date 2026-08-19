# BRMP DIY - Backend API

Setup awal backend REST API menggunakan Node.js, Express.js, dan Prisma ORM dengan arsitektur modular, konfigurasi keamanan, dan multi-origin CORS.

---

## 📁 Struktur Folder

```
BACKEND/
├── config/             # Konfigurasi aplikasi (environment, CORS, database prisma)
│   ├── cors.js         # Konfigurasi CORS multi-origin (publik & internal)
│   ├── env.js          # Konfigurasi & loader environment variables
│   └── prisma.js       # Instance Prisma Client (Singleton)
├── controllers/        # Logika pemrosesan request & response
│   └── healthController.js
├── middlewares/        # Custom middleware (error handling, autentikasi, logger, dll.)
│   ├── errorHandler.js # Global error handler
│   └── notFound.js     # 404 handler
├── models/             # Helper export model ORM
│   └── index.js
├── prisma/             # Skema & konfigurasi Prisma ORM
│   ├── schema.prisma   # Definisi models, enum, & relasi database
│   └── seed.js         # Seeder data awal (admin, dummy benih, lab, pengaduan)
├── routes/             # Definisi routing API
│   ├── index.js        # Root aggregator router
│   └── healthRoutes.js # Route health check
├── .env                # Environment variables lokal
├── .env.example        # Template konfigurasi environment
├── .gitignore          # File & folder yang diabaikan Git
├── package.json        # Manifest dependencies & npm scripts
├── README.md           # Dokumentasi backend
└── server.js           # Main application entry point
```

---

## 🗄️ Skema Database (Prisma ORM)

### 1. Model & Entitas
- **`User`**: Menyimpan data pegawai & admin BRMP DIY.
  - Kolom: `id`, `nama`, `email`, `password_hash`, `role` (`Admin`, `PetugasLab`), `created_at`, `updated_at`.
  - Relasi: Menangani `Pengaduan`, `LabTracking`, dan `Benih`.
- **`Benih`**: Katalog benih publik.
  - Kolom: `id`, `nama_benih`, `deskripsi`, `stok`, `gambar_url`, `created_by_id`, `created_at`, `updated_at`.
  - Relasi: Dikelola oleh `User` (`createdBy`).
- **`LabTracking`**: Status dan progres uji laboratorium benih.
  - Kolom: `id`, `kode_tracking` (Unique), `nama_pemohon`, `status_uji` (`Diterima`, `Proses`, `Selesai`), `hasil_dokumen_url`, `keterangan`, `petugas_id`, `tanggal_masuk`, `tanggal_selesai`, `created_at`, `updated_at`.
  - Relasi: Ditangani oleh `User` / `PetugasLab` (`petugas`).
- **`Pengaduan`**: Laporan & aspirasi dari masyarakat.
  - Kolom: `id`, `nama_pelapor`, `email_pelapor`, `no_telp_pelapor`, `isi_pengaduan`, `tanggal`, `status_tanggapan` (`Menunggu`, `Diproses`, `Selesai`, `Ditolak`), `isi_tanggapan`, `ditanggapi_oleh_id`, `tanggal_tanggapan`, `created_at`, `updated_at`.
  - Relasi: Ditanggapi oleh `User` / `Admin` (`ditanggapiOleh`).

---

## ⚙️ Panduan Migrasi Database Pertama Kali

### Langkah 1: Siapkan Database
Pastikan database server aktif (misal: MySQL / MariaDB di XAMPP atau Docker). Buat database baru bernama `brmp_diy_db`:
```sql
CREATE DATABASE brmp_diy_db;
```

### Langkah 2: Konfigurasi Connection String di `.env`
Buka file `.env` dan pastikan `DATABASE_URL` sudah sesuai:
```env
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL="mysql://root:@localhost:3306/brmp_diy_db"
```
*(Jika menggunakan PostgreSQL, ubah provider di `prisma/schema.prisma` menjadi `provider = "postgresql"` dan sesuaikan connection string).*

### Langkah 3: Jalankan Migrasi Prisma
Eksekusi perintah berikut untuk membuat tabel dan relasi di database secara otomatis:
```bash
npm run prisma:migrate
```
*Atau secara langsung: `npx prisma migrate dev --name init_database_schema`*

### Langkah 4: (Opsional) Seeding Data Awal
Untuk mengisi akun Admin default, contoh katalog benih, tracking lab, dan pengaduan demo:
```bash
npm run prisma:seed
```

### Langkah 5: (Opsional) Membuka Prisma Studio GUI
Untuk melihat dan mengelola data tabel secara visual lewat browser:
```bash
npm run prisma:studio
```

---

## 🚀 Cara Menjalankan Server

1. **Instalasi:**
   ```bash
   npm install
   ```
2. **Mode Development (Hot-Reload):**
   ```bash
   npm run dev
   ```
3. **Mode Production:**
   ```bash
   npm start
   ```
