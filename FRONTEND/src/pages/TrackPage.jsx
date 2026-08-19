import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Download, X, FlaskConical, FileText, MessageSquareWarning, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pengaduanService, labService } from '../services/apiService';

const LAB_STEPS = [
  'Pengajuan Diterima',
  'Verifikasi Dokumen',
  'Pengujian Sampel',
  'Analisis Hasil',
  'Laporan Selesai',
];

const labDatabase = [
  {
    code: 'LAB-2026-001', type: 'lab',
    title: 'Uji Mutu & Daya Kecambah Benih Padi Ciherang',
    pemohon: 'Kelompok Tani Sido Mulyo, Sleman',
    tanggalMasuk: '02 Agustus 2026',
    estimasiSelesai: '18 Agustus 2026',
    step: 4,
    parameter: [
      { nama: 'Daya Kecambah', nilai: '94%', standar: '≥ 80%', status: 'Memenuhi' },
      { nama: 'Kemurnian Benih', nilai: '99.2%', standar: '≥ 98%', status: 'Memenuhi' },
      { nama: 'Kadar Air', nilai: '11.5%', standar: '≤ 13%', status: 'Memenuhi' },
    ],
  },
  {
    code: 'LAB-2026-002', type: 'lab',
    title: 'Uji Kemurnian & Kadar Air Benih Jagung Hibrida',
    pemohon: 'Dinas Pertanian Bantul',
    tanggalMasuk: '05 Agustus 2026',
    estimasiSelesai: '12 Agustus 2026',
    step: 5,
    parameter: [
      { nama: 'Daya Kecambah', nilai: '96%', standar: '≥ 85%', status: 'Memenuhi' },
      { nama: 'Kemurnian Benih', nilai: '99.5%', standar: '≥ 99%', status: 'Memenuhi' },
    ],
  },
];

function LabResult({ data, onClose }) {
  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '20px',
      padding: '1.8rem', border: '1px solid #e2e8f0',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      animation: 'fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1)',
      position: 'relative',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem',
        backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b',
      }}>
        <X size={16} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          color: '#0d6e38', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FlaskConical size={26} />
        </div>
        <div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: '#0d6e38',
            backgroundColor: '#dcfce7', padding: '0.15rem 0.55rem', borderRadius: '6px',
          }}>{data.code || data.kode_tracking}</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem', lineHeight: 1.3 }}>
            {data.title || `Uji Laboratorium - ${data.nama_pemohon || 'Sampel Benih'}`}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pemohon', val: data.pemohon || data.nama_pemohon },
          { label: 'Tgl Masuk', val: data.tanggalMasuk || (data.tanggal_masuk ? new Date(data.tanggal_masuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-') },
          { label: 'Status Uji', val: data.status_uji || (data.step ? `Tahap ${data.step}/5` : 'Proses') },
          { label: 'Keterangan', val: data.keterangan || 'Sedang dalam pengujian mutu' },
        ].map((i) => (
          <div key={i.label} style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.15rem' }}>{i.label}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>{i.val}</div>
          </div>
        ))}
      </div>

      {data.parameter && (
        <>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>Hasil Parameter Uji:</h4>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', minWidth: '350px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  {['Parameter', 'Hasil', 'Standar', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#475569' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.parameter.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#334155' }}>{p.nama}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#0d6e38', fontWeight: 700 }}>{p.nilai}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#64748b' }}>{p.standar}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.12rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700 }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(data.hasil_dokumen_url || data.step === LAB_STEPS.length) && (
        <button onClick={() => alert(`Mengunduh Laporan Hasil Uji ${data.code || data.kode_tracking}`)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          background: 'linear-gradient(135deg, #0d6e38, #10b981)',
          color: '#ffffff', padding: '0.8rem', borderRadius: '10px',
          fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(13,110,56,0.25)',
        }}>
          <Download size={18} /> Unduh Laporan Uji PDF
        </button>
      )}
    </div>
  );
}

