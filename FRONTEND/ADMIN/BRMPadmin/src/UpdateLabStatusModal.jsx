import React, { useState, useEffect, useRef } from 'react';
import {
  X, FlaskConical, Save, CheckCircle2, AlertCircle, Loader2,
  FileText, Sparkles, Calendar, UploadCloud,
  FileCheck, Trash2, Eye, Phone, DollarSign, CreditCard, Layers, Tag,
  Activity, ArrowRight
} from 'lucide-react';
import { internalLabService, authService } from './services/apiService';
import { BookOpen } from 'lucide-react';

const SAMPLE_CATEGORIES = [
  { key: "TANAH", label: "Tanah [TH]", code: "TH", placeholder: "Contoh: 1089 atau 1105-1252" },
  { key: "AIR", label: "Air [A]", code: "A", placeholder: "Contoh: 274-275 atau 276" },
  { key: "PUPUK", label: "Pupuk (PO / PA) [P]", code: "P", placeholder: "Contoh: PA. 196 atau PO. 197-198" },
  { key: "TMN", label: "Jaringan Tanaman [TMN]", code: "TMN", placeholder: "Contoh: 388 atau 327-333" },
];

const CUS_OPTIONS = [
  { value: "CE-1", label: "CE-1" },
  { value: "CE-2", label: "CE-2" },
  { value: "CE-3", label: "CE-3" },
  { value: "I", label: "I (Internal)" },
];

const TAHAP_PROSES_OPTIONS = [
  "1. Penerimaan & Registrasi Sampel",
  "2. Preparasi & Pengeringan Sampel (Giling/Ayak)",
  "3. Destruksi / Ekstraksi Kimia di Laboratorium",
  "4. Analisis Instrumen / Spektrometri / Titrasi",
  "5. Pengolahan Data & Validasi Hasil Analisis",
  "6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)",
];

const PARAMETER_PRESETS = [
  "pH H2O, pH KCl, C-org, N-tot, P-tsd, K-tsd, NTK (Ca, Mg, K, Na), KTK, Kejenuhan Basa",
  "Kadar Air, Tekstur, BV",
  "Logam Berat (Pb, Cd, As, Hg)",
  "Total (N, P, K), C/N ratio, C-org",
  "DHL, pH, Salinitas Air",
  "Tersedia (Fe, Mn, Cu, Zn, B, Mo, PO4, SO4)",
];

const STATUS_UJI_STAGES = [
  { value: "Pembayaran", label: "1. Pembayaran", badgeClass: "bg-rose-100 text-rose-900 border-rose-300", icon: "💳", defaultTahap: "1. Penerimaan & Registrasi Sampel" },
  { value: "Verif Sampel", label: "2. Verif Sampel", badgeClass: "bg-sky-100 text-sky-900 border-sky-300", icon: "🔍", defaultTahap: "2. Preparasi & Pengeringan Sampel (Giling/Ayak)" },
  { value: "Pengujian", label: "3. Pengujian", badgeClass: "bg-purple-100 text-purple-900 border-purple-300", icon: "🧪", defaultTahap: "3. Destruksi / Ekstraksi Kimia di Laboratorium" },
  { value: "Analis Data", label: "4. Analis Data", badgeClass: "bg-amber-100 text-amber-900 border-amber-300", icon: "📊", defaultTahap: "5. Pengolahan Data & Validasi Hasil Analisis" },
  { value: "Selesai", label: "5. Selesai", badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300", icon: "✓", defaultTahap: "6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)" },
];

const formatSpk = (cus, dateStr, noReg) => {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const urutan = String(noReg || "").trim();
    return `${cus || "CE-3"}/${month}-${year}/${urutan}`;
  } catch {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = String(now.getFullYear()).slice(-2);
    return `${cus || "CE-3"}/${m}-${y}/${noReg || "1"}`;
  }
};

