import React, { useEffect, useRef, useState } from 'react';
import { Search, CheckCircle, Download, X, FlaskConical, Clock, FileText, ExternalLink, AlertCircle, Sparkles, Phone, Tag } from 'lucide-react';
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

const STEPS = ['Pembayaran', 'Verif Sampel', 'Pengujian', 'Analis Data', 'Selesai'];

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
        let stepNum = 1;
        const s = (item.status_uji || item.statusUji || '').toLowerCase().trim();
        if (s.includes('selesai')) stepNum = 5;
        else if (s.includes('analis') || s.includes('analisis') || s.includes('data')) stepNum = 4;
        else if (s.includes('pengujian') || s.includes('proses') || s.includes('ekstraksi') || s.includes('destruksi')) stepNum = 3;
        else if (s.includes('verif') || s.includes('preparasi')) stepNum = 2;
        else stepNum = 1;

        setActiveResult({
          id: item.id,
          noReg: item.no_reg || item.noReg || `#${item.id}`,
          spk: item.spk || item.noSpk || item.kode_tracking || `#${item.id}`,
          code: item.spk || item.kode_tracking || `#${item.id}`,
          pemohon: item.nama_pemohon || item.namaPemohon || 'Pemohon Terdaftar',
          sampelTanah: item.sampel_tanah || item.sampelTanah || null,
          sampelAir: item.sampel_air || item.sampelAir || null,
          sampelPupuk: item.sampel_pupuk || item.sampelPupuk || null,
          sampelTanaman: item.sampel_tanaman || item.sampelTanaman || null,
          jumlahSampel: item.jumlah_sampel || item.jumlahSampel || item.jumlah || '1',
          parameterUji: item.parameter_uji || item.parameterUji || null,
          telepon: item.telepon || item.noTelepon || null,
          biaya: item.biaya || null,
          statusBayar: item.status_bayar || item.statusBayar || 'Belum Bayar',
          tahapProses: item.tahap_proses || item.tahapProses || (item.status_uji === 'Selesai' ? '6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)' : '3. Destruksi / Ekstraksi Kimia di Laboratorium'),
          tanggalMasuk: item.tanggal_masuk || item.tanggalMasuk
            ? new Date(item.tanggal_masuk || item.tanggalMasuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Baru Masuk',
          tanggalSelesai: item.tanggal_selesai || item.tanggalSelesai
            ? new Date(item.tanggal_selesai || item.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : null,
          status: item.status_uji || item.statusUji || 'Pengujian',
          step: stepNum,
          dokumenUrl: item.hasil_dokumen_url || item.hasilDokumenUrl || null,
          keterangan: item.keterangan || '',
        });
        return;
      }
    } catch (err) {
      console.warn('Pelacakan lab:', err.message);
    } finally {
      setIsLoading(false);
    }

    setNotFoundMsg(`Nomor SPK atau kode pengujian '${q}' tidak ditemukan di database laboratorium BRMP DIY.`);
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

          <p style={{ fontSize: '0.98rem', color: '#64748b', lineHeight: 1.65, maxWidth: '680px', margin: '0 auto' }}>
            Pantau status pengujian sampel <strong>Tanah [TH]</strong>, <strong>Air [A]</strong>, <strong>Pupuk [P]</strong>, dan <strong>Jaringan Tanaman [TMN]</strong> secara transparan menggunakan Nomor SPK / Kode Register.
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
              placeholder="Masukkan Nomor SPK resmi (contoh: CE-2/09-26/297)..."
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
              {isLoading ? 'Mencari...' : 'Lacak Status Uji'}
            </button>
          </form>

          {/* SPK Notice Bar */}
          <div style={{
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: '#065f46',
            fontWeight: 700,
          }}>
            <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '0.3rem 0.85rem', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
              ℹ️ Pelacakan Resmi: Gunakan Nomor SPK lengkap yang tertera pada tanda terima sampel (Contoh: CE-2/09-26/297)
            </span>
          </div>

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
              maxWidth: '680px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
              padding: '2.2rem',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.35)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800, color: '#059669',
                    backgroundColor: '#dcfce7', padding: '0.2rem 0.65rem', borderRadius: '6px',
                    fontFamily: 'monospace',
                  }}>
                    SPK: {activeResult.spk}
                  </span>
                  {activeResult.noReg && (
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 800, color: '#475569',
                      backgroundColor: '#f1f5f9', padding: '0.2rem 0.65rem', borderRadius: '6px',
                      fontFamily: 'monospace',
                    }}>
                      No. Reg: {activeResult.noReg}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem', lineHeight: 1.3 }}>
                  {activeResult.pemohon}
                </h3>
              </div>
            </div>

            {/* Info Box: Sample Breakdown with Badges */}
            <div style={{
              backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '18px',
              fontSize: '0.86rem', marginBottom: '1.6rem', border: '1px solid #e2e8f0',
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.9rem',
                marginBottom: '1rem', paddingBottom: '0.9rem', borderBottom: '1px solid #e2e8f0',
              }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem', fontSize: '0.78rem' }}>Tanggal Penerimaan:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{activeResult.tanggalMasuk}</strong>
                </div>
                {activeResult.tanggalSelesai && (
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem', fontSize: '0.78rem' }}>Tanggal Selesai:</span>
                    <strong style={{ color: '#166534', fontSize: '0.9rem' }}>{activeResult.tanggalSelesai}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '0.15rem', fontSize: '0.78rem' }}>Status Pengujian:</span>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.6rem', borderRadius: '9999px',
                    backgroundColor: activeResult.status === 'Selesai' ? '#dcfce7' : '#fef3c7',
                    color: activeResult.status === 'Selesai' ? '#166534' : '#92400e',
                  }}>
                    {activeResult.status}
                  </span>
                </div>
              </div>

              {/* Rincian Nomor Sampel per Kategori */}
              <div>
                <span style={{ color: '#475569', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  Rincian Sampel Terdaftar ({activeResult.jumlahSampel || 1} Sampel):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {activeResult.sampelTanah && (
                    <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.35rem 0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', display: 'block' }}>TANAH [TH]</span>
                      <strong style={{ fontSize: '0.85rem', color: '#78350f', fontFamily: 'monospace' }}>{activeResult.sampelTanah}</strong>
                    </div>
                  )}
                  {activeResult.sampelAir && (
                    <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '10px', padding: '0.35rem 0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', display: 'block' }}>AIR [A]</span>
                      <strong style={{ fontSize: '0.85rem', color: '#075985', fontFamily: 'monospace' }}>{activeResult.sampelAir}</strong>
                    </div>
                  )}
                  {activeResult.sampelPupuk && (
                    <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.35rem 0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7e22ce', display: 'block' }}>PUPUK [P]</span>
                      <strong style={{ fontSize: '0.85rem', color: '#6b21a8', fontFamily: 'monospace' }}>{activeResult.sampelPupuk}</strong>
                    </div>
                  )}
                  {activeResult.sampelTanaman && (
                    <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.35rem 0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', display: 'block' }}>JARINGAN TANAMAN [TMN]</span>
                      <strong style={{ fontSize: '0.85rem', color: '#166534', fontFamily: 'monospace' }}>{activeResult.sampelTanaman}</strong>
                    </div>
                  )}
                  {!activeResult.sampelTanah && !activeResult.sampelAir && !activeResult.sampelPupuk && !activeResult.sampelTanaman && (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Sampel pengujian mutu umum</span>
                  )}
                </div>
              </div>

              {/* Parameter Uji jika ada */}
              {activeResult.parameterUji && (
                <div style={{ marginTop: '0.9rem', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#475569', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.3rem' }}>
                    Parameter Uji Analisis:
                  </span>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.5 }}>
                    {activeResult.parameterUji}
                  </p>
                </div>
              )}
            </div>

            {/* Tahapan Proses Analisis Saat Ini (Real-Time Badge) */}
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: '16px',
              padding: '1rem 1.2rem',
              marginBottom: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem',
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  📍 Tahapan Analisis Saat Ini:
                </span>
                <strong style={{ fontSize: '0.96rem', color: '#064e3b', display: 'block', marginTop: '0.2rem' }}>
                  {activeResult.tahapProses || '3. Destruksi / Ekstraksi Kimia di Laboratorium'}
                </strong>
              </div>
              <span style={{
                backgroundColor: '#059669', color: '#ffffff',
                fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '8px',
                flexShrink: 0,
              }}>
                Progres Lab
              </span>
            </div>

            {/* Progress Timeline */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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

            {/* Keterangan & Catatan Proses Pengujian oleh Petugas */}
            {activeResult.keterangan && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.2rem',
                marginBottom: '1.4rem',
                textAlign: 'left',
              }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#047857',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}>
                  🔬 Catatan & Keterangan Analis:
                </span>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  fontWeight: 500,
                  whiteSpace: 'pre-line',
                }}>
                  {activeResult.keterangan}
                </p>
              </div>
            )}

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
                <span>Unduh Dokumen Laporan Hasil Uji (LHU)</span>
              </a>
            ) : (
              <div style={{
                backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0',
                borderRadius: '14px', padding: '0.9rem', textAlign: 'center',
                fontSize: '0.86rem', color: '#065f46', fontWeight: 600, marginBottom: '1rem',
              }}>
                ℹ️ Sampel sedang dalam tahapan pengujian aktif di laboratorium BRMP DIY.
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
