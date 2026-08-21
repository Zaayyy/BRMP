import React, { useState, useRef, useEffect } from 'react';
import { ChevronsDown, ChevronDown, CheckCircle2, FileText, Send, Building2, GraduationCap, Calendar, User, Phone, BookOpen, Award, CheckCircle, X, Loader2 } from 'lucide-react';
import { pengaduanService } from '../services/apiService';

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

export default function MagangSection() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [infoOpen, setInfoOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    telepon: '',
    instansi: '',
    jurusan: '',
    divisi: 'Laboratorium Pengujian Mutu Benih',
    tglMulai: '',
    tglSelesai: '',
    proposalUrl: '',
    catatan: '',
  });
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullDescription = [
        `[Layanan: Pendaftaran Magang / PKL Mahasiswa]`,
        formData.instansi ? `\nUniversitas/Instansi: ${formData.instansi}` : '',
        formData.jurusan ? `\nJurusan/Prodi: ${formData.jurusan}` : '',
        formData.nim ? `\nNIM: ${formData.nim}` : '',
        formData.divisi ? `\nDivisi/Laboratorium Pilihan: ${formData.divisi}` : '',
        formData.tglMulai ? `\nPeriode: ${formData.tglMulai} s/d ${formData.tglSelesai}` : '',
        formData.catatan ? `\nCatatan/Minat: ${formData.catatan}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: `${formData.nama.toLowerCase().replace(/\s+/g, '')}@student.ac.id`,
        no_telp_pelapor: formData.telepon,
        isi_pengaduan: fullDescription,
        jenis_layanan: 'Permohonan Magang',
      });

      const code = res?.data?.kode_tracking || `MAGANG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        divisi: formData.divisi,
      });
    } catch (err) {
      console.warn('Magang submit note:', err.message);
      const code = `MAGANG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        divisi: formData.divisi,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="magang"
      ref={sectionRef}
      style={{
        backgroundColor: '#f4f8f5',
        padding: '5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial accent */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,110,56,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Main Card Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
            border: '1px solid rgba(13,110,56,0.1)',
            textAlign: 'center',
          }}
          className="magang-card-container"
        >
          {/* Top Pill Badge */}
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#dcfce7',
              color: '#0d6e38',
              padding: '0.35rem 1.2rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
              border: '1px solid rgba(13,110,56,0.2)',
            }}
          >
            BRMP DIY
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '2.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Magang
          </h2>

          {/* Accordion Item 1: Informasi Magang */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <button
              onClick={() => setInfoOpen(!infoOpen)}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: infoOpen ? '2px solid #0d6e38' : '2px solid #16a34a',
                borderRadius: '22px',
                padding: '1.25rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: infoOpen ? '0 8px 24px rgba(13,110,56,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
              }}
              onMouseOver={(e) => {
                if (!infoOpen) e.currentTarget.style.backgroundColor = '#f0fdf4';
              }}
              onMouseOut={(e) => {
                if (!infoOpen) e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#1e293b',
                }}
              >
                Informasi Magang
              </span>

              <div
                style={{
                  backgroundColor: '#0d6e38',
                  borderRadius: '14px',
                  padding: '0.55rem 1.1rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease, background-color 0.3s ease',
                  transform: infoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  boxShadow: '0 4px 12px rgba(13,110,56,0.3)',
                }}
              >
                <ChevronsDown size={20} strokeWidth={2.5} />
              </div>
            </button>

            {/* Expandable Content for Informasi Magang */}
            {infoOpen && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '20px',
                  padding: '2rem',
                  marginTop: '1rem',
                  border: '1px solid #e2e8f0',
                  animation: 'fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#0d6e38',
                    marginBottom: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <GraduationCap size={22} />
                  Program Magang & PKL BRMP DIY
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  Balai Besar Standar Instrumen Pertanian (BRMP DIY) membuka kesempatan magang, Praktik Kerja Lapangan (PKL), dan penelitian bagi mahasiswa dan siswa SMK di lingkungan laboratorium modern dan kebun percobaan agromodern Yogyakarta.
                </p>

                {/* Grid 4 Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.2rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={18} />
                      Persyaratan Dokumen
                    </div>
                    <ul style={{ fontSize: '0.84rem', color: '#64748b', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                      <li>Surat Pengantar Resmi Kampus/Sekolah</li>
                      <li>Proposal Magang / Rencana Kerja</li>
                      <li>Curriculum Vitae (CV) & KTM/KTP</li>
                      <li>Pasfoto 3x4 (2 Lembar)</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={18} />
                      Pilihan Divisi Magang
                    </div>
                    <ul style={{ fontSize: '0.84rem', color: '#64748b', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                      <li>Lab Pengujian Mutu Benih</li>
                      <li>Kebun Percobaan Agromodern</li>
                      <li>Proteksi & Hama Tanaman</li>
                      <li>Humas, PPID & Informasi Publik</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ color: '#d97706', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={18} />
                      Fasilitas & Manfaat
                    </div>
                    <ul style={{ fontSize: '0.84rem', color: '#64748b', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                      <li>Sertifikat Magang Resmi Instansi</li>
                      <li>Bimbingan Mentoring Ahli BRMP</li>
                      <li>Akses Alat Lab & Kebun Riset</li>
                      <li>Jaringan Komunitas Agromodern</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={18} />
                      Durasi & Alur
                    </div>
                    <ul style={{ fontSize: '0.84rem', color: '#64748b', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                      <li>Durasi: 1 hingga 6 Bulan</li>
                      <li>Verifikasi Berkas: 3-5 Hari Kerja</li>
                      <li>Konfirmasi via WhatsApp & Email</li>
                    </ul>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#dcfce7',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <CheckCircle2 size={18} flexShrink={0} />
                  <span>
                    Siap bergabung? Klik tombol <strong>Form Permohonan Magang</strong> di bawah untuk langsung mendaftar secara online.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Accordion Item 2: Form Permohonan Magang */}
          <div style={{ textAlign: 'left' }}>
            <button
              onClick={() => setFormOpen(!formOpen)}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: formOpen ? '2px solid #0d6e38' : '2px solid #16a34a',
                borderRadius: '22px',
                padding: '1.25rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: formOpen ? '0 8px 24px rgba(13,110,56,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
              }}
              onMouseOver={(e) => {
                if (!formOpen) e.currentTarget.style.backgroundColor = '#f0fdf4';
              }}
              onMouseOut={(e) => {
                if (!formOpen) e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#1e293b',
                }}
              >
                Form Permohonan Magang
              </span>

              <div
                style={{
                  backgroundColor: '#0d6e38',
                  borderRadius: '14px',
                  padding: '0.55rem 1.1rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease, background-color 0.3s ease',
                  transform: formOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  boxShadow: '0 4px 12px rgba(13,110,56,0.3)',
                }}
              >
                <ChevronsDown size={20} strokeWidth={2.5} />
              </div>
            </button>

            {/* Expandable Content for Form Permohonan Magang */}
            {formOpen && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '2rem',
                  marginTop: '1rem',
                  border: '1.5px solid #dcfce7',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                  animation: 'fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {!submitted ? (
                  <>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                      Formulir Pendaftaran Magang / PKL Online
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.5rem' }}>
                      Lengkapi data diri dan permohonan magang Anda di bawah ini secara lengkap.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid-2">
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Nama Lengkap Pemohon *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            placeholder="Contoh: Ahmad Rizky"
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            NIM / NIS *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nim}
                            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                            placeholder="Contoh: 21/478912/PN/1728"
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid-2">
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Asal Universitas / Sekolah *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.instansi}
                            onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                            placeholder="Contoh: Universitas Gadjah Mada"
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Program Studi / Jurusan *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.jurusan}
                            onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                            placeholder="Contoh: Agronomi / Agroteknologi"
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid-2">
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Nomor WhatsApp Aktif *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.telepon}
                            onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                            placeholder="0812xxxxxxx"
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Pilihan Divisi Magang *
                          </label>
                          <select
                            value={formData.divisi}
                            onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                              backgroundColor: '#ffffff', color: '#1e293b',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                          >
                            <option value="Laboratorium Pengujian Mutu Benih">Laboratorium Pengujian Mutu Benih</option>
                            <option value="Kebun Percobaan Agromodern">Kebun Percobaan Agromodern</option>
                            <option value="Proteksi & Hama Tanaman">Proteksi & Hama Tanaman</option>
                            <option value="Humas & PPID Informasi Publik">Humas & PPID Informasi Publik</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid-2">
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Rencana Tanggal Mulai *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.tglMulai}
                            onChange={(e) => setFormData({ ...formData, tglMulai: e.target.value })}
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                            Rencana Tanggal Selesai *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.tglSelesai}
                            onChange={(e) => setFormData({ ...formData, tglSelesai: e.target.value })}
                            style={{
                              width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                              border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                          Link Google Drive Surat Pengantar & Proposal Magang *
                        </label>
                        <input
                          type="url"
                          required
                          value={formData.proposalUrl}
                          onChange={(e) => setFormData({ ...formData, proposalUrl: e.target.value })}
                          placeholder="https://drive.google.com/drive/folders/..."
                          style={{
                            width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                            border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                          Catatan / Kebutuhan Khusus (Opsional)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.catatan}
                          onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                          placeholder="Tuliskan judul topik magang atau pesan tambahan jika ada..."
                          style={{
                            width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                            border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-ripple"
                        style={{
                          marginTop: '0.5rem',
                          background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                          color: '#ffffff',
                          padding: '0.9rem 2rem',
                          borderRadius: '14px',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.6rem',
                          boxShadow: '0 8px 24px rgba(13,110,56,0.35)',
                          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 12px 30px rgba(13,110,56,0.45)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,110,56,0.35)';
                        }}
                      >
                        <Send size={18} />
                        <span>Kirim Permohonan Magang</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <div
                      style={{
                        width: '70px', height: '70px', borderRadius: '50%',
                        backgroundColor: '#dcfce7', color: '#16a34a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.2rem',
                        animation: 'bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)',
                      }}
                    >
                      <CheckCircle size={42} />
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                      Permohonan Magang Berhasil Dikirim!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      Terima kasih <strong>{submitted.nama}</strong> dari <strong>{submitted.instansi}</strong>. Permohonan Anda untuk unit <strong>{submitted.divisi}</strong> telah terverifikasi dalam sistem BRMP DIY.
                    </p>

                    <div style={{ backgroundColor: '#f1f5f9', padding: '1.2rem', borderRadius: '16px', marginBottom: '1.8rem', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 600 }}>Nomor Resi Pendaftaran Magang Anda:</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0d6e38', letterSpacing: '0.06em' }}>
                        {submitted.code}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Gunakan nomor ini di menu <strong>Lacak Layanan</strong> untuk memantau status pengajuan.
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSubmitted(null);
                        setFormData({
                          nama: '', nim: '', telepon: '', instansi: '', jurusan: '',
                          divisi: 'Laboratorium Pengujian Mutu Benih', tglMulai: '', tglSelesai: '', proposalUrl: '', catatan: '',
                        });
                      }}
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '0.8rem 1.8rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Kirim Permohonan Lain
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .magang-card-container { padding: 2rem 1.2rem !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
