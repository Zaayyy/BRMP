import React, { useEffect, useRef, useState } from 'react';
import {
  Users, MessageSquareWarning, Building2, Volume2, UserCheck, MapPin,
  Search, CheckCircle, X, Send, FileCheck, Upload, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pengaduanService, labService } from '../services/apiService';

function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const serviceTiles = [
  {
    id: 'konsultasi', title: 'Konsultasi', icon: Users,
    gradient: 'linear-gradient(135deg, #0d6e38 0%, #10b981 100%)',
    glowColor: 'rgba(16,185,129,0.45)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Konsultasi teknis budidaya & standar agro modern dengan pakar BRMP DIY.',
    emoji: '🌱',
  },
  {
    id: 'pengaduan', title: 'Pengaduan', icon: MessageSquareWarning,
    gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    glowColor: 'rgba(251,191,36,0.45)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Saluran pengaduan resmi mutu benih, pupuk & pelayanan publik DIY.',
    emoji: '📣',
  },
  {
    id: 'magang', title: 'Magang / PKL', icon: Building2,
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    glowColor: 'rgba(129,140,248,0.45)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Pendaftaran magang & PKL mahasiswa di Lab & Kebun Percobaan BRMP DIY.',
    emoji: '🎓',
  },
  {
    id: 'narasumber', title: 'Narasumber', icon: Volume2,
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    glowColor: 'rgba(56,189,248,0.45)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Permohonan narasumber ahli untuk workshop, bimtek & seminar pertanian.',
    emoji: '🎙️',
  },
  {
    id: 'informasi-publik', title: 'Informasi Publik', icon: UserCheck,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
    glowColor: 'rgba(192,132,252,0.45)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Permohonan data publik, dokumen teknis & laporan resmi PPID BRMP DIY.',
    emoji: '📋',
  },
  {
    id: 'kunjungan', title: 'Kunjungan', icon: MapPin,
    gradient: 'linear-gradient(135deg, #dc2626 0%, #fb7185 100%)',
    glowColor: 'rgba(251,113,133,0.45)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Pengajuan kunjungan edukasi ke fasilitas lab & lahan modern BRMP DIY.',
    emoji: '🏛️',
  },
];

