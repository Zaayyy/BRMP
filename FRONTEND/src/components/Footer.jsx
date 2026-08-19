import React from 'react';
import { MapPin, Mail, Phone, Clock, ExternalLink, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=BRMP+DIY+Jl.+Stadion+Maguwoharjo+No+22+Wedomartani+Sleman';

  const quickLinks = [
    { label: 'Beranda & Pengenalan', to: '/' },
    { label: 'Lacak Status Layanan', to: '/track' },
    { label: 'Katalog Benih Bersertifikat', to: '/benih' },
    { label: 'Pendaftaran Magang & Riset', to: '/magang' },
    { label: 'Konsultasi Teknis & Ahli', to: '/konsultasi' },
    { label: 'Permohonan Narasumber', to: '/narasumber' },
    { label: 'Layanan Pengaduan Masyarakat', to: '/pengaduan' },
    { label: 'Kunjungan Edukasi & Lapang', to: '/kunjungan' },
    { label: 'Pejabat Pengelola Informasi (PPID)', to: '/informasi-publik' },
  ];

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #052e16 0%, #031c0e 100%)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Pattern / Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '-80px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Accent Line */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #059669 0%, #10b981 30%, #f59e0b 70%, #10b981 100%)',
          opacity: 0.9,
        }}
      />

      {/* Main Container */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 1.5rem 3rem 1.5rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.9fr 1.1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
          className="footer-grid-3"
        >
          {/* Column 1: Info Balai & Map */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.2rem' }}>
              <img
                src="/images/brmp_emblem.png"
                alt="Logo BRMP DIY"
                style={{
                  height: '46px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                  BRMP D.I. YOGYAKARTA
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Balai Besar Modernisasi Pertanian
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Mewujudkan kedaulatan pangan dan modernisasi pertanian berbasis standar instrumen presisi di wilayah Daerah Istimewa Yogyakarta.
            </p>

            {/* Map Preview Card */}
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#0f172a',
                height: '190px',
              }}
            >
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  zIndex: 10,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  color: '#0d6e38',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  textDecoration: 'none',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span>Buka di Google Maps</span>
                <ExternalLink size={12} />
              </a>

              <iframe
                title="Lokasi BRMP DIY"
                src="https://maps.google.com/maps?q=Stadion%20Maguwoharjo%20Sleman%20Yogyakarta&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, opacity: 0.9 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Column 2: Tautan Cepat Layanan */}
          <div>
            <h4
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#10b981' }} />
              Akses Layanan Publik
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {quickLinks.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  style={{
                    fontSize: '0.84rem',
                    color: '#cbd5e1',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#34d399';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <ArrowRight size={13} color="#10b981" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Hubungi & Kontak Kami */}
          <div>
            <h4
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
              Hubungi Kami
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem', color: '#cbd5e1' }}>
              {/* Alamat */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                }}>
                  <MapPin size={16} color="#34d399" />
                </div>
                <div style={{ lineHeight: 1.55 }}>
                  <strong style={{ display: 'block', color: '#f8fafc', fontWeight: 700, marginBottom: '0.15rem' }}>
                    Kantor Utama BRMP DIY
                  </strong>
                  <span>Jl. Stadion Maguwoharjo No 22, Wedomartani, Ngemplak, Sleman, D.I. Yogyakarta 55584</span>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Mail size={16} color="#34d399" />
                </div>
                <a
                  href="mailto:bsip.yogyakarta@pertanian.go.id"
                  style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#34d399')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                >
                  bsip.yogyakarta@pertanian.go.id
                </a>
              </div>

              {/* Telepon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Phone size={16} color="#34d399" />
                </div>
                <span>(0274) 884 662</span>
              </div>

              {/* Jam Layanan */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                }}>
                  <Clock size={16} color="#34d399" />
                </div>
                <div style={{ lineHeight: 1.5 }}>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>Senin – Kamis: 07.30 – 16.00 WIB</div>
                  <div style={{ color: '#94a3b8' }}>Jumat: 07.30 – 16.30 WIB</div>
                </div>
              </div>

              {/* Social Media Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', transition: 'all 0.25s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1877F2';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#1877F2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', transition: 'all 0.25s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/6285878438548"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', transition: 'all 0.25s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D366';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#25D366';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: '1.25rem 1.5rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.8rem',
            fontSize: '0.82rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>© {new Date().getFullYear()}</span>
            <strong style={{ color: '#f8fafc' }}>Balai Besar Modernisasi Pertanian (BRMP) D.I. Yogyakarta</strong>
            <span>— Hak Cipta Dilindungi.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600 }}>
              <ShieldCheck size={15} /> Portal Resmi Pemerintah RI
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .footer-grid-3 {
            grid-template-columns: 1fr 1fr !important;
            gap: 2.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid-3 {
            grid-template-columns: 1fr !important;
            gap: 2.2rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
