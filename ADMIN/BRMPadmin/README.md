# PRD - BRMP DIY Admin Dashboard

Dokumen ini memuat kebutuhan produk dan kondisi terkini aplikasi admin BRMP DIY berdasarkan implementasi frontend yang ada saat ini. Fokus utama saat ini adalah membangun antarmuka operasional admin yang terstruktur untuk mengelola layanan dan laboratorium secara terpusat.

---

## 1. Ringkasan Produk

BRMP DIY Admin Dashboard adalah aplikasi admin internal yang dirancang untuk membantu tim operasional memantau dan mengelola kegiatan penting dalam satu tampilan. Aplikasi ini berfungsi sebagai dashboard kontrol untuk melihat kondisi layanan, progres laboratorium, dan ringkasan aktivitas harian.

Tujuan utamanya adalah:

- mempercepat monitoring operasional
- memudahkan admin melihat status permohonan
- memberikan overview laboratorium secara real-time seperti mock data
- membuat workflow administrasi lebih rapi dan mudah dikelola

---

## 2. Fokus Aplikasi Saat Ini

Versi saat ini masih berada pada tahap prototype UI/dashboard admin. Fokus pengembangan adalah pengalaman pengguna yang bersih, modern, dan mudah dipahami untuk kebutuhan internal.

### Modul yang sudah tersedia saat ini

- Dashboard utama dengan ringkasan KPI
- Halaman Permohonan Layanan
- Halaman Laboratorium dengan beberapa sub-tampilan:
    - Jenis Sampel
    - Data Masuk Laboratorium
    - Laporan Lab Selesai
- Modul Data Benih dengan tampilan:
    - Jenis Benih
    - Update Benih / Riwayat Stok
    - Form Tambah Jenis Benih
    - Form Tambah Update Stok
- Halaman User Management (mock data dan aksi dasar)
- Navigasi antar modul menggunakan shell admin yang terstruktur
- Search dan filter visual pada beberapa halaman
- Statistika monitoring lab dan tren bulanan
- Log aktivitas dan shortcut aksi cepat

### Modul yang belum sepenuhnya jadi produk nyata

- Autentikasi dan role-based access
- Integrasi backend/database
- Penyimpanan data nyata dan API CRUD penuh
- Validasi input dan notifikasi sukses/error yang lengkap

---

## 5. Ruang Lingkup Fitur

### 5.1 Dashboard Admin

Dashboard menampilkan ringkasan operasional utama, mencakup:

- permohonan hari ini
- sampel laboratorium yang diproses
- stok benih aktif
- akun aktif
- log aktivitas terbaru
- shortcut operasional
- tren permohonan bulanan

### 5.2 Permohonan

Halaman permohonan berfungsi untuk memantau data masuk dan status proses. Saat ini tampilannya mencakup:

- total permohonan
- butuh review
- diterima
- selesai
- tabel daftar permohonan dengan kolom data pemohon, pekerjaan, tipe, email, nomor HP, dan status
- prioritas hari ini dan ringkasan pelayanan

### 5.3 Laboratorium

Modul laboratorium adalah fokus operasional kedua setelah permohonan. Saat ini tersedia beberapa submodul:

- Jenis Sampel
    - menambah jenis sampel baru
    - melihat daftar jenis sampel
    - aksi edit dan hapus
- Data Masuk Laboratorium
    - data sample masuk
    - status proses
    - tabel monitoring dengan filter bulan dan tahun
- Laporan Lab Selesai
    - daftar laporan sampel finished
    - tombol aksi lihat dan buka file laporan

### 5.4 Data Benih

Modul benih kini memiliki beberapa halaman terkait stok dan entri data:

- Jenis Benih
    - daftar jenis benih dengan foto, stok, dan harga
    - aksi edit dan hapus
- Update Benih
    - riwayat perubahan stok masuk/keluar
    - ringkasan total masuk, total keluar, dan stok tersedia
    - tombol Tambah Update Stok
- Tambah Jenis Benih
    - form untuk menambah jenis benih baru
    - upload foto benih
    - judul, harga, dan deskripsi
- Tambah Update Stok
    - form untuk mencatat stok masuk atau keluar
    - pilihan jenis benih, jenis update, jumlah, tanggal, dan catatan

### 5.5 Monitoring dan Status

Aplikasi menyediakan komponen monitoring untuk memperlihatkan:

- jumlah sampel masuk
- dalam proses
- selesai
- stok benih aktif
- tren layanan dan aktivitas terbaru

---

## 3. Pengguna Utama

Aplikasi ini ditujukan untuk pengguna internal BRMP DIY, terutama:

- Superadmin
- Admin Laboratorium
- Admin Layanan / Permohonan
- Operator
- Tim teknis / pengelola data internal

---

## 4. Visi UI/UX