export default function PortalLayanan() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [selectedService, setSelectedService] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    instansi: '',
    alamat: '',
    email: '',
    telepon: '',
    kegiatan: '',
    tema: '',
    tanggal: '',
    pesan: '',
  });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const navigate = useNavigate();

  const handleTileClick = (tile) => {
    if (tile.id === 'magang') {
      navigate('/magang');
    } else if (tile.id === 'konsultasi') {
      navigate('/konsultasi');
    } else if (tile.id === 'narasumber') {
      navigate('/narasumber');
    } else if (tile.id === 'pengaduan') {
      navigate('/pengaduan');
    } else if (tile.id === 'kunjungan') {
      navigate('/kunjungan');
    } else if (tile.id === 'informasi-publik') {
      navigate('/informasi-publik');
    } else {
      setSelectedService(tile);
      setSubmitted(null);
      setFile(null);
      setFormData({
        nik: '', nama: '', instansi: '', alamat: '', email: '', telepon: '', kegiatan: '', tema: '', tanggal: '', pesan: '',
      });
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    const code = trackInput.trim().toUpperCase();
    if (!code) return;

    try {
      // Cari di API Pengaduan & Layanan Publik
      const res = await pengaduanService.trackByCodePublic(code);
      if (res && res.success && res.data) {
        const data = res.data;
        const statusMap = {
          Selesai: '✅ Selesai Ditanggapi',
          Diproses: '⏳ Sedang Diproses Petugas',
          Menunggu: '🕒 Menunggu Verifikasi',
          Ditolak: '❌ Laporan Ditolak',
        };

        setTrackResult({
          kode: data.kode_tracking,
          layanan: 'Laporan Pengaduan & Permohonan Layanan',
          pemohon: 'Masyarakat (Identitas Terlindungi)',
          tanggal: data.tanggal_masuk
            ? new Date(data.tanggal_masuk).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Hari Ini',
          status: statusMap[data.status_tanggapan] || data.status_tanggapan,
          statusRaw: data.status_tanggapan,
          catatan:
            data.tanggapan_petugas ||
            'Permohonan / laporan Anda telah tercatat dan saat ini sedang dalam antrean verifikasi petugas BRMP DIY.',
          tanggalTanggapan: data.tanggal_tanggapan
            ? new Date(data.tanggal_tanggapan).toLocaleString('id-ID')
            : null,
        });
        return;
      }
    } catch (err) {
      console.warn('Pelacakan pengaduan:', err.message);
    }

    setTrackResult({
      kode: code,
      layanan: 'Status Layanan Tidak Ditemukan',
      pemohon: '-',
      tanggal: '-',
      status: '❌ Tidak Ditemukan',
      statusRaw: 'NotFound',
      catatan: `Nomor tiket/resi '${code}' tidak ditemukan di database BRMP DIY. Pastikan kode yang Anda masukkan sudah benar.`,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fullDescription = [
        `[Layanan: ${selectedService?.title || 'Permohonan Layanan'}]`,
        formData.pesan ? `\nPesan/Uraian: ${formData.pesan}` : '',
        formData.instansi ? `\nInstansi: ${formData.instansi}` : '',
        formData.kegiatan ? `\nKegiatan: ${formData.kegiatan}` : '',
        formData.tema ? `\nTema: ${formData.tema}` : '',
        formData.tanggal ? `\nTanggal: ${formData.tanggal}` : '',
        formData.alamat ? `\nAlamat: ${formData.alamat}` : '',
        formData.nik ? `\nNIK: ${formData.nik}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama || 'Pemohon Layanan BRMP',
        email_pelapor: formData.email || 'pemohon@layanan.go.id',
        no_telp_pelapor: formData.telepon || '-',
        isi_pengaduan: fullDescription,
      });

      const code = res?.data?.kode_tracking || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({ code, service: selectedService?.title || 'Layanan Agromodern', nama: formData.nama || 'Pemohon BRMP DIY' });
    } catch (err) {
      console.warn('Portal submit note:', err.message);
      const code = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({ code, service: selectedService?.title || 'Layanan Agromodern', nama: formData.nama || 'Pemohon BRMP DIY' });
    }

    setFormData({ nik: '', nama: '', instansi: '', alamat: '', email: '', telepon: '', kegiatan: '', tema: '', tanggal: '', pesan: '' });
    setFile(null);
  };

  return (
    <section
      id="portal-layanan"
      ref={sectionRef}
      style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 40%, #f8fafc 100%)',
        padding: '6rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: '5%', left: '-80px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'floatOrb 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-60px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,110,56,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'floatOrb 11s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '15%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'floatOrb 6s ease-in-out infinite 2s',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto',
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, #0d6e38, #10b981)',
            color: '#ffffff',
            padding: '0.45rem 1.2rem', borderRadius: '9999px',
            fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '1.2rem',
            boxShadow: '0 4px 14px rgba(13,110,56,0.3)',
          }}>
            🏛️ Layanan Publik Digital BRMP DIY
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Portal Sistem Informasi
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #0d6e38, #10b981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Manajemen Agro Modern</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Pilih layanan yang Anda butuhkan untuk mengajukan permohonan secara digital
          </p>
        </div>

        {/* Portal Container - 6 Gradient Tiles */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13,110,56,0.06) 0%, rgba(16,185,129,0.04) 50%, rgba(255,255,255,0.8) 100%)',
            borderRadius: '32px',
            padding: '2.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 20px 60px rgba(13,110,56,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
            border: '1px solid rgba(16,185,129,0.15)',
            backdropFilter: 'blur(12px)',
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(35px)',
            transition: 'all 0.7s 0.15s cubic-bezier(0.22,1,0.36,1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Container inner glow */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '32px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.2rem',
              position: 'relative',
            }}
            className="portal-grid"
          >
            {serviceTiles.map((tile, i) => {
              const IconComp = tile.icon;
              const isHover = hoveredTile === tile.id;
              return (
                <div
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  onMouseOver={() => setHoveredTile(tile.id)}
                  onMouseOut={() => setHoveredTile(null)}
                  style={{
                    borderRadius: '22px',
                    padding: '1.8rem 1.2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isHover
                      ? tile.gradient
                      : 'rgba(255,255,255,0.85)',
                    border: isHover
                      ? '1.5px solid rgba(255,255,255,0.4)'
                      : '1.5px solid rgba(255,255,255,0.6)',
                    boxShadow: isHover
                      ? `0 20px 50px ${tile.glowColor}, 0 0 0 1px rgba(255,255,255,0.2) inset`
                      : '0 4px 16px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.9) inset',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isHover ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
                    animation: sectionVisible ? `fadeInUp 0.55s ${i * 0.09 + 0.25}s both` : 'none',
                    backdropFilter: 'blur(8px)',
                    minHeight: '160px',
                  }}
                >
                  {/* Shimmer overlay on hover */}
                  {isHover && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '22px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }} />
                  )}

                  {/* Floating particles on hover */}
                  {isHover && (
                    <>
                      <div style={{
                        position: 'absolute', top: '12px', right: '14px',
                        width: '6px', height: '6px', borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        animation: 'particleFloat 1.5s ease-in-out infinite',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: '18px', left: '16px',
                        width: '4px', height: '4px', borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.4)',
                        animation: 'particleFloat 2s ease-in-out infinite 0.5s',
                      }} />
                    </>
                  )}

                  {/* Icon container */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: isHover ? tile.iconBg : tile.gradient,
                    color: isHover ? '#ffffff' : '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: isHover
                      ? '0 4px 16px rgba(255,255,255,0.3)'
                      : `0 8px 24px ${tile.glowColor}`,
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isHover ? 'scale(1.15) rotate(-3deg)' : 'scale(1) rotate(0)',
                    backdropFilter: isHover ? 'blur(4px)' : 'none',
                    border: isHover ? '1px solid rgba(255,255,255,0.35)' : 'none',
                  }}>
                    <IconComp size={30} strokeWidth={2} />
                  </div>

                  {/* Emoji badge */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '14px',
                    fontSize: '0.85rem', opacity: isHover ? 0.9 : 0.4,
                    transition: 'opacity 0.3s ease',
                    lineHeight: 1,
                  }}>
                    {tile.emoji}
                  </div>

                  <h3 style={{
                    fontSize: '0.95rem', fontWeight: 800,
                    color: isHover ? '#ffffff' : '#1e293b',
                    lineHeight: 1.3, transition: 'color 0.25s ease',
                    marginBottom: '0.4rem',
                  }}>
                    {tile.title}
                  </h3>

                  <p style={{
                    fontSize: '0.72rem',
                    color: isHover ? 'rgba(255,255,255,0.85)' : '#94a3b8',
                    lineHeight: 1.4,
                    transition: 'color 0.25s ease',
                    maxWidth: '140px',
                    margin: '0 auto',
                  }}>
                    {tile.desc}
                  </p>

                  {/* Arrow indicator on hover */}
                  <div style={{
                    marginTop: '0.8rem',
                    opacity: isHover ? 1 : 0,
                    transform: isHover ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'all 0.3s ease',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    Buka Layanan →
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-text */}
        <p style={{
          textAlign: 'center', fontSize: '0.88rem', color: '#475569', marginBottom: '1.2rem',
          fontWeight: 500,
          opacity: sectionVisible ? 1 : 0, transition: 'opacity 0.7s 0.5s ease',
        }}>
          Sudah pernah mengajukan permohonan layanan? Cek kode layanan di bawah ini.
        </p>

        {/* Track Layanan Search */}
        <form
          onSubmit={handleTrack}
          style={{
            maxWidth: '720px', margin: '0 auto',
            backgroundColor: '#ffffff', borderRadius: '9999px',
            padding: '0.4rem 0.4rem 0.4rem 1.4rem',
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '2px solid #e2e8f0',
            opacity: sectionVisible ? 1 : 0,
            transition: 'opacity 0.7s 0.55s ease, border-color 0.25s ease',
          }}
        >
          <Search size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            placeholder="Masukkan Nomor Resi / Kode Permohonan Layanan..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.92rem', color: '#1e293b', backgroundColor: 'transparent' }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff', padding: '0.75rem 1.6rem',
              borderRadius: '9999px', fontWeight: 700, fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)', whiteSpace: 'nowrap',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Lacak Layanan
          </button>
        </form>
      </div>

      {/* Service Form Modal */}
      {selectedService && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1.5rem',
        }} onClick={() => setSelectedService(null)}>
          <div
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px',
              maxWidth: '560px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
              padding: '2rem', position: 'relative',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
              animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top color bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
              borderRadius: '24px 24px 0 0', backgroundColor: selectedService.color,
            }} />

            <button onClick={() => setSelectedService(null)} style={{
              position: 'absolute', top: '1.2rem', right: '1.2rem',
              backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.2s ease',
            }}>
              <X size={18} />
            </button>

            {!submitted ? (
              <>
                <div style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    backgroundColor: selectedService.bgColor,
                    color: selectedService.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.8rem',
                  }}>
                    <selectedService.icon size={26} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Layanan {selectedService.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {selectedService.desc}
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Nama Sesuai KTP"
                      style={{
                        width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      NIK (Nomor Induk Kependudukan) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                      placeholder="16 Digit NIK KTP"
                      style={{
                        width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Alamat Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      placeholder="Alamat domisili lengkap"
                      style={{
                        width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@email.com"
                        style={{
                          width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                          border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                        No HP / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telepon}
                        onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                        placeholder="0812xxxx"
                        style={{
                          width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                          border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Detail Permohonan / Uraian *
                    </label>
                    <textarea
                      rows={3} required
                      value={formData.pesan}
                      onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                      placeholder="Jelaskan permohonan atau pengaduan Anda..."
                      style={{
                        width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Upload Dokumen / Foto Bukti Pendukung (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{
                        width: '100%', padding: '0.5rem', borderRadius: '10px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.85rem',
                      }}
                    />
                    {file && (
                      <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>
                        ✓ File terpilih: {file.name}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: '0.4rem',
                      background: `linear-gradient(135deg, ${selectedService.color}, ${selectedService.color}cc)`,
                      color: '#ffffff', padding: '0.85rem', borderRadius: '12px',
                      fontWeight: 700, fontSize: '0.93rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      boxShadow: `0 6px 18px ${selectedService.color}40`,
                      transition: 'all 0.25s ease', cursor: 'pointer',
                    }}
                  >
                    <Send size={18} />
                    <span>Kirim Permohonan</span>
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem',
                  animation: 'bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)',
                }}>
                  <CheckCircle size={38} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Permohonan Berhasil Dikirim!
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.2rem' }}>
                  Terima kasih, <strong>{submitted.nama}</strong>. Permohonan layanan <strong>{submitted.service}</strong> Anda telah tercatat.
                </p>
                <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>Simpan Nomor Resi:</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d6e38', letterSpacing: '0.05em' }}>{submitted.code}</div>
                </div>
                <button
                  onClick={() => { setSelectedService(null); setSubmitted(null); setFile(null); }}
                  style={{
                    backgroundColor: '#0f172a', color: '#ffffff',
                    padding: '0.75rem 1.5rem', borderRadius: '9999px',
                    fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tracking Result Modal */}
      {trackResult && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1.5rem',
        }} onClick={() => setTrackResult(null)}>
          <div
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px',
              maxWidth: '500px', width: '100%',
              padding: '2rem', position: 'relative',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
              animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setTrackResult(null)} style={{
              position: 'absolute', top: '1.2rem', right: '1.2rem',
              backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
            }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.3rem' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {trackResult.kode}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{trackResult.layanan}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.6, border: '1px solid #e2e8f0' }}>
              <div><span style={{ color: '#64748b' }}>Pemohon: </span><strong>{trackResult.pemohon}</strong></div>
              <div><span style={{ color: '#64748b' }}>Tanggal Pengajuan: </span><strong>{trackResult.tanggal}</strong></div>
              <div style={{ marginTop: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Status Saat Ini: </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: trackResult.statusRaw === 'Selesai' ? '#dcfce7' : trackResult.statusRaw === 'Diproses' ? '#e0f2fe' : trackResult.statusRaw === 'Ditolak' ? '#fee2e2' : '#fef3c7',
                  color: trackResult.statusRaw === 'Selesai' ? '#15803d' : trackResult.statusRaw === 'Diproses' ? '#0369a1' : trackResult.statusRaw === 'Ditolak' ? '#b91c1c' : '#b45309',
                  padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800,
                  marginLeft: '0.3rem',
                }}>
                  {trackResult.status}
                </span>
              </div>
            </div>

            {/* Official Response Highlight */}
            <div style={{
              backgroundColor: '#fffbeb', border: '1.5px solid #fde68a',
              borderRadius: '12px', padding: '0.9rem 1rem', marginBottom: '1.4rem',
              fontSize: '0.86rem', color: '#78350f', lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 800, color: '#92400e', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                💬 <span>Tanggapan Resmi Petugas:</span>
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{trackResult.catatan}</p>
            </div>

            <button
              onClick={() => setTrackResult(null)}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                color: '#ffffff', padding: '0.8rem', borderRadius: '10px',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .portal-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .portal-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.05); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-8px) scale(1.3); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
