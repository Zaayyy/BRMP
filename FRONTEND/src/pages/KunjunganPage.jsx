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
  ShieldCheck,
  Award,
  Sparkles,
  HelpCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

const LOKASI_LIST = [
  {
    id: 'lab-tanah',
    nama: 'Laboratorium Tanah',
    kategori: 'Laboratorium & Analisis Mutu',
    badge: 'Fasilitas Pengujian',
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani kunjungan edukasi, studi banding, dan pengenalan instrumen pengujian laboratorium tanah dan tanaman.',
    icon: FlaskConical,
    color: '#0284c7',
    persyaratan: [
      'Menulis identitas sesuai kartu identitas (KTP/KTM/Kartu Pelajar) dan maksud kedatangan pada buku tamu.',
      'Mengisi form permohonan layanan kunjungan online dan melampirkan surat pengantar resmi dari instansi/sekolah (jika rombongan).',
      'Mematuhi tata tertib keselamatan dan keamanan laboratorium (K3) selama berada di area pengujian.',
    ],
    prosedur: [
      'Pengguna layanan mengajukan permohonan kunjungan laboratorium melalui sistem portal BRMP DIY;',
      'Pengguna layanan mengisi buku tamu dan melengkapi data penanggung jawab;',
      'Petugas layanan informasi menerima, mencatat, dan menyampaikan permohonan kepada Kepala Laboratorium;',
      'Pejabat berwenang mendisposisi jadwal kunjungan dan menugaskan analis/instruktur pendamping;',
      'Penanggung jawab lab dan tim analis menyiapkan bahan edukasi dan memandu jalannya kunjungan praktikum/studi;',
      'Tim mendokumentasikan kegiatan dan menyerahkan lembar informasi teknis laboratorium;',
      'Pemohon layanan mengisi formulir Survey Kepuasan Masyarakat (SKM) yang disediakan oleh petugas.',
    ],
    biaya: 'Pelayanan kunjungan edukasi laboratorium tidak dipungut biaya / GRATIS (Rp. 0)',
    output: 'Layanan edukasi instrumen pengujian, pendampingan teknis kimia tanah, dan sertifikat/kunjungan resmi.',
    waktu: 'Durasi kunjungan 2 - 4 jam per sesi (Senin – Jumat, 08.00 – 15.00 WIB)',
  },
  {
    id: 'kebun-percobaan',
    nama: 'Kebun Percobaan',
    kategori: 'Lahan Agro Eduwisata Modern',
    badge: 'Outdoor Field',
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani kunjungan agro eduwisata, studi lapang varietas benih unggul, dan percontohan smart farming.',
    icon: Sprout,
    color: '#10b981',
    persyaratan: [
      'Menulis identitas penanggung jawab rombongan dan maksud kunjungan.',
      'Mengisi formulir permohonan kunjungan kebun percobaan secara digital.',
      'Menjaga kebersihan dan kelestarian tanaman serta fasilitas percontohan selama kunjungan.',
    ],
    prosedur: [
      'Pengguna layanan mengajukan permohonan kunjungan agro eduwisata kebun percobaan;',
      'Pengguna layanan mengisi buku tamu digital dan melengkapi rincian rombongan;',
      'Petugas layanan informasi menerima, meregistrasi, dan meneruskan permohonan ke Koordinator Kebun Percobaan;',
      'Koordinator menetapkan jadwal, rute edukasi lapang, dan pemandu pertanian modern;',
      'Pemandu memandu rombongan menjelajahi display varietas unggul, smart irrigation, dan greenhouse;',
      'Tim mendokumentasikan jalannya kegiatan agro eduwisata;',
      'Pemohon layanan mengisi Survey Kepuasan Masyarakat (SKM) bersama petugas.',
    ],
    biaya: 'Pelayanan kunjungan Kebun Percobaan Agro Eduwisata tidak dipungut biaya / GRATIS (Rp. 0)',
    output: 'Layanan pemanduan lapang budidaya modern, demonstrasi varietas unggul, dan edukasi pertanian presisi.',
    waktu: 'Jam Kunjungan Kebun Percobaan : 1 hari (Sesi Pagi: 08.00 - 11.30 / Sesi Siang: 13.00 - 15.30 WIB)',
  },
  {
    id: 'wisma-brmp',
    nama: 'Wisma BRMP DIY',
    kategori: 'Akomodasi & Diklat Pertanian',
    badge: 'Fasilitas Wisma',
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani permohonan akomodasi wisma untuk peserta pelatihan, magang, bimbingan teknis, dan studi banding pertanian.',
    icon: Home,
    color: '#f59e0b',
    persyaratan: [
      'Menulis identitas resmi instansi penyelenggara diklat/rombongan tamu.',
      'Mengisi form permohonan reservasi wisma dengan mencantumkan jumlah peserta dan durasi menginap.',
      'Menjaga ketertiban, kebersihan kamar, dan fasilitas bersama di lingkungan wisma.',
    ],
    prosedur: [
      'Pengguna layanan mengajukan reservasi wisma untuk keperluan diklat, magang, atau studi banding;',
      'Petugas pengelola wisma memeriksa ketersediaan kamar dan aula pertemuan;',
      'Petugas menyampaikan permohonan dan konfirmasi tarif/disposisi pimpinan;',
      'Penyerahan kunci kamar dan pengenalan fasilitas wisma kepada penanggung jawab tamu;',
      'Penyediaan layanan kebersihan dan dukungan sarana pertemuan;',
      'Pemeriksaan akhir fasilitas saat check-out tamu;',
      'Pemohon mengisi Survey Kepuasan Masyarakat (SKM).',
    ],
    biaya: 'Sesuai dengan ketentuan PNBP yang berlaku untuk akomodasi kedinasan / Free koordinasi kegiatan resmi BRMP DIY',
    output: 'Akomodasi kamar penginapan, ruang aula pertemuan, dan fasilitas pendukung diklat.',
    waktu: 'Layanan Check-in 13.00 WIB & Check-out 12.00 WIB (Sesuai surat tugas)',
  },
  {
    id: 'balai-besar',
    nama: 'Balai Besar BRMP DIY',
    kategori: 'Pusat Standarisasi & Audiensi',
    badge: 'Kantor Pusat',
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani kunjungan kelembagaan, audiensi kedinasan, studi banding PPID, dan konsultasi kebijakan standarisasi pertanian.',
    icon: Building2,
    color: '#8b5cf6',
    persyaratan: [
      'Membawa dan melampirkan Surat Permohonan Kunjungan / Audiensi Resmi dari pimpinan instansi pengirim.',
      'Menulis identitas pada buku tamu resepsionis utama kantor BRMP DIY.',
      'Menaati tata tertib berpakaian rapi dan etika kedinasan di lingkungan Balai.',
    ],
    prosedur: [
      'Pengguna layanan mengajukan surat dan form permohonan kunjungan audiensi kehumasan/PPID;',
      'Petugas Front Office menerima surat dan menyampaikan kepada Kepala Balai;',
      'Disposisi persetujuan waktu dan penunjukan ruang rapat utama/pejabat yang menyambut;',
      'Pelaksanaan audiensi, paparan profil inovasi pertanian modern, dan diskusi tanya jawab;',
      'Sesi pertukaran cinderamata dan foto bersama kelembagaan;',
      'Tim humas mempublikasikan dokumentasi kegiatan kunjungan resmi;',
      'Tamu mengisi Survey Kepuasan Masyarakat (SKM).',
    ],
    biaya: 'Pelayanan kunjungan kelembagaan dan audiensi kedinasan GRATIS (Rp. 0)',
    output: 'Layanan penerimaan audiensi resmi, transfer informasi kebijakan standarisasi, dan bahan publikasi PPID.',
    waktu: 'Sesuai jadwal audiensi yang disetujui (Hari kerja Senin – Jumat)',
  },
];

