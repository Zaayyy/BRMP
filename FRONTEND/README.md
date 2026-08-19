# PRD: BRMP DIY (Sistem Informasi Terpadu Agro Modern)

Dokumen Spesifikasi Kebutuhan Produk (Product Requirement Document) untuk aplikasi web **BRMP DIY**.

---

## 1. Deskripsi Proyek & Vibe
* **Nama Aplikasi**: BRMP DIY (Aplikasi Informasi Terpadu Agro Modern)
* **Tujuan**: Menyediakan layanan pelacakan resi, uji laboratorium, sertifikasi benih, dan konsultasi agro bagi masyarakat, serta dashboard sistem informasi (KITA BRMP DIY) untuk manajemen admin.
* **Vibe / Estetika**: Desain terstandarisasi, bersih, ergonomis, dan fungsional dengan dominasi warna hijau (identik dengan pertanian/agro) dan putih.

---

## 2. Rekomendasi Tech Stack (Tumpukan Teknologi)
* **Framework Frontend**: Next.js (App Router) atau React.js
* **Styling**: Tailwind CSS / Vanilla CSS dengan variabel warna terstandarisasi
* **State Management**: Zustand atau React Context
* **Komponen UI**: Shadcn UI, Headless UI, atau Lucide React Icons
* **Database & Backend**: Supabase / Firebase / Node.js Express

---

## 3. Arsitektur Halaman Utama (Portal Publik)
Halaman ini ditujukan untuk masyarakat umum dan pengguna layanan.

* **Beranda (Landing Page)**: Menampilkan menu layanan digital terintegrasi dan informasi stok benih terkini.
* **Informasi Benih Terkini**: Menampilkan data komoditas seperti Jagung, Padi, Bawang Merah, dan Kedelai.
* **Pelacakan Layanan**: Fitur lacak pengajuan laboratorium menggunakan Nomor SPK/Kode Lab dan pelacakan surat pengajuan dokumen.
* **Detail Pelacakan**: Menampilkan timeline status 5 tahap:
  1. Pengajuan Diterima
  2. Verifikasi Dokumen
  3. Pengujian Sampel
  4. Analisis Hasil
  5. Laporan Selesai
* **Layanan Formulir Publik**: Terdiri dari 6 kategori formulir:
  1. Konsultasi
  2. Pengaduan
  3. Magang
  4. Narasumber
  5. Permohonan Informasi Publik (PPID)
  6. Kunjungan

---

## 4. Arsitektur Halaman Admin (Dashboard KITA BRMP DIY)
Sistem tertutup (memerlukan login) untuk mengelola data operasional.

* **Dashboard Utama**: Menampilkan statistik data permohonan layanan, tren bulanan, dan log aktivitas pengguna secara real-time.
* **Permohonan Layanan**: Tabel daftar permohonan masuk dengan status (*Diterima*, *Diproses*, *Selesai*) dan fitur untuk mengedit data permohonan.
* **Laboratorium**: Modul untuk mengelola jenis sampel, melihat data masuk, dan memantau statistik laporan lab.
* **Manajemen Benih (Data Benih)**: Fitur untuk menambah jenis benih, memperbarui harga, dan mencatat riwayat pergerakan stok (stok masuk dan keluar).
* **User Manajemen**: Pengaturan akun pengguna dengan pembagian peran (*Role*) seperti:
  * Superadmin
  * Admin Lab
  * Admin Layanan
  * Operator
  * Viewer

---

## 5. Estimasi Skema Database (Tabel Utama)

| Nama Tabel | Kolom Utama | Deskripsi |
|---|---|---|
| `users` | `id`, `nama`, `email`, `role`, `status` | Menyimpan data otentikasi dan peran admin. |
| `permohonan` | `id`, `nomor_surat`, `nama_pemohon`, `jenis_layanan`, `status` | Menyimpan data pengajuan layanan publik dan statusnya. |
| `lab_tracker` | `id`, `nomor_spk`, `kode_lab`, `pelanggan`, `analisis`, `status` | Data pelacakan spesifik untuk uji laboratorium. |
| `benih` | `id`, `nama_benih`, `foto`, `harga`, `deskripsi` | Katalog jenis benih yang dikelola sistem. |
| `stok_benih` | `id`, `id_benih`, `tipe` (masuk/keluar), `jumlah`, `tanggal` | Riwayat pergerakan stok (log inventaris). |
| `form_publik` | `id`, `tipe_form`, `nama_pengaju`, `email`, `isi_form`, `tanggal` | Menyimpan data dari keenam form layanan publik. |

---

## 6. Fase Pengembangan (Panduan Prompt untuk AI)

* **Fase 1: Setup & UI Dasar** — Buat kerangka proyek, atur styling, dan bangun komponen navigasi (Navbar & Footer) publik.
* **Fase 2: Portal Publik** — Bangun halaman Beranda, form layanan 6 kategori (Konsultasi, Magang, dll), dan halaman pelacakan (Tracker) resi.
* **Fase 3: Kerangka Dashboard Admin** — Buat layout tata letak admin (Sidebar & Header) untuk "KITA BRMP DIY".
* **Fase 4: CRUD Data Benih & Lab** — Bangun antarmuka tabel Manajemen Benih, riwayat stok benih, dan manajemen sampel laboratorium.
* **Fase 5: Manajemen User & Log** — Selesaikan modul Manajemen Pengguna, hak akses (Role), dan log aktivitas di halaman Dashboard.
* **Fase 6: Integrasi Data** — Hubungkan form yang diisi masyarakat di Portal Publik agar datanya masuk ke tabel Permohonan Layanan di Dashboard Admin.

---

## 🚀 Cara Menjalankan Proyek

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Build untuk produksi
npm run build
```
