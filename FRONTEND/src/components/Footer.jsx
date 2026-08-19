import React from 'react';
import { MapPin, Mail, Phone, Clock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=BRMP+DIY+Jl.+Stadion+Maguwoharjo+No+22+Wedomartani+Sleman';

  return (
    <footer
      style={{
        backgroundColor: '#0d6e38',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Top Main Section */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3.5rem 1.5rem 3rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}
        className="footer-grid"
      >
        {/* Left Column: Lokasi Kami */}
        <div>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '1.2rem',
              letterSpacing: '-0.01em',
            }}
          >
            Lokasi Kami
          </h3>

          {/* Map Container Card matching Image 2 */}
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#e2e8f0',
              aspectRatio: '16/9',
              maxHeight: '280px',
            }}
          >
            {/* Open in Maps Floating Badge */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 10,
                backgroundColor: '#ffffff',
                color: '#2563eb',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                textDecoration: 'none',
              }}
            >
              <span>Open in Maps</span>
              <ExternalLink size={14} />
            </a>

            {/* Google Maps Embed iframe */}
            <iframe
              title="Lokasi BRMP DIY"
              src="https://maps.google.com/maps?q=Stadion%20Maguwoharjo%20Sleman%20Yogyakarta&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right Column: Hubungi Kami matching image 2 exactly */}
        <div>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '1.2rem',
              letterSpacing: '-0.01em',
            }}
          >
            Hubungi Kami
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              color: '#ffffff',
            }}
          >
            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
              <MapPin size={22} color="#ffffff" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 800, marginBottom: '0.2rem' }}>
                  BALAI PENERAPAN MODERNISASI PERTANIAN YOGYAKARTA
                </strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Jl. Stadion Maguwoharjo No 22, Wedomartani, Ngemplak, Sleman, Daerah Istimewa Yogyakarta (Kode Pos 55584)
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Mail size={20} color="#ffffff" style={{ flexShrink: 0 }} />
              <a
                href="mailto:bsip.yogyakarta@pertanian.go.id"
                style={{ color: '#ffffff', textDecoration: 'underline' }}
              >
                bsip.yogyakarta@pertanian.go.id
              </a>
            </div>

            {/* Telephone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Phone size={20} color="#ffffff" style={{ flexShrink: 0 }} />
              <span>(0274) 884 662</span>
            </div>

            {/* Working Hours */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
              <Clock size={20} color="#ffffff" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Senin - Kamis, 07.30 - 16.00</div>
                <div style={{ fontWeight: 600 }}>Jumat, 07.30 - 16.30</div>
              </div>
            </div>

            {/* Social Media Icons (Facebook, Instagram, WhatsApp) matching Image 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0d6e38';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0d6e38';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0d6e38';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bright Yellow Copyright Bar matching image 2 */}
      <div
        style={{
          backgroundColor: '#ffc107',
          color: '#ffffff',
          padding: '1.1rem 1.5rem',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          textShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        © 2025 BRMP D.I. YOGYAKARTA. All rights reserved.
      </div>

      <style>{`
        @media (max-width: 850px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
