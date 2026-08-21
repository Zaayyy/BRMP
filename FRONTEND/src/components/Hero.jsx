import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { benihService } from '../services/apiService';

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

// SVG Plant component – animated growing stem + swaying leaves
function PlantSVG({ x, variant = 0, scale = 1, delay = 0 }) {
  const colors = [
    { stem: '#10b981', leaf: '#34d399', leafDark: '#059669', flower: '#fbbf24' },
    { stem: '#0d6e38', leaf: '#22c55e', leafDark: '#16a34a', flower: '#f472b6' },
    { stem: '#059669', leaf: '#4ade80', leafDark: '#15803d', flower: '#fb923c' },
  ];
  const c = colors[variant % colors.length];

  return (
    <svg
      viewBox="0 0 80 160"
      width={60 * scale}
      height={120 * scale}z
      style={{
        position: 'absolute',
        bottom: 0,
        left: x,
        transformOrigin: 'bottom center',
        animation: `plantSway ${3 + variant * 0.7}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
      }}
    >
      {/* Main stem */}
      <path
        d="M40,155 Q38,120 40,90 Q42,60 38,30"
        stroke={c.stem}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: 160,
          strokeDashoffset: 160,
          animation: `growStem 1.8s ${delay}s cubic-bezier(0.22,1,0.36,1) forwards`,
        }}
      />

      {/* Left leaf 1 */}
      <path
        d="M39,105 Q20,95 14,75 Q30,80 38,95"
        fill={c.leaf}
        opacity="0.9"
        style={{
          transformOrigin: '39px 105px',
          animation: `leafBloom 0.6s ${delay + 0.6}s cubic-bezier(0.34,1.56,0.64,1) both`,
        }}
      />

      {/* Right leaf 1 */}
      <path
        d="M41,100 Q60,88 66,68 Q50,75 42,92"
        fill={c.leafDark}
        opacity="0.9"
        style={{
          transformOrigin: '41px 100px',
          animation: `leafBloom 0.6s ${delay + 0.75}s cubic-bezier(0.34,1.56,0.64,1) both`,
        }}
      />

      {/* Left leaf 2 */}
      <path
        d="M39,75 Q18,62 12,44 Q30,52 39,68"
        fill={c.leafDark}
        opacity="0.85"
        style={{
          transformOrigin: '39px 75px',
          animation: `leafBloom 0.6s ${delay + 0.95}s cubic-bezier(0.34,1.56,0.64,1) both`,
        }}
      />

      {/* Right leaf 2 */}
      <path
        d="M41,68 Q62,56 68,36 Q50,46 41,62"
        fill={c.leaf}
        opacity="0.85"
        style={{
          transformOrigin: '41px 68px',
          animation: `leafBloom 0.6s ${delay + 1.1}s cubic-bezier(0.34,1.56,0.64,1) both`,
        }}
      />

      {/* Flower top */}
      <g
        style={{
          transformOrigin: '38px 28px',
          animation: `flowerBloom 0.5s ${delay + 1.4}s cubic-bezier(0.34,1.56,0.64,1) both`,
        }}
      >
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((deg, idx) => (
          <ellipse
            key={idx}
            cx={38 + Math.cos((deg * Math.PI) / 180) * 8}
            cy={28 + Math.sin((deg * Math.PI) / 180) * 8}
            rx="5"
            ry="3.5"
            fill={c.flower}
            opacity="0.9"
            transform={`rotate(${deg} ${38 + Math.cos((deg * Math.PI) / 180) * 8} ${28 + Math.sin((deg * Math.PI) / 180) * 8})`}
          />
        ))}
        {/* Center */}
        <circle cx="38" cy="28" r="5.5" fill="#fef08a" />
        <circle cx="38" cy="28" r="3" fill="#fbbf24" />
      </g>
    </svg>
  );
}

// Grass blade
function GrassBlade({ x, height, delay, color }) {
  return (
    <svg
      viewBox="0 0 20 60"
      width={14}
      height={height}
      style={{
        position: 'absolute',
        bottom: 0,
        left: x,
        transformOrigin: 'bottom center',
        animation: `grassSway ${2 + Math.random() * 1.5}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <path
        d="M10,58 Q8,40 9,20 Q10,5 11,0"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: 70,
          strokeDashoffset: 70,
          animation: `growStem 1.2s ${delay}s ease-out forwards`,
        }}
      />
    </svg>
  );
}

