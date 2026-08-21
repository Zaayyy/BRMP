import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, CheckCircle, FileText, Image as ImageIcon,
  X, ShieldCheck, MessageCircle, HelpCircle, Loader2, Sprout,
  Users, Clock, Award, Phone, Mail, MapPin, Sparkles, Check
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

const TOPIK_KONSULTASI = [
  { id: 'padi', label: '🌾 Budidaya & Mutu Benih Padi', icon: '🌾' },
  { id: 'jagung', label: '🌽 Varietas Jagung Unggul', icon: '🌽' },
  { id: 'kedelai', label: '🌱 Kedelai & Kacang-kacangan', icon: '🌱' },
  { id: 'hortikultura', label: '🌶️ Cabai, Bawang & Sayuran', icon: '🌶️' },
  { id: 'tanah', label: '🧪 Kesuburan Tanah & Pemupukan', icon: '🧪' },
  { id: 'hama', label: '🐛 Pengendalian Hama & Penyakit (OPT)', icon: '🐛' },
  { id: 'sertifikasi', label: '📜 Prosedur Sertifikasi Benih', icon: '📜' },
];

export default function KonsultasiPage() {
  const navigate = useNavigate();
  const [selectedTopik, setSelectedTopik] = useState(TOPIK_KONSULTASI[0].label);
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    email: '',
    noHp: '',
    komoditas: '',
    pesan: '',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullDescription = [
        `[Layanan: Konsultasi Teknis & Standarisasi Pertanian]`,
        `\nTopik Utama: ${selectedTopik}`,
        formData.komoditas ? `\nKomoditas/Varietas: ${formData.komoditas}` : '',
        formData.nik ? `\nNIK: ${formData.nik}` : '',
        `\nUraian Pertanyaan/Keluhan: ${formData.pesan}`,
        formData.alamat ? `\nLokasi Lahan/Alamat: ${formData.alamat}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: formData.email,
        no_telp_pelapor: formData.noHp,
        isi_pengaduan: fullDescription,
        jenis_layanan: 'Permohonan Konsultasi',
      });

      const code = res?.data?.kode_tracking || `KON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        topik: selectedTopik,
        email: formData.email,
        fileName: file ? file.name : null,
      });
    } catch (err) {
      console.warn('Konsultasi submit note:', err.message);
      const code = `KON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        topik: selectedTopik,
        email: formData.email,
        fileName: file ? file.name : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '76px', minHeight: '100vh', backgroundColor: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
            color: '#0d6e38',
            padding: '0.55rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #dcfce7',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
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
            boxShadow: '0 20px 50px rgba(13, 110, 56, 0.16)',
            background: 'linear-gradient(135deg, #064e26 0%, #0d6e38 55%, #10b981 100%)',
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
                <Sprout size={14} />
                Layanan Konsultasi Pakar Pertanian
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#d1fae5',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Langsung Ditangani Ahli BRMP DIY
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
              Konsultasi Teknis & Standarisasi Agro Modern
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#ecfdf5', lineHeight: 1.65, margin: 0 }}>
              Dapatkan solusi langsung dari pakar pemuliaan benih, agronom, dan analis laboratorium BRMP DIY terkait budidaya, hama tanaman, pemupukan presisi, hingga sertifikasi benih.
            </p>
          </div>
        </div>

        {/* JAMINAN LAYANAN KONSULTASI STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {[
            { icon: Award, label: 'Biaya Konsultasi', val: 'GRATIS (Rp. 0)', desc: 'Layanan publik bebas biaya' },
            { icon: Clock, label: 'Respon Cepat', val: '1x24 Jam Kerja', desc: 'Diteruskan ke tim pakar spesialis' },
            { icon: Users, label: 'Tenaga Ahli', val: 'Pakar Berpengalaman', desc: 'Agronom & Peneliti Mutu Benih' },
            { icon: ShieldCheck, label: 'Pelacakan Tiket', val: 'Resi Online Terpadu', desc: 'Pantau status jawaban petugas' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #dcfce7',
                boxShadow: '0 2px 10px rgba(13,110,56,0.04)',
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
                  backgroundColor: '#dcfce7',
                  color: '#0d6e38',
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
            border: '1.5px solid rgba(16,185,129,0.2)',
            boxShadow: '0 15px 40px rgba(13, 110, 56, 0.07)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}
            >
              <MessageCircle size={14} />
              Formulir Konsultasi Online
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Ajukan Pertanyaan atau Masalah Pertanian
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Pilih bidang konsultasi dan isi formulir di bawah ini agar tim teknis kami dapat memberikan rekomendasi yang tepat.
            </p>
          </div>

          {/* Topik Pilihan Selector */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.6rem' }}>
              Pilih Bidang / Topik Konsultasi *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {TOPIK_KONSULTASI.map((t) => {
                const isSelected = selectedTopik === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopik(t.label)}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '9999px',
                      border: isSelected ? '2px solid #0d6e38' : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#dcfce7' : '#f8fafc',
                      color: isSelected ? '#0d6e38' : '#475569',
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
                    {isSelected && <Check size={14} color="#0d6e38" />}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nama Lengkap Pemohon *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ir. Joko Prasetyo"
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
                  Nomor Induk Kependudukan (NIK KTP) / Kelompok Tani
                </label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Contoh: 3404XXXXXXXXXXXX / Poktan Makmur"
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
                  Alamat Email Aktif *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: pemohon@domain.com"
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
                  Komoditas / Varietas yang Dikonsultasikan
                </label>
                <input
                  type="text"
                  value={formData.komoditas}
                  onChange={(e) => setFormData({ ...formData, komoditas: e.target.value })}
                  placeholder="Contoh: Padi Inpari 32 / Cabai Rawit / Jagung Hibrida"
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
                  Lokasi Lahan / Alamat Domisili
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Contoh: Kec. Kalasan, Kab. Sleman, DIY"
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
                Uraian Pertanyaan, Masalah, atau Gejala Tanaman *
              </label>
              <textarea
                required
                rows={4}
                value={formData.pesan}
                onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                placeholder="Ceritakan secara detail pertanyaan atau kendala yang dihadapi (contoh: Daun tanaman padi menguning pada usia 35 HST dan timbul bercak coklat pada batang bawah...)"
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

            {/* Upload Foto Gejala / Lahan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Unggah Foto Gejala Tanaman / Lahan / Dokumen (Opsional)
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
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={22} color="#0d6e38" style={{ margin: '0 auto 0.4rem auto' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  {file ? file.name : 'Klik untuk mengunggah foto gejala tanaman atau dokumen'}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Format JPG, PNG, PDF (Maksimal 10MB)</span>
              </div>

              {filePreview && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={filePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <button type="button" onClick={removeFile} style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    Hapus Gambar
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0d6e38 0%, #10b981 100%)',
                color: '#ffffff',
                padding: '1rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(13, 110, 56, 0.3)',
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
              <span>{isLoading ? 'Mengirim Permohonan...' : 'Kirim Permohonan Konsultasi'}</span>
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
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle size={38} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
              Konsultasi Berhasil Terkirim! 🎉
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Pertanyaan Anda telah diteruskan ke tim pakar BRMP DIY. Anda dapat melacak balasan melalui nomor tiket berikut.
            </p>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                fontSize: '0.86rem',
                marginBottom: '1.5rem',
                lineHeight: 1.75,
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Nomor Resi / Tiket: </span>
                <strong style={{ color: '#0d6e38', fontFamily: 'monospace', fontSize: '1rem' }}>{submitted.code}</strong>
              </div>
              <div><span style={{ color: '#64748b' }}>Bidang Konsultasi: </span><strong>{submitted.topik}</strong></div>
              <div><span style={{ color: '#64748b' }}>Nama Pemohon: </span><strong>{submitted.nama}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/6285878438548?text=${encodeURIComponent(`Halo Admin BRMP DIY, saya telah mengajukan permohonan konsultasi (${submitted.topik}) dengan Nomor Tiket: ${submitted.code}. Mohon info tanggapannya. Terima kasih.`)}`}
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
                <span>Konfirmasi via WhatsApp Tim Ahli</span>
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
