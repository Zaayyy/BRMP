import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CircleDashed,
    Search,
    RefreshCw,
    Send,
    Loader2,
    AlertCircle,
    User,
    Mail,
    Phone,
    Calendar,
    MessageSquareWarning,
    ExternalLink
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { internalPengaduanService } from "./services/apiService";

const statusStyles = {
    Selesai: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Diproses: "bg-amber-100 text-amber-800 border border-amber-200",
    Menunggu: "bg-violet-100 text-violet-800 border border-violet-200",
    Ditolak: "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function PermohonanPage({ onNavigate }) {
    const [aduanList, setAduanList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [notification, setNotification] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Form Tanggapan Petugas State
    const [formTanggapan, setFormTanggapan] = useState({
        status_tanggapan: "Diproses",
        tanggapan_petugas: "",
    });

    // 1. Fetch seluruh data pengaduan masuk dari backend (GET /api/internal/pengaduan)
    const fetchAduan = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const res = await internalPengaduanService.getAll();
            if (res && res.success && Array.isArray(res.data)) {
                setAduanList(res.data);
                if (res.data.length > 0 && !selectedId) {
                    setSelectedId(res.data[0].id);
                    setFormTanggapan({
                        status_tanggapan: res.data[0].status_tanggapan || "Diproses",
                        tanggapan_petugas: res.data[0].tanggapan_petugas || "",
                    });
                }
            }
        } catch (err) {
            setErrorMsg(err.message || "Gagal memuat daftar pengaduan dari backend.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAduan();
    }, []);

    // Item yang sedang dipilih
    const selectedItem = useMemo(() => {
        return aduanList.find((item) => item.id === selectedId) || aduanList[0] || null;
    }, [aduanList, selectedId]);

    // Update form when selected item changes
    useEffect(() => {
        if (selectedItem) {
            setFormTanggapan({
                status_tanggapan: selectedItem.status_tanggapan || "Diproses",
                tanggapan_petugas: selectedItem.tanggapan_petugas || "",
            });
        }
    }, [selectedItem]);

    // Filter pencarian dan status
    const filteredAduan = useMemo(() => {
        return aduanList.filter((item) => {
            const matchSearch =
                (item.nama_pelapor || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.kode_tracking || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.email_pelapor || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.isi_pengaduan || "").toLowerCase().includes(search.toLowerCase());

            const matchStatus = filterStatus === "Semua" || item.status_tanggapan === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [aduanList, search, filterStatus]);

    // Hitung statistik
    const summaryStats = useMemo(() => {
        const total = aduanList.length;
        const menunggu = aduanList.filter((a) => a.status_tanggapan === "Menunggu").length;
        const diproses = aduanList.filter((a) => a.status_tanggapan === "Diproses").length;
        const selesai = aduanList.filter((a) => a.status_tanggapan === "Selesai").length;
        return [
            { label: "Total Laporan Masuk", value: total, detail: "Keseluruhan pengaduan publik" },
            { label: "Menunggu Tindak Lanjut", value: menunggu, detail: "Butuh verifikasi awal petugas" },
            { label: "Sedang Diproses", value: diproses, detail: "Dalam penanganan tim teknis" },
            { label: "Selesai Ditanggapi", value: selesai, detail: "Sudah diberikan respon resmi" },
        ];
    }, [aduanList]);

    // Handle Simpan Tanggapan Petugas (PUT /api/internal/pengaduan/:id/tanggapan)
    const handleSaveTanggapan = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setIsSaving(true);
        try {
            const payload = {
                status_tanggapan: formTanggapan.status_tanggapan,
                tanggapan_petugas: formTanggapan.tanggapan_petugas.trim() || null,
            };

            const res = await internalPengaduanService.tanggap(selectedItem.id, payload);

            if (res && res.success) {
                // Update local state
                setAduanList((prev) =>
                    prev.map((item) =>
                        item.id === selectedItem.id
                            ? { ...item, ...payload, tanggal_tanggapan: new Date().toISOString() }
                            : item
                    )
                );
                setNotification(`Tanggapan untuk tiket [${selectedItem.kode_tracking}] berhasil disimpan!`);
                setTimeout(() => setNotification(null), 4000);
            }
        } catch (err) {
            alert(err.message || "Gagal menyimpan tanggapan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
            {/* Header */}
            <header className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <button
                            onClick={() => onNavigate?.("dashboard")}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                            <ArrowLeft size={14} />
                            Kembali ke Dashboard
                        </button>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                            Pengaduan & Permohonan Layanan Masuk
                        </p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Daftar Laporan & Pengaduan Masyarakat
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Tinjau laporan masuk dari masyarakat, periksa identitas & bukti, dan berikan tanggapan resmi petugas.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={fetchAduan}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin text-emerald-600" : ""} />
                            <span>Segarkan Data</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Notification Toast */}
            {notification && (
                <div className="rounded-2xl bg-emerald-600 text-white p-4 shadow-lg flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={20} />
                        <span className="font-bold text-sm">{notification}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
                </div>
            )}

            {/* Error Message */}
            {errorMsg && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center gap-3">
                    <AlertCircle size={18} className="text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Stat Cards */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryStats.map((item) => (
                    <article key={item.label} className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                        <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{item.value}</p>
                        <p className="mt-1 text-xs font-semibold text-emerald-700">{item.detail}</p>
                    </article>
                ))}
            </section>

            {/* Main Layout: Tabel Laporan (Kiri) & Detail + Form Tanggapan (Kanan) */}
            <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
                {/* 1. TABEL DAFTAR LAPORAN MASUK */}
                <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Laporan Pengaduan Masuk</h2>
                            <p className="text-xs text-slate-500">Pilih baris pada tabel untuk membaca isi laporan lengkap</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Filter Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="Menunggu">Menunggu</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Ditolak">Ditolak</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode tiket, nama pelapor, email, atau kata kunci..."
                            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none"
                        />
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-3.5 py-3 text-left">Kode Tiket</th>
                                    <th className="px-3.5 py-3 text-left">Pelapor</th>
                                    <th className="px-3.5 py-3 text-left">Tgl Masuk</th>
                                    <th className="px-3.5 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {filteredAduan.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-400">
                                            Tidak ada laporan pengaduan yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAduan.map((row) => {
                                        const isSelected = (selectedItem && selectedItem.id === row.id);
                                        return (
                                            <tr
                                                key={row.id}
                                                onClick={() => setSelectedId(row.id)}
                                                className={`cursor-pointer transition ${
                                                    isSelected ? "bg-emerald-50/80 font-semibold" : "hover:bg-slate-50"
                                                }`}
                                            >
                                                <td className="px-3.5 py-3.5 font-mono text-emerald-800 font-bold">
                                                    {row.kode_tracking}
                                                </td>
                                                <td className="px-3.5 py-3.5">
                                                    <div className="font-bold text-slate-900">{row.nama_pelapor}</div>
                                                    <div className="text-[11px] text-slate-400">{row.email_pelapor || row.no_telp_pelapor || "-"}</div>
                                                </td>
                                                <td className="px-3.5 py-3.5 text-slate-500">
                                                    {row.tanggal ? new Date(row.tanggal).toLocaleDateString("id-ID") : "-"}
                                                </td>
                                                <td className="px-3.5 py-3.5">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${statusStyles[row.status_tanggapan] || "bg-slate-100 text-slate-700"}`}>
                                                        {row.status_tanggapan}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                {/* 2. DETAIL LAPORAN & FORM TANGGAPAN PETUGAS */}
                <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    {selectedItem ? (
                        <div className="space-y-5">
                            {/* Header Detail */}
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                        {selectedItem.kode_tracking}
                                    </span>
                                    <h3 className="mt-2 text-lg font-black text-slate-900">
                                        Detail Laporan #{selectedItem.id}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Diterima pada: {selectedItem.tanggal ? new Date(selectedItem.tanggal).toLocaleString("id-ID") : "-"}
                                    </p>
                                </div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusStyles[selectedItem.status_tanggapan] || "bg-slate-100 text-slate-700"}`}>
                                    {selectedItem.status_tanggapan}
                                </span>
                            </div>

                            {/* Data Pelapor Box */}
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <div className="text-slate-400 font-semibold mb-0.5">Nama Pelapor:</div>
                                    <div className="font-bold text-slate-800 text-sm">{selectedItem.nama_pelapor}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 font-semibold mb-0.5">No. Telepon / WhatsApp:</div>
                                    <div className="font-bold text-slate-800">
                                        {selectedItem.no_telp_pelapor ? (
                                            <a
                                                href={`https://wa.me/${selectedItem.no_telp_pelapor.replace(/^0/, '62')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                                            >
                                                {selectedItem.no_telp_pelapor}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : "-"}
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <div className="text-slate-400 font-semibold mb-0.5">Email Pelapor:</div>
                                    <div className="font-bold text-slate-800">{selectedItem.email_pelapor || "-"}</div>
                                </div>
                            </div>

                            {/* Isi Uraian Pengaduan */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Uraian / Isi Laporan dari Masyarakat:
                                </label>
                                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 leading-relaxed whitespace-pre-line font-medium">
                                    {selectedItem.isi_pengaduan || "Tidak ada isi laporan."}
                                </div>
                            </div>

                            {/* Form Input Balasan Petugas */}
                            <form onSubmit={handleSaveTanggapan} className="space-y-4 pt-2 border-t border-slate-100">
                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <MessageSquareWarning size={16} className="text-emerald-600" />
                                    <span>Tanggapi Laporan Ini</span>
                                </h4>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Update Status Tindak Lanjut:
                                    </label>
                                    <select
                                        value={formTanggapan.status_tanggapan}
                                        onChange={(e) => setFormTanggapan((prev) => ({ ...prev, status_tanggapan: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                    >
                                        <option value="Menunggu">🟡 Menunggu (Belum Ditindaklanjuti)</option>
                                        <option value="Diproses">🔵 Diproses (Sedang Ditangani Petugas)</option>
                                        <option value="Selesai">🟢 Selesai (Tanggapan Diterbitkan)</option>
                                        <option value="Ditolak">🔴 Ditolak (Laporan Tidak Sesuai)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Tuliskan Balasan / Tanggapan Resmi Petugas:
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formTanggapan.tanggapan_petugas}
                                        onChange={(e) => setFormTanggapan((prev) => ({ ...prev, tanggapan_petugas: e.target.value }))}
                                        placeholder="Contoh: Laporan Anda telah kami tindak lanjuti bersama tim pengawas lapangan..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-none leading-relaxed"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        * Tanggapan ini akan dapat dilihat oleh pelapor saat mengecek kode tiket di menu Pelacakan Publik.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition disabled:opacity-75"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    <span>{isSaving ? "Menyimpan..." : "Simpan Tanggapan Resmi"}</span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-slate-400">
                            <p className="font-semibold text-sm">Pilih laporan dari tabel di sebelah kiri untuk melihat rincian.</p>
                        </div>
                    )}
                </article>
            </section>
        </div>
    );
}