// Floating leaf particle
function FloatingLeaf({ style, variant }) {
  const emojis = ['🌿', '🍃', '🌱', '✨'];
  return (
    <div
      style={{
        position: 'absolute',
        fontSize: `${12 + variant * 4}px`,
        animation: `floatLeaf ${8 + variant * 3}s ease-in-out infinite`,
        animationDelay: `${variant * 1.5}s`,
        opacity: 0.7,
        zIndex: 2,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {emojis[variant % emojis.length]}
    </div>
  );
}

export default function Hero({ onOpenBenihModal, onOpenGuideModal }) {
  const [loaded, setLoaded] = useState(false);
  const [benihCount, setBenihCount] = useState(3);

  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: Math.random() * 14 + 4,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 14 + 10}s`,
    }))
  ).current;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);

    // Fetch live benih count from database
    benihService
      .getAllPublic()
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setBenihCount(res.data.length);
        }
      })
      .catch((err) => console.warn('Hero live stats:', err.message));

    return () => clearTimeout(t);
  }, []);

  // Plant positions – spread across bottom of hero
  const plants = [
    { x: '1%',  variant: 0, scale: 1.3, delay: 0.2 },
    { x: '7%',  variant: 1, scale: 0.9, delay: 0.5 },
    { x: '13%', variant: 2, scale: 1.1, delay: 0.1 },
    { x: '19%', variant: 0, scale: 0.8, delay: 0.7 },
    { x: '75%', variant: 1, scale: 0.9, delay: 0.4 },
    { x: '81%', variant: 2, scale: 1.2, delay: 0.0 },
    { x: '87%', variant: 0, scale: 0.85, delay: 0.6 },
    { x: '93%', variant: 1, scale: 1.0, delay: 0.3 },
  ];

  // Grass blades – densely packed bottom edges
  const grassBlades = Array.from({ length: 60 }, (_, i) => ({
    x: `${(i / 60) * 100}%`,
    height: 25 + Math.random() * 25,
    delay: Math.random() * 2,
    color: ['#22c55e', '#16a34a', '#4ade80', '#15803d', '#10b981'][Math.floor(Math.random() * 5)],
  }));

  // Floating leaves
  const floatingLeaves = [
    { style: { top: '15%', left: '25%' }, variant: 0 },
    { style: { top: '30%', right: '28%' }, variant: 1 },
    { style: { top: '60%', left: '60%' }, variant: 2 },
    { style: { top: '20%', right: '40%' }, variant: 3 },
    { style: { top: '50%', left: '18%' }, variant: 1 },
    { style: { top: '75%', right: '18%' }, variant: 0 },
  ];

  return (
    <section
      id="beranda"
      style={{
        position: 'relative',
        minHeight: '92vh',
        paddingTop: '90px',
        paddingBottom: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('/images/hero_background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Multi-layer gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(5,56,27,0.94) 0%, rgba(13,110,56,0.80) 50%, rgba(4,47,68,0.88) 100%)',
        zIndex: 1,
      }} />

      {/* Animated dot-grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      {/* Glowing orbs */}
      <div style={{
        position: 'absolute', top: '15%', right: '12%', zIndex: 2,
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'pulseGlow 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '8%', zIndex: 2,
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)',
        filter: 'blur(50px)',
        animation: 'pulseGlow 8s 2s ease-in-out infinite',
      }} />

      {/* ---- PLANT ANIMATIONS LAYER ---- */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Grass blades strip along the bottom */}
        <div style={{ position: 'absolute', bottom: 68, left: 0, right: 0, height: 60 }}>
          {grassBlades.map((g, i) => (
            <GrassBlade key={i} x={g.x} height={g.height} delay={g.delay} color={g.color} />
          ))}
        </div>

        {/* Bigger plants */}
        <div style={{ position: 'absolute', bottom: 68, left: 0, right: 0 }}>
          {plants.map((p, i) => (
            <PlantSVG key={i} x={p.x} variant={p.variant} scale={p.scale} delay={p.delay} />
          ))}
        </div>

        {/* Ground strip - dark soil strip */}
        <div style={{
          position: 'absolute', bottom: 68, left: 0, right: 0, height: '6px',
          background: 'linear-gradient(90deg, rgba(5,46,22,0.9), rgba(13,80,42,0.7), rgba(5,46,22,0.9))',
          borderRadius: '2px 2px 0 0',
        }} />

        {/* Floating leaves drifting */}
        {floatingLeaves.map((leaf, i) => (
          <FloatingLeaf key={i} style={leaf.style} variant={leaf.variant} />
        ))}

        {/* Sparkle twinkles scattered */}
        {[
          { top: '12%', left: '30%' }, { top: '40%', left: '8%' },
          { top: '25%', right: '20%' }, { top: '55%', right: '8%' },
          { top: '70%', left: '40%' },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', width: '6px', height: '6px',
            borderRadius: '50%', backgroundColor: '#fde047',
            animation: `twinkle ${2 + i * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            boxShadow: '0 0 8px 3px rgba(253,224,71,0.5)',
            ...pos,
          }} />
        ))}
      </div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <Particle key={p.id} style={{
          width: `${p.size}px`, height: `${p.size}px`,
          left: p.left, bottom: '-20px',
          animationDuration: p.duration,
          animationDelay: p.delay,
          zIndex: 2,
        }} />
      ))}

      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '3rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 4,
        }}
        className="hero-grid"
      >
        {/* LEFT: Text Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Badge */}
          <div
            className="glass"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#7dd3fc',
              marginBottom: '1.6rem',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s 0.1s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <Sparkles size={14} color="#38bdf8" style={{ animation: 'spin 4s linear infinite' }} />
            <span>SISTEM INFORMASI TERPADU</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              marginBottom: '1.2rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s 0.2s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            APLIKASI INFORMASI <br />
            TERPADU <br />
            <span className="gradient-text">AGROMODERN</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              fontWeight: 400,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.88)',
              maxWidth: '580px',
              marginBottom: '2.2rem',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(25px)',
              transition: 'all 0.7s 0.32s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            Satu pintu untuk pengelolaan, pemantauan, pengawasan, mutu benih tanaman, dan layanan modernisasi pertanian di Daerah Istimewa Yogyakarta.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s 0.44s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <Link
              to="/benih"
              className="btn-ripple card-shine"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #10b981, #0d6e38)',
                color: '#ffffff',
                padding: '0.9rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(13,110,56,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
                e.currentTarget.style.boxShadow = '0 16px 35px rgba(13,110,56,0.55)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,110,56,0.45), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
            >
              <span>🌾 Katalog Benih</span>
              <ChevronRight size={17} />
            </Link>

            <Link
              to="/track"
              className="glass btn-ripple"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#ffffff',
                padding: '0.9rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              <Search size={18} />
              <span>Lacak Layanan</span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '2.5rem',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(18px)',
              transition: 'all 0.6s 0.58s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {[
              { num: benihCount >= 5 ? `${benihCount}+` : `${benihCount}`, label: 'Komoditas Benih' },
              { num: '3', label: 'Lab Pengujian' },
              { num: '6', label: 'Jenis Layanan' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fde047', lineHeight: 1 }}>{stat.num}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Emblem */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 0.8s 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}
          className="hero-emblem-container"
        >
          {/* Ring 1 (outer rotating) */}
          <div style={{
            position: 'absolute',
            width: 'clamp(310px, 36vw, 420px)',
            height: 'clamp(310px, 36vw, 420px)',
            borderRadius: '50%',
            border: '2px dashed rgba(255,255,255,0.2)',
            animation: 'spin 30s linear infinite',
            zIndex: 1,
          }} />
          {/* Ring 2 counter-rotating */}
          <div style={{
            position: 'absolute',
            width: 'clamp(260px, 30vw, 360px)',
            height: 'clamp(260px, 30vw, 360px)',
            borderRadius: '50%',
            border: '1.5px dashed rgba(251,191,36,0.3)',
            animation: 'spin 20s linear infinite reverse',
            zIndex: 1,
          }} />

          {/* Glow halo */}
          <div style={{
            position: 'absolute',
            width: 'clamp(240px, 28vw, 340px)',
            height: 'clamp(240px, 28vw, 340px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234,179,8,0.4) 0%, transparent 70%)',
            filter: 'blur(30px)',
            zIndex: 1,
            animation: 'pulseGlow 4s ease-in-out infinite',
          }} />

          {/* Emblem Image */}
          <div
            className="animate-float-rotate"
            style={{
              position: 'relative',
              zIndex: 2,
              width: 'clamp(240px, 30vw, 340px)',
            }}
          >
            <img
              src="/images/brmp_emblem.png"
              alt="Logo Resmi BRMP DIY"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(234,179,8,0.4))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '80px' }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
        </svg>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid > div:first-child { align-items: center !important; }
          .hero-emblem-container { margin-top: 2rem; }
        }

        /* Plant stem grows upward */
        @keyframes growStem {
          to { stroke-dashoffset: 0; }
        }

        /* Leaf pops in from transform origin */
        @keyframes leafBloom {
          from { transform: scale(0) rotate(-30deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);  opacity: 1; }
        }

        /* Flower blooms */
        @keyframes flowerBloom {
          from { transform: scale(0) rotate(-90deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }

        /* Whole plant sways in the breeze */
        @keyframes plantSway {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(2.5deg); }
          75%       { transform: rotate(-2.5deg); }
        }

        /* Individual grass blades sway */
        @keyframes grassSway {
          0%, 100% { transform: rotate(0deg); }
          30%       { transform: rotate(4deg); }
          70%       { transform: rotate(-3deg); }
        }

        /* Floating emoji leaves drift */
        @keyframes floatLeaf {
          0%   { transform: translate(0, 0) rotate(0deg);    opacity: 0.6; }
          25%  { transform: translate(10px,-15px) rotate(20deg); opacity: 0.8; }
          50%  { transform: translate(-5px,-8px) rotate(-10deg); opacity: 0.6; }
          75%  { transform: translate(8px,-18px) rotate(15deg);  opacity: 0.8; }
          100% { transform: translate(0, 0) rotate(0deg);    opacity: 0.6; }
        }

        /* Sparkle twinkle */
        @keyframes twinkle {
          0%, 100% { transform: scale(1);   opacity: 0.8; }
          50%       { transform: scale(1.8); opacity: 0.2; }
        }
      `}</style>
    </section>
  );
}
