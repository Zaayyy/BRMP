import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, ChevronRight } from 'lucide-react';
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
      id: 'konsultasi', label: 'Layanan Konsultasi', type: 'route', to: '/konsultasi',
      isActive: () => location.pathname === '/konsultasi',
    },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        backgroundColor: isScrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isScrolled
          ? '0 4px 30px rgba(13,110,56,0.08), 0 1px 0 rgba(13,110,56,0.06)'
          : '0 1px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        borderBottom: isScrolled ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(0,0,0,0.03)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
      }}
    >
      {/* Animated gradient top accent — thin & elegant */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #059669, #10b981, #fbbf24, #10b981, #059669)',
        backgroundSize: '300% 100%',
        animation: 'gradientShift 4s ease infinite',
      }} />

      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0.8rem 1.5rem',
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
              height: '44px', width: 'auto', objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', lineHeight: 1.1,
              background: 'linear-gradient(135deg, #0d6e38, #059669)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              BRMP DIY
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              AGRO MODERN
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="desktop-nav"
          style={{ display: 'none', alignItems: 'center', gap: '0.15rem' }}
        >
          {navLinks.map((link, i) => {
            const isActive = link.isActive();
            const commonStyle = {
              fontSize: '0.86rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0d6e38' : '#475569',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
              transition: 'all 0.25s ease',
              animation: `fadeInUp 0.5s ${i * 0.06}s both`,
              textDecoration: 'none',
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
            };
            const hoverIn = (e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.06)';
                e.currentTarget.style.color = '#059669';
              }
            };
            const hoverOut = (e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
              }
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
                      transform: 'translateX(-50%)', width: '16px', height: '2.5px',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, #10b981, #0d6e38)',
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
                style={{ ...commonStyle, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent' }}
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
            href="https://wa.me/6285878438548?text=Halo%20BRMP%20DIY,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20pertanian%20dan%20benih"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ripple"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#ffffff', padding: '0.6rem 1.25rem', borderRadius: '9999px',
              fontSize: '0.85rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              animation: 'fadeInUp 0.5s 0.3s both',
              textDecoration: 'none',
              position: 'relative',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,211,102,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.3)';
            }}
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="mobile-toggle"
            style={{
              display: 'flex', padding: '0.5rem', borderRadius: '10px',
              backgroundColor: '#f1f5f9', color: '#1f2937',
              transition: 'all 0.2s ease', border: 'none', cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
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
          backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9',
          padding: mobileMenuOpen ? '1rem 1.5rem 1.5rem' : '0 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
        }}>
          {navLinks.map((link) => {
            const isActive = link.isActive();
            const style = {
              fontSize: '0.95rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0d6e38' : '#475569',
              padding: '0.7rem 1rem', borderRadius: '12px',
              backgroundColor: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
              transition: 'all 0.2s ease', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            };
            if (link.type === 'route') {
              return (
                <Link key={link.id} to={link.to} style={style} onClick={() => setMobileMenuOpen(false)}>
                  <span>{link.label}</span>
                  <ChevronRight size={16} color={isActive ? '#0d6e38' : '#cbd5e1'} />
                </Link>
              );
            }
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.hash)}
                style={{ ...style, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent', textAlign: 'left' }}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} color={isActive ? '#0d6e38' : '#cbd5e1'} />
              </button>
            );
          })}
          <a
            href="https://wa.me/6285878438548?text=Halo%20BRMP%20DIY,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20pertanian%20dan%20benih"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#ffffff',
              padding: '0.75rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none',
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
