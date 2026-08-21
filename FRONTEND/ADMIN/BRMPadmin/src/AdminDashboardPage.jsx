import React, { useState, useEffect } from "react";
import {
    ArrowUpRight,
    CheckCircle2,
    ClipboardList,
    FlaskConical,
    Sparkles,
    Sprout,
    Users,
    RefreshCw,
    Calendar,
    ChevronRight,
} from "lucide-react";
import {
    internalPengaduanService,
    internalLabService,
    internalBenihService,
    authService,
} from "./services/apiService";
import { getJenisLayananInfo } from "./PermohonanPage";
import StatCard from "./components/StatCard";
import StatusDonutChart from "./components/StatusDonutChart";
import SkeletonDashboard from "./components/SkeletonDashboard";

/* ---- Status config ---- */
const STATUS = {
    Menunggu: { badge: "bg-violet-50 text-violet-700 border-violet-200/60", border: "border-l-violet-500", dot: "bg-violet-400", color: "#8b5cf6" },
    Diproses: { badge: "bg-amber-50  text-amber-700  border-amber-200/60",  border: "border-l-amber-500",  dot: "bg-amber-400",  color: "#f59e0b" },
    Selesai:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",border:"border-l-brand-500",  dot: "bg-brand-400",  color: "#25c47a" },
    Diterima: { badge: "bg-sky-50  text-sky-700  border-sky-200/60",        border: "border-l-sky-500",    dot: "bg-sky-400",   color: "#0ea5e9" },
    Ditolak:  { badge: "bg-rose-50 text-rose-700 border-rose-200/60",       border: "border-l-rose-500",   dot: "bg-rose-400",  color: "#f43f5e" },
};

/* ---- Helpers ---- */
function getGreeting() {
    const h = new Date().getHours();
    if (h >= 4  && h < 11) return "Selamat Pagi";
    if (h >= 11 && h < 15) return "Selamat Siang";
    if (h >= 15 && h < 18) return "Selamat Sore";
    return "Selamat Malam";
}

function todayLabel() {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
}

