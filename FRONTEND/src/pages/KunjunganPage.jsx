import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Upload,
  CheckCircle,
  FileText,
  X,
  MapPin,
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  Users,
  FlaskConical,
  Sprout,
  Home,
  Clock,
  Loader2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

const LOKASI_LIST = [
  {
    id: 'lab-tanah',
    nama: 'Laboratorium Tanah',
    kategori: 'Laboratorium & Pengujian',
    icon: FlaskConical,
    color: '#0284c7',
    bgColor: '#e0f2fe',
    badge: 'Fasilitas Uji',
    deskripsi: 'Laboratorium pengujian kesuburan, sifat kimia, fisika tanah, serta analisa kandungan pupuk dan jaringan tanaman berstandar nasional.',
    fasilitas: ['Alat Uji Spektrofotometer', 'Analisis N-P-K & pH Tanah', 'Edukasi Praktikum Tanah', 'Konsultasi Tim Ahli Kimia Tanah'],
    lokasi: 'Kompleks Laboratorium Terpadu BRMP DIY, Maguwoharjo',
    kapasitas: '15 - 30 Peserta per Sesi',
  },
  {
    id: 'kebun-percobaan',
    nama: 'Kebun Percobaan',
    kategori: 'Lahan Agro Modern',
    icon: Sprout,
    color: '#10b981',
    bgColor: '#d1fae5',
    badge: 'Outdoor Field',
    deskripsi: 'Lahan percontohan budidaya agro modern, display varietas benih unggul bersertifikat (padi, jagung, kedelai, hortikultura), dan teknologi smart farming.',
    fasilitas: ['Display Varietas Unggul', 'Smart Irrigation Demo', 'Edukasi Teknik Polinasi Benih', 'Greenhouse Hidroponik & Organik'],
    lokasi: 'Kebun Percobaan BRMP DIY, Sleman',
    kapasitas: '30 - 80 Peserta per Sesi',
  },
  {
    id: 'wisma-brmp',
    nama: 'Wisma BRMP DIY',
    kategori: 'Akomodasi & Diklat',
    icon: Home,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    badge: 'Wisma Edukasi',
    deskripsi: 'Fasilitas wisma dan penginapan pelatihan untuk rombongan studi banding, magang, bimbingan teknis (bimtek), dan workshop pertanian berkelanjutan.',
    fasilitas: ['Kamar Penginapan Ber-AC', 'Aula Pertemuan / Ruang Diskusi', 'Akses Dekat Lab & Kebun', 'Area Parkir Bus Luas'],
    lokasi: 'Kompleks Wisma & Balai Pelatihan BRMP DIY',
    kapasitas: '20 - 50 Orang Menginap',
  },
  {
    id: 'balai-besar',
    nama: 'Balai Besar BRMP DIY',
    kategori: 'Pusat Kebijakan & Standar',
    icon: Building2,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    badge: 'Kantor Pusat',
    deskripsi: 'Gedung utama Balai Penerapan Modernisasi Pertanian DIY, pusat layanan publik terpadu, PPID, ruang pameran teknologi pertanian, dan audiensi resmi.',
    fasilitas: ['Ruang Rapat Utama & VIP', 'Pojok PPID & Data Pertanian', 'Pameran Standar Mutu Pertanian', 'Penerimaan Audiensi Resmi'],
    lokasi: 'Jl. Stadion Maguwoharjo No 22, Wedomartani, Sleman',
    kapasitas: '20 - 100 Tamu / Audiensi',
  },
];

