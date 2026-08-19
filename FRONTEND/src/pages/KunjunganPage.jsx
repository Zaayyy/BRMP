import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, CheckCircle, X, MapPin, Calendar,
  Building2, Phone, FlaskConical, Sprout, Home, Loader2,
  ChevronRight, Users, Clock, DollarSign, FileText, Star
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

const LOKASI_LIST = [
  {
    id: 'lab-tanah',
    nama: 'Laboratorium Tanah',
    emoji: '🧪',
    kategori: 'Laboratorium & Analisis Mutu',
    badge: 'Fasilitas Pengujian',
    // Different Unsplash images for each facility
    bgImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1400&q=80',
    bgGradient: 'linear-gradient(180deg, rgba(2,56,110,0.3) 0%, rgba(2,56,110,0.92) 100%)',
    accentColor: '#0ea5e9',
    tagColor: '#bae6fd',
    tagBg: 'rgba(14,165,233,0.25)',
    icon: FlaskConical,
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani kunjungan edukasi, studi banding, dan pengenalan instrumen pengujian laboratorium tanah dan tanaman.',
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
    output: 'Layanan edukasi instrumen pengujian, pendampingan teknis kimia tanah, dan sertifikat kunjungan resmi.',
    waktu: 'Durasi kunjungan 2 - 4 jam per sesi (Senin – Jumat, 08.00 – 15.00 WIB)',
    kapasitas: '15 – 30 Peserta',
  },
  {
    id: 'kebun-percobaan',
    nama: 'Kebun Percobaan',
    emoji: '🌾',
    kategori: 'Lahan Agro Eduwisata Modern',
    badge: 'Outdoor Field',
    bgImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=80',
    bgGradient: 'linear-gradient(180deg, rgba(5,56,27,0.25) 0%, rgba(5,56,27,0.92) 100%)',
    accentColor: '#10b981',
    tagColor: '#bbf7d0',
    tagBg: 'rgba(16,185,129,0.25)',
    icon: Sprout,
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani kunjungan agro eduwisata, studi lapang varietas benih unggul, dan percontohan smart farming.',
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
    waktu: 'Jam Kunjungan : 1 hari (Sesi Pagi 08.00–11.30 / Sesi Siang 13.00–15.30 WIB)',
    kapasitas: '30 – 80 Peserta',
  },
  {
    id: 'wisma-brmp',
    nama: 'Wisma BRMP DIY',
    emoji: '🏡',
    kategori: 'Akomodasi & Diklat Pertanian',
    badge: 'Fasilitas Wisma',
    bgImage: 'https://images.unsplash.com/photo-1501117716987-5c432a1c8e2e?auto=format&fit=crop&w=1400&q=80',
    bgGradient: 'linear-gradient(180deg, rgba(92,56,5,0.3) 0%, rgba(92,56,5,0.92) 100%)',
    accentColor: '#f59e0b',
    tagColor: '#fde68a',
    tagBg: 'rgba(245,158,11,0.25)',
    icon: Home,
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani permohonan akomodasi wisma untuk peserta pelatihan, magang, bimbingan teknis, dan studi banding pertanian.',
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
    biaya: 'Sesuai ketentuan PNBP yang berlaku / Free untuk koordinasi kegiatan resmi BRMP DIY',
    output: 'Akomodasi kamar penginapan, ruang aula pertemuan, dan fasilitas pendukung diklat.',
    waktu: 'Check-in 13.00 WIB & Check-out 12.00 WIB (Sesuai surat tugas)',
    kapasitas: '20 – 50 Orang Menginap',
  },
  {
    id: 'balai-besar',
    nama: 'Balai Besar BRMP DIY',
    emoji: '🏛️',
    kategori: 'Pusat Standarisasi & Audiensi',
    badge: 'Kantor Pusat',
    bgImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80',
    bgGradient: 'linear-gradient(180deg, rgba(56,5,92,0.25) 0%, rgba(30,5,56,0.92) 100%)',
    accentColor: '#8b5cf6',
    tagColor: '#ddd6fe',
    tagBg: 'rgba(139,92,246,0.25)',
    icon: Building2,
    descRingkas: 'Balai Besar Modernisasi Pertanian (BRMP) DIY melayani kunjungan kelembagaan, audiensi kedinasan, studi banding PPID, dan konsultasi kebijakan standarisasi pertanian.',
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
    kapasitas: '20 – 100 Tamu',
  },
];