const getSlaInfo = (dateStr) => {
  if (!dateStr) return { daysRemaining: 45, label: "Sisa 45 hari", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  try {
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) return { daysRemaining: 45, label: "Sisa 45 hari", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - start.getTime();
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 45 - daysElapsed;
    if (daysRemaining <= 0) {
      return { daysRemaining, label: daysRemaining === 0 ? "Batas Hari Ini" : `Lewat ${Math.abs(daysRemaining)} hr`, badgeClass: "bg-rose-100 text-rose-900 border-rose-300 font-black" };
    } else if (daysRemaining <= 7) {
      return { daysRemaining, label: `🚨 Sisa ${daysRemaining} hr (Kritis)`, badgeClass: "bg-rose-100 text-rose-900 border-rose-300 font-extrabold" };
    } else if (daysRemaining <= 14) {
      return { daysRemaining, label: `⚠️ Sisa ${daysRemaining} hr`, badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-bold" };
    } else {
      return { daysRemaining, label: `✓ Sisa ${daysRemaining} hr`, badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" };
    }
  } catch {
    return { daysRemaining: 45, label: "Sisa 45 hari", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  }
};

const getNextSampleRange = (categoryKey, countStr, samplesList = []) => {
  const count = Math.max(1, parseInt(countStr || "1", 10) || 1);
  let fieldKey = "sampel_tanah";
  let altFieldKey = "sampelTanah";
  if (categoryKey === "AIR") { fieldKey = "sampel_air"; altFieldKey = "sampelAir"; }
  else if (categoryKey === "PUPUK") { fieldKey = "sampel_pupuk"; altFieldKey = "sampelPupuk"; }
  else if (categoryKey === "TMN") { fieldKey = "sampel_tanaman"; altFieldKey = "sampelTanaman"; }

  let maxNumber = 0;

  samplesList.forEach((item) => {
    const rawVal = String(item[fieldKey] || item[altFieldKey] || "").trim();
    if (!rawVal) return;

    const numbers = rawVal.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      numbers.forEach((numStr) => {
        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed) && parsed > maxNumber) {
          maxNumber = parsed;
        }
      });
    }
  });

  const startNum = maxNumber + 1;
  if (count === 1) {
    return `${startNum}`;
  } else {
    const endNum = startNum + count - 1;
    return `${startNum}-${endNum}`;
  }
};

export default function UpdateLabStatusModal({ isOpen, onClose, trackingItem, onSuccess }) {
  const user = authService.getUser();
  const userRole = user?.role || "Admin";
  const isAnalis = userRole === "Analis";

  const [formData, setFormData] = useState({
    no_reg: '',
    spk: '',
    nama_pemohon: '',
    tanggal_masuk: '',
    telepon: '',
    biaya: '',
    status_bayar: 'Belum Bayar',
    status_uji: 'Proses',
    tahap_proses: '3. Destruksi / Ekstraksi Kimia di Laboratorium',
    jumlah_sampel: '1',
    parameter_uji: '',
    keterangan: '',
    tanggal_selesai: '',
  });

  const [cusCode, setCusCode] = useState('CE-3');
  const [selectedCategory, setSelectedCategory] = useState('TANAH');
  const [sampleCodeValue, setSampleCodeValue] = useState('');

  const [hasilDokumenUrl, setHasilDokumenUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (trackingItem) {
      const existingSpk = trackingItem.spk || trackingItem.noSpk || trackingItem.kode_tracking || '';
      let detectedCus = 'CE-3';
      if (existingSpk.startsWith('CE-1/')) detectedCus = 'CE-1';
      else if (existingSpk.startsWith('CE-2/')) detectedCus = 'CE-2';
      else if (existingSpk.startsWith('CE-3/')) detectedCus = 'CE-3';
      else if (existingSpk.startsWith('I/')) detectedCus = 'I';
      setCusCode(detectedCus);

      const tglMasuk = trackingItem.tanggal_masuk || trackingItem.tanggalMasuk
        ? new Date(trackingItem.tanggal_masuk || trackingItem.tanggalMasuk).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const parts = existingSpk.split('/');
      const extractedNoReg = trackingItem.no_reg || trackingItem.noReg || (parts.length > 1 ? parts[parts.length - 1] : '1');

      setFormData({
        no_reg: extractedNoReg,
        spk: existingSpk,
        nama_pemohon: trackingItem.nama_pemohon || trackingItem.namaPemohon || '',
        tanggal_masuk: tglMasuk,
        telepon: trackingItem.telepon || trackingItem.noTelepon || '',
        biaya: trackingItem.biaya || '',
        status_bayar: trackingItem.status_bayar || trackingItem.statusBayar || 'Belum Bayar',
        status_uji: trackingItem.status_uji || trackingItem.statusUji || 'Proses',
        tahap_proses: trackingItem.tahap_proses || trackingItem.tahapProses || '3. Destruksi / Ekstraksi Kimia di Laboratorium',
        jumlah_sampel: trackingItem.jumlah_sampel || trackingItem.jumlahSampel || trackingItem.jumlah || '1',
        parameter_uji: trackingItem.parameter_uji || trackingItem.parameterUji || '',
        keterangan: trackingItem.keterangan || '',
        tanggal_selesai: trackingItem.tanggal_selesai
          ? new Date(trackingItem.tanggal_selesai).toISOString().slice(0, 10)
          : '',
      });

      // Deteksi kategori sampel aktif
      if (trackingItem.sampel_tanah || trackingItem.sampelTanah) {
        setSelectedCategory('TANAH');
        setSampleCodeValue(trackingItem.sampel_tanah || trackingItem.sampelTanah);
      } else if (trackingItem.sampel_air || trackingItem.sampelAir) {
        setSelectedCategory('AIR');
        setSampleCodeValue(trackingItem.sampel_air || trackingItem.sampelAir);
      } else if (trackingItem.sampel_pupuk || trackingItem.sampelPupuk) {
        setSelectedCategory('PUPUK');
        setSampleCodeValue(trackingItem.sampel_pupuk || trackingItem.sampelPupuk);
      } else if (trackingItem.sampel_tanaman || trackingItem.sampelTanaman) {
        setSelectedCategory('TMN');
        setSampleCodeValue(trackingItem.sampel_tanaman || trackingItem.sampelTanaman);
      } else {
        setSelectedCategory('TANAH');
        setSampleCodeValue('');
      }

      const docUrl = trackingItem.hasil_dokumen_url || trackingItem.hasilDokumenUrl || '';
      setHasilDokumenUrl(docUrl);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (docUrl) {
        setUploadedFileInfo({
          name: 'Dokumen_Hasil_Uji_Lab.pdf',
          sizeText: 'Tersimpan di database',
          type: 'application/pdf',
        });
      } else {
        setUploadedFileInfo(null);
      }
    }
  }, [trackingItem, isOpen]);

  if (!isOpen || !trackingItem) return null;

  const handleCusChange = (newCus) => {
    setCusCode(newCus);
    setFormData((prev) => ({
      ...prev,
      spk: formatSpk(newCus, prev.tanggal_masuk, prev.no_reg),
    }));
  };

  const TEMPLATES = [
    {
      label: '🔬 Uji Unsur Hara Tanah & pH',
      text: 'Sampel tanah sedang dalam proses ekstraksi dan analisis kadar N, P, K, C-Organik, serta pH di ruang instrumen.',
    },
    {
      label: '🧪 Uji Pupuk (PO / PA)',
      text: 'Sampel pupuk sedang diuji kadar hara makro/mikro dan kelarutan sesuai baku mutu standar laboratorium.',
    },
    {
      label: '💧 Analisis Air Irigasi',
      text: 'Sampel air sedang dalam tahapan pengujian DHL, pH, dan kandungan cemaran mineral.',
    },
    {
      label: '🌿 Analisis Jaringan Tanaman (TMN)',
      text: 'Sampel daun/jaringan tanaman dalam proses destruksi basah dan spektrofotometri serapan hara.',
    },
    {
      label: '✅ Laporan Resmi Selesai (LHU)',
      text: 'Pengujian teknis selesai. Hasil analisis memenuhi standar laboratorium BRMP DIY. LHU resmi telah diterbitkan.',
    },
  ];

  // Process File Upload to Data URL (Base64)
  const handleFileProcess = (file) => {
    if (!file) return;

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
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const sampleCodeClean = sampleCodeValue.trim();
      const spkFinal = formData.spk.trim() || formatSpk(cusCode, formData.tanggal_masuk, formData.no_reg);
      const spkParts = spkFinal.split('/');
      const extractedNoReg = spkParts.length > 1 ? spkParts[spkParts.length - 1] : formData.no_reg;

      const payload = {
        no_reg: extractedNoReg,
        spk: spkFinal,
        nama_pemohon: formData.nama_pemohon.trim(),
        sampel_tanah: selectedCategory === 'TANAH' ? sampleCodeClean : null,
        sampel_air: selectedCategory === 'AIR' ? sampleCodeClean : null,
        sampel_pupuk: selectedCategory === 'PUPUK' ? sampleCodeClean : null,
        sampel_tanaman: selectedCategory === 'TMN' ? sampleCodeClean : null,
        jumlah_sampel: formData.jumlah_sampel ? formData.jumlah_sampel.trim() : '1',
        parameter_uji: formData.parameter_uji ? formData.parameter_uji.trim() : '',
        telepon: formData.telepon.trim() || null,
        biaya: formData.biaya.trim() || null,
        status_bayar: formData.status_bayar,
        status_uji: formData.status_uji,
        tahap_proses: formData.status_uji === 'Selesai' ? '6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)' : formData.tahap_proses,
        keterangan: formData.keterangan ? formData.keterangan.trim() : '',
        tanggal_selesai:
          formData.status_uji === 'Selesai' && !formData.tanggal_selesai
            ? new Date().toISOString().slice(0, 10)
            : formData.tanggal_selesai || null,
        hasil_dokumen_url: hasilDokumenUrl || null,
      };

      const res = await internalLabService.updateStatus(trackingItem.id, payload);

      if (res && res.success) {
        setSuccessMessage('Data logbook, tahap proses, & parameter uji berhasil diperbarui!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        throw new Error(res.message || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat memperbarui data.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeCategoryObj = SAMPLE_CATEGORIES.find((c) => c.key === selectedCategory) || SAMPLE_CATEGORIES[0];

  const sla = getSlaInfo(formData.tanggal_masuk || trackingItem?.tanggal_masuk || trackingItem?.tanggalMasuk);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 mb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${
            isAnalis
              ? "bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-purple-500/20"
              : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20"
          }`}>
            {isAnalis ? <BookOpen size={24} /> : <FlaskConical size={24} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-mono text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                isAnalis ? "text-purple-900 bg-purple-100 border border-purple-200" : "text-emerald-800 bg-emerald-100"
              }`}>
                SPK: {formData.spk || trackingItem.kode_tracking || `#${trackingItem.id}`}
              </span>

              {/* SLA 45 Hari Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${sla.badgeClass}`}>
                <span>⏳ SLA 45 Hari:</span>
                <span>{sla.label}</span>
              </span>

              {isAnalis ? (
                <span className="text-[11px] font-bold text-purple-900 bg-purple-100/70 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="font-mono font-black">{activeCategoryObj.code}</span>
                  <span>{sampleCodeValue || "-"}</span>
                  <span className="text-slate-400">|</span>
                  <span>{formData.jumlah_sampel || "1"} Sampel</span>
                </span>
              ) : (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                  formData.status_bayar === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {formData.status_bayar === 'Lunas' ? '✓ Lunas' : '⏳ Belum Bayar'}
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              {isAnalis ? "Buku Catatan Analis (Update Tahap & Parameter Uji)" : "Update Data Register & Tahapan Analisis Lab"}
            </h2>
            {isAnalis && (
              <p className="text-[11px] text-purple-700/80 font-medium">Khusus Analis: Pengisian parameter pengujian dan progres tahapan teknis laboratorium</p>
            )}
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800">
            <AlertCircle size={18} className="flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Data Identitas Logbook (HANYA Khusus Admin / Petugas Lab) */}
          {!isAnalis && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                Identitas Pemohon &amp; Register Logbook
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">1. TGL (Tanggal Masuk)</label>
                  <input
                    type="date"
                    value={formData.tanggal_masuk}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        tanggal_masuk: newDate,
                        spk: formatSpk(cusCode, newDate, prev.no_reg),
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-brand-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">2. NAMA (Pemohon / Instansi) *</label>
                  <input
                    required
                    type="text"
                    value={formData.nama_pemohon}
                    onChange={(e) => setFormData({ ...formData, nama_pemohon: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Kode CUS</label>
                  <select
                    value={cusCode}
                    onChange={(e) => handleCusChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-brand-900 outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {CUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">4. Nomor SPK *</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, spk: formatSpk(cusCode, prev.tanggal_masuk, prev.no_reg) }))}
                      className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition flex items-center gap-1 shadow-sm"
                      title="Generate ulang nomor SPK"
                    >
                      <span>⚡ Auto Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.spk}
                    onChange={(e) => setFormData({ ...formData, spk: e.target.value })}
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs font-bold font-mono text-brand-800 outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                {/* Dropdown 1 Kategori Sampel */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">5. Jenis Sampel *</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {SAMPLE_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kode / Rentang Sampel Terpilih */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">6. No / Kode Sampel *</label>
                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                      selectedCategory === "TANAH" ? "bg-amber-100 text-amber-900 border border-amber-200" :
                      selectedCategory === "AIR" ? "bg-sky-100 text-sky-900 border border-sky-200" :
                      selectedCategory === "PUPUK" ? "bg-purple-100 text-purple-900 border border-purple-200" :
                      "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}>
                      {activeCategoryObj.code}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={sampleCodeValue}
                    onChange={(e) => setSampleCodeValue(e.target.value)}
                    placeholder={activeCategoryObj.placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold outline-none focus:border-brand-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Format: {activeCategoryObj.code}.{sampleCodeValue || "-"}
                  </p>
                </div>

                {/* Jumlah Sampel */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">7. Jumlah Sampel</label>
                  <input
                    type="text"
                    value={formData.jumlah_sampel}
                    onChange={(e) => setFormData({ ...formData, jumlah_sampel: e.target.value })}
                    placeholder="Contoh: 1 / 5 / 148"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">8. Telepon / WA</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="08..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">9. Biaya / Tarif</label>
                  <input
                    type="text"
                    value={formData.biaya}
                    onChange={(e) => setFormData({ ...formData, biaya: e.target.value })}
                    placeholder="Rp..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Tahapan Proses Analis (Custom Text Input + Quick Preset Chips) */}
          <div className={`rounded-2xl p-4 border ${
            isAnalis ? "bg-purple-50/70 border-purple-200" : "bg-emerald-50/70 border-emerald-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-black flex items-center gap-1.5 ${
                isAnalis ? "text-purple-950" : "text-emerald-950"
              }`}>
                <Activity size={15} className={isAnalis ? "text-purple-700" : "text-emerald-700"} />
                <span>Tahapan Proses Pengujian (Bisa Diketik Custom oleh Analis) *</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isAnalis ? "text-purple-800 bg-purple-100 border border-purple-200" : "text-emerald-700 bg-emerald-100"
              }`}>
                Info Tracking Realtime
              </span>
            </div>
            
            <input
              type="text"
              required
              value={formData.tahap_proses}
              onChange={(e) => setFormData({ ...formData, tahap_proses: e.target.value })}
              placeholder="Ketik tahapan pengujian saat ini (contoh: 3. Destruksi / Ekstraksi Kimia di Lab)..."
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-bold outline-none shadow-sm ${
                isAnalis ? "border-purple-300 text-purple-950 focus:border-purple-600" : "border-emerald-300 text-emerald-950 focus:border-emerald-600"
              }`}
            />

            {/* Quick Template Chips for Tahap */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
              <span className={`text-[10px] font-bold ${isAnalis ? "text-purple-900" : "text-emerald-800"}`}>Pilihan Cepat Tahap:</span>
              {TAHAP_PROSES_OPTIONS.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, tahap_proses: t }))}
                  className={`rounded-lg bg-white border px-2 py-0.5 text-[10px] font-bold transition shadow-2xs ${
                    isAnalis
                      ? "border-purple-200 text-purple-800 hover:bg-purple-600 hover:text-white"
                      : "border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Parameter Uji Lab (Catatan Analis) */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag size={14} className={isAnalis ? "text-purple-600" : "text-brand-600"} />
                <span>Parameter Uji Analisis</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Contoh: Tekstur, pH H2O, C-org, N-tot, P-tsd, K-tsd</span>
            </label>
            <textarea
              rows={2}
              value={formData.parameter_uji}
              onChange={(e) => setFormData({ ...formData, parameter_uji: e.target.value })}
              placeholder="Ketik parameter pengujian (contoh: Tekstur, kadar air, pH H2O, pH KCl, C-org, N-tot, P-tsd, K-tsd, NTK, KTK)..."
              className={`w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs outline-none font-medium ${
                isAnalis ? "focus:border-purple-500" : "focus:border-brand-500"
              }`}
            />
            {/* Quick Preset Buttons */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-bold text-slate-400">Pilihan Cepat:</span>
              {PARAMETER_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      parameter_uji: prev.parameter_uji ? `${prev.parameter_uji}, ${p}` : p,
                    }))
                  }
                  className={`rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition ${
                    isAnalis
                      ? "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                      : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                  }`}
                >
                  + {p.split(',')[0]}...
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Status Pembayaran & Status Pengujian */}
          <div className={`grid gap-4 ${isAnalis ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {/* Status Pembayaran HANYA untuk Admin & Petugas Lab */}
            {!isAnalis && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-brand-600" />
                  <span>Status Pembayaran *</span>
                </label>
                <select
                  value={formData.status_bayar}
                  onChange={(e) => setFormData({ ...formData, status_bayar: e.target.value })}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-black outline-none ${
                    formData.status_bayar === 'Lunas'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 focus:border-emerald-500'
                      : 'border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500'
                  }`}
                >
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Status Tahapan Pengujian *
                </label>
                <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  5 Tahapan Urut
                </span>
              </div>
              <select
                value={formData.status_uji}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  const stageObj = STATUS_UJI_STAGES.find((s) => s.value === newStatus);
                  setFormData((prev) => ({
                    ...prev,
                    status_uji: newStatus,
                    status_bayar: newStatus === "Pembayaran" ? "Belum Bayar" : "Lunas",
                    tahap_proses: stageObj ? stageObj.defaultTahap : prev.tahap_proses,
                    tanggal_selesai:
                      newStatus === "Selesai" && !prev.tanggal_selesai
                        ? new Date().toISOString().slice(0, 10)
                        : prev.tanggal_selesai,
                  }));
                }}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold outline-none ${
                  isAnalis ? "focus:border-purple-500" : "focus:border-emerald-500"
                }`}
              >
                {STATUS_UJI_STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>

              {/* Quick Select Stage Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2">
                {STATUS_UJI_STAGES.map((st) => {
                  const isCurrent = formData.status_uji === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          status_uji: st.value,
                          status_bayar: st.value === "Pembayaran" ? "Belum Bayar" : "Lunas",
                          tahap_proses: st.defaultTahap,
                          tanggal_selesai:
                            st.value === "Selesai" && !prev.tanggal_selesai
                              ? new Date().toISOString().slice(0, 10)
                              : prev.tanggal_selesai,
                        }));
                      }}
                      className={`rounded-xl px-2 py-1.5 text-[10px] font-black border transition text-center flex flex-col items-center justify-center gap-0.5 ${
                        isCurrent
                          ? `${st.badgeClass} ring-2 ring-purple-500 shadow-sm`
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs">{st.icon}</span>
                      <span className="truncate w-full text-[9px]">{st.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Tanggal Selesai Uji</span>
                <span className="text-[10px] text-slate-400 font-normal">Diisi jika telah selesai</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.tanggal_selesai}
                  onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                  className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none ${
                    isAnalis ? "focus:border-purple-500" : "focus:border-emerald-500"
                  }`}
                />
                <Calendar size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section 5: Catatan & Keterangan Analis (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className={isAnalis ? "text-purple-600" : "text-emerald-600"} />
                <span>Catatan &amp; Keterangan Analis Petugas</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal italic">Opsional</span>
            </label>

            <textarea
              rows={3}
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Tuliskan catatan teknis hasil analisis pengujian atau instruksi khusus..."
              className={`w-full rounded-2xl border border-slate-200 p-3.5 text-xs outline-none leading-relaxed ${
                isAnalis ? "focus:border-purple-500" : "focus:border-emerald-500"
              }`}
            />

            {/* Template Cepat */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> Template Cepat:
              </span>
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, keterangan: tmpl.text }))}
                  className={`rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 transition ${
                    isAnalis ? "hover:bg-purple-50 hover:text-purple-700" : "hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Upload Dokumen LHU (PDF) - Khusus Admin & Petugas Lab */}
          {!isAnalis && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <UploadCloud size={15} className="text-emerald-600" />
                <span>Dokumen Sertifikat / Laporan Hasil Uji (PDF / LHU)</span>
              </label>

              {uploadedFileInfo || hasilDokumenUrl ? (
                <div className="flex items-center justify-between rounded-xl bg-white border border-emerald-200 p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 truncate max-w-xs">
                        {uploadedFileInfo?.name || 'Dokumen_LHU.pdf'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {uploadedFileInfo?.sizeText || 'Dokumen PDF terpasang'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasilDokumenUrl && (
                      <a
                        href={hasilDokumenUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
                        title="Preview Dokumen"
                      >
                        <Eye size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setHasilDokumenUrl('');
                        setUploadedFileInfo(null);
                      }}
                      className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
                      title="Hapus Dokumen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud size={28} className="text-slate-400 mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">
                    Klik untuk upload atau drag &amp; drop file PDF Sertifikat LHU
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Format PDF (Maks. 12 MB)</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition ${
                isAnalis
                  ? "bg-purple-700 hover:bg-purple-800 shadow-purple-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{isAnalis ? "Simpan Progres Analis" : "Simpan Perubahan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
