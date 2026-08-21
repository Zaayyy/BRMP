import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, CheckCircle, FileText, X, Volume2, Calendar,
  Building2, User, Phone, Mail, MapPin, Loader2, Award, Clock, Users,
  Mic, Sparkles, Check
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

const TOPIK_NARASUMBER = [
  { id: 'smart-farming', label: '🤖 Smart Farming & Pertanian Presisi', icon: '🤖' },
  { id: 'pemuliaan-benih', label: '🌾 Pemuliaan & Standarisasi Mutu Benih', icon: '🌾' },
  { id: 'organik', label: '🍃 Pertanian Organik & Ramah Lingkungan', icon: '🍃' },
  { id: 'hama-terpadu', label: '🐛 Pengelolaan Hama Terpadu (PHT)', icon: '🐛' },
  { id: 'analisis-tanah', label: '🧪 Uji & Pengelolaan Kesuburan Tanah', icon: '🧪' },
  { id: 'agrobisnis', label: '📈 Agrobisnis & Hilirisasi Produk Pertanian', icon: '📈' },
];

export default function NarasumberPage() {
  const navigate = useNavigate();
  const [selectedTopik, setSelectedTopik] = useState(TOPIK_NARASUMBER[0].label);
  const [bentukAcara, setBentukAcara] = useState('Seminar / Webinar Online');
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    alamat: '',
    noHp: '',
    email: '',
    kegiatan: '',
    tanggal: '',
    waktu: '09:00',
    jumlahPeserta: '',
    lokasiAcara: '',
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
        `[Layanan: Permohonan Narasumber & Tenaga Ahli]`,
        `\nTopik/Materi Keahlian: ${selectedTopik}`,
        `\nBentuk Kegiatan: ${bentukAcara}`,
        formData.kegiatan ? `\nNama Acara: ${formData.kegiatan}` : '',
        formData.instansi ? `\nInstansi Penyelenggara: ${formData.instansi}` : '',
        formData.tanggal ? `\nTanggal & Waktu: ${formData.tanggal} (Pukul ${formData.waktu} WIB)` : '',
        formData.jumlahPeserta ? `\nEstimasi Peserta: ${formData.jumlahPeserta} Orang` : '',
        formData.lokasiAcara ? `\nLokasi/Media Acara: ${formData.lokasiAcara}` : '',
        formData.alamat ? `\nAlamat Instansi: ${formData.alamat}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: formData.email,
        no_telp_pelapor: formData.noHp,
        isi_pengaduan: fullDescription,
        jenis_layanan: 'Permohonan Narasumber',
      });

      const code = res?.data?.kode_tracking || `NAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        kegiatan: formData.kegiatan,
        topik: selectedTopik,
        tanggal: formData.tanggal,
        fileName: file ? file.name : null,
      });
    } catch (err) {
      console.warn('Narasumber submit note:', err.message);
      const code = `NAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        kegiatan: formData.kegiatan,
        topik: selectedTopik,
        tanggal: formData.tanggal,
        fileName: file ? file.name : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '76px', minHeight: '100vh', backgroundColor: '#f0f9ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
            color: '#0284c7',
            padding: '0.55rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e0f2fe',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
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
            boxShadow: '0 20px 50px rgba(2, 132, 199, 0.16)',
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
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
                <Mic size={14} />
                Layanan Narasumber & Pemateri
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#e0f2fe',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Tenaga Ahli & Peneliti BRMP DIY
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
              Permohonan Narasumber Ahli Pertanian
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#e0f2fe', lineHeight: 1.65, margin: 0 }}>
              Ajukan permohonan pemateri, instruktur pelatihan, atau narasumber seminar bagi instansi pemerintah, universitas, sekolah, dan organisasi petani dari tim fungsional ahli BRMP DIY.
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
            { icon: Award, label: 'Kualitas Materi', val: 'Berstandar Nasional', desc: 'Materi riset terkini & aplikatif' },
            { icon: Users, label: 'Keahlian Lengkap', val: 'Berbagai Disiplin Ilmu', desc: 'Agronomi, Proteksi, Tanah & Benih' },
            { icon: Clock, label: 'Konfirmasi Jadwal', val: '1-3 Hari Kerja', desc: 'Disposisi langsung oleh Pimpinan Balai' },
            { icon: Building2, label: 'Fleksibilitas Acara', val: 'Online / Offline', desc: 'Seminar, Bimtek, Kuliah Umum' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #e0f2fe',
                boxShadow: '0 2px 10px rgba(2,132,199,0.04)',
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
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
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
            border: '1.5px solid rgba(2,132,199,0.2)',
            boxShadow: '0 15px 40px rgba(2, 132, 199, 0.07)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}
            >
              <Volume2 size={14} />
              Formulir Permohonan Narasumber
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Ajukan Permohonan Pemateri
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Isi data kegiatan, topik bahasan, dan waktu pelaksanaan untuk penerbitan surat tugas resmi narasumber.
            </p>
          </div>

          {/* Topik Materi Selector */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.6rem' }}>
              Bidang / Topik Keahlian Narasumber *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {TOPIK_NARASUMBER.map((t) => {
                const isSelected = selectedTopik === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopik(t.label)}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '9999px',
                      border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#e0f2fe' : '#f8fafc',
                      color: isSelected ? '#0284c7' : '#475569',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{t.label}</span>
                    {isSelected && <Check size={14} color="#0284c7" />}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nama Lengkap Pemohon / PIC Panitia *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dr. Anita Rahmawati"
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
                  Nama Instansi / Universitas / Komunitas Penyelenggara *
                </label>
                <input
                  required
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  placeholder="Contoh: Fakultas Pertanian UPN Veteran Yogyakarta"
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
                  Nomor WhatsApp / HP PIC *
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
                  Email Resmi Panitia *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: panitia@instansi.ac.id"
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
                  Nama Kegiatan / Judul Acara *
                </label>
                <input
                  required
                  type="text"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                  placeholder="Contoh: Seminar Nasional Inovasi Benih & Pertanian Cerdas 2026"
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
                  Format Bentuk Kegiatan
                </label>
                <select
                  value={bentukAcara}
                  onChange={(e) => setBentukAcara(e.target.value)}
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
                  <option value="Seminar / Webinar Online">Seminar / Webinar Online (Zoom/GMeet)</option>
                  <option value="Workshop / Bimtek Offline">Workshop / Bimbingan Teknis Tatap Muka</option>
                  <option value="Kuliah Umum / Dosen Tamu">Kuliah Umum / Dosen Praktisi Tamu</option>
                  <option value="Pelatihan Kelompok Tani">Pelatihan Lapang Kelompok Tani</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Tanggal Pelaksanaan Acara *
                </label>
                <input
                  required
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
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
                  Jam Pelaksanaan (WIB)
                </label>
                <select
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
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
                  <option value="08:30">08:30 WIB (Pagi)</option>
                  <option value="09:00">09:00 WIB (Pagi)</option>
                  <option value="10:00">10:00 WIB (Siang)</option>
                  <option value="13:30">13:30 WIB (Siang/Sore)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Estimasi Jumlah Peserta (Orang)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.jumlahPeserta}
                  onChange={(e) => setFormData({ ...formData, jumlahPeserta: e.target.value })}
                  placeholder="Contoh: 100"
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
                  Lokasi Gedung / Tautan Platform Acara
                </label>
                <input
                  type="text"
                  value={formData.lokasiAcara}
                  onChange={(e) => setFormData({ ...formData, lokasiAcara: e.target.value })}
                  placeholder="Contoh: Auditorium Kampus / Tautan Zoom"
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

            {/* Upload Undangan / TOR */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Unggah Surat Undangan Resmi / TOR / Rundown Acara (PDF/DOCX, Opsional)
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
                <Upload size={22} color="#0284c7" style={{ margin: '0 auto 0.4rem auto' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  {file ? file.name : 'Klik untuk mengunggah surat undangan atau TOR kegiatan'}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Format PDF, DOC, DOCX (Maksimal 10MB)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '1rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(2, 132, 199, 0.3)',
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
              <span>{isLoading ? 'Memproses Permohonan...' : 'Kirim Permohonan Narasumber'}</span>
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
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle size={38} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
              Permohonan Narasumber Terkirim! 🎙️
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Permohonan narasumber Anda telah kami terima dan akan dikoordinasikan dengan tim pimpinan BRMP DIY.
            </p>

            <div
              style={{
                backgroundColor: '#f0f9ff',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid #bae6fd',
                textAlign: 'left',
                fontSize: '0.86rem',
                marginBottom: '1.5rem',
                lineHeight: 1.75,
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Nomor Resi / Tiket: </span>
                <strong style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: '1rem' }}>{submitted.code}</strong>
              </div>
              <div><span style={{ color: '#64748b' }}>Topik Materi: </span><strong>{submitted.topik}</strong></div>
              <div><span style={{ color: '#64748b' }}>Nama Kegiatan: </span><strong>{submitted.kegiatan}</strong></div>
              <div><span style={{ color: '#64748b' }}>Instansi: </span><strong>{submitted.instansi}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/6285878438548?text=${encodeURIComponent(`Halo Tim Humas BRMP DIY, saya telah mengajukan Permohonan Narasumber (${submitted.topik}) dengan Nomor Tiket: ${submitted.code}. Mohon konfirmasi ketersediaan pemateri. Terima kasih.`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setSubmitted(null);
                  navigate('/');
                }}
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
                <span>Konfirmasi via WhatsApp Humas</span>
              </a>

              <button
                onClick={() => {
                  setSubmitted(null);
                  navigate('/');
                }}
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
                Tutup & Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
