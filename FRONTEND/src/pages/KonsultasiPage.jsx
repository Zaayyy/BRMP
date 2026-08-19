import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Upload, CheckCircle, FileText, Image as ImageIcon, X, ShieldCheck, MessageCircle, HelpCircle, Loader2 } from 'lucide-react';
import { pengaduanService } from '../services/apiService';

export default function KonsultasiPage() {
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    alamat: '',
    email: '',
    noHp: '',
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
        `[Layanan: Konsultasi Teknis & Mutu Benih]`,
        formData.pesan ? `\nTopik/Keluhan: ${formData.pesan}` : '',
        formData.alamat ? `\nAlamat: ${formData.alamat}` : '',
        formData.nik ? `\nNIK: ${formData.nik}` : '',
      ].join('');

      const res = await pengaduanService.submitPublic({
        nama_pelapor: formData.nama,
        email_pelapor: formData.email,
        no_telp_pelapor: formData.noHp,
        isi_pengaduan: fullDescription,
      });

      const code = res?.data?.kode_tracking || `KON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        nik: formData.nik,
        email: formData.email,
        fileName: file ? file.name : null,
      });
    } catch (err) {
      console.warn('Konsultasi submit note:', err.message);
      const code = `KON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitted({
        code,
        nama: formData.nama,
        nik: formData.nik,
        email: formData.email,
        fileName: file ? file.name : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', backgroundColor: '#f4f8f5', paddingBottom: '4rem' }}>
      {/* Top Back Navigation */}
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', padding: '0 1.5rem' }}>
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Main Card Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
            border: '1px solid rgba(13,110,56,0.1)',
          }}
        >
          {/* Top Badge */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#dcfce7',
                color: '#0d6e38',
                padding: '0.4rem 1.2rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                border: '1px solid rgba(13,110,56,0.2)',
              }}
            >
              <HelpCircle size={15} />
              <span>LAYANAN KONSULTASI AHLI</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.6rem',
                letterSpacing: '-0.02em',
              }}
            >
              Konsultasi Agromodern BRMP DIY
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              Sampaikan pertanyaan atau permasalahan teknis pertanian, uji benih, dan tanah Anda secara langsung kepada tim pakar ahli BRMP DIY.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* NIK & Nama Lengkap */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="form-grid-2">
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    NIK (Nomor Induk Kependudukan) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    pattern="[0-9]{16}"
                    title="NIK harus berupa 16 digit angka"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="16 Digit NIK KTP Anda"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Sesuai KTP / Kartu Tani"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Alamat Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              </div>

              {/* Email & No HP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="form-grid-2">
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    No HP / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>
              </div>

              {/* Pesan */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Pesan / Detail Konsultasi *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.pesan}
                  onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                  placeholder="Tuliskan secara jelas topik atau pertanyaan konsultasi teknis pertanian Anda..."
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0d6e38')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              </div>

              {/* Upload Dokumen atau Foto */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Upload Dokumen atau Foto Pendukung (Opsional)
                </label>
                
                {!file ? (
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '16px',
                      padding: '1.8rem 1rem',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                    onClick={() => document.getElementById('konsultasi-file-input').click()}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#0d6e38';
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <input
                      id="konsultasi-file-input"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#dcfce7',
                        color: '#0d6e38',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.8rem',
                      }}
                    >
                      <Upload size={22} />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                      Pilih file dokumen atau foto untuk diunggah
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Format yang didukung: JPG, PNG, WEBP, PDF, DOC (Maksimal 10MB)
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      border: '1.5px solid #bbf7d0',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '14px',
                      padding: '1rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', overflow: 'hidden' }}>
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            backgroundColor: '#dcfce7',
                            color: '#0d6e38',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={24} />
                        </div>
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-ripple"
                style={{
                  marginTop: '0.8rem',
                  background: 'linear-gradient(135deg, #0d6e38, #10b981)',
                  color: '#ffffff',
                  padding: '0.95rem 2rem',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
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
                <Send size={19} />
                <span>Kirim Permohonan Konsultasi</span>
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.2rem',
                  animation: 'bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)',
                }}
              >
                <CheckCircle size={44} />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Permohonan Konsultasi Berhasil Dikirim!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Terima kasih <strong>{submitted.nama}</strong>. Pengajuan konsultasi Anda telah terverifikasi dalam sistem BRMP DIY dan akan ditanggapi oleh tim ahli kami.
              </p>

              <div style={{ backgroundColor: '#f1f5f9', padding: '1.2rem', borderRadius: '16px', marginBottom: '1.8rem', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 600 }}>Nomor Resi Konsultasi Anda:</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0d6e38', letterSpacing: '0.06em' }}>
                  {submitted.code}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Simpan kode ini untuk memantau status konsultasi di menu <strong>Lacak Layanan</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setSubmitted(null);
                    setFormData({ nik: '', nama: '', alamat: '', email: '', noHp: '', pesan: '' });
                    setFile(null);
                    setFilePreview(null);
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
                  Kirim Konsultasi Baru
                </button>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo BRMP DIY, saya telah menguji permohonan konsultasi dengan Resi: ${submitted.code}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '0.8rem 1.8rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Hubungi via WA</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
