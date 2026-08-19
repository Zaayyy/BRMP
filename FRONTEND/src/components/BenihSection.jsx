import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ChevronRight, RefreshCw, Loader2, Sprout } from 'lucide-react';
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

  // Ambil data benih secara real-time dari backend (GET /api/public/benih)
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
        backgroundColor: '#ffffff',
        padding: '6rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                gap: '0.5rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.76rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <span>🌾 Stok Inventaris Live</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Ketersediaan Benih Bersertifikasi
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', maxWidth: '500px' }}>
              Data benih pertanian resmi bersertifikat mutu dari Balai Besar Standar Instrumen Pertanian DIY.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={fetchLiveBenih}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '9999px',
                border: '1.5px solid #d1fae5',
                backgroundColor: '#f0fdf4',
                color: '#0d6e38',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Memuat...' : 'Segarkan'}</span>
            </button>

            <Link
              to="/benih"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0d6e38',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                padding: '0.65rem 1.2rem',
                borderRadius: '9999px',
                border: '1.5px solid #d1fae5',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0d6e38';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#0d6e38';
              }}
            >
              <span>Katalog Lengkap</span>
              <ChevronRight size={17} />
            </Link>
          </div>
        </div>

        {/* Grid List */}
        {benihList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            border: '1px dashed #cbd5e1',
          }}>
            <Sprout size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Belum Ada Data Benih Terdaftar</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.4rem' }}>
              Daftar benih baru yang ditambahkan di portal admin akan langsung tampil di sini.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  borderRadius: '20px',
                  padding: '1.5rem',
                  border: '1.5px solid #f1f5f9',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(13,110,56,0.12)';
                  e.currentTarget.style.borderColor = '#86efac';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{
                  height: '130px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                }}>
                  <img
                    src={item.image}
                    alt={item.nama}
                    style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.src = '/images/seed_padi.png'; }}
                  />
                </div>

                <span style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: item.statusStok === 'Tersedia' ? '#dcfce7' : item.statusStok === 'Terbatas' ? '#fef3c7' : '#fee2e2',
                  color: item.statusStok === 'Tersedia' ? '#15803d' : item.statusStok === 'Terbatas' ? '#b45309' : '#b91c1c',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  marginBottom: '0.6rem',
                }}>
                  {item.statusStok}
                </span>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                  {item.nama}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', flex: 1 }}>
                  Stok: <strong>{item.stok}</strong>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d6e38' }}>Lihat Detail</span>
                  <ChevronRight size={15} color="#0d6e38" />
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
            backgroundColor: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1.5rem',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px', width: '100%',
              padding: '2rem',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: '1.2rem', right: '1.2rem',
                backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '16px',
                backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '1px solid #e2e8f0',
              }}>
                <img src={selected.image} alt={selected.nama} style={{ maxHeight: '60px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = '/images/seed_padi.png'; }} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {selected.kelas}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>{selected.nama}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '14px', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.6, border: '1px solid #e2e8f0' }}>
              <div><span style={{ color: '#64748b' }}>Stok Tersedia: </span><strong style={{ color: '#0d6e38' }}>{selected.stok}</strong></div>
              <div><span style={{ color: '#64748b' }}>Status: </span><strong>{selected.statusStok}</strong></div>
              <div><span style={{ color: '#64748b' }}>Deskripsi: </span>{selected.deskripsi}</div>
            </div>

            <a
              href="https://wa.me/6285878438548?text=Halo%20Admin%20BRMP%20DIY,%20saya%20ingin%20konsultasi%20terkait%20ketersediaan%20benih"
              target="_blank"
              rel="noreferrer"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                color: '#ffffff', padding: '0.85rem', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none',
              }}
            >
              <MessageCircle size={18} />
              <span>Hubungi Petugas Layanan Benih</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
