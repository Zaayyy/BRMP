import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ChevronRight, RefreshCw, Loader2, Sprout, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { benihService } from '../services/apiService';

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

export default function BenihSection() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [selected, setSelected] = useState(null);
  const [benihList, setBenihList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveBenih = async () => {
    setIsLoading(true);
    try {
      const res = await benihService.getAllPublic({ limit: 8 });
      if (res && res.success && Array.isArray(res.data)) {
        const colors = ['#10b981', '#f59e0b', '#0284c7', '#ec4899', '#8b5cf6'];
        const formatted = res.data.map((item, idx) => ({
          id: item.id,
          nama: item.nama_benih,
          varietas: item.nama_benih,
          stok: `${(item.stok || 0).toLocaleString()} kg`,
          statusStok: (item.stok || 0) > 50 ? 'Tersedia' : (item.stok || 0) > 0 ? 'Terbatas' : 'Habis',
          kelas: 'Benih Bersertifikat',
          harga: 'Hubungi Petugas',
          image: item.gambar_url || '/images/seed_padi.png',
          dayaKecambah: '≥ 90%',
          kemurnian: '≥ 99%',
          kadarAir: '≤ 12%',
          deskripsi: item.deskripsi || 'Benih unggulan bersertifikat pengawasan mutu BRMP DIY.',
          color: colors[idx % colors.length],
        }));
        setBenihList(formatted);
      }
    } catch (err) {
      console.warn('Gagal memuat benih dari server:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBenih();
  }, []);

  return (
    <section
      id="informasi-benih"
      ref={sectionRef}
      style={{
        backgroundColor: '#fafbfc',
        padding: '6rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3.5rem',
            gap: '1.5rem',
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
                boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
              }}
            >
              <Sprout size={15} />
              <span>Inventaris Benih Real-Time</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              Ketersediaan Benih Bersertifikasi
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#64748b', marginTop: '0.65rem', maxWidth: '540px', lineHeight: 1.6 }}>
              Katalog resmi varietas benih unggul berstandar nasional yang diproduksi dan diawasi oleh BRMP D.I. Yogyakarta.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={fetchLiveBenih}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '9999px',
                border: '1.5px solid #d1fae5',
                backgroundColor: '#f0fdf4',
                color: '#065f46',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Memuat...' : 'Segarkan Data'}</span>
            </button>

            <Link
              to="/benih"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)';
              }}
            >
              <span>Katalog Lengkap</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Grid List */}
        {benihList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '26px',
            border: '1.5px dashed #cbd5e1',
          }}>
            <Sprout size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Belum Ada Data Benih Terdaftar</h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '0.4rem' }}>
              Daftar benih baru yang ditambahkan di portal admin akan langsung tampil di sini.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s 0.2s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {benihList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '22px',
                  padding: '1.5rem',
                  border: '1.5px solid #f1f5f9',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 18px 36px rgba(16,185,129,0.12)';
                  e.currentTarget.style.borderColor = '#a7f3d0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                {/* Image Box */}
                <div style={{
                  height: '140px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                  overflow: 'hidden',
                  border: '1px solid #f1f5f9',
                }}>
                  <img
                    src={item.image}
                    alt={item.nama}
                    style={{ maxHeight: '115px', maxWidth: '90%', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.src = '/images/seed_padi.png'; }}
                  />
                </div>

                <span style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: item.statusStok === 'Tersedia' ? '#dcfce7' : item.statusStok === 'Terbatas' ? '#fef3c7' : '#fee2e2',
                  color: item.statusStok === 'Tersedia' ? '#15803d' : item.statusStok === 'Terbatas' ? '#b45309' : '#b91c1c',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '9999px',
                  marginBottom: '0.7rem',
                }}>
                  {item.statusStok}
                </span>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                  {item.nama}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.2rem', flex: 1 }}>
                  Stok: <strong style={{ color: '#059669' }}>{item.stok}</strong>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.9rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669' }}>Lihat Detail Varietas</span>
                  <ChevronRight size={16} color="#059669" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '1.5rem',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              maxWidth: '560px', width: '100%',
              padding: '2.2rem',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.35)',
              position: 'relative',
              animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: '1.2rem', right: '1.2rem',
                backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center', marginBottom: '1.6rem' }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '18px',
                backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '1.5px solid #e2e8f0', flexShrink: 0,
              }}>
                <img src={selected.image} alt={selected.nama} style={{ maxHeight: '64px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = '/images/seed_padi.png'; }} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                  {selected.kelas}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>{selected.nama}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1.1rem', borderRadius: '16px', fontSize: '0.86rem', marginBottom: '1.4rem', lineHeight: 1.65, border: '1px solid #e2e8f0' }}>
              <div><span style={{ color: '#64748b' }}>Stok Tersedia: </span><strong style={{ color: '#059669', fontSize: '0.95rem' }}>{selected.stok}</strong></div>
              <div><span style={{ color: '#64748b' }}>Status Inventaris: </span><strong>{selected.statusStok}</strong></div>
              <div style={{ marginTop: '0.3rem' }}><span style={{ color: '#64748b' }}>Deskripsi Mutu: </span>{selected.deskripsi}</div>
            </div>

            <a
              href={`https://wa.me/6285878438548?text=Halo%20Admin%20BRMP%20DIY,%20saya%20tertarik%20dengan%20ketersediaan%20benih%20${encodeURIComponent(selected.nama)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#ffffff', padding: '0.95rem', borderRadius: '14px',
                fontWeight: 800, fontSize: '0.94rem', textDecoration: 'none',
                boxShadow: '0 6px 18px rgba(37,211,102,0.3)',
              }}
            >
              <MessageCircle size={18} />
              <span>Hubungi Petugas Penjualan via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
