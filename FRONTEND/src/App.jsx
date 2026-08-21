import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LabTracking from './components/LabTracking';
import BenihSection from './components/BenihSection';
import PortalLayanan from './components/PortalLayanan';
import Footer from './components/Footer';
import TrackPage from './pages/TrackPage';
import BenihPage from './pages/BenihPage';
import MagangPage from './pages/MagangPage';
import KonsultasiPage from './pages/KonsultasiPage';
import NarasumberPage from './pages/NarasumberPage';
import PengaduanPage from './pages/PengaduanPage';
import KunjunganPage from './pages/KunjunganPage';
import InformasiPublikPage from './pages/InformasiPublikPage';
import { BookOpen, X } from 'lucide-react';

function HomePage({ onOpenGuideModal }) {
  return (
    <>
      <Hero
        onOpenBenihModal={() => {
          const elem = document.querySelector('#informasi-benih');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenGuideModal={onOpenGuideModal}
      />
      <PortalLayanan />
      <LabTracking />
      <BenihSection />
    </>
  );
}

export default function App() {
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Otomatis support baik / maupun /testing/
  const basename = window.location.pathname.startsWith('/testing') ? '/testing' : '/';

  return (
    <BrowserRouter basename={basename}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage onOpenGuideModal={() => setGuideModalOpen(true)} />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/benih" element={<BenihPage />} />
            <Route path="/magang" element={<MagangPage />} />
            <Route path="/konsultasi" element={<KonsultasiPage />} />
            <Route path="/narasumber" element={<NarasumberPage />} />
            <Route path="/pengaduan" element={<PengaduanPage />} />
            <Route path="/kunjungan" element={<KunjunganPage />} />
            <Route path="/informasi-publik" element={<InformasiPublikPage />} />
          </Routes>
        </main>
        <Footer />
      </div>

      {/* Guide Modal */}
      {guideModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '1.5rem',
          }}
          onClick={() => setGuideModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px',
              maxWidth: '640px', width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
              padding: '2rem', position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              animation: 'fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGuideModalOpen(false)}
              style={{
                position: 'absolute', top: '1.2rem', right: '1.2rem',
                backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#64748b', cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: '#e8f5ed', color: '#0d6e38',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={24} />
              </div>
              <div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, color: '#0d6e38',
                  backgroundColor: '#e8f5ed', padding: '0.2rem 0.6rem', borderRadius: '6px',
                }}>Panduan Penggunaan</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  Panduan Layanan Agromodern BRMP DIY
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem', color: '#334155' }}>
              {[
                {
                  num: '1', title: 'Tracking Layanan Lab & Resi',
                  desc: 'Kunjungi halaman Lacak Layanan, masukkan Nomor SPK atau Kode Lab (contoh: LAB-2026-001). Pantau 5 tahap status pengujian hingga laporan selesai.',
                },
                {
                  num: '2', title: 'Informasi & Pemesanan Benih',
                  desc: 'Buka halaman Benih Unggulan, pilih varietas yang tersedia, cek stok real-time dan spesifikasi mutu, lalu terhubung langsung via WhatsApp.',
                },
                {
                  num: '3', title: 'Konsultasi, Pengaduan & Permohonan Layanan',
                  desc: 'Akses menu Konsultasi Ahli, Pengaduan, Magang, atau Narasumber untuk mengajukan permohonan secara online.',
                },
              ].map((item) => (
                <div key={item.num} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.8rem' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800,
                  }}>{item.num}</div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0d6e38', marginBottom: '0.3rem' }}>{item.title}</h4>
                    <p style={{ color: '#64748b', lineHeight: 1.5, fontSize: '0.85rem' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setGuideModalOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                  color: '#ffffff', padding: '0.75rem 1.6rem',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
