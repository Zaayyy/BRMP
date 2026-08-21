import React, { useEffect, useRef, useState } from 'react';
import {
  Users, MessageSquareWarning, Building2, Volume2, UserCheck, MapPin,
  Search, CheckCircle, X, Send, FileCheck, Upload, FileText, Sparkles, ArrowRight, Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pengaduanService } from '../services/apiService';

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
    id: 'konsultasi', title: 'Konsultasi Teknis', icon: Users,
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    glowColor: 'rgba(16,185,129,0.35)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Konsultasi budidaya & standar agro modern bersama fungsional ahli.',
    emoji: '🌱',
  },
  {
    id: 'pengaduan', title: 'Pengaduan Publik', icon: MessageSquareWarning,
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    glowColor: 'rgba(245,158,11,0.35)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Saluran resmi pengaduan mutu benih, pupuk & layanan pertanian.',
    emoji: '📣',
  },
  {
    id: 'magang', title: 'Magang / PKL / Riset', icon: Building2,
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    glowColor: 'rgba(99,102,241,0.35)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Pendaftaran magang & riset terapan di Lab & Kebun Percobaan.',
    emoji: '🎓',
  },
  {
    id: 'narasumber', title: 'Permohonan Narasumber', icon: Volume2,
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    glowColor: 'rgba(56,189,248,0.35)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Permohonan pemateri & narasumber ahli untuk bimtek/workshop.',
    emoji: '🎙️',
  },
  {
    id: 'informasi-publik', title: 'Informasi Publik (PPID)', icon: UserCheck,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    glowColor: 'rgba(168,85,247,0.35)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Permohonan data publik & dokumen teknis resmi PPID BRMP DIY.',
    emoji: '📋',
  },
  {
    id: 'kunjungan', title: 'Kunjungan Edukasi', icon: MapPin,
    gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
    glowColor: 'rgba(244,63,94,0.35)',
    iconBg: 'rgba(255,255,255,0.22)',
    desc: 'Pengajuan kunjungan studi lapang ke fasilitas agro modern BRMP.',
    emoji: '🏛️',
  },
];

