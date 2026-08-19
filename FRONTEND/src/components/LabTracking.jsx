import React, { useEffect, useRef, useState } from 'react';
import { Search, CheckCircle, Download, X, FlaskConical, Clock, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { labService } from '../services/apiService';

// Intersection Observer hook for scroll reveal
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const STEPS = ['Pengajuan Diterima', 'Verifikasi Sampel', 'Pengujian Lab', 'Analisis Hasil', 'Laporan Selesai'];

export default function LabTracking() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState(null);
  const [notFoundMsg, setNotFoundMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setNotFoundMsg(null);

    try {
      const res = await labService.trackByCodePublic(q);
      if (res && res.success && res.data) {
        const item = res.data;
        const stepNum = item.status_uji === 'Selesai' ? 5 : item.status_uji === 'Proses' ? 3 : 1;

        setActiveResult({
          code: item.kode_tracking || `#${item.id}`,
          title: item.keterangan || 'Pengujian Mutu & Standar Laboratorium BRMP DIY',
          pemohon: item.nama_pemohon || 'Pemohon Terdaftar',
          tanggalMasuk: item.tanggal_masuk ? new Date(item.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru Masuk',
          status: item.status_uji,
          step: stepNum,
          dokumenUrl: item.hasil_dokumen_url,
          keterangan: item.keterangan,
        });
        return;
      }
    } catch (err) {
      console.warn('Pelacakan lab:', err.message);
    } finally {
      setIsLoading(false);
    }

    setNotFoundMsg(`Kode sampel atau nomor pengujian '${q}' tidak ditemukan di database laboratorium BRMP DIY.`);
  };

  return (
    <section
      id="lab-tracking"
      ref={sectionRef}
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 50%, #ffffff 100%)',
        padding: '6rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', left: '-40px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,110,56,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#dcfce7', color: '#15803d',
            padding: '0.4rem 1rem', borderRadius: '9999px',
            fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            <FlaskConical size={14} />
            <span>Layanan Laboratorium</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
            fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.8rem',
          }}>
            Tracking Layanan Laboratorium BRMP DIY
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.55, maxWidth: '600px', margin: '0 auto' }}>
            Pantau hasil uji laboratorium, sertifikasi benih, dan analisis mutu secara transparan dan real-time langsung dari database.
          </p>
        </div>

        {/* Search Card */}
        <div style={{
          background: 'linear-gradient(135deg, #e8f5ed, #d1fae5)',
          borderRadius: '24px',
          padding: '2.5rem',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 8px 32px rgba(13,110,56,0.07)',
        }}>
          <form onSubmit={handleSearch} style={{
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
            padding: '0.4rem 0.4rem 0.4rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '2px solid rgba(16,185,129,0.2)',
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          }}>
            <Search size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setNotFoundMsg(null); }}
              placeholder="Masukkan Kode Tracking Pengujian Lab (contoh: LAB-20260819-001)..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: '0.95rem', color: '#1e293b', backgroundColor: 'transparent',
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #10b981, #0d6e38)',
                color: '#ffffff',
                padding: '0.75rem 1.75rem',
                borderRadius: '9999px',
                fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(13,110,56,0.3)',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                border: 'none', cursor: 'pointer',
              }}
            >
              {isLoading ? 'Mencari...' : 'Cari Hasil Lab'}
            </button>
          </form>

          {/* Not Found Alert */}
          {notFoundMsg && (
            <div style={{
              marginTop: '1.2rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              padding: '0.8rem 1.2rem',
              fontSize: '0.86rem',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{notFoundMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Hasil Uji */}
      {activeResult && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1.5rem',
          }}
          onClick={() => setActiveResult(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '640px', width: '100%',
              maxHeight: '88vh', overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setActiveResult(null)} style={{
              position: 'absolute', top: '1.2rem', right: '1.2rem',
              backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <X size={18} />
            </button>

            {/* Modal Header */}
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
                  backgroundColor: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '6px',
                }}>
                  {activeResult.code}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem', lineHeight: 1.3 }}>
                  {activeResult.title}
                </h3>
              </div>
            </div>

            {/* Info Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem',
              backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px',
              fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0',
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Pemohon:</span>
                <strong style={{ color: '#1e293b' }}>{activeResult.pemohon}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Tanggal Masuk:</span>
                <strong style={{ color: '#1e293b' }}>{activeResult.tanggalMasuk}</strong>
              </div>
            </div>

            {/* Progress Timeline */}
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>Progress Pengujian Laboratorium:</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '1.8rem' }}>
              <div style={{
                position: 'absolute', top: '16px', left: '8%', right: '8%', height: '3px',
                backgroundColor: '#e2e8f0', zIndex: 0, borderRadius: '2px',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${((activeResult.step - 1) / 4) * 100}%`,
                  background: 'linear-gradient(90deg, #0d6e38, #10b981)',
                  transition: 'width 1s ease',
                }} />
              </div>
              {STEPS.map((step, i) => {
                const done = i + 1 <= activeResult.step;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      backgroundColor: done ? '#0d6e38' : '#e2e8f0',
                      color: done ? '#ffffff' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.82rem',
                      boxShadow: done ? '0 4px 10px rgba(13,110,56,0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      marginBottom: '0.4rem',
                    }}>
                      {done ? <CheckCircle size={18} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: done ? 700 : 500, color: done ? '#0d6e38' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Document Link */}
            {activeResult.dokumenUrl ? (
              <a
                href={activeResult.dokumenUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                  color: '#ffffff', padding: '0.85rem', borderRadius: '12px',
                  fontWeight: 700, fontSize: '0.93rem', textDecoration: 'none', marginBottom: '0.8rem',
                }}
              >
                <Download size={18} />
                <span>Unduh Dokumen Hasil Uji Resmi (PDF)</span>
              </a>
            ) : (
              <div style={{
                backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: '12px', padding: '0.8rem', textAlign: 'center',
                fontSize: '0.84rem', color: '#15803d', fontWeight: 600, marginBottom: '0.8rem',
              }}>
                ℹ️ Sampel sedang dalam tahapan pengujian aktif laboratorium BRMP DIY.
              </div>
            )}

            <button
              onClick={() => setActiveResult(null)}
              style={{
                width: '100%', backgroundColor: '#f1f5f9', color: '#475569',
                padding: '0.75rem', borderRadius: '12px', fontWeight: 700,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
