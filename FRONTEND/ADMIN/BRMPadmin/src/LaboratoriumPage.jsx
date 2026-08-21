import { ArrowLeft, CheckCircle2, Edit3, Eye, FileText, Filter, Plus, Search, Trash2, RefreshCw, Loader2, Save, X, ExternalLink, Pencil } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { internalLabService } from "./services/apiService";
import UpdateLabStatusModal from "./UpdateLabStatusModal";

const tabMeta = {
    "laboratorium-jenis-sampel": {
        title: "Kelola Jenis Sampel",
        breadcrumb: "Laboratorium / Jenis Sampel",
        description: "Tambah, ubah, dan hapus jenis sampel yang digunakan di laboratorium.",
    },
    "laboratorium-masuk": {
        title: "Data Masuk Laboratorium",
        breadcrumb: "Laboratorium / Masuk",
        description: "Kelola sampel pengujian yang sudah diterima, perbarui catatan/keterangan proses petugas, dan ubah status pengujian.",
    },
    "laboratorium-laporan-selesai": {
        title: "Laporan Lab Selesai",
        breadcrumb: "Laboratorium / Laporan Selesai",
        description: "Daftar laporan hasil uji laboratorium yang telah selesai diproses dan siap diunduh.",
    },
};

const statusStyles = {
    Selesai: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Proses: "bg-amber-100 text-amber-800 border border-amber-200",
    Diterima: "bg-sky-100 text-sky-800 border border-sky-200",
};