export default function PortalLayanan() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [selectedService, setSelectedService] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [formData, setFormData] = useState({
    nik: '', nama: '', instansi: '', alamat: '', email: '', telepon: '', kegiatan: '', tema: '', tanggal: '', pesan: '',
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
        jenis_layanan: selectedService?.title || 'Permohonan Layanan',
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
        background: 'linear-gradient(180deg, #f8fafc 0%, #ecfdf5 45%, #f8fafc 100%)',
        padding: '6rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dot Pattern Overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(16,185,129,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'floatOrb 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '-60px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'floatOrb 11s ease-in-out infinite reverse',
      }} />

      <div style={{ maxWidth: '1160px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{
          textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto',
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: '#ffffff',
            padding: '0.45rem 1.25rem', borderRadius: '9999px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '1.2rem',
            boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
          }}>
            <Sparkles size={14} />
            <span>Layanan Publik Digital BRMP DIY</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 3.8vw, 2.7rem)',
            fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}>
            Portal Sistem Informasi
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Manajemen Agro Modern
            </span>
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#64748b', marginTop: '0.85rem', lineHeight: 1.65 }}>
            Akses seluruh permohonan layanan, sertifikasi, konsultasi, dan pengaduan masyarakat dalam satu pintu terintegrasi.
          </p>
        </div>

        {/* Portal Container - 6 Gradient Tiles */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '28px',
            padding: '2.5rem',
            marginBottom: '2.8rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9) inset',
            border: '1px solid rgba(16,185,129,0.15)',
            backdropFilter: 'blur(16px)',
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(35px)',
            transition: 'all 0.7s 0.15s cubic-bezier(0.22,1,0.36,1)',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem',
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
                    padding: '2rem 1.4rem 1.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isHover
                      ? tile.gradient
                      : '#ffffff',
                    border: isHover
                      ? '1.5px solid rgba(255,255,255,0.4)'
                      : '1.5px solid #f1f5f9',
                    boxShadow: isHover
                      ? `0 20px 45px ${tile.glowColor}, 0 0 0 1px rgba(255,255,255,0.2) inset`
                      : '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isHover ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
                    minHeight: '200px',
                  }}
                >
                  {/* Emoji badge */}
                  <div style={{
                    position: 'absolute', top: '14px', left: '16px',
                    fontSize: '0.9rem', opacity: isHover ? 0.95 : 0.5,
                    transition: 'opacity 0.3s ease',
                    lineHeight: 1,
                  }}>
                    {tile.emoji}
                  </div>

                  {/* Icon container */}
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '18px',
                    background: isHover ? 'rgba(255,255,255,0.2)' : tile.gradient,
                    color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: isHover
                      ? '0 4px 16px rgba(255,255,255,0.3)'
                      : `0 8px 20px ${tile.glowColor}`,
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isHover ? 'scale(1.1) rotate(-3deg)' : 'scale(1) rotate(0)',
                    border: isHover ? '1px solid rgba(255,255,255,0.4)' : 'none',
                  }}>
                    <IconComp size={28} strokeWidth={2} />
                  </div>

                  <div>
                    <h3 style={{
                      fontSize: '1rem', fontWeight: 800,
                      color: isHover ? '#ffffff' : '#0f172a',
                      lineHeight: 1.3, transition: 'color 0.25s ease',
                      marginBottom: '0.45rem',
                    }}>
                      {tile.title}
                    </h3>

                    <p style={{
                      fontSize: '0.78rem',
                      color: isHover ? 'rgba(255,255,255,0.9)' : '#64748b',
                      lineHeight: 1.5,
                      transition: 'color 0.25s ease',
                      maxWidth: '220px',
                      margin: '0 auto',
                    }}>
                      {tile.desc}
                    </p>
                  </div>

                  {/* Action Link Footer */}
                  <div style={{
                    marginTop: '1.2rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isHover ? '#ffffff' : '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.25s ease',
                    transform: isHover ? 'translateX(2px)' : 'translateX(0)',
                  }}>
                    <span>Buka Layanan</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search / Track Section */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.9rem', color: '#475569', marginBottom: '1.2rem',
            fontWeight: 600,
            opacity: sectionVisible ? 1 : 0, transition: 'opacity 0.7s 0.5s ease',
          }}>
            Sudah pernah mengajukan permohonan layanan? Cek status nomor resi di bawah ini:
          </p>

          <form
            onSubmit={handleTrack}
            style={{
              backgroundColor: '#ffffff', borderRadius: '9999px',
              padding: '0.45rem 0.45rem 0.45rem 1.4rem',
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
              opacity: sectionVisible ? 1 : 0,
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
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
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#ffffff', padding: '0.8rem 1.75rem',
                borderRadius: '9999px', fontWeight: 800, fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)', whiteSpace: 'nowrap',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Lacak Layanan
            </button>
          </form>

          {/* WhatsApp Assistance Bar */}
          <div style={{
            marginTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem',
            color: '#334155',
            fontWeight: 600,
            opacity: sectionVisible ? 1 : 0,
            transition: 'opacity 0.7s 0.6s ease',
          }}>
            <span style={{ color: '#475569' }}>
              Butuh bantuan? Hubungi kami
            </span>
            <a
              href="https://wa.me/6285878438548?text=Halo%20Admin%20BRMP%20DIY%2C%20saya%20butuh%20bantuan%20mengenai%20layanan%20dan%20permohonan%20BRMP."
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '0.45rem 1.1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                transition: 'all 0.25s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                e.currentTarget.style.backgroundColor = '#1eb956';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.backgroundColor = '#25D366';
              }}
            >
              <Phone size={14} />
              <span>Hubungi WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Track Result Modal */}
      {trackResult && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3000, padding: '1.5rem',
        }} onClick={() => setTrackResult(null)}>
          <div
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px',
              maxWidth: '520px', width: '100%',
              padding: '2rem', position: 'relative',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.35)',
              animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
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
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {trackResult.kode}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{trackResult.layanan}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '14px', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.6, border: '1px solid #e2e8f0' }}>
              <div><span style={{ color: '#64748b' }}>Pemohon: </span><strong>{trackResult.pemohon}</strong></div>
              <div><span style={{ color: '#64748b' }}>Tanggal Pengajuan: </span><strong>{trackResult.tanggal}</strong></div>
              <div style={{ marginTop: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Status Saat Ini: </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: trackResult.statusRaw === 'Selesai' ? '#dcfce7' : trackResult.statusRaw === 'Diproses' ? '#e0f2fe' : trackResult.statusRaw === 'Ditolak' ? '#fee2e2' : '#fef3c7',
                  color: trackResult.statusRaw === 'Selesai' ? '#15803d' : trackResult.statusRaw === 'Diproses' ? '#0369a1' : trackResult.statusRaw === 'Ditolak' ? '#b91c1c' : '#b45309',
                  padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800,
                  marginLeft: '0.3rem',
                }}>
                  {trackResult.status}
                </span>
              </div>
            </div>

            {/* Official Response Highlight */}
            <div style={{
              backgroundColor: '#fffbeb', border: '1.5px solid #fde68a',
              borderRadius: '14px', padding: '1rem', marginBottom: '1.4rem',
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
                width: '100%', background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#ffffff', padding: '0.85rem', borderRadius: '12px',
                fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', border: 'none',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.05); }
        }
      `}</style>
    </section>
  );
}
