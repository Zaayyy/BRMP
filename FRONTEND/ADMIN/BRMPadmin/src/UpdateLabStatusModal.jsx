import React, { useState } from 'react';
import { X, FlaskConical, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { internalLabService } from './services/apiService';

export default function UpdateLabStatusModal({ isOpen, onClose, trackingItem, onSuccess }) {
  const [statusUji, setStatusUji] = useState(trackingItem ? trackingItem.status_uji || 'Proses' : 'Proses');
  const [hasilDokumenUrl, setHasilDokumenUrl] = useState(trackingItem ? trackingItem.hasil_dokumen_url || '' : '');
  const [keterangan, setKeterangan] = useState(trackingItem ? trackingItem.keterangan || '' : '');
  const [tanggalSelesai, setTanggalSelesai] = useState(
    trackingItem && trackingItem.tanggal_selesai
      ? new Date(trackingItem.tanggal_selesai).toISOString().slice(0, 10)
      : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen || !trackingItem) return null;

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
      // Header Authorization: Bearer <token> disisipkan secara otomatis oleh interceptor apiService
      const response = await internalLabService.updateStatus(trackingItem.id, payload);

      if (response && response.success) {
        setSuccessMessage(`Status uji laboratorium [${trackingItem.kode_tracking || trackingItem.id}] berhasil diperbarui!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(response.data);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(response.message || 'Gagal memperbarui status pengujian.');
      }
    } catch (error) {
      setErrorMessage(
        error.message || 'Gagal mengupdate status laboratorium. Pastikan token login Anda masih aktif.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center shadow-md">
            <FlaskConical size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Update Status Uji Laboratorium</h3>
            <p className="text-xs text-slate-500 font-medium">
              Kode Tracking: <span className="font-bold text-sky-700">{trackingItem.kode_tracking || `#${trackingItem.id}`}</span>
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Uji Laboratorium *
            </label>
            <select
              value={statusUji}
              onChange={(e) => setStatusUji(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="Diterima">🟡 Diterima (Sampel Masuk)</option>
              <option value="Proses">🔵 Proses (Sedang Pengujian)</option>
              <option value="Selesai">🟢 Selesai (Laporan Diterbitkan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              URL / Link Dokumen Hasil Uji PDF (Opsional)
            </label>
            <input
              type="url"
              value={hasilDokumenUrl}
              onChange={(e) => setHasilDokumenUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/xxx atau /docs/hasil-lab.pdf"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Catatan / Hasil Analisis Pengujian
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Daya kecambah 96%, kadar air 11.2%. Memenuhi standar mutu benih bersertifikat."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm text-slate-800 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tanggal Selesai Uji
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-600/25 flex items-center gap-2 transition disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
