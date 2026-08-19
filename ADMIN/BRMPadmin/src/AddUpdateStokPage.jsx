import { useState, useEffect } from "react";
import { internalBenihService } from "./services/apiService";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddUpdateStokPage({ onNavigate }) {
    const [benihList, setBenihList] = useState([]);
    const [form, setForm] = useState({
        benihId: "",
        keterangan: "Masuk",
        jumlah: "",
        tanggal: new Date().toISOString().slice(0, 10),
        catatan: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Ambil daftar benih live dari backend
    useEffect(() => {
        const fetchSeeds = async () => {
            try {
                const res = await internalBenihService.getAll();
                if (res && res.success && Array.isArray(res.data)) {
                    setBenihList(res.data);
                    if (res.data.length > 0) {
                        setForm((prev) => ({ ...prev, benihId: res.data[0].id }));
                    }
                }
            } catch (err) {
                console.warn("Gagal memuat benih:", err.message);
            }
        };
        fetchSeeds();
    }, []);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const selectedSeed = benihList.find((b) => String(b.id) === String(form.benihId));

        if (!selectedSeed) {
            setErrorMsg("Pilih jenis benih yang ingin diupdate.");
            return;
        }

        const delta = parseInt(form.jumlah, 10);
        if (isNaN(delta) || delta <= 0) {
            setErrorMsg("Jumlah harus berupa angka lebih dari 0.");
            return;
        }

        const currentStok = selectedSeed.stok || 0;
        let newStok = form.keterangan === "Masuk" ? currentStok + delta : currentStok - delta;

        if (newStok < 0) {
            setErrorMsg(`Stok keluar melebihi stok yang tersedia saat ini (${currentStok} kg).`);
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            // Update stok benih di database backend via PUT /api/internal/benih/:id
            await internalBenihService.update(selectedSeed.id, {
                stok: newStok,
            });

            // Simpan riwayat update ke localStorage untuk tampilan Riwayat Update
            const historyItem = {
                no: Date.now(),
                tanggal: form.tanggal,
                nama: selectedSeed.nama_benih,
                jenis: form.keterangan,
                jumlah: form.keterangan === "Masuk" ? `+${delta} kg` : `-${delta} kg`,
                catatan: form.catatan,
            };

            const existingHistory = JSON.parse(localStorage.getItem("brmp_stock_history") || "[]");
            localStorage.setItem("brmp_stock_history", JSON.stringify([historyItem, ...existingHistory]));

            setSuccessMsg(`Stok '${selectedSeed.nama_benih}' berhasil diupdate menjadi ${newStok} kg!`);
            setTimeout(() => {
                onNavigate?.("benih-update-benih");
            }, 1200);
        } catch (error) {
            setErrorMsg(error.message || "Gagal memperbarui stok di server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">HOME &gt; BENIH &gt; UPDATE BENIH &gt; TAMBAH</p>
                <h1 className="mt-4 text-3xl font-black text-slate-900">Tambah Update Stok</h1>
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
                <div className="grid gap-6 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                        Pilih Jenis Benih *
                        <select
                            value={form.benihId}
                            onChange={handleChange("benihId")}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        >
                            {benihList.length > 0 ? (
                                benihList.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nama_benih} (Stok Saat Ini: {b.stok} kg)
                                    </option>
                                ))
                            ) : (
                                <option value="">Memuat daftar benih...</option>
                            )}
                        </select>
                    </label>

                    <fieldset className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <legend className="px-2 text-sm font-medium text-slate-700">Keterangan Perubahan Stok</legend>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer transition hover:border-brand-400">
                                <input
                                    type="radio"
                                    name="keterangan"
                                    value="Masuk"
                                    checked={form.keterangan === "Masuk"}
                                    onChange={handleChange("keterangan")}
                                    className="h-4 w-4 text-brand-500"
                                />
                                🟢 Stok Masuk (Penambahan dari Produksi / Panen)
                            </label>
                            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer transition hover:border-brand-400">
                                <input
                                    type="radio"
                                    name="keterangan"
                                    value="Keluar"
                                    checked={form.keterangan === "Keluar"}
                                    onChange={handleChange("keterangan")}
                                    className="h-4 w-4 text-brand-500"
                                />
                                🔴 Stok Keluar (Distribusi / Penjualan Masyarakat)
                            </label>
                        </div>
                    </fieldset>

                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Jumlah (kg) *
                        <input
                            type="number"
                            min="1"
                            required
                            value={form.jumlah}
                            onChange={handleChange("jumlah")}
                            placeholder="Contoh: 150"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        />
                    </label>

                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                        Tanggal Update
                        <input
                            type="date"
                            value={form.tanggal}
                            onChange={handleChange("tanggal")}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
                        />
                    </label>

                    <label className="md:col-span-2 block space-y-2 text-sm font-medium text-slate-700">
                        Catatan Tambahan (Opsional)
                        <textarea
                            value={form.catatan}
                            onChange={handleChange("catatan")}
                            placeholder="Tulis rincian tambahan seperti asal benih atau instansi/kelompok tani penerima di sini..."
                            rows={4}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white resize-none"
                        />
                    </label>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onNavigate?.("benih-update-benih")}
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
                        <span>{isLoading ? "Memperbarui..." : "Simpan Update Stok"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