/**
 * Komponen Render Hasil Tracking Pengaduan Masyarakat (Live Data dari Backend)
 */
function PengaduanResult({ data, onClose }) {
  // Format badge warna berdasarkan status tanggapan
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: '✅ Selesai Ditanggapi' };
      case 'Diproses':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: '⏳ Sedang Diproses Tim' };
      case 'Ditolak':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: '❌ Laporan Ditolak' };
      case 'Menunggu':
      default:
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: '🕒 Menunggu Verifikasi' };
    }
  };

  const badge = getStatusBadge(data.status_tanggapan);
  const formattedTglMasuk = data.tanggal_masuk
    ? new Date(data.tanggal_masuk).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const formattedTglTanggapan = data.tanggal_tanggapan
    ? new Date(data.tanggal_tanggapan).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '20px',
      padding: '1.8rem', border: '1px solid #fed7aa',
      boxShadow: '0 8px 32px rgba(217,119,6,0.08)',
      animation: 'fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1)',
      position: 'relative',
    }}>
      {/* Close button */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem',
        backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b',
      }}>
        <X size={16} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.3rem', alignItems: 'flex-start' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
          color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <MessageSquareWarning size={26} />
        </div>
        <div>
          <span style={{
            fontSize: '0.74rem', fontWeight: 800, color: '#b45309',
            backgroundColor: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '6px',
            letterSpacing: '0.04em',
          }}>
            {data.kode_tracking}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem', lineHeight: 1.25 }}>
            Status Pengaduan Publik
          </h3>
        </div>
      </div>

      {/* Status & Tanggal Card */}
      <div style={{
        backgroundColor: '#f8fafc', padding: '1rem 1.2rem',
        borderRadius: '14px', marginBottom: '1.2rem',
        border: '1px solid #e2e8f0',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            Tanggal Pengajuan:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
            {formattedTglMasuk}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            Status Saat Ini:
          </div>
          <div>
            <span style={{
              display: 'inline-block',
              backgroundColor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              padding: '0.18rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800,
            }}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tanggapan Petugas / Official Response Box */}
      <div style={{
        backgroundColor: '#fffbeb',
        borderRadius: '14px',
        padding: '1.1rem 1.2rem',
        border: '1.5px solid #fde68a',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            💬 <span>Tanggapan Resmi Petugas:</span>
          </div>
          {formattedTglTanggapan && (
            <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>
              {formattedTglTanggapan}
            </div>
          )}
        </div>
        <p style={{
          fontSize: '0.88rem',
          color: '#78350f',
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: 'pre-line',
        }}>
          {data.tanggapan_petugas || 'Laporan pengaduan Anda telah kami terima dan saat ini sedang dalam proses verifikasi tim pengawas BRMP DIY.'}
        </p>
      </div>

      {/* Privacy Notice */}
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
        🔒 Demi menjaga privasi masyarakat, data identitas dan kontak pelapor tidak dipublikasikan.
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [labQuery, setLabQuery] = useState('');
  const [labResult, setLabResult] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labError, setLabError] = useState(null);

  // State untuk Tracking Pengaduan Publik
  const [pengaduanQuery, setPengaduanQuery] = useState('');
  const [pengaduanResult, setPengaduanResult] = useState(null);
  const [pengaduanLoading, setPengaduanLoading] = useState(false);
  const [pengaduanError, setPengaduanError] = useState(null);

  // Handler Pencarian Lab
  const searchLab = async (e) => {
    e.preventDefault();
    const q = labQuery.trim();
    if (!q) return;

    setLabLoading(true);
    setLabError(null);
    setLabResult(null);

    try {
      // Coba panggil API backend
      const res = await labService.trackByCodePublic(q);
      if (res && res.data) {
        setLabResult(res.data);
      }
    } catch (err) {
      // Fallback ke data demo jika server lokal/mock
      const match = labDatabase.find((s) =>
        s.code.toLowerCase() === q.toLowerCase() || s.pemohon.toLowerCase().includes(q.toLowerCase())
      );
      if (match) {
        setLabResult(match);
      } else {
        setLabError(
          err.status === 404
            ? `Pengujian laboratorium dengan kode '${q}' tidak ditemukan. Mohon periksa kembali nomor SPK atau kode sampel Anda.`
            : err.message || 'Gagal memeriksa status lab. Silakan coba lagi.'
        );
      }
    } finally {
      setLabLoading(false);
    }
  };

  // Handler Pencarian Tracking Pengaduan (GET /api/public/pengaduan/track/:kode_tracking)
  const searchPengaduan = async (e) => {
    e.preventDefault();
    const q = pengaduanQuery.trim();

    if (!q) {
      setPengaduanError('Silakan masukkan kode tracking pengaduan Anda.');
      return;
    }

    setPengaduanLoading(true);
    setPengaduanError(null);
    setPengaduanResult(null);

    try {
      // Panggil endpoint resmi GET /api/public/pengaduan/track/:kode_tracking
      const response = await pengaduanService.trackByCodePublic(q);

      if (response && response.success && response.data) {
        setPengaduanResult(response.data);
      } else {
        setPengaduanError('Data pengaduan tidak ditemukan.');
      }
    } catch (error) {
      if (error.status === 404) {
        setPengaduanError(
          `Pengaduan dengan kode tracking '${q.toUpperCase()}' tidak ditemukan. Mohon periksa kembali kode tiket Anda (Contoh format: PGD-20260819-A8F2K).`
        );
      } else if (error.status === 400) {
        setPengaduanError(error.message || 'Format kode tracking tidak valid.');
      } else {
        setPengaduanError(
          'Tidak dapat terhubung ke server backend pengaduan. Pastikan server aktif dan koneksi internet stabil.'
        );
      }
    } finally {
      setPengaduanLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', paddingTop: '80px', minHeight: '100vh' }}>
      {/* Page Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a3a1e 0%, #0d6e38 60%, #064e3b 100%)',
        padding: '4rem 1.5rem 5rem',
        position: 'relative', overflow: 'hidden',
        color: '#ffffff',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            padding: '0.4rem 1rem', borderRadius: '9999px',
            fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1.2rem',
            border: '1px solid rgba(255,255,255,0.25)', color: '#7dd3fc',
          }}>
            🔍 Lacak Layanan Publik Online
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800,
            letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '0.8rem',
          }}>
            Pelacakan Layanan BRMP DIY
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
            Cek progres <strong>Pengujian Laboratorium</strong> benih atau pantau status dan balasan <strong>Pengaduan Masyarakat</strong> secara transparan.
          </p>
        </div>
        {/* Wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }} className="track-grid">
          
          {/* 1. LAB TRACKING */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.2rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #dcfce7, #86efac)',
                color: '#0d6e38', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FlaskConical size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Tracking Uji Lab</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Nomor SPK atau Kode Sampel Lab</p>
              </div>
            </div>

            <form onSubmit={searchLab} style={{
              backgroundColor: '#f8fafc', borderRadius: '14px',
              border: '2px solid #e2e8f0', overflow: 'hidden', marginBottom: '1.2rem',
              display: 'flex',
            }}>
              <input
                type="text" value={labQuery}
                onChange={(e) => setLabQuery(e.target.value)}
                placeholder="Contoh: LAB-2026-001"
                style={{
                  flex: 1, padding: '0.85rem 1rem', border: 'none', outline: 'none',
                  fontSize: '0.9rem', color: '#1e293b', backgroundColor: 'transparent',
                }}
              />
              <button type="submit" disabled={labLoading} style={{
                background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                color: '#fff', padding: '0.85rem 1.3rem',
                fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'filter 0.2s ease',
              }}>
                {labLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>{labLoading ? 'Mencari...' : 'Cari'}</span>
              </button>
            </form>

            {/* Error Message */}
            {labError && (
              <div style={{
                backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '12px', padding: '0.9rem 1rem', marginBottom: '1.2rem',
                display: 'flex', gap: '0.6rem', alignItems: 'flex-start', color: '#b91c1c',
                fontSize: '0.84rem', lineHeight: 1.5,
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>{labError}</div>
                <button onClick={() => setLabError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Demo Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.77rem', color: '#64748b', alignSelf: 'center' }}>Demo Lab:</span>
              {labDatabase.map((s) => (
                <button key={s.code} onClick={() => { setLabQuery(s.code); setLabResult(s); setLabError(null); }} style={{
                  backgroundColor: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '9999px',
                  padding: '0.15rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#0d6e38',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}>
                  {s.code}
                </button>
              ))}
            </div>

            {labResult && <LabResult data={labResult} onClose={() => setLabResult(null)} />}
          </div>

          {/* 2. PENGADUAN TRACKING (LIVE API) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.2rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <MessageSquareWarning size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Tracking Pengaduan</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Gunakan Nomor Tiket / Kode Tracking Pengaduan</p>
              </div>
            </div>

            <form onSubmit={searchPengaduan} style={{
              backgroundColor: '#f8fafc', borderRadius: '14px',
              border: '2px solid #fed7aa', overflow: 'hidden', marginBottom: '1.2rem',
              display: 'flex',
            }}>
              <input
                type="text"
                value={pengaduanQuery}
                onChange={(e) => setPengaduanQuery(e.target.value)}
                placeholder="Contoh: PGD-20260819-A8F2K"
                style={{
                  flex: 1, padding: '0.85rem 1rem', border: 'none', outline: 'none',
                  fontSize: '0.9rem', color: '#1e293b', backgroundColor: 'transparent',
                }}
              />
              <button
                type="submit"
                disabled={pengaduanLoading}
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  color: '#fff', padding: '0.85rem 1.3rem',
                  fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'filter 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
              >
                {pengaduanLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>{pengaduanLoading ? 'Mencari...' : 'Cari'}</span>
              </button>
            </form>

            {/* Error Alert Box */}
            {pengaduanError && (
              <div style={{
                backgroundColor: '#fff1f2',
                border: '1.5px solid #fecdd3',
                borderRadius: '14px',
                padding: '1rem 1.1rem',
                marginBottom: '1.2rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                color: '#9f1239',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                animation: 'fadeInUp 0.3s ease',
              }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '1px', color: '#e11d48' }} />
                <div style={{ flex: 1 }}>
                  <strong>Pencarian Gagal:</strong> {pengaduanError}
                </div>
                <button
                  onClick={() => setPengaduanError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9f1239',
                    padding: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Demo / Sample Codes */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.77rem', color: '#64748b' }}>Contoh Kode:</span>
              {['PGD-20260819-A8F2K', 'PGD-20260819-RYL3B'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setPengaduanQuery(code);
                    setPengaduanError(null);
                  }}
                  style={{
                    backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '9999px',
                    padding: '0.18rem 0.65rem', fontSize: '0.74rem', fontWeight: 700, color: '#b45309',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fde68a'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fffbeb'; }}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Hasil Render Live Data Pengaduan */}
            {pengaduanResult && (
              <PengaduanResult data={pengaduanResult} onClose={() => setPengaduanResult(null)} />
            )}
          </div>
        </div>

        {/* Back to Home Navigation & Formulir Baru */}
        <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/pengaduan" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#b45309', fontWeight: 700, fontSize: '0.9rem',
            textDecoration: 'none', padding: '0.65rem 1.4rem',
            borderRadius: '9999px', border: '1.5px solid #fed7aa',
            backgroundColor: '#fffbeb', transition: 'all 0.2s ease',
          }}>
            ✍️ Buat Laporan Pengaduan Baru
          </Link>

          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#0d6e38', fontWeight: 600, fontSize: '0.9rem',
            textDecoration: 'none', padding: '0.65rem 1.4rem',
            borderRadius: '9999px', border: '1.5px solid #bbf7d0',
            backgroundColor: '#f0fdf4', transition: 'all 0.2s ease',
          }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .track-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
