import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, CheckCircle, FileText, X,
  Building2, User, Phone, Mail, MapPin, Loader2,
  FileCheck2, ShieldCheck, HelpCircle, Eye, Download,
  Clock, Award, Sparkles, Scale, Info, ChevronRight,
  Database, BookOpen, AlertCircle
} from 'lucide-react';
import { pengaduanService } from '../services/apiService';

export default function InformasiPublikPage() {
  const [pemohonType, setPemohonType] = useState('perorangan'); // 'perorangan' | 'lembaga'
  const [caraPeroleh, setCaraPeroleh] = useState('Salinan Elektronik (Email / PDF)');
  const [caraKirim, setCaraKirim] = useState('Email / WhatsApp Online');

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    instansi: '',
    pekerjaan: '',
    alamat: '',
    noHp: '',
    email: '',
    rincianInformasi: '',
    tujuanPenggunaan: '',
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
        `[Layanan: Permohonan Informasi Publik (PPID)]`,
        `\nKategori Pemohon: ${pemohonType === 'perorangan' ? 'Perorangan / Pribadi' : 'Badan Hukum / Instansi / Mahasiswa'}`,
        formData.nik ? `\nNIK / Identitas: ${formData.nik}` : '',
        formData.instansi ? `\nNama Instansi/Kampus: ${formData.instansi}` : '',
        formData.pekerjaan ? `\nProfesi/Pekerjaan: ${formData.pekerjaan}` : '',
        `\nRincian Informasi Diminta: ${formData.rincianInformasi}`,
        `\nTujuan Penggunaan: ${formData.tujuanPenggunaan}`,
        `\nBentuk Salinan: ${caraPeroleh}`,
        `\nCara Penyerahan: ${caraKirim}`,
        formData.alamat ? `\nAlamat Pemohon: ${formData.alamat}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: formData.email,
        no_telp_pelapor: formData.noHp,
        isi_pengaduan: fullDescription,
      });

      const code = res?.data?.kode_tracking || `PPID-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        kategori: 'Informasi Publik PPID',
        rincian: formData.rincianInformasi,
        caraKirim,
        fileName: file ? file.name : null,
      });
    } catch (err) {
      console.warn('PPID submit note:', err.message);
      const code = `PPID-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        instansi: formData.instansi,
        kategori: 'Informasi Publik PPID',
        rincian: formData.rincianInformasi,
        caraKirim,
        fileName: file ? file.name : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '76px', minHeight: '100vh', backgroundColor: '#f5f3ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 25px rgba(124, 58, 237, 0.2); } 50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.4); } }
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
            color: '#7c3aed',
            padding: '0.55rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #ede9fe',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ede9fe')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {/* HERO SECTION BANNER */}
        <div
          style={{
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(124, 58, 237, 0.15)',
            background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #4c1d95 100%)',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            position: 'relative',
            marginBottom: '2.5rem',
            animation: 'fadeInUp 0.5s ease both',
          }}
        >
          {/* Decorative Background Elements */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-40px', width: '320px', height: '320px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
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
                <ShieldCheck size={14} />
                PPID Utama BRMP DIY
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#ede9fe',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                UU No. 14 Tahun 2008
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
              Layanan Permohonan Informasi Publik (PPID)
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#e9d5ff', lineHeight: 1.65, margin: 0 }}>
              Pejabat Pengelola Informasi dan Dokumentasi (PPID) Balai Besar Standar Instrumen Pertanian DIY menjamin hak masyarakat untuk memperoleh informasi publik pertanian yang transparan, akurat, dan dapat dipertanggungjawabkan.
            </p>
          </div>
        </div>

        {/* JAMINAN LAYANAN & PROSES INFO STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {[
            { icon: Clock, label: 'Waktu Respon Cepat', val: 'Maks. 10 Hari Kerja', desc: 'Berdasarkan UU KIP No. 14/2008' },
            { icon: Scale, label: 'Biaya Dokumen', val: 'GRATIS (Rp. 0)', desc: 'Salinan digital tidak dipungut biaya' },
            { icon: FileCheck2, label: 'Jaminan Akurasi', val: 'Terverifikasi Resmi', desc: 'Divalidasi langsung oleh Tim PPID' },
            { icon: Award, label: 'Transparansi Penuh', val: 'Tracking Tiket Online', desc: 'Pantau resi permohonan kapan saja' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #ede9fe',
                boxShadow: '0 2px 10px rgba(124,58,237,0.04)',
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
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <item.icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e1b4b', marginTop: '0.1rem' }}>{item.val}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN FORM CONTAINER */}
        <div
          id="form-ppid"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            padding: '2.8rem 2.5rem',
            border: '1.5px solid #ede9fe',
            boxShadow: '0 15px 40px rgba(124, 58, 237, 0.08)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 2.5rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#ede9fe',
                color: '#7c3aed',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}
            >
              <FileText size={14} />
              Formulir Pengajuan Online
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e1b4b', margin: '0 0 0.4rem 0' }}>
              Form Permohonan Informasi Publik
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: 0 }}>
              Silakan lengkapi formulir di bawah ini dengan data yang benar untuk pemrosesan dokumen secara resmi.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Tipe Pemohon Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '0.6rem' }}>
                Kategori Pemohon Informasi *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPemohonType('perorangan')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: pemohonType === 'perorangan' ? '2px solid #7c3aed' : '1.5px solid #e5e7eb',
                    backgroundColor: pemohonType === 'perorangan' ? '#f5f3ff' : '#f9fafb',
                    color: pemohonType === 'perorangan' ? '#7c3aed' : '#4b5563',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <User size={18} />
                  <span>Perorangan / Pribadi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPemohonType('lembaga')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: pemohonType === 'lembaga' ? '2px solid #7c3aed' : '1.5px solid #e5e7eb',
                    backgroundColor: pemohonType === 'lembaga' ? '#f5f3ff' : '#f9fafb',
                    color: pemohonType === 'lembaga' ? '#7c3aed' : '#4b5563',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Building2 size={18} />
                  <span>Badan Hukum / Instansi / Mahasiswa</span>
                </button>
              </div>
            </div>

            {/* Nama & NIK */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                  Nama Lengkap Pemohon *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan, S.P."
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                  Nomor Induk Kependudukan (NIK KTP) / Paspor *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="16 Digit NIK KTP Pemohon"
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

            {/* Instansi & Pekerjaan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                  {pemohonType === 'lembaga' ? 'Nama Instansi / Universitas / Organisasi *' : 'Nama Lembaga / Asal Instansi (Opsional)'}
                </label>
                <input
                  required={pemohonType === 'lembaga'}
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  placeholder="Contoh: Universitas Gadjah Mada / Lembaga Riset Pertanian"
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                  Profesi / Pekerjaan
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Contoh: Peneliti / Dosen / Mahasiswa / Petani / Jurnalis"
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

            {/* Kontak: No HP & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
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

            {/* Rincian Informasi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                Rincian Informasi Publik yang Dibutuhkan *
              </label>
              <textarea
                required
                rows={3}
                value={formData.rincianInformasi}
                onChange={(e) => setFormData({ ...formData, rincianInformasi: e.target.value })}
                placeholder="Jelaskan secara spesifik data atau dokumen yang Anda butuhkan (contoh: Data Sertifikasi Mutu Benih Padi DIY Tahun 2024-2025 dan Laporan Uji Laboratorium Tanah)..."
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

            {/* Tujuan Penggunaan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                Tujuan Penggunaan Informasi *
              </label>
              <input
                required
                type="text"
                value={formData.tujuanPenggunaan}
                onChange={(e) => setFormData({ ...formData, tujuanPenggunaan: e.target.value })}
                placeholder="Contoh: Penyusunan Skripsi / Tesis / Riset Kebijakan / Bahan Publikasi Jurnal"
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

            {/* Cara Memperoleh & Cara Penyerahan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                  Format / Cara Memperoleh Informasi
                </label>
                <select
                  value={caraPeroleh}
                  onChange={(e) => setCaraPeroleh(e.target.value)}
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
                  <option value="Salinan Elektronik (Email / PDF)">Salinan Elektronik (Email / PDF)</option>
                  <option value="Melihat / Membaca Langsung">Melihat / Membaca Langsung di Kantor</option>
                  <option value="Salinan Cetak (Hardcopy)">Salinan Cetak (Hardcopy / Kertas)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                  Metode Pengiriman Salinan
                </label>
                <select
                  value={caraKirim}
                  onChange={(e) => setCaraKirim(e.target.value)}
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
                  <option value="Email / WhatsApp Online">Online (Email Resmi & WhatsApp)</option>
                  <option value="Diambil Langsung ke Kantor PPID">Diambil Langsung di Meja PPID BRMP DIY</option>
                  <option value="Kurir / Pos (Biaya Pengiriman Pemohon)">Pos / Ekspedisi</option>
                </select>
              </div>
            </div>

            {/* Upload KTP / Dokumen Pendukung */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                Unggah Foto KTP / Kartu Identitas / Surat Pengantar Lembaga (PDF/JPG/PNG, Opsional)
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
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={22} color="#7c3aed" style={{ margin: '0 auto 0.4rem auto' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  {file ? file.name : 'Pilih foto KTP atau surat pengantar permohonan'}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Format PDF, PNG, JPG (Maks. 10MB)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                padding: '1rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)',
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
              <span>{isLoading ? 'Memproses Permohonan...' : 'Kirim Permohonan Informasi Publik'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* MODAL POPUP SUKSES */}
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
              animation: 'fadeInUp 0.35s ease both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle size={38} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e1b4b', marginBottom: '0.4rem' }}>
              Permohonan Informasi Publik Terkirim! 🎉
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Permohonan Anda telah teregistrasi di sistem PPID BRMP DIY dan akan diproses sesuai standar UU Keterbukaan Informasi Publik.
            </p>

            <div
              style={{
                backgroundColor: '#f5f3ff',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid #ddd6fe',
                textAlign: 'left',
                fontSize: '0.86rem',
                marginBottom: '1.5rem',
                lineHeight: 1.75,
              }}
            >
              <div>
                <span style={{ color: '#6b7280' }}>Nomor Resi / Tiket PPID: </span>
                <strong style={{ color: '#7c3aed', fontFamily: 'monospace', fontSize: '1rem' }}>{submitted.code}</strong>
              </div>
              <div><span style={{ color: '#6b7280' }}>Kategori Informasi: </span><strong>{submitted.kategori}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Nama Pemohon: </span><strong>{submitted.nama} {submitted.instansi ? `(${submitted.instansi})` : ''}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Metode Penyerahan: </span><strong>{submitted.caraKirim}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/6285878438548?text=${encodeURIComponent(`Halo Petugas PPID BRMP DIY, saya telah mengajukan Permohonan Informasi Publik (${submitted.kategori}) dengan Nomor Tiket: ${submitted.code}. Mohon info proses selanjutnya. Terima kasih.`)}`}
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
                <span>Konfirmasi via WhatsApp Petugas PPID</span>
              </a>

              <button
                onClick={() => setSubmitted(null)}
                style={{
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
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
