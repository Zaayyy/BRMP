import React, { useState, useEffect, useRef } from 'react';
import {
  X, FlaskConical, Save, CheckCircle2, AlertCircle, Loader2,
  FileText, Sparkles, Calendar, UploadCloud,
  FileCheck, Trash2, Eye
} from 'lucide-react';
import { internalLabService } from './services/apiService';

export default function UpdateLabStatusModal({ isOpen, onClose, trackingItem, onSuccess }) {
  const [statusUji, setStatusUji] = useState('Proses');
  const [hasilDokumenUrl, setHasilDokumenUrl] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (trackingItem) {
      setStatusUji(trackingItem.status_uji || 'Proses');
      const docUrl = trackingItem.hasil_dokumen_url || '';
      setHasilDokumenUrl(docUrl);
      setKeterangan(trackingItem.keterangan || '');
      setTanggalSelesai(
        trackingItem.tanggal_selesai
          ? new Date(trackingItem.tanggal_selesai).toISOString().slice(0, 10)
          : ''
      );
      setErrorMessage(null);
      setSuccessMessage(null);

      if (docUrl) {
        setUploadedFileInfo({
          name: 'Dokumen_Hasil_Uji_Lab.pdf',
          sizeText: 'Tersimpan',
          type: 'application/pdf',
        });
      } else {
        setUploadedFileInfo(null);
      }
    }
  }, [trackingItem, isOpen]);

  if (!isOpen || !trackingItem) return null;

  const TEMPLATES = [
    {
      label: '🔬 Uji Daya Kecambah & Kadar Air',
      text: 'Sampel sedang dalam tahapan pengujian kadar air, kemurnian fisik, dan inkubasi daya berkecambah di laboratorium.',
    },
    {
      label: '🧪 Analisis Kimia Tanah / Pupuk',
      text: 'Sampel sedang dalam proses ekstraksi dan analisis kandungan unsur hara (N, P, K, pH) di ruang instrumen.',
    },
    {
      label: '📋 Verifikasi & Rekap Data',
      text: 'Pengujian teknis telah rampung. Tim analis sedang melakukan verifikasi dan penyusunan draf Laporan Hasil Uji (LHU).',
    },
    {
      label: '✅ Laporan Resmi Selesai',
      text: 'Pengujian selesai. Hasil pengujian memenuhi standar sertifikasi mutu benih BRMP DIY. Dokumen LHU resmi telah diterbitkan.',
    },
  ];

  // Process File Upload to Data URL (Base64)
  const handleFileProcess = (file) => {
    if (!file) return;

    // Check size limit (max 12MB)
    const maxSizeBytes = 12 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage('Ukuran file terlalu besar! Maksimum ukuran dokumen adalah 12 MB.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setHasilDokumenUrl(base64Data);
      setUploadedFileInfo({
        name: file.name,
        sizeText: sizeFormatted,
        type: file.type || 'application/pdf',
      });
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca file yang dipilih. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setHasilDokumenUrl('');
    setUploadedFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        status_uji: statusUji,
        hasil_dokumen_url: hasilDokumenUrl.trim() || null,
        keterangan: keterangan.trim() || null,
        ...(tanggalSelesai && { tanggal_selesai: tanggalSelesai }),
      };

      // Panggil PUT /api/internal/tracking/:id
      const response = await internalLabService.updateStatus(trackingItem.id, payload);

      if (response && response.success) {
        setSuccessMessage(`Keterangan & dokumen hasil uji [${trackingItem.kode_tracking || trackingItem.id}] berhasil diperbarui!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(response.data);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(response?.message || 'Gagal memperbarui status pengujian.');
      }
    } catch (error) {
      setErrorMessage(
        error.message || 'Gagal mengupdate laboratorium. Pastikan Anda memiliki akses petugas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
            <FlaskConical size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Ubah Keterangan & Dokumen Uji</h3>
            <p className="text-xs text-slate-500 font-medium">
              Pemohon: <strong className="text-slate-800">{trackingItem.nama_pemohon}</strong> • Kode: <span className="font-bold text-emerald-700">{trackingItem.kode_tracking || `#${trackingItem.id}`}</span>
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 animate-fadeIn">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-800 animate-fadeIn">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Tahapan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Tahapan Uji Laboratorium *
            </label>
            <select
              value={statusUji}
              onChange={(e) => {
                const val = e.target.value;
                setStatusUji(val);
                if (val === 'Selesai' && !tanggalSelesai) {
                  setTanggalSelesai(new Date().toISOString().slice(0, 10));
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-sm font-bold text-slate-800 bg-white"
            >
              <option value="Diterima">🟡 Tahap 1: Pengajuan Diterima (Sampel Masuk)</option>
              <option value="Proses">🔵 Tahap 2 - 4: Sedang Dalam Pengujian Aktif & Analisis Mutu</option>
              <option value="Selesai">🟢 Tahap 5: Laporan Selesai & Diterbitkan</option>
            </select>
          </div>

          {/* Keterangan & Catatan Proses Petugas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Catatan & Keterangan Proses Petugas *
              </label>
              <span className="text-[11px] text-slate-400">Ditampilkan langsung di tracking publik</span>
            </div>
            <textarea
              required
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Tuliskan perkembangan proses pengujian sampel..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-sm text-slate-800 resize-none leading-relaxed"
            />

            {/* Quick Templates */}
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                ⚡ Template Keterangan Cepat (Klik untuk menyisipkan):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setKeterangan(tmpl.text)}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 transition font-medium text-left"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* UPLOAD & DRAG DROP DOKUMEN HASIL UJI */}
          <div className="pt-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-600" />
              Dokumen / Laporan Hasil Uji (PDF / Gambar)
            </label>

            {/* Drag and Drop Zone */}
            {!hasilDokumenUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                    : 'border-slate-300 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 shadow-sm">
                  <UploadCloud size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800 mb-1">
                  {isDragging ? 'Lepaskan file dokumen di sini...' : 'Tarik & Lepas file PDF di sini atau Klik untuk Memilih'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Mendukung format PDF, DOCX, atau Gambar (Maks. 12 MB)
                </p>
              </div>
            ) : (
              /* File Uploaded Card Preview */
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {uploadedFileInfo?.name || 'Dokumen_Hasil_Uji.pdf'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {uploadedFileInfo?.sizeText || 'Dokumen Siap'} • Terlampir
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <a
                    href={hasilDokumenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                    title="Buka / Preview Dokumen"
                  >
                    <Eye size={15} />
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 transition border border-rose-200"
                    title="Hapus / Ganti Dokumen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              Tanggal Selesai Pengujian
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-sm text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Keterangan & Dokumen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
