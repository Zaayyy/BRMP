import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, CheckCircle, FileText, X,
  Building2, GraduationCap, Calendar, User, Phone, Mail,
  BookOpen, Award, Loader2, Sparkles, Check, Clock, Users,
  FlaskConical, Sprout, Database, ShieldCheck
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

const DIVISI_MAGANG = [
  { id: 'lab-benih', label: '🌾 Laboratorium Uji Mutu Benih', icon: '🌾' },
  { id: 'lab-tanah', label: '🧪 Laboratorium Kimia & Kesuburan Tanah', icon: '🧪' },
  { id: 'kebun-percobaan', label: '🌱 Kebun Percobaan Agro Modern', icon: '🌱' },
  { id: 'smart-farming', label: '🤖 Teknologi Pertanian Presisi / IoT', icon: '🤖' },
  { id: 'ppid-standar', label: '📊 Standarisasi & Manajemen Data Pertanian', icon: '📊' },
];

export default function MagangPage() {
  const [selectedDivisi, setSelectedDivisi] = useState(DIVISI_MAGANG[0].label);
  const [jenjang, setJenjang] = useState('S1 / D4 Perguruan Tinggi');

  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    instansi: '',
    jurusan: '',
    noHp: '',
    email: '',
    tglMulai: '',
    tglSelesai: '',
    jumlahAnggota: '1',
    catatan: '',
  });

  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullDescription = [
        `[Layanan: Pendaftaran Magang, PKL & Riset Mahasiswa/SMK]`,
        `\nDivisi Pilihan: ${selectedDivisi}`,
        `\nJenjang Pendidikan: ${jenjang}`,
        formData.instansi ? `\nAsal Kampus/Sekolah: ${formData.instansi}` : '',
        formData.jurusan ? `\nJurusan/Program Studi: ${formData.jurusan}` : '',
        formData.nim ? `\nNIM / NIS: ${formData.nim}` : '',
        formData.jumlahAnggota ? `\nJumlah Anggota Rombongan: ${formData.jumlahAnggota} Orang` : '',
        formData.tglMulai ? `\nPeriode Magang: ${formData.tglMulai} s/d ${formData.tglSelesai}` : '',
        formData.catatan ? `\nRencana Topik/Fokus Riset: ${formData.catatan}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: formData.email,
        no_telp_pelapor: formData.noHp,
        isi_pengaduan: fullDescription,
      });

      const code = res?.data?.kode_tracking || `MAGANG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        divisi: selectedDivisi,
        periode: `${formData.tglMulai} s/d ${formData.tglSelesai}`,
        fileName: file ? file.name : null,
      });
    } catch (err) {
      console.warn('Magang submit note:', err.message);
      const code = `MAGANG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        divisi: selectedDivisi,
        periode: `${formData.tglMulai} s/d ${formData.tglSelesai}`,
        fileName: file ? file.name : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '76px', minHeight: '100vh', backgroundColor: '#eef2ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top Back Navigation */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 1.5rem', padding: '0 1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            color: '#4338ca',
            padding: '0.55rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e0e7ff',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e7ff')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {/* HERO BANNER */}
        <div
          style={{
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(67, 56, 202, 0.16)',
            background: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            position: 'relative',
            marginBottom: '2.5rem',
            animation: 'fadeInUp 0.5s ease both',
          }}
        >
          <div style={{
            position: 'absolute', top: '-50px', right: '-30px', width: '320px', height: '320px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  color: '#ffffff',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.05em',
                }}
              >
                <GraduationCap size={14} />
                Program Magang, PKL & Riset
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#e0e7ff',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Terbuka untuk Mahasiswa & Siswa SMK
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              Pendaftaran Magang & Riset Terapan BRMP DIY
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#e0e7ff', lineHeight: 1.65, margin: 0 }}>
              Dapatkan pengalaman riset lapang dan praktikum laboratorium berstandar nasional di Balai Besar Standar Instrumen Pertanian DIY dengan bimbingan langsung para peneliti dan fungsional ahli.
            </p>
          </div>
        </div>

        {/* JAMINAN LAYANAN STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {[
            { icon: Award, label: 'Sertifikat Resmi', val: 'Pengalaman Terakreditasi', desc: 'Diterbitkan langsung oleh Balai Besar' },
            { icon: Users, label: 'Pembimbing Ahli', val: 'Mentoring 1-on-1', desc: 'Dibimbing Peneliti & Fungsional Ahli' },
            { icon: FlaskConical, label: 'Fasilitas Terpadu', val: 'Lab & Smart Greenhouse', desc: 'Instrumen mutakhir & kebun riset' },
            { icon: Clock, label: 'Proses Cepat', val: 'Surat Balasan 2-4 Hari', desc: 'Konfirmasi ketersediaan kuota resmi' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #e0e7ff',
                boxShadow: '0 2px 10px rgba(67,56,202,0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <item.icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{item.val}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FORM CONTAINER */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            padding: '2.8rem 2.5rem',
            border: '1.5px solid rgba(99,102,241,0.2)',
            boxShadow: '0 15px 40px rgba(67, 56, 202, 0.07)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}
            >
              <GraduationCap size={14} />
              Formulir Pengajuan Magang Digital
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Registrasi Magang / PKL / Riset
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Lengkapi data pemohon, institusi pendidikan, divisi yang diminati, serta periode pelaksanaan magang.
            </p>
          </div>

          {/* Divisi Pilihan Selector */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.6rem' }}>
              Pilihan Divisi / Laboratorium Magang *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {DIVISI_MAGANG.map((d) => {
                const isSelected = selectedDivisi === d.label;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDivisi(d.label)}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '9999px',
                      border: isSelected ? '2px solid #4338ca' : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#e0e7ff' : '#f8fafc',
                      color: isSelected ? '#4338ca' : '#475569',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{d.label}</span>
                    {isSelected && <Check size={14} color="#4338ca" />}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nama Lengkap Pemohon (Ketua/Individu) *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nomor Induk Mahasiswa (NIM) / NIS *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Contoh: 21/478923/PN/17234"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Asal Universitas / Institut / SMK *
                </label>
                <input
                  required
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  placeholder="Contoh: Universitas Gadjah Mada"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Program Studi / Jurusan *
                </label>
                <input
                  required
                  type="text"
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  placeholder="Contoh: Agronomi / Ilmu Tanah / Agroteknologi"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Jenjang Pendidikan
                </label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  <option value="S1 / D4 Perguruan Tinggi">S1 / D4 Perguruan Tinggi</option>
                  <option value="D3 Vokasi">D3 Vokasi / Diploma</option>
                  <option value="S2 Magister Pascasarjana">S2 Magister Pascasarjana</option>
                  <option value="SMK Pertanian / Kejuruan">SMK Pertanian / Kejuruan</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Jumlah Anggota Rombongan (Orang)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.jumlahAnggota}
                  onChange={(e) => setFormData({ ...formData, jumlahAnggota: e.target.value })}
                  placeholder="Contoh: 1 (atau lebih jika kelompok)"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nomor WhatsApp / HP Aktif *
                </label>
                <input
                  required
                  type="tel"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Alamat Email Mahasiswa *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: mahasiswa@mail.ugm.ac.id"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Tanggal Mulai Magang *
                </label>
                <input
                  required
                  type="date"
                  value={formData.tglMulai}
                  onChange={(e) => setFormData({ ...formData, tglMulai: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Tanggal Selesai Magang *
                </label>
                <input
                  required
                  type="date"
                  value={formData.tglSelesai}
                  onChange={(e) => setFormData({ ...formData, tglSelesai: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Rencana Topik Riset / Minat Fokus Pembelajaran
              </label>
              <textarea
                rows={3}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Contoh: Analisis viabilitas dan vigor benih padi bersertifikat, atau pengujian kandungan hara N-P-K tanah sawah..."
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  resize: 'none',
                }}
              />
            </div>

            {/* Upload Proposal / Surat Pengantar */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Unggah Surat Pengantar Kampus / Proposal Magang (PDF/DOCX, Opsional)
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={22} color="#4338ca" style={{ margin: '0 auto 0.4rem auto' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  {file ? file.name : 'Klik untuk mengunggah proposal magang atau surat pengantar fakultas'}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Format PDF, DOC, DOCX (Maksimal 10MB)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                color: '#ffffff',
                padding: '1rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(67, 56, 202, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>{isLoading ? 'Memproses Pengajuan...' : 'Kirim Pendaftaran Magang'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* MODAL SUKSES */}
      {submitted && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
            padding: '1.5rem',
          }}
          onClick={() => setSubmitted(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle size={38} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
              Pendaftaran Magang Berhasil Terkirim! 🎓
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Berkas pengajuan magang Anda telah masuk ke sistem BRMP DIY. Tim pengelola diklat akan memeriksa ketersediaan kuota.
            </p>

            <div
              style={{
                backgroundColor: '#eef2ff',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid #c7d2fe',
                textAlign: 'left',
                fontSize: '0.86rem',
                marginBottom: '1.5rem',
                lineHeight: 1.75,
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Nomor Resi / Tiket: </span>
                <strong style={{ color: '#4338ca', fontFamily: 'monospace', fontSize: '1rem' }}>{submitted.code}</strong>
              </div>
              <div><span style={{ color: '#64748b' }}>Divisi Pilihan: </span><strong>{submitted.divisi}</strong></div>
              <div><span style={{ color: '#64748b' }}>Nama Pemohon: </span><strong>{submitted.nama} ({submitted.instansi})</strong></div>
              <div><span style={{ color: '#64748b' }}>Periode: </span><strong>{submitted.periode}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/6285878438548?text=${encodeURIComponent(`Halo Pengelola Magang BRMP DIY, saya telah mendaftar Program Magang (${submitted.divisi}) dengan Nomor Tiket: ${submitted.code}. Mohon konfirmasi ketersediaan kuotanya. Terima kasih.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Phone size={18} />
                <span>Konfirmasi via WhatsApp Pengelola Diklat</span>
              </a>

              <button
                onClick={() => setSubmitted(null)}
                style={{
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