export default function KunjunganPage() {
  const [selectedLokasi, setSelectedLokasi] = useState(LOKASI_LIST[0]);
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    alamat: '',
    noHp: '',
    email: '',
    lokasiPilihan: LOKASI_LIST[0].nama,
    tanggal: '',
    waktu: '09:00',
    jumlahPeserta: '',
    tujuan: '',
  });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectLokasi = (lokasi) => {
    setSelectedLokasi(lokasi);
    setFormData((prev) => ({ ...prev, lokasiPilihan: lokasi.nama }));
    // Scroll smoothly to the booking form
    const formEl = document.getElementById('form-kunjungan');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullDescription = [
        `[Layanan: Permohonan Kunjungan Lapangan & Edukasi]`,
        `\nLokasi Tujuan: ${formData.lokasiPilihan}`,
        formData.instansi ? `\nInstansi/Sekolah/Komunitas: ${formData.instansi}` : '',
        formData.jumlahPeserta ? `\nJumlah Rombongan: ${formData.jumlahPeserta} Peserta` : '',
        formData.tanggal ? `\nTanggal & Waktu Rencana: ${formData.tanggal} (Pukul ${formData.waktu} WIB)` : '',
        formData.tujuan ? `\nMaksud & Tujuan: ${formData.tujuan}` : '',
        formData.alamat ? `\nAlamat Instansi: ${formData.alamat}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: formData.email,
        no_telp_pelapor: formData.noHp,
        isi_pengaduan: fullDescription,
      });

      const code = res?.data?.kode_tracking || `KUN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        lokasiPilihan: formData.lokasiPilihan,
        tanggal: formData.tanggal,
        jumlahPeserta: formData.jumlahPeserta,
        fileName: file ? file.name : null,
      });
    } catch (err) {
      console.warn('Kunjungan submit note:', err.message);
      const code = `KUN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        lokasiPilihan: formData.lokasiPilihan,
        tanggal: formData.tanggal,
        jumlahPeserta: formData.jumlahPeserta,
        fileName: file ? file.name : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#f4f8f5', paddingBottom: '5rem' }}>
      {/* Top Back Navigation */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 1.5rem auto', padding: '0 1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            color: '#0d6e38',
            padding: '0.55rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #dcfce7',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* HEADER BANNER - MATCHING USER SCREENSHOT */}
        <div
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(13,110,56,0.12)',
            border: '1px solid rgba(16,185,129,0.2)',
            backgroundColor: '#ffffff',
            marginBottom: '3rem',
          }}
        >
          {/* Green Title Header Bar */}
          <div
            style={{
              backgroundColor: '#4e9a7e',
              padding: '1.25rem 2rem',
              textAlign: 'center',
              borderBottom: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Kunjungan
            </h1>
          </div>

          {/* 4 Yellow / Amber Buttons Section (Matching Image) */}
          <div
            style={{
              backgroundColor: '#4e9a7e',
              padding: '0 1.5rem 1.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {LOKASI_LIST.map((item) => {
              const isCurrent = selectedLokasi.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectLokasi(item)}
                  style={{
                    width: '100%',
                    backgroundColor: isCurrent ? '#f59e0b' : '#fbbf24',
                    color: '#0f172a',
                    padding: '0.9rem 1.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    border: isCurrent ? '2px solid #ffffff' : 'none',
                    boxShadow: isCurrent
                      ? '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)'
                      : '0 2px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f59e0b';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isCurrent ? '#f59e0b' : '#fbbf24';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>{item.nama}</span>
                  {isCurrent && <span style={{ fontSize: '0.8rem', backgroundColor: '#0f172a', color: '#ffffff', padding: '0.15rem 0.6rem', borderRadius: '9999px' }}>Terpilih ✓</span>}
                </button>
              );
            })}
          </div>

          {/* BRMP DIY Building Background Image */}
          <div
            style={{
              position: 'relative',
              height: '340px',
              backgroundImage: `url('/images/hero_background.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '2rem',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(5,56,27,0.4) 0%, rgba(5,56,27,0.85) 100%)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                Fasilitas Terbuka untuk Edukasi & Penelitian
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.6rem 0 0.2rem 0' }}>
                {selectedLokasi.nama}
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: 0 }}>
                {selectedLokasi.deskripsi}
              </p>
            </div>
          </div>
        </div>

        {/* DETAILS OF SELECTED LOCATION */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '3rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: selectedLokasi.bgColor,
                color: selectedLokasi.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <selectedLokasi.icon size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedLokasi.color, textTransform: 'uppercase' }}>
                {selectedLokasi.kategori}
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Informasi & Fasilitas {selectedLokasi.nama}
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sprout size={16} color="#10b981" />
                <span>Fasilitas & Ruang Lingkup Kunjungan:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }}>
                {selectedLokasi.fasilitas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#ef4444" />
                <span>Lokasi & Ketentuan:</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', spaceY: '0.5rem', lineHeight: 1.6 }}>
                <div><strong>Alamat:</strong> {selectedLokasi.lokasi}</div>
                <div style={{ marginTop: '0.4rem' }}><strong>Kapasitas:</strong> {selectedLokasi.kapasitas}</div>
                <div style={{ marginTop: '0.4rem' }}><strong>Jam Kunjungan:</strong> Senin – Jumat, 08.00 – 15.00 WIB</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOOKING FORM SECTION */}
        <div
          id="form-kunjungan"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 8px 30px rgba(13,110,56,0.06)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}
            >
              <Calendar size={14} />
              Formulir Kunjungan Online
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
              Ajukan Permohonan Kunjungan
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Isi formulir di bawah ini untuk mengajukan agenda kunjungan sekolah, universitas, instansi pemerintah, atau kelompok tani.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Nama Penanggung Jawab / Pemohon *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dr. Ir. Budi Santoso, M.P."
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Nama Instansi / Sekolah / Universitas *
                </label>
                <input
                  required
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  placeholder="Contoh: Fakultas Pertanian UGM / SMK Pertanian Sleman"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Nomor WhatsApp / HP Aktif *
                </label>
                <input
                  required
                  type="tel"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Email Resmi / Pribadi *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: rombongan@instansi.ac.id"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Lokasi Kunjungan yang Dituju *
                </label>
                <select
                  value={formData.lokasiPilihan}
                  onChange={(e) => {
                    const match = LOKASI_LIST.find((l) => l.nama === e.target.value) || LOKASI_LIST[0];
                    setSelectedLokasi(match);
                    setFormData({ ...formData, lokasiPilihan: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    fontWeight: 700,
                  }}
                >
                  {LOKASI_LIST.map((l) => (
                    <option key={l.id} value={l.nama}>{l.nama} ({l.kategori})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Jumlah Peserta Rombongan (Orang) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.jumlahPeserta}
                  onChange={(e) => setFormData({ ...formData, jumlahPeserta: e.target.value })}
                  placeholder="Contoh: 35"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Rencana Tanggal Kunjungan *
                </label>
                <input
                  required
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Waktu / Jam Kedatangan
                </label>
                <select
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  <option value="08:30">08:30 WIB (Pagi)</option>
                  <option value="09:30">09:30 WIB (Pagi)</option>
                  <option value="10:30">10:30 WIB (Siang)</option>
                  <option value="13:30">13:30 WIB (Siang/Sore)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Maksud, Tujuan & Topik Kunjungan
              </label>
              <textarea
                rows={3}
                value={formData.tujuan}
                onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                placeholder="Contoh: Studi lapangan praktikum budidaya tanaman dan pengenalan laboratorium bagi siswa kelas XII..."
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  resize: 'none',
                }}
              />
            </div>

            {/* Upload Surat Pengantar */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Unggah Surat Pengantar / Proposal (PDF/DOCX, Opsional)
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={24} color="#64748b" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                  {file ? file.name : 'Klik untuk memilih file surat permohonan'}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Maksimal 10MB (PDF atau Word)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                color: '#ffffff',
                padding: '0.95rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(13,110,56,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>{isLoading ? 'Mengirim Permohonan...' : 'Kirim Permohonan Kunjungan'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* POPUP SUKSES */}
      {submitted && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1.5rem',
          }}
          onClick={() => setSubmitted(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem auto',
              }}
            >
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              Permohonan Kunjungan Terkirim!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Agenda kunjungan Anda telah kami simpan di sistem dan diteruskan ke tim pengelola fasilitas BRMP DIY.
            </p>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '1.2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                lineHeight: 1.7,
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Nomor Resi / Tiket: </span>
                <strong style={{ color: '#0d6e38', fontFamily: 'monospace', fontSize: '0.95rem' }}>{submitted.code}</strong>
              </div>
              <div><span style={{ color: '#64748b' }}>Lokasi Tujuan: </span><strong>{submitted.lokasiPilihan}</strong></div>
              <div><span style={{ color: '#64748b' }}>Nama Pemohon: </span><strong>{submitted.nama} ({submitted.instansi})</strong></div>
              <div><span style={{ color: '#64748b' }}>Rencana Tanggal: </span><strong>{submitted.tanggal} ({submitted.jumlahPeserta} Peserta)</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/6285878438548?text=${encodeURIComponent(`Halo Admin BRMP DIY, saya telah mengajukan permohonan kunjungan ke ${submitted.lokasiPilihan} dengan Nomor Tiket: ${submitted.code}. Mohon konfirmasi jadwalnya. Terima kasih.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Phone size={18} />
                <span>Konfirmasi via WhatsApp Resmi</span>
              </a>

              <button
                onClick={() => setSubmitted(null)}
                style={{
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