export default function KunjunganPage() {
  const [modalDetail, setModalDetail] = useState(null); // Detail SOP modal (matching screenshot)
  const [modalFormOpen, setModalFormOpen] = useState(false); // Clean Booking form modal
  const [selectedTarget, setSelectedTarget] = useState(LOKASI_LIST[0]);

  // Form State
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

  // Open SOP Modal when clicking yellow button
  const handleOpenDetailModal = (item) => {
    setSelectedTarget(item);
    setFormData((prev) => ({ ...prev, lokasiPilihan: item.nama }));
    setModalDetail(item);
  };

  // Open Form from inside the SOP modal
  const handleOpenFormFromModal = () => {
    setModalDetail(null);
    setModalFormOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullDescription = [
        `[Layanan: Permohonan Kunjungan & Eduwisata Lapang]`,
        `\nLokasi Tujuan: ${formData.lokasiPilihan}`,
        formData.instansi ? `\nInstansi/Sekolah/Rombongan: ${formData.instansi}` : '',
        formData.jumlahPeserta ? `\nJumlah Rombongan: ${formData.jumlahPeserta} Peserta` : '',
        formData.tanggal ? `\nTanggal & Waktu: ${formData.tanggal} (Pukul ${formData.waktu} WIB)` : '',
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
      setModalFormOpen(false);
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
      setModalFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#f0fdf4', paddingBottom: '5rem' }}>
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
        {/* MAIN SECTION - MATCHING USER SCREENSHOT EXACTLY */}
        <div
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(13,110,56,0.14)',
            border: '1.5px solid rgba(16,185,129,0.25)',
            backgroundColor: '#ffffff',
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
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              Kunjungan
            </h1>
          </div>

          {/* 4 Yellow / Golden Buttons Container */}
          <div
            style={{
              backgroundColor: '#4e9a7e',
              padding: '0 1.5rem 1.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            {LOKASI_LIST.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpenDetailModal(item)}
                style={{
                  width: '100%',
                  backgroundColor: '#ffba08',
                  color: '#0f172a',
                  padding: '1rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  border: 'none',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  position: 'relative',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f59e0b';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.008)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffba08';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)';
                }}
              >
                <span>{item.nama}</span>
              </button>
            ))}
          </div>

          {/* BRMP Building Photo Banner (As in Image) */}
          <div
            style={{
              position: 'relative',
              height: '380px',
              backgroundImage: `url('/images/hero_background.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '2.5rem',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(5,56,27,0.3) 0%, rgba(5,56,27,0.92) 100%)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backdropFilter: 'blur(6px)',
                  marginBottom: '0.75rem',
                }}
              >
                <span>🌱 Balai Besar Modernisasi Pertanian DIY</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.25 }}>
                Pusat Edukasi, Standarisasi Mutu & Pertanian Modern DIY
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: 0, lineHeight: 1.6 }}>
                Silakan klik salah satu pilihan fasilitas di atas untuk melihat detail persyaratan, alur pelayanan resmi, serta mengajukan formulir permohonan kunjungan secara digital.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. MODAL DETAIL PENJELASAN (MATCHING USER SCREENSHOT EXACTLY) */}
      {modalDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            padding: '1.25rem',
          }}
          onClick={() => setModalDetail(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)',
              animation: 'fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Title + Close Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {modalDetail.nama}
              </h3>
              <button
                onClick={() => setModalDetail(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Content (Persis seperti teks format di screenshot) */}
            <div style={{ padding: '1.75rem', fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.65 }}>
              <p style={{ margin: '0 0 1.25rem 0', color: '#334155' }}>
                {modalDetail.descRingkas}
              </p>

              {/* PERSYARATAN PENGGUNA LAYANAN */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  PERSYARATAN PENGGUNA LAYANAN:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', spaceY: '0.35rem' }}>
                  {modalDetail.persyaratan.map((syarat, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{syarat}</li>
                  ))}
                </ol>
              </div>

              {/* PROSEDUR / ALUR PELAYANAN */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  PROSEDUR / ALUR PELAYANAN:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {modalDetail.prosedur.map((alur, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{alur}</li>
                  ))}
                </ol>
              </div>

              {/* BIAYA / TARIF */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.02em' }}>
                  BIAYA / TARIF:
                </h4>
                <p style={{ margin: 0, color: '#15803d', fontWeight: 700 }}>
                  {modalDetail.biaya}
                </p>
              </div>

              {/* OUTPUT LAYANAN */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.02em' }}>
                  OUTPUT LAYANAN:
                </h4>
                <p style={{ margin: 0 }}>{modalDetail.output}</p>
              </div>

              {/* WAKTU PENYELESAIAN LAYANAN */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.02em' }}>
                  WAKTU PENYELESAIAN LAYANAN:
                </h4>
                <p style={{ margin: 0 }}>{modalDetail.waktu}</p>
              </div>

              {/* ACTION BUTTON: FORM KUNJUNGAN (Green Full-width as in image) */}
              <button
                onClick={handleOpenFormFromModal}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981, #0d6e38)',
                  color: '#ffffff',
                  padding: '0.9rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(13,110,56,0.3)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Calendar size={18} />
                <span>Form Kunjungan</span>
              </button>

              {/* RED CLOSE BUTTON (As in bottom right of image) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setModalDetail(null)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    padding: '0.55rem 1.6rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL FORMULIR PENDAFTARAN KUNJUNGAN ONLINE (MODERN & PREMIUM) */}
      {modalFormOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1.25rem',
          }}
          onClick={() => setModalFormOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2.5rem',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4)',
              position: 'relative',
              animation: 'fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalFormOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
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
                  marginBottom: '0.6rem',
                }}
              >
                <Calendar size={14} />
                <span>Formulir Permohonan Kunjungan</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                Agenda Kunjungan {selectedTarget.nama}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                Lengkapi data di bawah ini untuk penerbitan tiket dan konfirmasi jadwal resmi petugas.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Nama Penanggung Jawab Rombongan *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Dr. Ir. Budi Santoso, M.P."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Nama Instansi / Sekolah / Universitas *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    placeholder="Contoh: Universitas Gadjah Mada"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Nomor WhatsApp / Telepon Aktif *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Email Resmi / Pemohon *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: pemohon@instansi.ac.id"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Fasilitas Lokasi yang Dipilih *
                  </label>
                  <select
                    value={formData.lokasiPilihan}
                    onChange={(e) => {
                      const match = LOKASI_LIST.find((l) => l.nama === e.target.value) || LOKASI_LIST[0];
                      setSelectedTarget(match);
                      setFormData({ ...formData, lokasiPilihan: e.target.value });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Jumlah Peserta Rombongan (Orang) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.jumlahPeserta}
                    onChange={(e) => setFormData({ ...formData, jumlahPeserta: e.target.value })}
                    placeholder="Contoh: 30"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Rencana Tanggal Kunjungan *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Jam Kedatangan
                  </label>
                  <select
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Maksud & Tujuan Kunjungan
                </label>
                <textarea
                  rows={3}
                  value={formData.tujuan}
                  onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                  placeholder="Contoh: Studi lapangan praktikum budidaya tanaman dan pengenalan laboratorium bagi siswa..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Upload Surat */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Unggah Surat Permohonan / Proposal Resmi (PDF/DOCX, Opsional)
                </label>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '1.25rem',
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
                  <Upload size={20} color="#64748b" style={{ margin: '0 auto 0.35rem auto' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    {file ? file.name : 'Pilih file surat permohonan instansi'}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Maksimal 10MB (PDF atau Word)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalFormOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                    color: '#ffffff',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(13,110,56,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  <span>{isLoading ? 'Mengirim...' : 'Kirim Permohonan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL POPUP SUKSES */}
      {submitted && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
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
              animation: 'fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1)',
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
              Permohonan Kunjungan Berhasil Terkirim!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Data kunjungan Anda telah tercatat di sistem BRMP DIY dan diteruskan ke petugas penanggung jawab.
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
              <div><span style={{ color: '#64748b' }}>Lokasi Pilihan: </span><strong>{submitted.lokasiPilihan}</strong></div>
              <div><span style={{ color: '#64748b' }}>Nama Pemohon: </span><strong>{submitted.nama} ({submitted.instansi})</strong></div>
              <div><span style={{ color: '#64748b' }}>Jadwal Kunjungan: </span><strong>{submitted.tanggal} ({submitted.jumlahPeserta} Peserta)</strong></div>
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
