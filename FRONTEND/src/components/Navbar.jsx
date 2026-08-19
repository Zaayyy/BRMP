import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (hash) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + hash);
      return;
    }
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    {
      id: 'beranda', label: 'Beranda', type: 'scroll', hash: '#beranda',
      isActive: () => location.pathname === '/',
    },
    {
      id: 'track', label: 'Lacak Layanan', type: 'route', to: '/track',
      isActive: () => location.pathname === '/track',
    },
    {
      id: 'benih', label: 'Info Benih', type: 'route', to: '/benih',
      isActive: () => location.pathname === '/benih',
    },
    {
      id: 'magang', label: 'Magang', type: 'route', to: '/magang',
      isActive: () => location.pathname === '/magang',
    },
    {
      id: 'konsultasi', label: 'Konsultasi Ahli', type: 'route', to: '/konsultasi',
      isActive: () => location.pathname === '/konsultasi',
    },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isScrolled
          ? '0 4px 30px rgba(13,110,56,0.1), 0 1px 0 rgba(13,110,56,0.08)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        borderBottom: isScrolled ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(0,0,0,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
      }}
    >
      {/* Animated gradient top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, #0d6e38, #10b981, #fbbf24, #10b981, #0d6e38)',
        backgroundSize: '300% 100%',
        animation: 'gradientShift 4s ease infinite',
      }} />

      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none',
            transition: 'transform 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <img
            src="/images/brmp_emblem.png"
            alt="BRMP DIY Emblem"
            style={{
              height: '48px', width: 'auto', objectFit: 'contain',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.14))',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0d6e38', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              BRMP DIY
            </span>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AGRO MODERN
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="desktop-nav"
          style={{ display: 'none', alignItems: 'center', gap: '0.2rem' }}
        >
          {navLinks.map((link, i) => {
            const isActive = link.isActive();
            const commonStyle = {
              fontSize: '0.88rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0d6e38' : '#374151',
              padding: '0.5rem 0.8rem',
              borderRadius: '10px',
              backgroundColor: isActive ? 'rgba(13,110,56,0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              animation: `fadeInUp 0.5s ${i * 0.06}s both`,
              textDecoration: 'none',
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
            };
            const hoverIn = (e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(13,110,56,0.06)';
              e.currentTarget.style.color = '#0d6e38';
            };
            const hoverOut = (e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isActive ? '#0d6e38' : '#374151';
            };

            if (link.type === 'route') {
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  style={commonStyle}
                  onMouseOver={hoverIn}
                  onMouseOut={hoverOut}
                >
                  {link.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute', bottom: '4px', left: '50%',
                      transform: 'translateX(-50%)', width: '4px', height: '4px',
                      borderRadius: '50%', backgroundColor: '#0d6e38',
                      animation: 'bounceIn 0.4s ease',
                    }} />
                  )}
                </Link>
              );
            }
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.hash)}
                style={{ ...commonStyle, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(13,110,56,0.08)' : 'transparent' }}
                onMouseOver={hoverIn}
                onMouseOut={hoverOut}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* CTA WhatsApp + Mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="https://wa.me/6281234567890?text=Halo%20BRMP%20DIY,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20pertanian%20dan%20benih"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ripple"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#ffffff', padding: '0.65rem 1.3rem', borderRadius: '9999px',
              fontSize: '0.88rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              animation: 'fadeInUp 0.5s 0.3s both',
              textDecoration: 'none',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,211,102,0.45)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.35)';
            }}
          >
            <MessageCircle size={17} />
            <span>Hubungi WhatsApp</span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="mobile-toggle"
            style={{
              display: 'flex', padding: '0.5rem', borderRadius: '10px',
              backgroundColor: '#f3f4f6', color: '#1f2937',
              transition: 'all 0.2s ease', border: 'none', cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            <div style={{ transition: 'transform 0.3s ease', transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div style={{
        maxHeight: mobileMenuOpen ? '420px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{
          backgroundColor: '#ffffff', borderTop: '1px solid #f3f4f6',
          padding: mobileMenuOpen ? '1rem 1.5rem 1.5rem' : '0 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {navLinks.map((link) => {
            const isActive = link.isActive();
            const style = {
              fontSize: '1rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0d6e38' : '#374151',
              padding: '0.7rem 1rem', borderRadius: '10px',
              backgroundColor: isActive ? 'rgba(13,110,56,0.08)' : 'transparent',
              transition: 'all 0.2s ease', textDecoration: 'none',
              display: 'block',
            };
            if (link.type === 'route') {
              return <Link key={link.id} to={link.to} style={style} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>;
            }
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.hash)}
                style={{ ...style, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(13,110,56,0.08)' : 'transparent', textAlign: 'left' }}
              >
                {link.label}
              </button>
            );
          })}
          <a
            href="https://wa.me/6281234567890?text=Halo%20BRMP%20DIY,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20pertanian%20dan%20benih"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#ffffff',
              padding: '0.75rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none',
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageCircle size={18} /> Hubungi WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
