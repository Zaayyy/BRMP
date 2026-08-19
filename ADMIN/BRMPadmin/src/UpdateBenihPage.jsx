import { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { internalBenihService } from "./services/apiService";

export default function UpdateBenihPage({ onNavigate }) {
    const [filter, setFilter] = useState("Semua Jenis Benih");
    const [benihList, setBenihList] = useState([]);
    const [stockHistory, setStockHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Muat data benih backend dan riwayat lokal
    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await internalBenihService.getAll();
            if (res && res.success && Array.isArray(res.data)) {
                setBenihList(res.data);
            }
        } catch (err) {
            console.warn("Gagal memuat total stok benih:", err.message);
        } finally {
            setIsLoading(false);
        }

        const localHistory = JSON.parse(localStorage.getItem("brmp_stock_history") || "[]");
        setStockHistory(localHistory);
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalStokTersedia = useMemo(() => {
        return benihList.reduce((acc, b) => acc + (b.stok || 0), 0);
    }, [benihList]);

    const filteredHistory = useMemo(
        () => stockHistory.filter((row) => filter === "Semua Jenis Benih" || row.nama === filter),
        [filter, stockHistory],
    );

    const deleteHistoryItem = (no) => {
        const updated = stockHistory.filter((row) => row.no !== no);
        setStockHistory(updated);
        localStorage.setItem("brmp_stock_history", JSON.stringify(updated));
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">HOME &gt; BENIH &gt; UPDATE BENIH</p>
                        <h1 className="mt-4 text-3xl font-black text-slate-900">Riwayat Update & Pergerakan Stok</h1>
                        <p className="mt-1 text-sm text-slate-500">Pantau dan kelola perubahan stok inventaris benih secara real-time.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
                        >
                            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                            <span>Refresh Stok</span>
                        </button>
                        <button
                            onClick={() => onNavigate?.("benih-tambah-update-stok")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 shadow-md shadow-brand-500/20"
                        >
                            <Plus size={16} />
                            Tambah Mutasi Stok
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                        <span className="text-sm font-semibold text-slate-700">Saring Benih:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none font-medium"
                        >
                            <option>Semua Jenis Benih</option>
                            {benihList.map((b) => (
                                <option key={b.id} value={b.nama_benih}>{b.nama_benih}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
                        Total {benihList.length} Jenis Benih Terdaftar
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 px-4 py-3 text-emerald-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black">🌱</div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Total Stok Tersedia di Database</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-800">{totalStokTersedia.toLocaleString("id-ID")} kg</p>
                        </div>
                    </div>
                </article>

                <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 rounded-3xl bg-sky-50 px-4 py-3 text-sky-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-black">📋</div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Riwayat Mutasi Tercatat</p>
                            <p className="mt-2 text-2xl font-bold text-sky-800">{stockHistory.length} Transaksi</p>
                        </div>
                    </div>
                </article>
            </section>

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">No</th>
                                <th className="px-4 py-3 text-left">Tanggal</th>
                                <th className="px-4 py-3 text-left">Jenis Benih</th>
                                <th className="px-4 py-3 text-left">Tipe Mutasi</th>
                                <th className="px-4 py-3 text-left">Jumlah</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white text-xs">
                            {filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-400">
                                        Belum ada riwayat mutasi stok. Klik "Tambah Mutasi Stok" untuk memperbarui inventaris.
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((row, idx) => (
                                    <tr key={row.no || idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                                        <td className="px-4 py-3 text-slate-600">{row.tanggal}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-900">{row.nama}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${row.jenis === "Masuk" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                                {row.jenis}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{row.jumlah}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => deleteHistoryItem(row.no)}
                                                className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
