import React from 'react';
import MagangSection from '../components/MagangSection';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MagangPage() {
  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', backgroundColor: '#f4f8f5', paddingBottom: '3rem' }}>
      {/* Back button container */}
      <div style={{ maxWidth: '860px', margin: '0 auto 1rem auto', padding: '0 1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            color: '#0d6e38',
            padding: '0.55rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #dcfce7',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#dcfce7';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <MagangSection />
    </div>
  );
}