Desain aplikasi menggunakan pola dashboard modern dengan nuansa agribisnis dan operasional yang rapi. Tampilan dibuat agar cepat dibaca, ringkas, dan konsisten di tiap halaman.

Karakteristik utama:

- warna dominan hijau, putih, dan nuansa bumi/pertanian
- layout yang rapi dan efisien
- prioritas pada informasi utama di bagian atas
- penggunaan card, badge, dan tabel untuk visual data
- tombol aksi cepat untuk kebutuhan admin sehari-hari

---

## 5. Ruang Lingkup Fitur

### 5.1 Dashboard Admin

Dashboard menampilkan ringkasan operasional utama, mencakup:

- permohonan hari ini
- sampel laboratorium yang diproses
- stok benih aktif
- akun aktif
- log aktivitas terbaru
- shortcut operasional
- tren permohonan bulanan

### 5.2 Permohonan

Halaman permohonan berfungsi untuk memantau data masuk dan status proses. Saat ini tampilannya mencakup:

- total permohonan
- butuh review
- diterima
- selesai
- tabel daftar permohonan dengan kolom data pemohon, pekerjaan, tipe, email, nomor HP, dan status
- prioritas hari ini dan ringkasan pelayanan

### 5.3 Laboratorium

Modul laboratorium adalah fokus operasional kedua setelah permohonan. Saat ini tersedia beberapa submodul:

- Jenis Sampel
    - menambah jenis sampel baru
    - melihat daftar jenis sampel
    - aksi edit dan hapus
- Data Masuk Laboratorium
    - data sample masuk
    - status proses
    - tabel monitoring dengan filter bulan dan tahun
- Laporan Lab Selesai
    - daftar laporan sampel finished
    - tombol aksi lihat dan buka file laporan

### 5.4 Monitoring dan Status

Aplikasi menyediakan komponen monitoring untuk memperlihatkan:

- jumlah sampel masuk
- dalam proses
- selesai
- progress bar status
- ringkasan total sampel

---

## 6. Status Pengembangan Saat Ini

Saat ini proyek berada pada tahapan UI prototype/admin dashboard dengan data statis/mock. Artinya:

- tampilan antarmuka sudah tersedia dan terstruktur
- navigasi antar modul sudah berjalan
- data masih bersifat sample / demo
- belum ada backend dan database terhubung secara nyata
- belum ada auth/role management yang benar-benar terimplementasi

---

## 7. Teknologi yang Digunakan

- React.js
- Vite
- Tailwind CSS
- Lucide React Icons

---

## 8. Produk Requirement Summary

### Functional requirements

- admin dapat melihat overview operasional di dashboard
- admin dapat membuka halaman permohonan dan melihat data status
- admin dapat melihat data laboratorium secara terpisah per submodul
- admin dapat mencari dan memfilter data di beberapa halaman
- admin dapat melakukan aksi cepat seperti review, import, dan monitoring

### Non-functional requirements

- tampilan harus responsif untuk desktop dan tablet
- antarmuka harus bersih, mudah dibaca, dan konsisten
- pengalaman pengguna harus fokus pada efisiensi operasional
- UI harus siap dikembangkan lebih lanjut ke sistem data nyata

---

## 9. Rencana Pengembangan Selanjutnya

Prioritas berikutnya untuk mengubah dashboard ini menjadi sistem operasional yang lebih lengkap:

1. Integrasi autentikasi dan role-based access
2. Koneksi ke backend dan database
3. CRUD untuk permohonan, laboratorium, jenis sampel, dan data user
4. Pembuatan modul benih dan inventory
5. Real-time monitoring dan notifikasi
6. Export laporan PDF/Excel yang benar-benar terhubung ke data
7. Audit log dan histori perubahan data

---

## 10. Status Saat Ini vs Tujuan Produk

| Area            | Status saat ini             | Target masa depan              |
| --------------- | --------------------------- | ------------------------------ |
| Dashboard admin | Sudah ada                   | Dipertahankan dan dikembangkan |
| Permohonan      | UI dan mock data sudah ada  | CRUD + integrasi backend       |
| Laboratorium    | UI dan monitoring sudah ada | Data nyata + workflow lengkap  |
| User management | Belum ada                   | Full user & role management    |
| Benih / stok    | Belum ada                   | Modul inventory lengkap        |
| Backend         | Belum ada                   | API + database terintegrasi    |

---

## 11. Cara Menjalankan Proyek

```bash
# Install dependency
npm install

# Jalankan aplikasi lokal
npm run dev

# Build untuk produksi
npm run build
```

---

## 12. Kesimpulan

BRMP DIY Admin Dashboard saat ini sudah menjadi prototype dashboard operasional yang cukup solid untuk kebutuhan admin internal. Fokus utamanya adalah memberi pandangan menyeluruh terhadap proses permohonan dan laboratorium, dengan potensi pengembangan lebih lanjut menjadi sistem manajemen BRMP DIY yang lengkap dan terintegrasi.