export default function LaboratoriumPage({ activeTab, onNavigate }) {
    const current = tabMeta[activeTab] ?? tabMeta["laboratorium-jenis-sampel"];
    const [labSamples, setLabSamples] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState(null);

    // Modal Edit Status & Keterangan Petugas
    const [editModalItem, setEditModalItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Jenis Sampel State
    const [sampleRows, setSampleRows] = useState(() => {
        const saved = localStorage.getItem("brmp_sample_types");
        return saved ? JSON.parse(saved) : [
            { no: 1, name: "Tanah / Soil" },
            { no: 2, name: "Pupuk Organik" },
            { no: 3, name: "Tanaman / Daun" },
            { no: 4, name: "Benih Padi" },
            { no: 5, name: "Air Irigasi" },
        ];
    });
    const [newSample, setNewSample] = useState("");
    const [editingSampleId, setEditingSampleId] = useState(null);
    const [editingSampleName, setEditingSampleName] = useState("");

    // Form Tambah Sampel Masuk
    const [newEntry, setNewEntry] = useState({
        nama_pemohon: "",
        kode_tracking: `LAB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        status_uji: "Proses",
        keterangan: "",
        hasil_dokumen_url: "",
    });

    // 1. Fetch live data laboratorium dari backend
    const fetchLabData = async () => {
        setIsLoading(true);
        try {
            const res = await internalLabService.getAll();
            if (res && res.success && Array.isArray(res.data)) {
                setLabSamples(res.data);
            }
        } catch (err) {
            console.warn("Lab fetch:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLabData();
    }, []);

    // Filtered data
    const filteredSamples = useMemo(() => {
        return labSamples.filter((row) =>
            (row.nama_pemohon || "").toLowerCase().includes(search.toLowerCase()) ||
            (row.kode_tracking || "").toLowerCase().includes(search.toLowerCase()) ||
            (row.keterangan || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [labSamples, search]);

    const finishedSamples = useMemo(() => {
        return filteredSamples.filter((row) => row.status_uji === "Selesai");
    }, [filteredSamples]);

    // Handle Jenis Sampel
    const addSampleType = () => {
        const name = newSample.trim();
        if (!name) return;
        const updated = [...sampleRows, { no: sampleRows.length + 1, name }];
        setSampleRows(updated);
        localStorage.setItem("brmp_sample_types", JSON.stringify(updated));
        setNewSample("");
    };

    const saveSampleType = () => {
        if (!editingSampleName.trim()) return;
        const updated = sampleRows.map((r) => r.no === editingSampleId ? { ...r, name: editingSampleName.trim() } : r);
        setSampleRows(updated);
        localStorage.setItem("brmp_sample_types", JSON.stringify(updated));
        setEditingSampleId(null);
        setEditingSampleName("");
    };

    const deleteSampleType = (no) => {
        const updated = sampleRows.filter((r) => r.no !== no);
        setSampleRows(updated);
        localStorage.setItem("brmp_sample_types", JSON.stringify(updated));
    };

    // Handle Create Sampel Masuk
    const handleCreateLab = async (e) => {
        e.preventDefault();
        if (!newEntry.nama_pemohon.trim()) {
            alert("Nama pemohon wajib diisi.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await internalLabService.create(newEntry);
            if (res && res.success) {
                setNotification(`Sampel baru [${res.data?.kode_tracking || newEntry.kode_tracking}] berhasil didaftarkan!`);
                setNewEntry({
                    nama_pemohon: "",
                    kode_tracking: `LAB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                    status_uji: "Proses",
                    keterangan: "",
                    hasil_dokumen_url: "",
                });
                fetchLabData();
                setTimeout(() => setNotification(null), 3500);
            }
        } catch (err) {
            alert(err.message || "Gagal membuat sampel laboratorium.");
        } finally {
            setActionLoading(false);
        }
    };

    // Toggle status sample
    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === "Proses" ? "Selesai" : currentStatus === "Diterima" ? "Proses" : "Proses";
        setActionLoading(true);
        try {
            await internalLabService.updateStatus(id, { status_uji: nextStatus });
            setLabSamples((prev) =>
                prev.map((item) => (item.id === id ? { ...item, status_uji: nextStatus } : item))
            );
            setNotification(`Status sampel berhasil diubah ke '${nextStatus}'.`);
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            alert(err.message || "Gagal mengupdate status.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            {/* Header */}
            <header className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <button onClick={() => onNavigate?.("dashboard")} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                            <ArrowLeft size={14} />
                            Kembali ke dashboard
                        </button>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">{current.breadcrumb}</p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{current.title}</h1>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{current.description}</p>
                    </div>

                    <button
                        onClick={fetchLabData}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 self-start"
                    >
                        <RefreshCw size={15} className={isLoading ? "animate-spin text-brand-600" : ""} />
                        <span>Refresh Data</span>
                    </button>
                </div>
            </header>

            {/* Notification */}
            {notification && (
                <div className="rounded-2xl bg-emerald-600 text-white p-4 shadow-lg flex items-center justify-between animate-fadeIn">
                    <span className="font-bold text-sm">{notification}</span>
                    <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
                </div>
            )}

            {/* SUB-VIEW 1: JENIS SAMPEL */}
            {activeTab === "laboratorium-jenis-sampel" && (
                <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Daftar Kategori & Jenis Sampel</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSample}
                                onChange={(e) => setNewSample(e.target.value)}
                                placeholder="Tambah jenis sampel baru..."
                                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-brand-500 w-60"
                            />
                            <button
                                onClick={addSampleType}
                                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 shadow-sm"
                            >
                                + Tambah
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">No</th>
                                    <th className="px-4 py-3 text-left">Nama Jenis Sampel</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {sampleRows.map((row) => (
                                    <tr key={row.no} className="hover:bg-slate-50">
                                        <td className="px-4 py-3.5 text-slate-400 font-mono">{row.no}</td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                                            {editingSampleId === row.no ? (
                                                <input
                                                    type="text"
                                                    value={editingSampleName}
                                                    onChange={(e) => setEditingSampleName(e.target.value)}
                                                    className="rounded-lg border border-brand-400 px-2 py-1 text-xs outline-none"
                                                />
                                            ) : (
                                                row.name
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            {editingSampleId === row.no ? (
                                                <div className="inline-flex gap-2">
                                                    <button onClick={saveSampleType} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={15} /></button>
                                                    <button onClick={() => setEditingSampleId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={15} /></button>
                                                </div>
                                            ) : (
                                                <div className="inline-flex gap-2">
                                                    <button onClick={() => { setEditingSampleId(row.no); setEditingSampleName(row.name); }} className="p-1 text-slate-500 hover:text-brand-600"><Edit3 size={15} /></button>
                                                    <button onClick={() => deleteSampleType(row.no)} className="p-1 text-rose-500 hover:text-rose-700"><Trash2 size={15} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* SUB-VIEW 2: DATA MASUK LABORATORIUM */}
            {activeTab === "laboratorium-masuk" && (
                <>
                    {/* Form Tambah Sampel Baru */}
                    <form onSubmit={handleCreateLab} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 mb-4">Pendaftaran Sampel Masuk Baru</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pemohon / Instansi *</label>
                                <input
                                    required
                                    type="text"
                                    value={newEntry.nama_pemohon}
                                    onChange={(e) => setNewEntry((prev) => ({ ...prev, nama_pemohon: e.target.value }))}
                                    placeholder="Contoh: Kelompok Tani Sleman"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Tracking / SPK</label>
                                <input
                                    type="text"
                                    value={newEntry.kode_tracking}
                                    onChange={(e) => setNewEntry((prev) => ({ ...prev, kode_tracking: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Awal</label>
                                <select
                                    value={newEntry.status_uji}
                                    onChange={(e) => setNewEntry((prev) => ({ ...prev, status_uji: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white font-semibold"
                                >
                                    <option value="Diterima">Diterima</option>
                                    <option value="Proses">Proses</option>
                                    <option value="Selesai">Selesai</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Analisis</label>
                                <input
                                    type="text"
                                    value={newEntry.keterangan}
                                    onChange={(e) => setNewEntry((prev) => ({ ...prev, keterangan: e.target.value }))}
                                    placeholder="Uji daya kecambah / kadar air"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-600 shadow-md shadow-brand-500/20 flex items-center gap-1.5"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                <span>Daftarkan Sampel</span>
                            </button>
                        </div>
                    </form>

                    {/* Tabel Sampel Masuk */}
                    <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-base font-bold text-slate-900">Daftar Seluruh Sampel Laboratorium</h3>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                                <Search size={14} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kode tracking atau pemohon..."
                                    className="bg-transparent text-xs outline-none w-48"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Kode Tracking</th>
                                        <th className="px-4 py-3 text-left">Pemohon</th>
                                        <th className="px-4 py-3 text-left">Keterangan & Catatan Proses</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi Petugas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {filteredSamples.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3.5 font-mono font-bold text-sky-800">{row.kode_tracking || `#${row.id}`}</td>
                                            <td className="px-4 py-3.5 font-semibold text-slate-800">{row.nama_pemohon}</td>
                                            <td className="px-4 py-3.5 text-slate-600 max-w-sm">
                                                <div className="line-clamp-2 leading-relaxed" title={row.keterangan || "Belum ada catatan proses"}>
                                                    {row.keterangan || <span className="text-slate-400 italic">Belum ada keterangan proses</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusStyles[row.status_uji] || "bg-slate-100"}`}>
                                                    {row.status_uji}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setEditModalItem(row);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                                                    >
                                                        <Pencil size={12} />
                                                        <span>Ubah Keterangan</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(row.id, row.status_uji)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                                                        title="Klik untuk ubah status cepat"
                                                    >
                                                        {row.status_uji === "Proses" ? "Tandai Selesai ✓" : "Set Proses"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {/* SUB-VIEW 3: LAPORAN LAB SELESAI */}
            {activeTab === "laboratorium-laporan-selesai" && (
                <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Hasil Pengujian Selesai</h3>
                            <p className="text-xs text-slate-500">Daftar sampel yang siap diunduh laporannya oleh masyarakat</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                            {finishedSamples.length} Laporan Selesai
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">Kode Tracking</th>
                                    <th className="px-4 py-3 text-left">Nama Pemohon</th>
                                    <th className="px-4 py-3 text-left">Keterangan / Hasil Akhir</th>
                                    <th className="px-4 py-3 text-left">Tanggal Selesai</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {finishedSamples.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-400">
                                            Belum ada laporan laboratorium yang berstatus selesai.
                                        </td>
                                    </tr>
                                ) : (
                                    finishedSamples.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3.5 font-mono font-bold text-sky-800">{row.kode_tracking || `#${row.id}`}</td>
                                            <td className="px-4 py-3.5 font-semibold text-slate-800">{row.nama_pemohon}</td>
                                            <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                                                <div className="line-clamp-2 leading-relaxed" title={row.keterangan || ""}>
                                                    {row.keterangan || <span className="text-slate-400 italic">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-500">
                                                {row.tanggal_selesai ? new Date(row.tanggal_selesai).toLocaleDateString("id-ID") : "Tersedia"}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                                                    Selesai
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {row.hasil_dokumen_url ? (
                                                        <a
                                                            href={row.hasil_dokumen_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                                                        >
                                                            <span>PDF</span>
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    ) : null}
                                                    <button
                                                        onClick={() => {
                                                            setEditModalItem(row);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Pencil size={11} />
                                                        <span>Edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Modal Update Keterangan & Status Uji Laboratorium */}
            <UpdateLabStatusModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditModalItem(null);
                }}
                trackingItem={editModalItem}
                onSuccess={() => {
                    fetchLabData();
                    setNotification("Keterangan proses dan status pengujian lab berhasil diperbarui!");
                    setTimeout(() => setNotification(null), 3500);
                }}
            />
        </div>
    );
}
