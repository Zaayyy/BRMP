import { useMemo, useState, useEffect } from "react";
import { Plus, Search, Trash2, Pencil, RefreshCw, Check, X, Loader2, AlertCircle, Upload, Image as ImageIcon } from "lucide-react";
import { internalBenihService } from "./services/apiService";

export default function BenihPage({ activeTab, onNavigate }) {
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ nama_benih: "", stok: "", deskripsi: "", gambar_url: "" });

    const title = activeTab === "benih-update-benih" ? "Update Benih" : "Jenis Benih";
    const breadcrumb = activeTab === "benih-update-benih" ? "Data Benih / Update Benih" : "Data Benih / Jenis Benih";

    // 1. Fetch live data benih dari backend (GET /api/internal/benih)
    const fetchBenih = async () => {
        setIsLoading(true);
        try {
            const res = await internalBenihService.getAll();
            if (res && res.success && Array.isArray(res.data)) {
                setRows(res.data);
            }
        } catch (error) {
            console.warn("Gagal memuat benih dari server:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBenih();
    }, []);

    const filteredRows = useMemo(() => {
        return rows.filter((row) =>
            (row.nama_benih || "").toLowerCase().includes(search.toLowerCase()) ||
            (row.deskripsi || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [search, rows]);

    function startEdit(row) {
        setEditingId(row.id);
        setEditValues({
            nama_benih: row.nama_benih || row.namaBenih || "",
            stok: row.stok !== undefined ? row.stok : 0,
            deskripsi: row.deskripsi || "",
            gambar_url: row.gambar_url || row.gambarUrl || "",
        });
    }

    const handleEditImageFile = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
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
                const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
                setEditValues((prev) => ({ ...prev, gambar_url: dataUrl }));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    async function saveEdit(id) {
        setActionLoading(true);
        try {
            const payload = {
                nama_benih: editValues.nama_benih.trim(),
                stok: parseInt(editValues.stok, 10) || 0,
                deskripsi: editValues.deskripsi.trim(),
                gambar_url: editValues.gambar_url.trim() || null,
            };

            // Panggil API PUT /api/internal/benih/:id
            await internalBenihService.update(id, payload);

            setRows((prev) =>
                prev.map((row) => (row.id === id ? { ...row, ...payload } : row))
            );
            setEditingId(null);
            setNotification("Data benih berhasil diperbarui di database!");
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            alert(error.message || "Gagal memperbarui data benih.");
        } finally {
            setActionLoading(false);
        }
    }

    async function deleteRow(id, nama) {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus benih '${nama || id}'?`)) return;

        setActionLoading(true);
        try {
            // Panggil API DELETE /api/internal/benih/:id
            await internalBenihService.delete(id);

            setRows((prev) => prev.filter((row) => row.id !== id));
            setNotification(`Data benih '${nama}' berhasil dihapus.`);
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            alert(error.message || "Gagal menghapus benih.");
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">{breadcrumb}</p>
                        <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchBenih}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
                        >
                            <RefreshCw size={15} className={isLoading ? "animate-spin text-brand-600" : ""} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => onNavigate?.("benih-tambah-jenis-benih")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 shadow-md shadow-brand-500/20"
                        >
                            <Plus size={16} /> Tambah Benih Baru
                        </button>
                    </div>
                </div>
            </section>

            {/* Notification */}
            {notification && (
                <div className="rounded-2xl bg-emerald-600 text-white p-4 shadow-lg flex items-center justify-between animate-fadeIn">
                    <span className="font-bold text-sm">{notification}</span>
                    <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
                </div>
            )}

            {/* Filter Search */}
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama benih atau deskripsi..."
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Total: {filteredRows.length} Jenis Benih
                    </span>
                </div>
            </section>

            {/* Tabel Data Benih */}
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-slate-50 p-2">
                    <table className="min-w-full text-sm text-slate-700">
                        <thead className="bg-white text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                            <tr>
                                <th className="px-4 py-3.5">ID</th>
                                <th className="px-4 py-3.5">Foto</th>
                                <th className="px-4 py-3.5">Nama Benih</th>
                                <th className="px-4 py-3.5">Stok Tersedia (kg)</th>
                                <th className="px-4 py-3.5">Deskripsi Singkat</th>
                                <th className="px-4 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredRows.map((row) => {
                                const isEditing = editingId === row.id;

                                return (
                                    <tr key={row.id} className="bg-white hover:bg-slate-50 transition">
                                        <td className="px-4 py-4 font-mono text-xs font-bold text-slate-400">
                                            #{row.id}
                                        </td>
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <label className="relative group/img block h-12 w-12 cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition shadow-sm">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleEditImageFile(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <img
                                                        src={editValues.gambar_url || row.gambar_url || row.gambarUrl || "https://images.unsplash.com/photo-1524591902995-a986c4cc0367?auto=format&fit=crop&w=72&q=80"}
                                                        alt={row.nama_benih || row.namaBenih || "Benih"}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524591902995-a986c4cc0367?auto=format&fit=crop&w=72&q=80"; }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition">
                                                        <Upload size={14} />
                                                    </div>
                                                </label>
                                            ) : (
                                                <img
                                                    src={row.gambar_url || row.gambarUrl || "https://images.unsplash.com/photo-1524591902995-a986c4cc0367?auto=format&fit=crop&w=72&q=80"}
                                                    alt={row.nama_benih || row.namaBenih || "Benih"}
                                                    className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                                                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524591902995-a986c4cc0367?auto=format&fit=crop&w=72&q=80"; }}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-900">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editValues.nama_benih}
                                                    onChange={(e) => setEditValues((prev) => ({ ...prev, nama_benih: e.target.value }))}
                                                    className="w-full rounded-xl border border-emerald-300 px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            ) : (
                                                row.nama_benih || row.namaBenih || "-"
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editValues.stok}
                                                    onChange={(e) => setEditValues((prev) => ({ ...prev, stok: e.target.value }))}
                                                    className="w-24 rounded-xl border border-brand-300 px-3 py-1.5 text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-brand-500"
                                                />
                                            ) : (
                                                <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    {row.stok} kg
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editValues.deskripsi}
                                                    onChange={(e) => setEditValues((prev) => ({ ...prev, deskripsi: e.target.value }))}
                                                    className="w-full rounded-xl border border-brand-300 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                                />
                                            ) : (
                                                row.deskripsi || "-"
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(row.id)}
                                                            disabled={actionLoading}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                                                            title="Simpan"
                                                        >
                                                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                            title="Batal"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(row)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 transition"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteRow(row.id, row.nama_benih)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
