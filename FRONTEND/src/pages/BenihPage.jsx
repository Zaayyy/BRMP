import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageCircle, X, ChevronRight, SlidersHorizontal, RefreshCw, Loader2 } from 'lucide-react';
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

const KATEGORI = ['Semua', 'Serealia', 'Sayuran', 'Kacang-kacangan'];

export default function BenihPage() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');
  const [stokFilter, setStokFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [benihList, setBenihList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil data katalog benih live dari backend (GET /api/public/benih)
  const fetchLiveBenih = async (querySearch = '') => {
    setIsLoading(true);
    try {
      const response = await benihService.getAllPublic({ search: querySearch });
      if (response && response.success && Array.isArray(response.data)) {
        // Transformasikan data dari Prisma schema ke format tampilan kartu
        const formatted = response.data.map((item, index) => {
          const colors = ['#10b981', '#f59e0b', '#0284c7', '#ec4899', '#8b5cf6'];
          const bgColors = ['#d1fae5', '#fef3c7', '#e0f2fe', '#fce7f3', '#ede9fe'];
          const pickedColor = colors[index % colors.length];
          const pickedBg = bgColors[index % bgColors.length];

          return {
            id: item.id,
            nama: item.nama_benih,
            varietas: item.nama_benih,
            kategori: item.nama_benih.toLowerCase().includes('padi') || item.nama_benih.toLowerCase().includes('jagung')
              ? 'Serealia'
              : item.nama_benih.toLowerCase().includes('kedelai') || item.nama_benih.toLowerCase().includes('kacang')
              ? 'Kacang-kacangan'
              : 'Sayuran',
            stok: item.stok || 0,
            satuan: 'kg',
            statusStok: (item.stok || 0) > 50 ? 'Tersedia' : (item.stok || 0) > 0 ? 'Terbatas' : 'Habis',
            kelas: 'Benih Bersertifikat',
            harga: 'Hubungi Petugas',
            image: item.gambar_url || '/images/seed_padi.png',
            dayaKecambah: '≥ 90%',
            kemurnian: '≥ 99%',
            kadarAir: '≤ 12%',
            deskripsi: item.deskripsi || 'Benih unggulan bersertifikat resmi pengawasan mutu BRMP DIY.',
            color: pickedColor,
            bgColor: pickedBg,
          };
        });
        setBenihList(formatted);
      }
    } catch (err) {
      console.warn('Gagal memuat benih:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBenih(search);
  }, [search]);

  const filtered = benihList.filter((b) => {
    const matchSearch = (b.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.varietas || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.deskripsi || '').toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === 'Semua' || b.kategori === kategori;
    const matchStok = stokFilter === 'Semua' || b.statusStok === stokFilter;
    return matchSearch && matchKategori && matchStok;
  });

  const handleWA = (nama = '') => {
    const text = encodeURIComponent(`Halo BRMP DIY, saya ingin menanyakan informasi stok dan pemesanan benih ${nama || 'unggul'}. Terima kasih.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', paddingTop: '80px', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #022c22 0%, #0d6e38 60%, #065f46 100%)',
        padding: '4rem 1.5rem 5rem',
        position: 'relative', overflow: 'hidden', color: '#ffffff',
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
            border: '1px solid rgba(255,255,255,0.25)', color: '#6ee7b7',
          }}>
            🌾 Katalog Benih Terkini
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800,
            letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '0.8rem',
          }}>
            Informasi Benih Unggulan BRMP DIY
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
            Data stok real-time benih tanaman pangan dan hortikultura bersertifikat di wilayah Daerah Istimewa Yogyakarta.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {/* Filters */}
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem',
            alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '2rem',
            opacity: sectionVisible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
          ref={sectionRef}
        >
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
            padding: '0.6rem 1rem', flex: '1', minWidth: '240px',
            transition: 'border-color 0.2s ease',
          }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#10b981')}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Search size={18} color="#94a3b8" />}
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau varietas benih..."
              style={{ border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1e293b', backgroundColor: 'transparent', flex: 1 }}
            />
          </div>

          {/* Kategori Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {KATEGORI.map((k) => (
              <button key={k} onClick={() => setKategori(k)} style={{
                padding: '0.5rem 1rem', borderRadius: '9999px', border: '1.5px solid',
                borderColor: kategori === k ? '#0d6e38' : '#e2e8f0',
                backgroundColor: kategori === k ? '#0d6e38' : '#ffffff',
                color: kategori === k ? '#ffffff' : '#374151',
                fontSize: '0.85rem', fontWeight: kategori === k ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                {k}
              </button>
            ))}
          </div>

          {/* Stok filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Semua', 'Tersedia', 'Terbatas'].map((s) => (
              <button key={s} onClick={() => setStokFilter(s)} style={{
                padding: '0.5rem 0.85rem', borderRadius: '9999px', border: '1.5px solid',
                borderColor: stokFilter === s ? '#10b981' : '#e2e8f0',
                backgroundColor: stokFilter === s ? '#e8f5ed' : '#ffffff',
                color: stokFilter === s ? '#0d6e38' : '#6b7280',
                fontSize: '0.82rem', fontWeight: stokFilter === s ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Count info & Refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Menampilkan <strong style={{ color: '#0d6e38' }}>{filtered.length}</strong> komoditas benih terdaftar
          </p>
          <button
            onClick={() => fetchLiveBenih(search)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#0d6e38', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Sinkronisasi Stok</span>
          </button>
        </div>

        {/* Grid Benih */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Benih tidak ditemukan</p>
            <p style={{ fontSize: '0.86rem' }}>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {filtered.map((benih, i) => (
              <div
                key={benih.id}
                onClick={() => setSelected(benih)}
                className="hover-lift card-shine"
                style={{
                  backgroundColor: '#ffffff', borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  padding: '1.4rem', cursor: 'pointer',
                  opacity: sectionVisible ? 1 : 0,
                  transform: sectionVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s cubic-bezier(0.22,1,0.36,1)`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Top accent */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                  borderRadius: '20px 20px 0 0', backgroundColor: benih.color,
                }} />

                {/* Image */}
                <div style={{
                  width: '100%', aspectRatio: '1/1', backgroundColor: '#f8fafc',
                  borderRadius: '14px', marginBottom: '1rem', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <img
                    src={benih.image} alt={benih.nama}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1524591902995-a986c4cc0367?auto=format&fit=crop&w=300&q=80'; }}
                    onMouseOver={(e) => (e.target.style.transform = 'scale(1.08)')}
                    onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                  />
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    backgroundColor: benih.statusStok === 'Tersedia' ? '#16a34a' : benih.statusStok === 'Terbatas' ? '#d97706' : '#dc2626',
                    color: '#ffffff', fontSize: '0.68rem', fontWeight: 700,
                    padding: '0.2rem 0.55rem', borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}>
                    {benih.statusStok}
                  </span>
                </div>

                {/* Category badge */}
                <span style={{
                  display: 'inline-block', fontSize: '0.68rem', fontWeight: 700,
                  color: benih.color, backgroundColor: benih.bgColor,
                  padding: '0.15rem 0.55rem', borderRadius: '6px', marginBottom: '0.4rem',
                }}>
                  {benih.kategori}
                </span>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                  {benih.nama}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {benih.varietas}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: benih.color }}>
                    {benih.stok.toLocaleString()} {benih.satuan}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
                    Detail <ChevronRight size={14} />
                  </div>
                </div>

                {/* Stok bar */}
                <div style={{ marginTop: '0.8rem', backgroundColor: '#f1f5f9', borderRadius: '9999px', height: '5px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '9999px',
                    width: benih.statusStok === 'Tersedia' ? `${Math.min((benih.stok / 4000) * 100, 100)}%` : '25%',
                    backgroundColor: benih.statusStok === 'Tersedia' ? benih.color : '#d97706',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WA CTA */}
        <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px',
            padding: '2rem', maxWidth: '600px', margin: '0 auto',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Tertarik Memesan Benih?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Hubungi tim BRMP DIY langsung via WhatsApp untuk informasi ketersediaan, harga, dan pemesanan benih bersertifikat.
            </p>
            <button onClick={() => handleWA()} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
              background: 'linear-gradient(135deg, #16a34a, #0d6e38)',
              color: '#ffffff', padding: '0.85rem 1.8rem', borderRadius: '9999px',
              fontWeight: 700, fontSize: '0.95rem',
              boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              border: 'none', cursor: 'pointer',
            }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
            >
              <MessageCircle size={20} /> Hubungi via WhatsApp
            </button>
          </div>
        </div>

        {/* Back */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#0d6e38', fontWeight: 600, fontSize: '0.9rem',
            textDecoration: 'none', padding: '0.6rem 1.2rem',
            borderRadius: '9999px', border: '1.5px solid #bbf7d0',
            backgroundColor: '#f0fdf4', transition: 'all 0.2s ease',
          }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1.5rem',
        }} onClick={() => setSelected(null)}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px',
            maxWidth: '520px', width: '100%',
            padding: '2rem', position: 'relative',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
            animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            overflow: 'hidden',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
              backgroundColor: selected.color,
            }} />

            <button onClick={() => setSelected(null)} style={{
              position: 'absolute', top: '1.2rem', right: '1.2rem',
              backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
            }}>
              <X size={16} />
            </button>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                backgroundColor: selected.bgColor, overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={selected.image} alt={selected.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1524591902995-a986c4cc0367?auto=format&fit=crop&w=300&q=80'; }} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: selected.color, backgroundColor: selected.bgColor, padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                  {selected.kategori} • {selected.kelas}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  {selected.nama}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {selected.deskripsi}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Stok Tersedia</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: selected.color }}>
                  {selected.stok.toLocaleString()} {selected.satuan}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Status Ketersediaan</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selected.statusStok === 'Tersedia' ? '#16a34a' : '#d97706' }}>
                  {selected.statusStok}
                </div>
              </div>
            </div>

            <button onClick={() => { setSelected(null); handleWA(selected.nama); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              background: 'linear-gradient(135deg, #16a34a, #0d6e38)',
              color: '#ffffff', padding: '0.85rem', borderRadius: '12px',
              fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
            }}>
              <MessageCircle size={18} /> Hubungi via WhatsApp untuk Pemesanan
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
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