export default function KunjunganPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [modalDetail, setModalDetail] = useState(null);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(LOKASI_LIST[0]);

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

  const activeLokasi = LOKASI_LIST[activeIdx];

  const handleSelectLokasi = (idx) => {
    if (idx === activeIdx || transitioning) return;
    setPrevIdx(activeIdx);
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setTransitioning(false);
    }, 350);
  };

  const handleOpenDetail = (item, idx) => {
    handleSelectLokasi(idx);
    setTimeout(() => setModalDetail(item), idx === activeIdx ? 0 : 380);
  };

  const handleOpenForm = (item) => {
    setFormTarget(item);
    setFormData((prev) => ({ ...prev, lokasiPilihan: item.nama }));
    setModalDetail(null);
    setTimeout(() => setModalFormOpen(true), 200);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fullDescription = [
        `[Layanan: Permohonan Kunjungan & Eduwisata]`,
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
      setSubmitted({ code, nama: formData.nama, instansi: formData.instansi, lokasiPilihan: formData.lokasiPilihan, tanggal: formData.tanggal, jumlahPeserta: formData.jumlahPeserta });
      setModalFormOpen(false);
    } catch (err) {
      const code = `KUN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({ code, nama: formData.nama, instansi: formData.instansi, lokasiPilihan: formData.lokasiPilihan, tanggal: formData.tanggal, jumlahPeserta: formData.jumlahPeserta });
      setModalFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '76px', minHeight: '100vh', backgroundColor: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .kunjungan-hero-img {
          transition: opacity 0.4s ease, transform 0.5s ease;
        }
        .kunjungan-hero-img.out {
          opacity: 0;
          transform: scale(1.05);
        }
        .kunjungan-hero-img.in {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      {/* ─────────────────────── BACK BUTTON ─────────────────────── */}
      <div style={{ maxWidth: '1140px', margin: '0 auto 1.5rem', padding: '0 1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#fff', color: '#0d6e38', padding: '0.55rem 1.2rem',
            borderRadius: '9999px', fontSize: '0.86rem', fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #dcfce7', transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
        >
          <ArrowLeft size={16} /><span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>

        {/* ═══════════════════ MAIN HERO CARD ═══════════════════ */}
        <div style={{
          borderRadius: '28px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(13,110,56,0.16), 0 4px 12px rgba(0,0,0,0.05)',
          border: '1.5px solid rgba(16,185,129,0.2)',
          backgroundColor: '#fff', marginBottom: '2.5rem',
          animation: 'fadeInScale 0.5s ease both',
        }}>

          {/* Green Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #0d6e38 0%, #1a9e5a 50%, #0d6e38 100%)',
            padding: '1.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-40px', left: '10%', width: '200px', height: '200px',
              borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{
              position: 'absolute', top: '-60px', right: '5%', width: '280px', height: '280px',
              borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
            }} />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.15)', color: '#d1fae5',
              padding: '0.3rem 0.9rem', borderRadius: '9999px',
              fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', backdropFilter: 'blur(4px)', marginBottom: '0.6rem',
              display: 'block',
            }}>
              🌱 Balai Besar Modernisasi Pertanian DIY
            </span>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 900, color: '#fff',
              margin: 0, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              Kunjungan & Eduwisata
            </h1>
            <p style={{
              fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)',
              margin: '0.4rem 0 0 0', fontWeight: 400,
            }}>
              Pilih fasilitas yang ingin Anda kunjungi untuk melihat informasi lengkap layanan
            </p>
          </div>

          {/* ─── TAB BUTTONS (Vertical inside green panel) ─── */}
          <div style={{
            backgroundColor: '#4e9a7e',
            padding: '1.25rem 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.7rem',
          }}>
            {LOKASI_LIST.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenDetail(item, idx)}
                  style={{
                    width: '100%',
                    backgroundColor: isActive ? '#fff' : '#ffba08',
                    color: isActive ? '#0d6e38' : '#1a1a1a',
                    padding: '0.95rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: isActive ? '2.5px solid rgba(13,110,56,0.4)' : '2px solid transparent',
                    boxShadow: isActive
                      ? '0 4px 16px rgba(13,110,56,0.2), 0 1px 3px rgba(0,0,0,0.1)'
                      : '0 2px 8px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f59e0b';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#ffba08';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                    <span>{item.nama}</span>
                  </span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    backgroundColor: isActive ? '#dcfce7' : 'rgba(0,0,0,0.12)',
                    color: isActive ? '#15803d' : '#333',
                    padding: '0.2rem 0.65rem', borderRadius: '9999px',
                  }}>
                    {isActive ? 'Aktif ✓' : item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─── HERO IMAGE (changes when tab switches) ─── */}
          <div style={{
            position: 'relative', height: '420px', overflow: 'hidden',
          }}>
            {/* Animated Background Image */}
            <div
              className={`kunjungan-hero-img ${transitioning ? 'out' : 'in'}`}
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url('${activeLokasi.bgImage}')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }}
            />

            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: activeLokasi.bgGradient,
              transition: 'background 0.5s ease',
            }} />

            {/* Animated color accent strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: `linear-gradient(90deg, transparent, ${activeLokasi.accentColor}, transparent)`,
              transition: 'background 0.5s ease',
            }} />

            {/* Content Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '2.5rem',
              transition: 'opacity 0.4s ease',
              opacity: transitioning ? 0 : 1,
            }}>
              <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  backgroundColor: activeLokasi.tagBg,
                  color: activeLokasi.tagColor,
                  padding: '0.3rem 0.8rem', borderRadius: '9999px',
                  fontSize: '0.76rem', fontWeight: 700,
                  backdropFilter: 'blur(6px)',
                  border: `1px solid ${activeLokasi.accentColor}55`,
                  transition: 'all 0.4s ease',
                }}>
                  <activeLokasi.icon size={13} />
                  <span>{activeLokasi.kategori}</span>
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'rgba(255,255,255,0.9)',
                  padding: '0.3rem 0.8rem', borderRadius: '9999px',
                  fontSize: '0.76rem', fontWeight: 600,
                  backdropFilter: 'blur(6px)',
                }}>
                  <Users size={12} />
                  <span>Kapasitas: {activeLokasi.kapasitas}</span>
                </span>
              </div>

              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 900, color: '#fff', margin: '0 0 0.6rem 0',
                lineHeight: 1.2, textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                transition: 'opacity 0.4s ease',
              }}>
                {activeLokasi.emoji} {activeLokasi.nama}
              </h2>

              <p style={{
                fontSize: '0.9rem', color: 'rgba(255,255,255,0.88)',
                maxWidth: '640px', margin: '0 0 1.5rem 0', lineHeight: 1.6,
              }}>
                {activeLokasi.descRingkas}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setModalDetail(activeLokasi)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff', padding: '0.7rem 1.4rem',
                    borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
                    border: '1.5px solid rgba(255,255,255,0.4)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
                >
                  <FileText size={16} /> Lihat Detail & SOP
                </button>

                <button
                  onClick={() => handleOpenForm(activeLokasi)}
                  style={{
                    background: `linear-gradient(135deg, ${activeLokasi.accentColor}, #fff3)`,
                    color: '#fff', padding: '0.7rem 1.4rem',
                    borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    boxShadow: `0 4px 14px ${activeLokasi.accentColor}50`,
                    transition: 'all 0.2s ease',
                    backgroundColor: activeLokasi.accentColor,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Calendar size={16} /> Ajukan Kunjungan
                </button>
              </div>
            </div>

            {/* Tab indicator dots */}
            <div style={{
              position: 'absolute', bottom: '1.25rem', right: '1.5rem',
              display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              {LOKASI_LIST.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLokasi(idx)}
                  style={{
                    width: idx === activeIdx ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: idx === activeIdx ? '#fff' : 'rgba(255,255,255,0.45)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════ QUICK INFO CARDS ═══════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem', marginBottom: '2.5rem',
          animation: 'fadeInUp 0.6s 0.1s ease both',
        }}>
          {LOKASI_LIST.map((item, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item, idx)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '18px',
                  padding: '1.4rem',
                  cursor: 'pointer',
                  border: isActive ? `2px solid ${item.accentColor}` : '2px solid #f1f5f9',
                  boxShadow: isActive
                    ? `0 8px 24px ${item.accentColor}25, 0 2px 4px rgba(0,0,0,0.04)`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${item.accentColor}20`;
                    e.currentTarget.style.borderColor = item.accentColor + '80';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '80px', height: '80px',
                    background: `radial-gradient(circle at top right, ${item.accentColor}15, transparent)`,
                  }} />
                )}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: item.accentColor + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.85rem', fontSize: '1.4rem',
                }}>
                  {item.emoji}
                </div>
                <h3 style={{
                  fontSize: '0.95rem', fontWeight: 800, color: isActive ? item.accentColor : '#0f172a',
                  margin: '0 0 0.3rem 0', transition: 'color 0.3s ease',
                }}>
                  {item.nama}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  {item.kategori}
                </p>
                <div style={{
                  marginTop: '0.85rem', display: 'flex', alignItems: 'center',
                  gap: '0.35rem', fontSize: '0.75rem', color: item.accentColor, fontWeight: 700,
                }}>
                  <span>Lihat Detail</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══════════════════ INFO STRIP ═══════════════════ */}
        <div style={{
          background: 'linear-gradient(135deg, #0d6e38, #1a9e5a)',
          borderRadius: '18px', padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          animation: 'fadeInUp 0.6s 0.2s ease both',
        }}>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: DollarSign, label: 'Biaya Kunjungan', value: 'GRATIS / Rp. 0' },
              { icon: Clock, label: 'Jam Layanan', value: 'Senin – Jumat, 08.00 – 15.30' },
              { icon: MapPin, label: 'Lokasi', value: 'Maguwoharjo, Sleman, DIY' },
            ].map((info, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <info.icon size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{info.label}</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 800 }}>{info.value}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleOpenForm(activeLokasi)}
            style={{
              backgroundColor: '#fff', color: '#0d6e38',
              padding: '0.75rem 1.5rem', borderRadius: '12px',
              fontWeight: 800, fontSize: '0.9rem', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Calendar size={17} /> Daftar Kunjungan Sekarang
          </button>
        </div>
      </div>

      {/* ═══════════════════ MODAL DETAIL / SOP ═══════════════════ */}
      {modalDetail && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2500, padding: '1.25rem',
          }}
          onClick={() => setModalDetail(null)}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '24px',
              maxWidth: '840px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.45)',
              animation: 'fadeInScale 0.35s cubic-bezier(0.22,1,0.36,1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Hero Strip */}
            <div style={{
              background: `linear-gradient(135deg, ${modalDetail.bgGradient.replace('180deg', '135deg')})`,
              backgroundImage: `url('${modalDetail.bgImage}')`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              height: '140px', borderRadius: '24px 24px 0 0',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, rgba(0,0,0,0.55), ${modalDetail.accentColor}60)`,
                borderRadius: '24px 24px 0 0',
              }} />
              <div style={{
                position: 'absolute', bottom: '1.25rem', left: '1.75rem',
                color: '#fff',
              }}>
                <span style={{
                  fontSize: '0.73rem', fontWeight: 700, backgroundColor: modalDetail.tagBg,
                  color: modalDetail.tagColor, padding: '0.25rem 0.75rem', borderRadius: '6px',
                  backdropFilter: 'blur(4px)', marginBottom: '0.4rem', display: 'inline-block',
                }}>
                  {modalDetail.badge}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0.25rem 0 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  {modalDetail.emoji} {modalDetail.nama}
                </h3>
              </div>
              <button
                onClick={() => setModalDetail(null)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%',
                  width: '36px', height: '36px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.65 }}>
              {/* Desc intro */}
              <p style={{
                backgroundColor: '#f8fafc', border: `1px solid ${modalDetail.accentColor}30`,
                borderLeft: `4px solid ${modalDetail.accentColor}`,
                padding: '1rem 1.25rem', borderRadius: '0 10px 10px 0',
                color: '#334155', margin: '0 0 1.5rem 0', fontWeight: 500,
              }}>
                {modalDetail.descRingkas}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Persyaratan */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: modalDetail.accentColor + '20', color: modalDetail.accentColor, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✓</span>
                    Persyaratan Pengguna Layanan:
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {modalDetail.persyaratan.map((s, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem', color: '#334155' }}>{s}</li>
                    ))}
                  </ol>
                </div>

                {/* Biaya, Output, Waktu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Biaya / Tarif', value: modalDetail.biaya, color: '#15803d' },
                    { label: 'Output Layanan', value: modalDetail.output },
                    { label: 'Waktu Penyelesaian', value: modalDetail.waktu },
                  ].map((item, i) => (
                    <div key={i} style={{
                      backgroundColor: '#f8fafc', borderRadius: '10px',
                      padding: '0.85rem 1rem', border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        {item.label}
                      </div>
                      <div style={{ fontWeight: 600, color: item.color || '#1e293b', fontSize: '0.85rem' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prosedur */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: modalDetail.accentColor + '20', color: modalDetail.accentColor, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>↻</span>
                  Prosedur / Alur Pelayanan:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {modalDetail.prosedur.map((alur, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.65rem 1rem', backgroundColor: '#f8fafc', borderRadius: '9px', border: '1px solid #f1f5f9' }}>
                      <span style={{
                        width: '24px', height: '24px', minWidth: '24px',
                        borderRadius: '6px', backgroundColor: modalDetail.accentColor,
                        color: '#fff', fontWeight: 800, fontSize: '0.72rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ color: '#334155', lineHeight: 1.55, fontSize: '0.85rem' }}>{alur}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleOpenForm(modalDetail)}
                  style={{
                    flex: 3, backgroundColor: modalDetail.accentColor,
                    color: '#fff', padding: '0.9rem', borderRadius: '12px',
                    fontWeight: 800, fontSize: '0.95rem', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: `0 6px 20px ${modalDetail.accentColor}40`, transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Calendar size={18} /> Form Kunjungan
                </button>
                <button
                  onClick={() => setModalDetail(null)}
                  style={{
                    flex: 1, backgroundColor: '#ef4444', color: '#fff',
                    padding: '0.9rem', borderRadius: '12px', fontWeight: 700,
                    fontSize: '0.9rem', border: 'none', cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL FORM KUNJUNGAN ═══════════════════ */}
      {modalFormOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '1.25rem',
          }}
          onClick={() => setModalFormOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '24px',
              maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              padding: '2.5rem',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.45)',
              animation: 'fadeInScale 0.35s cubic-bezier(0.22,1,0.36,1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalFormOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '38px', height: '38px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                backgroundColor: formTarget.accentColor + '18',
                color: formTarget.accentColor, fontSize: '1.6rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.9rem auto',
              }}>
                {formTarget.emoji}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem' }}>
                Formulir Kunjungan
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Agenda: <strong style={{ color: formTarget.accentColor }}>{formTarget.nama}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {[
                { label: 'Nama Penanggung Jawab Rombongan *', key: 'nama', type: 'text', placeholder: 'Contoh: Dr. Ir. Budi Santoso, M.P.' },
                { label: 'Nama Instansi / Sekolah / Universitas *', key: 'instansi', type: 'text', placeholder: 'Contoh: Universitas Gadjah Mada' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {field.label}
                  </label>
                  <input
                    required={field.label.includes('*')}
                    type={field.type}
                    value={formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                      outline: 'none', backgroundColor: '#f8fafc',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = formTarget.accentColor)}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Nomor WhatsApp Aktif *', key: 'noHp', type: 'tel', placeholder: '08xxxxxxxxxx' },
                  { label: 'Email Pemohon *', key: 'email', type: 'email', placeholder: 'email@instansi.ac.id' },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      {field.label}
                    </label>
                    <input
                      required={field.label.includes('*')}
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                        outline: 'none', backgroundColor: '#f8fafc',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = formTarget.accentColor)}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Jumlah Peserta (Orang) *
                  </label>
                  <input
                    required type="number" min="1"
                    value={formData.jumlahPeserta}
                    onChange={(e) => setFormData({ ...formData, jumlahPeserta: e.target.value })}
                    placeholder="Contoh: 30"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                      outline: 'none', backgroundColor: '#f8fafc',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = formTarget.accentColor)}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Lokasi Kunjungan
                  </label>
                  <select
                    value={formData.lokasiPilihan}
                    onChange={(e) => {
                      const match = LOKASI_LIST.find((l) => l.nama === e.target.value) || LOKASI_LIST[0];
                      setFormTarget(match);
                      setFormData({ ...formData, lokasiPilihan: e.target.value });
                    }}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                      outline: 'none', backgroundColor: '#f8fafc', fontWeight: 700,
                    }}
                  >
                    {LOKASI_LIST.map((l) => (
                      <option key={l.id} value={l.nama}>{l.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Rencana Tanggal Kunjungan *
                  </label>
                  <input
                    required type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                      outline: 'none', backgroundColor: '#f8fafc',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = formTarget.accentColor)}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Jam Kedatangan
                  </label>
                  <select
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                      outline: 'none', backgroundColor: '#f8fafc', fontWeight: 600,
                    }}
                  >
                    <option value="08:30">08:30 WIB</option>
                    <option value="09:30">09:30 WIB</option>
                    <option value="10:30">10:30 WIB</option>
                    <option value="13:30">13:30 WIB</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Maksud & Tujuan Kunjungan
                </label>
                <textarea
                  rows={3}
                  value={formData.tujuan}
                  onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                  placeholder="Contoh: Studi lapangan praktikum budidaya tanaman dan pengenalan instrumen laboratorium..."
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                    border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                    outline: 'none', backgroundColor: '#f8fafc', resize: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = formTarget.accentColor)}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Unggah Surat Permohonan Resmi (PDF/DOCX, Opsional)
                </label>
                <div style={{
                  border: '2px dashed #e2e8f0', borderRadius: '12px',
                  padding: '1rem', textAlign: 'center',
                  backgroundColor: '#f8fafc', cursor: 'pointer', position: 'relative',
                }}>
                  <input
                    type="file" accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  <Upload size={18} color="#94a3b8" style={{ margin: '0 auto 0.3rem' }} />
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                    {file ? file.name : 'Klik untuk memilih file'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalFormOpen(false)} style={{
                  flex: 1, backgroundColor: '#f1f5f9', color: '#475569',
                  padding: '0.85rem', borderRadius: '12px', fontWeight: 700,
                  fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                }}>
                  Batal
                </button>
                <button type="submit" disabled={isLoading} style={{
                  flex: 3, backgroundColor: formTarget.accentColor,
                  color: '#fff', padding: '0.85rem', borderRadius: '12px',
                  fontWeight: 800, fontSize: '0.92rem', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: `0 4px 16px ${formTarget.accentColor}40`,
                }}>
                  {isLoading ? <Loader2 size={18} /> : <Send size={18} />}
                  <span>{isLoading ? 'Mengirim...' : 'Kirim Permohonan Kunjungan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════ SUCCESS MODAL ═══════════════════ */}
      {submitted && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3500, padding: '1.5rem',
          }}
          onClick={() => setSubmitted(null)}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '24px',
              maxWidth: '540px', width: '100%', padding: '2.5rem',
              boxShadow: '0 30px 70px -12px rgba(0,0,0,0.35)',
              textAlign: 'center', animation: 'fadeInScale 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              backgroundColor: '#dcfce7', color: '#15803d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle size={38} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
              Permohonan Berhasil Terkirim! 🎉
            </h3>
            <p style={{ fontSize: '0.87rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Data kunjungan Anda telah tercatat di sistem BRMP DIY. Tim kami akan menghubungi Anda untuk konfirmasi jadwal.
            </p>
            <div style={{
              backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '16px',
              border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.84rem',
              marginBottom: '1.5rem', lineHeight: 1.75,
            }}>
              <div><span style={{ color: '#64748b' }}>Nomor Tiket: </span>
                <strong style={{ color: '#0d6e38', fontFamily: 'monospace', fontSize: '0.95rem' }}>{submitted.code}</strong>
              </div>
              <div><span style={{ color: '#64748b' }}>Lokasi: </span><strong>{submitted.lokasiPilihan}</strong></div>
              <div><span style={{ color: '#64748b' }}>Pemohon: </span><strong>{submitted.nama} ({submitted.instansi})</strong></div>
              <div><span style={{ color: '#64748b' }}>Jadwal: </span><strong>{submitted.tanggal} | {submitted.jumlahPeserta} Peserta</strong></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/6285878438548?text=${encodeURIComponent(`Halo Admin BRMP DIY, saya telah mengajukan permohonan kunjungan ke ${submitted.lokasiPilihan} dengan Nomor Tiket: ${submitted.code}. Mohon konfirmasi jadwalnya. Terima kasih.`)}`}
                target="_blank" rel="noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#fff', padding: '0.9rem', borderRadius: '12px',
                  fontWeight: 700, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <Phone size={18} /> Konfirmasi via WhatsApp
              </a>
              <button onClick={() => setSubmitted(null)} style={{
                backgroundColor: '#f1f5f9', color: '#475569', padding: '0.75rem',
                borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer',
              }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
