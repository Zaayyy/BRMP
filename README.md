# 🌾 BRMP DIY - Sistem Informasi & Pelayanan Terpadu Balai Standarisasi Pertanian

Monorepo resmi aplikasi **BRMP DIY (Balai Besar Standar Instrumen Pertanian / Balai Pengawasan & Sertifikasi Benih DIY)** yang mencakup Website Publik, Portal Petugas/Admin, dan Backend REST API.

---

## 📁 Struktur Monorepo

```plaintext
BRMP/
├── BACKEND/             # Express.js + Prisma ORM + MySQL Database
│   ├── config/          # Konfigurasi CORS, Prisma, JWT, Sanitasi
│   ├── controllers/     # Controller CRUD (Auth, Benih, Lab, Pengaduan)
│   ├── middleware/      # JWT Authentication & Role Authorization
│   ├── prisma/          # Prisma Schema & Database Migrations
│   └── routes/          # Public Routes, Internal Routes, Auth Routes
│
├── FRONTEND/            # React + Vite (Website Publik Masyarakat)
│   ├── src/components/  # Hero, Katalog Benih, Lab Tracking, Portal Layanan, dll.
│   ├── src/pages/       # Konsultasi, Narasumber, Magang, Tracking, Benih
│   └── src/services/    # API Service Interceptor
│
└── ADMIN/
    └── BRMPadmin/       # React + Vite + Tailwind (Portal Internal Admin & Lab)
        ├── src/components/ # AdminShell, Modals, Stat Cards
        ├── src/pages/      # Dashboard, Permohonan, Benih, Lab, Settings
        └── src/services/   # JWT Auth & Internal API Services
```

---

## 🚀 Panduan Menjalankan Project

### 1. Menjalankan Backend (`BACKEND/`)
```bash
cd BACKEND
npm install
npx prisma db push
npm run dev
# Backend berjalan di http://localhost:5000
```

### 2. Menjalankan Website Publik (`FRONTEND/`)
```bash
cd FRONTEND
npm install
npm run dev
# Frontend berjalan di http://localhost:3000 (atau port Vite default)
```

### 3. Menjalankan Portal Admin (`ADMIN/BRMPadmin/`)
```bash
cd ADMIN/BRMPadmin
npm install
npm run dev
# Admin berjalan di http://localhost:5173
```

---

## 🔐 Akun Default Admin / Petugas

- **Superadmin**: `admin@brmpdiy.go.id` / `Password123!`
- **Petugas Lab**: `petugaslab@brmpdiy.go.id` / `Password123!`

---

## 🌟 Fitur Utama
1. **Katalog Benih Real-Time**: Integrasi langsung antara inventaris admin dengan etalase benih publik.
2. **Layanan Pengaduan & Tracking Resi**: Laporan masuk dari masyarakat (Konsultasi, Magang, Pengaduan) dapat ditanggapi langsung oleh admin dan dilacak statusnya secara real-time.
3. **Sistem Tracking Laboratorium**: Pendaftaran dan pemantauan pengujian mutu sampel benih dan tanah.
