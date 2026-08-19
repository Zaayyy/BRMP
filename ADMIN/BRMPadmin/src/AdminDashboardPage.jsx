import React, { useState, useEffect } from "react";
import {
    ArrowUpRight,
    CheckCircle2,
    ClipboardList,
    FlaskConical,
    Filter,
    Layers3,
    Search,
    Sprout,
    Users,
    RefreshCw
} from "lucide-react";
import { internalPengaduanService, internalLabService, internalBenihService, authService } from "./services/apiService";

const statusStyles = {
    Diterima: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Diproses: "bg-amber-100 text-amber-800 border border-amber-200",
    Selesai: "bg-sky-100 text-sky-800 border border-sky-200",
    Menunggu: "bg-violet-100 text-violet-800 border border-violet-200",
    Ditolak: "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function AdminDashboardPage({ onNavigate }) {
    const [user, setUser] = useState(authService.getUser());
    const [pengaduanList, setPengaduanList] = useState([]);
    const [labList, setLabList] = useState([]);
    const [benihList, setBenihList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [pRes, lRes, bRes] = await Promise.allSettled([
                internalPengaduanService.getAll(),
                internalLabService.getAll(),
                internalBenihService.getAll(),
            ]);

            if (pRes.status === "fulfilled" && pRes.value?.success && Array.isArray(pRes.value.data)) {
                setPengaduanList(pRes.value.data);
            }
            if (lRes.status === "fulfilled" && lRes.value?.success && Array.isArray(lRes.value.data)) {
                setLabList(lRes.value.data);
            }
            if (bRes.status === "fulfilled" && bRes.value?.success && Array.isArray(bRes.value.data)) {
                setBenihList(bRes.value.data);
            }
        } catch (err) {
            console.warn("Dashboard stats load:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Perhitungan Metrik Real-Time
    const totalStokBenih = benihList.reduce((sum, b) => sum + (b.stok || 0), 0);
    const labProsesCount = labList.filter((l) => l.status_uji === "Proses" || l.status_uji === "Diterima").length;

    const metrics = [
        {
            label: "Permohonan Masuk",
            value: pengaduanList.length.toString(),
            delta: `${pengaduanList.filter((p) => p.status_tanggapan === "Menunggu").length} baru`,
            accent: "text-emerald-700",
        },
        {
            label: "Sampel Lab Aktif",
            value: (labProsesCount || labList.length || 3).toString(),
            delta: "Diproses",
            accent: "text-sky-700",
        },
        {
            label: "Total Stok Benih",
            value: `${totalStokBenih.toLocaleString("id-ID")} kg`,
            delta: `${benihList.length} varietas`,
            accent: "text-amber-700",
        },
        {
            label: "Akun Petugas",
            value: user?.role === "Admin" ? "Superadmin" : "Petugas Lab",
            delta: "Aktif",
            accent: "text-emerald-700",
        },
    ];

    // Log Aktivitas
    const recentActivities = [
        ...(pengaduanList.slice(0, 2).map((p) => ({
            title: `Laporan [${p.kode_tracking}] masuk`,
            detail: `Dari ${p.nama_pelapor}: ${p.isi_pengaduan?.slice(0, 45)}...`,
            time: p.tanggal ? new Date(p.tanggal).toLocaleDateString("id-ID") : "Baru saja",
        }))),
        ...(benihList.slice(0, 1).map((b) => ({
            title: `Katalog benih '${b.nama_benih}'`,
            detail: `Stok tersedia: ${b.stok} kg. Data tersinkron ke website publik.`,
            time: "Hari ini",
        }))),
    ];

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Panel Admin Real-Time</p>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Ringkasan Operasional BRMP DIY
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                            Kelola permohonan masyarakat, laboratorium, katalog benih, dan pengguna dari satu dashboard terpadu.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={loadDashboardData}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin text-emerald-600" : ""} />
                            <span>Refresh Data</span>
                        </button>
                        <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-bold">
                                {user?.role === "PetugasLab" ? "LAB" : "ADM"}
                            </div>
                            <span>{user?.nama || "Administrator"}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Metrik Cards */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <article key={metric.label} className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
                        <div className="mt-3 flex items-end justify-between gap-3">
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{metric.value}</div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${metric.accent}`}>{metric.delta}</span>
                        </div>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                {/* Permohonan Terbaru */}
                <article className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Permohonan</p>
                            <h2 className="mt-2 text-xl font-black text-slate-900">Data permohonan masuk terbaru</h2>
                        </div>
                        <button
                            onClick={() => onNavigate?.("permohonan")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                            <span>Buka Halaman Permohonan</span>
                            <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <div className="mt-5 space-y-3">
                        {pengaduanList.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">Belum ada data permohonan masuk.</div>
                        ) : (
                            pengaduanList.slice(0, 4).map((request) => (
                                <div
                                    key={request.id}
                                    onClick={() => onNavigate?.("permohonan")}
                                    className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-100 transition"
                                >
                                    <div>
                                        <p className="text-xs font-bold font-mono tracking-wider text-brand-700">
                                            {request.kode_tracking}
                                        </p>
                                        <h3 className="mt-1 text-sm font-semibold text-slate-900">{request.nama_pelapor}</h3>
                                        <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                                            {request.isi_pengaduan || "Pengaduan Layanan"}
                                        </p>
                                    </div>
                                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${statusStyles[request.status_tanggapan] || "bg-slate-100 text-slate-700"}`}>
                                        {request.status_tanggapan}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </article>

                {/* Log Aktivitas & Shortcut */}
                <div className="flex flex-col gap-6">
                    <article className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Aktivitas</p>
                        <h2 className="mt-2 text-xl font-black text-slate-900">Log aktivitas terkini</h2>
                        <div className="mt-5 space-y-3">
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{activity.title}</h3>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">{activity.detail}</p>
                                        <p className="mt-2 text-[11px] font-medium text-slate-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Aksi cepat</p>
                        <h2 className="mt-2 text-xl font-black text-slate-900">Shortcut operasional</h2>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <button
                                onClick={() => onNavigate?.("permohonan")}
                                className="flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-4 text-left transition hover:bg-brand-100"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Tanggapi Laporan Masuk</p>
                                    <p className="mt-1 text-xs text-slate-500">Tindak lanjuti aduan masyarakat</p>
                                </div>
                                <ClipboardList className="text-brand-700" size={18} />
                            </button>
                            <button
                                onClick={() => onNavigate?.("benih-jenis-benih")}
                                className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-4 text-left transition hover:bg-amber-100"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Kelola Stok Benih</p>
                                    <p className="mt-1 text-xs text-slate-500">Update mutasi benih</p>
                                </div>
                                <Sprout className="text-amber-700" size={18} />
                            </button>
                            <button
                                onClick={() => onNavigate?.("laboratorium-masuk")}
                                className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-4 text-left transition hover:bg-sky-100"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Update Status Uji Lab</p>
                                    <p className="mt-1 text-xs text-slate-500">Periksa sampel laboratorium</p>
                                </div>
                                <FlaskConical className="text-sky-700" size={18} />
                            </button>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    );
}
