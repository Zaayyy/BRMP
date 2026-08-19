import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { internalBenihService } from "./services/apiService";

export default function AddBenihPage({ onNavigate }) {
    const [form, setForm] = useState({
        nama_benih: "",
        stok: "",
        deskripsi: "",
        gambar_url: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

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
                gambar_url: form.gambar_url.trim() || null,
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
                <div className="space-y-5">
                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Nama Benih / Varietas *
                        <input
                            required
                            value={form.nama_benih}
                            onChange={(e) => setForm((prev) => ({ ...prev, nama_benih: e.target.value }))}
                            placeholder="Contoh: Padi Inpari 32 HDB, Jagung Hibrida Bisi 18"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        />
                    </label>

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

                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        URL / Link Gambar Benih
                        <input
                            type="url"
                            value={form.gambar_url}
                            onChange={(e) => setForm((prev) => ({ ...prev, gambar_url: e.target.value }))}
                            placeholder="Contoh: /images/seed_padi.png atau https://..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        />
                    </label>

                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Deskripsi Lengkap Benih *
                        <textarea
                            required
                            value={form.deskripsi}
                            onChange={(e) => setForm((prev) => ({ ...prev, deskripsi: e.target.value }))}
                            placeholder="Tuliskan detail deskripsi varietas, masa tanam, potensi hasil (Ton/Ha), atau keunggulan spesifik di sini..."
                            rows={5}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white resize-none"
                        />
                    </label>
                </div>

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
                        disabled={isLoading}
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
