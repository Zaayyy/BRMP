import React, { useEffect, useRef, useState } from 'react';
import { Search, CheckCircle, Download, X, FlaskConical, Clock, FileText, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { labService } from '../services/apiService';

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
      {/* Decorative background blurs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', left: '-40px',
        width: '240px', height: '240px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            backgroundColor: '#dcfce7', color: '#15803d',
            padding: '0.45rem 1.15rem', borderRadius: '9999px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '1.2rem',
            boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
          }}>
            <FlaskConical size={14} />
            <span>Laboratorium Terakreditasi</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)',
            fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.85rem',
          }}>
            Tracking Uji Laboratorium BRMP DIY
          </h2>

          <p style={{ fontSize: '0.98rem', color: '#64748b', lineHeight: 1.65, maxWidth: '640px', margin: '0 auto' }}>
            Pantau proses pengujian mutu benih, analisis tanah, dan instrumen pertanian secara transparan langsung dari database laboratorium.
          </p>
        </div>

        {/* Search Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5ed 50%, #d1fae5 100%)',
          borderRadius: '26px',
          padding: '2.5rem',
          border: '1.5px solid rgba(16,185,129,0.25)',
          boxShadow: '0 12px 35px rgba(13,110,56,0.06)',
          position: 'relative',
        }}>
          <form onSubmit={handleSearch} style={{
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
            padding: '0.45rem 0.45rem 0.45rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            border: '2px solid rgba(16,185,129,0.3)',
            transition: 'all 0.25s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)')}
          >
            <Search size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setNotFoundMsg(null); }}
              placeholder="Masukkan Kode Tracking Pengujian Lab (contoh: LAB-2026-001)..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: '0.95rem', color: '#1e293b', backgroundColor: 'transparent',
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#ffffff',
                padding: '0.8rem 1.8rem',
                borderRadius: '9999px',
                fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                border: 'none', cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isLoading ? 'Mencari...' : 'Cari Hasil Lab'}
            </button>
          </form>

          {/* Not Found Alert */}
          {notFoundMsg && (
            <div style={{
              marginTop: '1.2rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '14px',
              padding: '0.9rem 1.2rem',
              fontSize: '0.88rem',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 500,
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
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
            backgroundColor: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '1.5rem',
          }}
          onClick={() => setActiveResult(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              maxWidth: '660px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
              padding: '2.2rem',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.35)',
              animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setActiveResult(null)} style={{
              position: 'absolute', top: '1.2rem', right: '1.2rem',
              backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 6px 16px rgba(16,185,129,0.3)',
              }}>
                <FlaskConical size={28} />
              </div>
              <div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 800, color: '#059669',
                  backgroundColor: '#dcfce7', padding: '0.25rem 0.7rem', borderRadius: '6px',
                }}>
                  {activeResult.code}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem', lineHeight: 1.3 }}>
                  {activeResult.title}
                </h3>
              </div>
            </div>

            {/* Info Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem',
              backgroundColor: '#f8fafc', padding: '1.1rem', borderRadius: '16px',
              fontSize: '0.86rem', marginBottom: '1.6rem', border: '1px solid #e2e8f0',
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem', fontSize: '0.78rem' }}>Nama Pemohon:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{activeResult.pemohon}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem', fontSize: '0.78rem' }}>Tanggal Penerimaan Sampel:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{activeResult.tanggalMasuk}</strong>
              </div>
            </div>

            {/* Progress Timeline */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Tahapan Pengujian Laboratorium:
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '2rem' }}>
              <div style={{
                position: 'absolute', top: '17px', left: '8%', right: '8%', height: '3px',
                backgroundColor: '#e2e8f0', zIndex: 0, borderRadius: '2px',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${((activeResult.step - 1) / 4) * 100}%`,
                  background: 'linear-gradient(90deg, #059669, #10b981)',
                  transition: 'width 1s ease',
                }} />
              </div>
              {STEPS.map((step, i) => {
                const done = i + 1 <= activeResult.step;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: done ? '#059669' : '#ffffff',
                      color: done ? '#ffffff' : '#94a3b8',
                      border: done ? 'none' : '2px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.85rem',
                      boxShadow: done ? '0 4px 12px rgba(5,150,105,0.35)' : 'none',
                      transition: 'all 0.3s ease',
                      marginBottom: '0.45rem',
                    }}>
                      {done ? <CheckCircle size={20} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: done ? 800 : 500, color: done ? '#065f46' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
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
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#ffffff', padding: '0.95rem', borderRadius: '14px',
                  fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', marginBottom: '0.9rem',
                  boxShadow: '0 6px 18px rgba(16,185,129,0.3)',
                }}
              >
                <Download size={18} />
                <span>Unduh Dokumen Laporan Hasil Uji (PDF)</span>
              </a>
            ) : (
              <div style={{
                backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0',
                borderRadius: '14px', padding: '0.9rem', textAlign: 'center',
                fontSize: '0.86rem', color: '#065f46', fontWeight: 600, marginBottom: '1rem',
              }}>
                ℹ️ Sampel sedang dalam tahapan pengujian aktif laboratorium BRMP DIY.
              </div>
            )}

            <button
              onClick={() => setActiveResult(null)}
              style={{
                width: '100%', backgroundColor: '#f1f5f9', color: '#475569',
                padding: '0.8rem', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.9rem', border: 'none', cursor: 'pointer',
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
