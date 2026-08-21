import { useState, useRef } from "react";
import {
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Trash2,
    Link as LinkIcon,
    RefreshCw,
    FileImage,
    Sparkles,
} from "lucide-react";
import { internalBenihService } from "./services/apiService";

export default function AddBenihPage({ onNavigate }) {
    const [form, setForm] = useState({
        nama_benih: "",
        stok: "",
        deskripsi: "",
        gambar_url: "",
    });

    const [imageMode, setImageMode] = useState("upload"); // 'upload' | 'url'
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const fileInputRef = useRef(null);

    // Fungsi kompresi dan optimasi gambar client-side (agar ringan, cepat, dan tajam)
    const processImageFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMsg("File yang dipilih harus berupa gambar (JPG, PNG, WebP, GIF).");
            return;
        }

        // Cek ukuran maks 8MB
        if (file.size > 8 * 1024 * 1024) {
            setErrorMsg("Ukuran file gambar maksimal 8MB.");
            return;
        }

        setImageProcessing(true);
        setErrorMsg(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Resize gambar jika terlalu besar (maks lebar/tinggi 1200px)
                const maxDim = 1200;
                let { width, height } = img;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Ekspor ke WebP / JPEG dengan kualitas 0.88
                const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.88);

                setImagePreview(optimizedDataUrl);
                setImageFile(file);
                setForm((prev) => ({ ...prev, gambar_url: optimizedDataUrl }));
                setImageProcessing(false);
            };

            img.onerror = () => {
                setErrorMsg("Gagal memproses file gambar.");
                setImageProcessing(false);
            };

            img.src = event.target.result;
        };

        reader.onerror = () => {
            setErrorMsg("Gagal membaca file gambar.");
            setImageProcessing(false);
        };

        reader.readAsDataURL(file);
    };

    // Handler Drag and Drop
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
            const file = e.dataTransfer.files[0];
            processImageFile(file);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            processImageFile(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setForm((prev) => ({ ...prev, gambar_url: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.nama_benih.trim() || !form.deskripsi.trim()) {
            setErrorMsg("Nama benih dan deskripsi wajib diisi.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const payload = {
                nama_benih: form.nama_benih.trim(),
                stok: parseInt(form.stok, 10) || 0,
                deskripsi: form.deskripsi.trim(),
                gambar_url: form.gambar_url ? form.gambar_url.trim() : null,
            };

            // Panggil API POST /api/internal/benih
            const response = await internalBenihService.create(payload);

            if (response && response.success) {
                setSuccessMsg(`Benih '${form.nama_benih}' berhasil ditambahkan ke katalog sistem!`);
                setTimeout(() => {
                    onNavigate?.("benih-jenis-benih");
                }, 1200);
            } else {
                setErrorMsg(response?.message || "Gagal menambahkan benih.");
            }
        } catch (error) {
            setErrorMsg(error.message || "Terjadi kesalahan saat menghubungi backend.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">HOME &gt; BENIH &gt; JENIS BENIH &gt; TAMBAH</p>
                <h1 className="mt-4 text-3xl font-black text-slate-900">Tambah Jenis Benih Baru</h1>
            </section>

            {/* Success Alert */}
            {successMsg && (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 animate-fadeIn">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="font-bold">{successMsg}</span>
                </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
                <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 animate-fadeIn">
                    <AlertCircle size={18} className="text-rose-600 shrink-0" />
                    <span className="font-medium">{errorMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                    {/* 1. Nama Benih */}
                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Nama Benih / Varietas *
                        <input
                            required
                            value={form.nama_benih}
                            onChange={(e) => setForm((prev) => ({ ...prev, nama_benih: e.target.value }))}
                            placeholder="Contoh: Padi Inpari 32 HDB, Jagung Hibrida Bisi 18, Kedelai Anjasmoro"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        />
                    </label>

                    {/* 2. Stok Awal */}
                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Stok Awal (kg)
                        <input
                            type="number"
                            min="0"
                            value={form.stok}
                            onChange={(e) => setForm((prev) => ({ ...prev, stok: e.target.value }))}
                            placeholder="Contoh: 500"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        />
                    </label>

                    {/* 3. Upload / Drag & Drop Gambar Benih */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                <ImageIcon size={16} className="text-brand-600" />
                                Foto / Gambar Benih
                            </span>

                            {/* Mode Switch Tabs */}
                            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageMode("upload");
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                                        imageMode === "upload"
                                            ? "bg-white text-brand-700 shadow-sm font-extrabold"
                                            : "hover:text-slate-900"
                                    }`}
                                >
                                    <Upload size={13} />
                                    Upload / Drag & Drop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageMode("url");
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                                        imageMode === "url"
                                            ? "bg-white text-brand-700 shadow-sm font-extrabold"
                                            : "hover:text-slate-900"
                                    }`}
                                >
                                    <LinkIcon size={13} />
                                    Link URL Online
                                </button>
                            </div>
                        </div>

                        {imageMode === "upload" ? (
                            <div>
                                {/* Hidden File Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {imagePreview || form.gambar_url?.startsWith("data:") ? (
                                    /* Image Preview Card */
                                    <div className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-brand-50/30 p-4 transition-all">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-brand-200 bg-white shadow-sm">
                                                <img
                                                    src={imagePreview || form.gambar_url}
                                                    alt="Preview benih"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                                    <CheckCircle2 size={12} />
                                                    Gambar Berhasil Diproses & Siap Disimpan
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 truncate max-w-md">
                                                    {imageFile?.name || "Foto Benih Terunggah"}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {imageFile
                                                        ? `${(imageFile.size / 1024).toFixed(1)} KB • ${imageFile.type}`
                                                        : "Gambar format optimal"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:bg-slate-50 shadow-sm"
                                                >
                                                    <RefreshCw size={13} />
                                                    Ganti Foto
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                                                >
                                                    <Trash2 size={13} />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Drag & Drop Upload Zone */
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                                            isDragging
                                                ? "border-brand-500 bg-brand-50/70 scale-[0.99] shadow-inner"
                                                : "border-slate-200 bg-slate-50 hover:border-brand-400 hover:bg-white hover:shadow-sm"
                                        }`}
                                    >
                                        <div
                                            className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${
                                                isDragging
                                                    ? "bg-brand-500 text-white"
                                                    : "bg-white text-brand-600 border border-slate-100"
                                            }`}
                                        >
                                            {imageProcessing ? (
                                                <Loader2 size={26} className="animate-spin text-brand-600" />
                                            ) : (
                                                <Upload size={26} />
                                            )}
                                        </div>

                                        <p className="text-sm font-bold text-slate-800">
                                            {imageProcessing
                                                ? "Sedang memproses & mengoptimasi gambar..."
                                                : isDragging
                                                ? "Lepaskan file gambar di sini!"
                                                : "Tarik & Lepas foto benih ke sini, atau klik untuk memilih file"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Mendukung JPG, PNG, WebP, GIF (Maks. 8MB). Otomatis dioptimalkan untuk performa cepat.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* URL Input Mode */
                            <div className="space-y-2">
                                <input
                                    type="url"
                                    value={form.gambar_url}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, gambar_url: e.target.value }));
                                        setImagePreview(e.target.value);
                                    }}
                                    placeholder="Tempel URL gambar langsung (contoh: https://images.unsplash.com/... atau /images/seed.png)"
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white font-mono text-xs"
                                />

                                {form.gambar_url && !form.gambar_url.startsWith("data:") && (
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                                        <img
                                            src={form.gambar_url}
                                            alt="Preview link"
                                            className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                        <span className="text-xs text-slate-600 truncate flex-1">
                                            Preview: {form.gambar_url}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. Deskripsi Lengkap Benih */}
                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Deskripsi Lengkap Benih *
                        <textarea
                            required
                            value={form.deskripsi}
                            onChange={(e) => setForm((prev) => ({ ...prev, deskripsi: e.target.value }))}
                            placeholder="Tuliskan detail deskripsi varietas, potensi hasil panen (Ton/Ha), umur tanaman, ketahanan hama/penyakit, dan rekomendasi ketinggian lahan..."
                            rows={5}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white resize-none"
                        />
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onNavigate?.("benih-jenis-benih")}
                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || imageProcessing}
                        className="rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 flex items-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        <span>{isLoading ? "Menyimpan..." : "Simpan ke Database"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