function initials(name = "") {
    return (name || "?")
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() || "")
        .join("");
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function AdminDashboardPage({ onNavigate }) {
    const [user]          = useState(authService.getUser());
    const [pengaduanList, setPengaduanList] = useState([]);
    const [labList,       setLabList]       = useState([]);
    const [benihList,     setBenihList]     = useState([]);
    const [isLoading,     setIsLoading]     = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const load = async () => {
        setIsLoading(true);
        try {
            const [pR, lR, bR] = await Promise.allSettled([
                internalPengaduanService.getAll(),
                internalLabService.getAll(),
                internalBenihService.getAll(),
            ]);
            if (pR.status === "fulfilled" && pR.value?.success && Array.isArray(pR.value.data)) setPengaduanList(pR.value.data);
            if (lR.status === "fulfilled" && lR.value?.success && Array.isArray(lR.value.data)) setLabList(lR.value.data);
            if (bR.status === "fulfilled" && bR.value?.success && Array.isArray(bR.value.data)) setBenihList(bR.value.data);
        } catch (e) {
            console.warn("Dashboard load:", e.message);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    };

    useEffect(() => { load(); }, []);

    /* --- Derived metrics --- */
    const totalStok        = benihList.reduce((s, b) => s + (Number(b.stok) || 0), 0);
    const labAktif         = labList.filter((l) => ["Proses", "Diterima"].includes(l.status_uji)).length;
    const pMenunggu        = pengaduanList.filter((p) => p.status_tanggapan === "Menunggu").length;
    const pDiproses        = pengaduanList.filter((p) => p.status_tanggapan === "Diproses").length;
    const pSelesai         = pengaduanList.filter((p) => p.status_tanggapan === "Selesai").length;
    const pDitolak         = pengaduanList.filter((p) => p.status_tanggapan === "Ditolak").length;

    const donutData = [
        { label: "Menunggu", value: pMenunggu, color: "#8b5cf6" },
        { label: "Diproses", value: pDiproses, color: "#f59e0b" },
        { label: "Selesai",  value: pSelesai,  color: "#25c47a" },
        { label: "Ditolak",  value: pDitolak,  color: "#f43f5e" },
    ];

    const recentActivities = [
        ...pengaduanList.slice(0, 3).map((p) => ({
            type: "pengaduan",
            title: `Permohonan #${p.kode_tracking || p.id}`,
            detail: `${p.nama_pelapor} — ${(p.isi_pengaduan || "Permohonan layanan").slice(0, 55)}${(p.isi_pengaduan?.length || 0) > 55 ? "…" : ""}`,
            time: p.tanggal
                ? new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                : "Hari ini",
        })),
        ...benihList.slice(0, 2).map((b) => ({
            type: "benih",
            title: `Benih '${b.nama_benih}'`,
            detail: `Stok: ${b.stok} kg tersedia — Data tersinkron ke website publik`,
            time: "Sinkron",
        })),
    ];

    if (isInitialLoad && isLoading) return <SkeletonDashboard />;

    /* ============================================================
       RENDER
       ============================================================ */
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-7 pb-10">

            {/* -------------------------------------------------- */}
            {/* 1. HEADER                                           */}
            {/* -------------------------------------------------- */}
            <header
                className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 p-6 sm:p-8 shadow-card backdrop-blur-xl"
                style={{ animationDelay: "0s" }}
            >
                {/* Background decorations */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-400/12 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-gold-400/10 blur-2xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Greeting */}
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Live badge */}
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-700">
                                <Sparkles size={12} className="text-brand-500" />
                                Panel Admin · Real-Time
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                <Calendar size={12} />
                                {todayLabel()}
                            </span>
                        </div>

                        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                            {getGreeting()},{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #127d4e 0%, #25c47a 50%, #f59e0b 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                {user?.nama || "Administrator"}
                            </span>{" "}
                            👋
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                            Monitoring terpadu permohonan layanan, pengujian laboratorium, dan persediaan katalog benih BRMP DIY.
                        </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={load}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700 hover:shadow-md active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin-slow text-brand-500" : ""} />
                            {isLoading ? "Memuat…" : "Refresh Data"}
                        </button>

                        <div className="flex items-center gap-3 rounded-2xl border border-brand-100/80 bg-gradient-to-r from-brand-50 to-emerald-50/60 px-4 py-2.5 shadow-sm">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white"
                                style={{
                                    background: "linear-gradient(135deg, #25c47a, #0f5033)",
                                    boxShadow: "0 6px 18px rgba(37,196,122,0.30)",
                                }}
                            >
                                {user?.role === "PetugasLab" ? "LAB" : "ADM"}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {user?.nama || "Administrator"}
                                </p>
                                <p className="text-[11px] font-semibold text-brand-700">
                                    {user?.role === "Admin" ? "Superadmin" : "Petugas Lab"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* -------------------------------------------------- */}
            {/* 2. STAT CARDS                                       */}
            {/* -------------------------------------------------- */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={ClipboardList}
                    label="Permohonan Masuk"
                    value={pengaduanList.length.toString()}
                    badgeText={`${pMenunggu} perlu ditanggapi`}
                    variant="emerald"
                    subtext="Layanan & Aduan"
                    onClick={() => onNavigate?.("permohonan")}
                    delay="0.05s"
                />
                <StatCard
                    icon={FlaskConical}
                    label="Sampel Lab Aktif"
                    value={(labAktif || labList.length || 0).toString()}
                    badgeText={`${labAktif} Dalam Pengujian`}
                    variant="sky"
                    subtext="Status Laboratorium"
                    onClick={() => onNavigate?.("laboratorium-masuk")}
                    delay="0.10s"
                />
                <StatCard
                    icon={Sprout}
                    label="Total Stok Benih"
                    value={`${totalStok.toLocaleString("id-ID")} kg`}
                    badgeText={`${benihList.length} Varietas`}
                    variant="amber"
                    subtext="Katalog Gudang"
                    onClick={() => onNavigate?.("benih-jenis-benih")}
                    delay="0.15s"
                />
                <StatCard
                    icon={Users}
                    label="Akses Sistem"
                    value={user?.role === "Admin" ? "Superadmin" : "Petugas"}
                    badgeText="Sesi Aktif"
                    variant="violet"
                    subtext="BRMP DIY Portal"
                    onClick={() => onNavigate?.("user")}
                    delay="0.20s"
                />
            </section>

            {/* -------------------------------------------------- */}
            {/* 3. MAIN CONTENT GRID                               */}
            {/* -------------------------------------------------- */}
            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">

                {/* ---- Left: Permohonan list ---- */}
                <article className="flex flex-col rounded-[2.25rem] border border-slate-100 bg-white/95 p-6 shadow-card backdrop-blur-lg">

                    {/* Card header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
                                </span>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">
                                    Antrean Layanan
                                </p>
                            </div>
                            <h2 className="mt-1.5 text-xl font-black text-slate-900">
                                Permohonan Masuk Terbaru
                            </h2>
                        </div>

                        <button
                            onClick={() => onNavigate?.("permohonan")}
                            className="group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-glow transition-all duration-200 hover:shadow-glow-lg active:scale-95"
                            style={{
                                background: "linear-gradient(135deg, #16a061 0%, #0f5033 100%)",
                            }}
                        >
                            <span>Lihat Semua ({pengaduanList.length})</span>
                            <ArrowUpRight
                                size={14}
                                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </button>
                    </div>

                    {/* Permohonan rows */}
                    <div className="mt-5 flex-1 space-y-3">
                        {pengaduanList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                                    <ClipboardList size={30} />
                                </div>
                                <p className="mt-3 text-sm font-bold text-slate-600">Belum ada permohonan</p>
                                <p className="mt-1 max-w-xs text-xs text-slate-400">
                                    Permohonan baru dari masyarakat akan tampil otomatis di sini.
                                </p>
                            </div>
                        ) : (
                            pengaduanList.slice(0, 5).map((req) => {
                                const cfg = STATUS[req.status_tanggapan] || STATUS.Menunggu;
                                const formInfo = getJenisLayananInfo(req);
                                const FormIcon = formInfo.icon;

                                return (
                                    <div
                                        key={req.id}
                                        onClick={() => onNavigate?.("permohonan")}
                                        className={`group relative flex flex-col gap-3 rounded-2xl border border-l-4 border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-md cursor-pointer sm:flex-row sm:items-center sm:justify-between ${cfg.border}`}
                                    >
                                        <div className="flex items-start gap-3.5">
                                            {/* Avatar */}
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm transition-transform group-hover:scale-105"
                                                style={{
                                                    background: "linear-gradient(135deg, #25c47a22 0%, #25c47a11 100%)",
                                                    color: "#127d4e",
                                                    border: "1.5px solid #25c47a22",
                                                }}
                                            >
                                                {initials(req.nama_pelapor)}
                                            </div>

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <code className="rounded-md border border-brand-100 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                                                        {req.kode_tracking || `#${req.id}`}
                                                    </code>
                                                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${formInfo.badgeClass}`}>
                                                        <FormIcon size={10} className={formInfo.iconColor} />
                                                        <span>{formInfo.shortLabel}</span>
                                                    </span>
                                                    {req.tanggal && (
                                                        <span className="text-[11px] text-slate-400">
                                                            {new Date(req.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short" })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                                                    {req.nama_pelapor}
                                                </p>
                                                <p className="line-clamp-1 max-w-sm text-xs text-slate-500">
                                                    {req.isi_pengaduan || "Permohonan / Pengaduan Layanan"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 sm:justify-end self-end sm:self-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${cfg.badge}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                                {req.status_tanggapan}
                                            </span>
                                            <ChevronRight size={15} className="hidden text-slate-300 group-hover:text-brand-500 transition-colors sm:block" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </article>

                {/* ---- Right column ---- */}
                <div className="flex flex-col gap-6">

                    {/* Donut Chart */}
                    <article className="rounded-[2.25rem] border border-slate-100 bg-white/95 p-6 shadow-card backdrop-blur-lg">
                        <div className="border-b border-slate-100 pb-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">
                                Analisis
                            </p>
                            <h2 className="mt-1 text-lg font-black text-slate-900">
                                Distribusi Status Permohonan
                            </h2>
                        </div>
                        <div className="mt-5">
                            <StatusDonutChart data={donutData} totalCount={pengaduanList.length} />
                        </div>
                    </article>

                    {/* Quick Actions */}
                    <article className="rounded-[2.25rem] border border-slate-100 bg-white/95 p-6 shadow-card backdrop-blur-lg">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">
                            Aksi Cepat
                        </p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">
                            Shortcut Operasional
                        </h2>

                        <div className="mt-5 space-y-3">
                            {[
                                {
                                    label: "Tanggapi Permohonan",
                                    sub:   "Tindak lanjuti aduan masuk",
                                    icon:  ClipboardList,
                                    nav:   "permohonan",
                                    from:  "#25c47a", to: "#127d4e",
                                    hoverBorder: "hover:border-brand-200",
                                    hoverBg:     "hover:from-brand-50/80 hover:to-emerald-50/40",
                                },
                                {
                                    label: "Update Mutasi Benih",
                                    sub:   "Input stok masuk/keluar",
                                    icon:  Sprout,
                                    nav:   "benih-tambah-update-stok",
                                    from:  "#f59e0b", to: "#d97706",
                                    hoverBorder: "hover:border-amber-200",
                                    hoverBg:     "hover:from-amber-50/80 hover:to-yellow-50/40",
                                },
                                {
                                    label: "Update Hasil Uji Lab",
                                    sub:   "Verifikasi sampel pengujian",
                                    icon:  FlaskConical,
                                    nav:   "laboratorium-masuk",
                                    from:  "#0ea5e9", to: "#0284c7",
                                    hoverBorder: "hover:border-sky-200",
                                    hoverBg:     "hover:from-sky-50/80 hover:to-blue-50/40",
                                },
                            ].map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.nav}
                                        onClick={() => onNavigate?.(action.nav)}
                                        className={`group w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50/80 to-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.hoverBorder} ${action.hoverBg}`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                                                style={{
                                                    background: `linear-gradient(135deg, ${action.from}, ${action.to})`,
                                                    boxShadow: `0 6px 18px ${action.from}40`,
                                                }}
                                            >
                                                <Icon size={18} strokeWidth={2.2} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{action.label}</p>
                                                <p className="text-xs text-slate-500">{action.sub}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight
                                            size={16}
                                            className="shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </article>

                    {/* Activity Timeline */}
                    <article className="rounded-[2.25rem] border border-slate-100 bg-white/95 p-6 shadow-card backdrop-blur-lg">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">
                            Log Aktivitas
                        </p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">
                            Aktivitas Terkini
                        </h2>

                        <div className="relative mt-5">
                            {/* Vertical line */}
                            <div className="pointer-events-none absolute left-4 top-3 bottom-3 w-px bg-gradient-to-b from-brand-300/50 via-slate-200 to-transparent" />

                            <div className="space-y-4">
                                {recentActivities.map((act, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        {/* Node */}
                                        <div
                                            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-500 bg-white text-brand-600 shadow-sm"
                                        >
                                            {act.type === "benih"
                                                ? <Sprout size={15} />
                                                : <CheckCircle2 size={15} />
                                            }
                                        </div>

                                        <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{act.title}</p>
                                                <span className="shrink-0 text-[10px] font-semibold text-slate-400">{act.time}</span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                                                {act.detail}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {recentActivities.length === 0 && (
                                    <p className="pl-12 text-xs text-slate-400">Belum ada aktivitas.</p>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    );
}
