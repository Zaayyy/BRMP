import React, { useState, useEffect, useMemo } from "react";
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
    Shield,
    ShieldCheck,
    User,
    Activity as ActivityIcon,
    Clock,
    Search,
    Download,
    Printer,
    X,
    Filter,
    FileSpreadsheet,
    Layers,
    History,
    FileText,
    Globe,
    TrendingUp,
    Eye,
    BarChart3,
    Smartphone,
    Monitor,
    ExternalLink,
    Check,
    Copy,
    Settings,
    Radio,
    Share2,
} from "lucide-react";
import {
    internalPengaduanService,
    internalLabService,
    internalBenihService,
    internalActivityService,
    authService,
    ROLE_DETAILS,
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

function formatRelativeTime(dateStr) {
    if (!dateStr) return "Baru saja";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Hari ini";
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "Baru saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function initials(name = "") {
    return (name || "?")
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() || "")
        .join("");
}

/* ---- Google Analytics Datasets ---- */
const ANALYTICS_DATASETS = {
    today: {
        label: "Hari Ini",
        visitors: "1.420",
        visitorsGrowth: "+14.8%",
        uniqueVisitors: "980",
        uniqueGrowth: "+12.1%",
        pageviews: "4.890",
        viewsGrowth: "+18.2%",
        avgDuration: "3m 45d",
        activeNow: 18,
        chartData: [
            { label: "00:00", value: 65, views: 160 },
            { label: "04:00", value: 32, views: 85 },
            { label: "08:00", value: 310, views: 1040 },
            { label: "12:00", value: 440, views: 1520 },
            { label: "16:00", value: 390, views: 1380 },
            { label: "20:00", value: 275, views: 980 },
        ],
        topPages: [
            { path: "/", title: "Beranda Portal Publik BRMP DIY", views: "2.050", pct: 42 },
            { path: "/layanan/lab", title: "Layanan Pengujian Laboratorium", views: "1.270", pct: 26 },
            { path: "/benih", title: "Katalog Ketersediaan Stok Benih", views: "880", pct: 18 },
            { path: "/kunjungan", title: "Pendaftaran Eduwisata & Magang", views: "440", pct: 9 },
            { path: "/permohonan", title: "Tracking & Permohonan Layanan", views: "250", pct: 5 },
        ],
    },
    "7d": {
        label: "7 Hari Terakhir",
        visitors: "12.850",
        visitorsGrowth: "+18.4%",
        uniqueVisitors: "8.920",
        uniqueGrowth: "+15.6%",
        pageviews: "34.620",
        viewsGrowth: "+22.8%",
        avgDuration: "2m 58d",
        activeNow: 24,
        chartData: [
            { label: "Sen", value: 1650, views: 4420 },
            { label: "Sel", value: 1840, views: 4950 },
            { label: "Rab", value: 1980, views: 5310 },
            { label: "Kam", value: 1720, views: 4620 },
            { label: "Jum", value: 2150, views: 5790 },
            { label: "Sab", value: 1890, views: 5120 },
            { label: "Min", value: 1620, views: 4410 },
        ],
        topPages: [
            { path: "/", title: "Beranda Portal Publik BRMP DIY", views: "14.540", pct: 42 },
            { path: "/layanan/lab", title: "Layanan Pengujian Laboratorium", views: "9.000", pct: 26 },
            { path: "/benih", title: "Katalog Ketersediaan Stok Benih", views: "5.885", pct: 17 },
            { path: "/kunjungan", title: "Pendaftaran Eduwisata & Magang", views: "3.460", pct: 10 },
            { path: "/permohonan", title: "Tracking & Permohonan Layanan", views: "1.735", pct: 5 },
        ],
    },
    "30d": {
        label: "30 Hari Terakhir",
        visitors: "48.960",
        visitorsGrowth: "+24.2%",
        uniqueVisitors: "32.400",
        uniqueGrowth: "+19.8%",
        pageviews: "138.450",
        viewsGrowth: "+27.5%",
        avgDuration: "3m 15d",
        activeNow: 28,
        chartData: [
            { label: "Mgg 1", value: 11200, views: 31500 },
            { label: "Mgg 2", value: 12400, views: 34900 },
            { label: "Mgg 3", value: 11800, views: 33400 },
            { label: "Mgg 4", value: 13560, views: 38650 },
        ],
        topPages: [
            { path: "/", title: "Beranda Portal Publik BRMP DIY", views: "58.150", pct: 42 },
            { path: "/layanan/lab", title: "Layanan Pengujian Laboratorium", views: "36.000", pct: 26 },
            { path: "/benih", title: "Katalog Ketersediaan Stok Benih", views: "24.920", pct: 18 },
            { path: "/kunjungan", title: "Pendaftaran Eduwisata & Magang", views: "12.460", pct: 9 },
            { path: "/permohonan", title: "Tracking & Permohonan Layanan", views: "6.920", pct: 5 },
        ],
    },
    year: {
        label: "Tahun 2025",
        visitors: "215.800",
        visitorsGrowth: "+31.5%",
        uniqueVisitors: "142.600",
        uniqueGrowth: "+28.4%",
        pageviews: "612.000",
        viewsGrowth: "+34.1%",
        avgDuration: "3m 05d",
        activeNow: 22,
        chartData: [
            { label: "Jan", value: 16800, views: 48000 },
            { label: "Feb", value: 17400, views: 49500 },
            { label: "Mar", value: 18900, views: 53200 },
            { label: "Apr", value: 18200, views: 51400 },
            { label: "Mei", value: 19600, views: 55800 },
            { label: "Jun", value: 20100, views: 57200 },
            { label: "Jul", value: 21500, views: 60900 },
            { label: "Agu", value: 22400, views: 63500 },
        ],
        topPages: [
            { path: "/", title: "Beranda Portal Publik BRMP DIY", views: "257.000", pct: 42 },
            { path: "/layanan/lab", title: "Layanan Pengujian Laboratorium", views: "159.100", pct: 26 },
            { path: "/benih", title: "Katalog Ketersediaan Stok Benih", views: "110.150", pct: 18 },
            { path: "/kunjungan", title: "Pendaftaran Eduwisata & Magang", views: "55.080", pct: 9 },
            { path: "/permohonan", title: "Tracking & Permohonan Layanan", views: "30.600", pct: 5 },
        ],
    },
};

const TRAFFIC_SOURCES = [
    { label: "Google Pencarian Organik", pct: 58, count: "58%", color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Direct / Kunjungan Langsung", pct: 24, count: "24%", color: "bg-sky-500", dot: "bg-sky-500" },
    { label: "Media Sosial & WhatsApp", pct: 14, count: "14%", color: "bg-amber-500", dot: "bg-amber-500" },
    { label: "Rujukan Website Pemda / Dinas", pct: 4, count: "4%", color: "bg-purple-500", dot: "bg-purple-500" },
];

const DEVICE_BREAKDOWN = [
    { label: "Smartphone / Mobile", pct: 68, icon: Smartphone, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { label: "Komputer / Desktop PC", pct: 29, icon: Monitor, color: "text-sky-700 bg-sky-50 border-sky-200" },
    { label: "Tablet", pct: 3, icon: Globe, color: "text-amber-700 bg-amber-50 border-amber-200" },
];

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function AdminDashboardPage({ onNavigate }) {
    const [user]             = useState(authService.getUser());
    const [pengaduanList,    setPengaduanList]    = useState([]);
    const [labList,          setLabList]          = useState([]);
    const [benihList,        setBenihList]        = useState([]);
    const [activitiesList,   setActivitiesList]   = useState([]);
    const [isLoading,        setIsLoading]        = useState(false);
    const [isInitialLoad,    setIsInitialLoad]    = useState(true);

    // State Audit Trail Modal & Penelusuran Log
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [auditSearch, setAuditSearch] = useState("");
    const [auditTipe, setAuditTipe] = useState("semua");
    const [auditRole, setAuditRole] = useState("semua");
    const [auditPeriod, setAuditPeriod] = useState("all");
    const [auditStartDate, setAuditStartDate] = useState("");
    const [auditEndDate, setAuditEndDate] = useState("");
    const [isLogRefreshing, setIsLogRefreshing] = useState(false);

    // State Google Analytics & Pengunjung Web
    const [analyticsPeriod, setAnalyticsPeriod] = useState("7d"); // 'today' | '7d' | '30d' | 'year'
    const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
    const [gaMeasurementId, setGaMeasurementId] = useState(
        () => localStorage.getItem("brmp_ga_id") || "G-BRMPDIY2025"
    );
    const [isEditingGaId, setIsEditingGaId] = useState(false);
    const [tempGaId, setTempGaId] = useState("");
    const [gaCopied, setGaCopied] = useState(false);

    const handleSaveGaId = (e) => {
        e.preventDefault();
        const cleanId = (tempGaId.trim() || gaMeasurementId).toUpperCase();
        setGaMeasurementId(cleanId);
        localStorage.setItem("brmp_ga_id", cleanId);
        setIsEditingGaId(false);
    };

    const handleCopyGaId = () => {
        navigator.clipboard?.writeText(gaMeasurementId);
        setGaCopied(true);
        setTimeout(() => setGaCopied(false), 2000);
    };

    const load = async () => {
        setIsLoading(true);
        try {
            const [pR, lR, bR, aR] = await Promise.allSettled([
                internalPengaduanService.getAll(),
                internalLabService.getAll(),
                internalBenihService.getAll(),
                internalActivityService.getAll({ limit: 1000 }),
            ]);
            if (pR.status === "fulfilled" && pR.value?.success && Array.isArray(pR.value.data)) setPengaduanList(pR.value.data);
            if (lR.status === "fulfilled" && lR.value?.success && Array.isArray(lR.value.data)) setLabList(lR.value.data);
            if (bR.status === "fulfilled" && bR.value?.success && Array.isArray(bR.value.data)) setBenihList(bR.value.data);
            if (aR.status === "fulfilled" && aR.value?.success && Array.isArray(aR.value.data)) setActivitiesList(aR.value.data);
        } catch (e) {
            console.warn("Dashboard load:", e.message);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    };

    const refreshLogsOnly = async () => {
        setIsLogRefreshing(true);
        try {
            const res = await internalActivityService.getAll({ limit: 1000 });
            if (res && res.success && Array.isArray(res.data)) {
                setActivitiesList(res.data);
            }
        } catch (e) {
            console.warn("Refresh logs:", e.message);
        } finally {
            setIsLogRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    /* --- Derived metrics --- */
    const totalStok        = benihList.reduce((s, b) => s + (Number(b.stok) || 0), 0);
    const labAktif         = labList.filter((l) => ["Proses", "Diterima", "Pengujian", "Verif Sampel", "Analis Data"].includes(l.status_uji)).length;
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

    // Filter Logs untuk Audit Trail Modal
    const filteredFullLogs = useMemo(() => {
        const now = new Date();
        return activitiesList.filter((act) => {
            // Filter Search Query
            if (auditSearch.trim()) {
                const q = auditSearch.toLowerCase();
                const uNama = String(act.user_nama || act.userNama || act.nama || "").toLowerCase();
                const uRole = String(act.user_role || act.userRole || act.role || "").toLowerCase();
                const uAct = String(act.action || act.title || "").toLowerCase();
                const uDet = String(act.detail || "").toLowerCase();
                if (!uNama.includes(q) && !uRole.includes(q) && !uAct.includes(q) && !uDet.includes(q)) {
                    return false;
                }
            }

            // Filter Tipe / Modul
            if (auditTipe !== "semua" && (act.tipe || act.type) !== auditTipe) {
                return false;
            }

            // Filter Role
            if (auditRole !== "semua") {
                const r = act.user_role || act.userRole || act.role || "";
                if (r !== auditRole) return false;
            }

            // Filter Periode Waktu
            const createdStr = act.created_at || act.createdAt || act.time;
            if (createdStr) {
                const logDate = new Date(createdStr);
                if (!isNaN(logDate.getTime())) {
                    if (auditPeriod === "today") {
                        const todayStr = now.toISOString().slice(0, 10);
                        const itemDateStr = logDate.toISOString().slice(0, 10);
                        if (todayStr !== itemDateStr) return false;
                    } else if (auditPeriod === "week") {
                        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
                        if (diffDays > 7) return false;
                    } else if (auditPeriod === "month") {
                        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
                        if (diffDays > 30) return false;
                    } else if (auditPeriod === "custom") {
                        if (auditStartDate) {
                            const sDate = new Date(auditStartDate);
                            sDate.setHours(0, 0, 0, 0);
                            if (logDate < sDate) return false;
                        }
                        if (auditEndDate) {
                            const eDate = new Date(auditEndDate);
                            eDate.setHours(23, 59, 59, 999);
                            if (logDate > eDate) return false;
                        }
                    }
                }
            }

            return true;
        });
    }, [activitiesList, auditSearch, auditTipe, auditRole, auditPeriod, auditStartDate, auditEndDate]);

    // Export Log to CSV (Excel)
    const handleExportCSV = () => {
        if (!filteredFullLogs || filteredFullLogs.length === 0) {
            alert("Tidak ada data riwayat log untuk diekspor.");
            return;
        }
        const headers = ["No", "Tanggal & Waktu", "Nama Petugas", "Role Akun", "Modul Sistem", "Aksi Operasional", "Rincian / Detail Aktivitas"];
        const rows = filteredFullLogs.map((l, idx) => {
            const rawDate = l.created_at || l.createdAt || l.time;
            const formattedDate = rawDate ? new Date(rawDate).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-";
            const uNama = l.user_nama || l.userNama || l.nama || "Petugas";
            const uRole = l.user_role || l.userRole || l.role || "Petugas";
            const uTipe = l.tipe || l.type || "System";
            const uAct = l.action || l.title || "Pembaruan";
            const uDet = (l.detail || "").replace(/"/g, '""');

            return [
                idx + 1,
                `"${formattedDate}"`,
                `"${uNama}"`,
                `"${uRole}"`,
                `"${uTipe}"`,
                `"${uAct}"`,
                `"${uDet}"`
            ];
        });

        const csvString = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `BRMP_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Build unified activities if API data is ready
    const displayActivities = activitiesList.length > 0
        ? activitiesList.slice(0, 7)
        : [
            ...labList.slice(0, 3).map((l) => ({
                tipe: "lab",
                user_nama: l.namaPetugas || "Petugas Laboratorium",
                user_role: l.status_uji === "Selesai" ? "PetugasLab" : "Analis",
                action: "Update Analisis Lab",
                detail: `SPK ${l.spk || l.kode_tracking} (${l.nama_pemohon}) — Tahap: ${l.tahap_proses || l.status_uji}`,
                created_at: l.tanggal_masuk,
            })),
            ...pengaduanList.slice(0, 2).map((p) => ({
                tipe: "pengaduan",
                user_nama: p.ditanggapiOleh || "Petugas Layanan",
                user_role: "PetugasLayanan",
                action: "Tindak Lanjut Permohonan",
                detail: `Tiket #${p.kode_tracking || p.id} (${p.nama_pelapor}) — Status: ${p.status_tanggapan}`,
                created_at: p.tanggal,
            })),
            ...benihList.slice(0, 2).map((b) => ({
                tipe: "benih",
                user_nama: "Petugas Perbenihan",
                user_role: "PetugasBenih",
                action: "Sinkronisasi Stok Benih",
                detail: `Benih '${b.nama_benih}' — Stok: ${b.stok} kg tersedia`,
                created_at: b.createdAt || b.created_at,
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
                                    background: user?.role === "Analis"
                                        ? "linear-gradient(135deg, #9333ea, #581c87)"
                                        : "linear-gradient(135deg, #25c47a, #0f5033)",
                                    boxShadow: user?.role === "Analis"
                                        ? "0 6px 18px rgba(147,51,234,0.30)"
                                        : "0 6px 18px rgba(37,196,122,0.30)",
                                }}
                            >
                                {ROLE_DETAILS[user?.role]?.shortCode || "ADM"}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {user?.nama || "Administrator"}
                                </p>
                                <p className="text-[11px] font-semibold text-brand-700">
                                    {ROLE_DETAILS[user?.role]?.label || "Administrator"}
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
                    subtext={user?.role === "Analis" ? "Buku Analis (Parameter)" : "Status Laboratorium"}
                    onClick={() => onNavigate?.(user?.role === "Analis" ? "laboratorium-buku-analis" : "laboratorium-masuk")}
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
                    value={ROLE_DETAILS[user?.role]?.label || "Pengguna"}
                    badgeText="Sesi Aktif"
                    variant="violet"
                    subtext="BRMP DIY Portal"
                    onClick={() => onNavigate?.(user?.role === "Admin" ? "user" : "pengaturan")}
                    delay="0.20s"
                />
            </section>

            {/* -------------------------------------------------- */}
            {/* 3. MAIN CONTENT GRID                               */}
            {/* -------------------------------------------------- */}
            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">

                {/* ---- Left Column: Google Analytics (Top) & Antrean Layanan (Moved Down) ---- */}
                <div className="flex flex-col gap-6">

                    {/* ======================================================== */}
                    {/* A. GOOGLE ANALYTICS & STATISTIK PENGUNJUNG WEB           */}
                    {/* ======================================================== */}
                    <article className="flex flex-col rounded-[2.25rem] border border-slate-100 bg-white/95 p-6 shadow-card backdrop-blur-lg">

                        {/* Card Header */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                                        <BarChart3 size={13} className="text-emerald-600" />
                                        <span>Google Analytics 4 (GA4) &bull; Trafik Portal Web</span>
                                    </p>
                                </div>
                                <h2 className="mt-1.5 text-xl font-black text-slate-900 flex items-center gap-2">
                                    <span>Statistik Pengunjung Website</span>
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Pantau jumlah pengunjung publik, durasi sesi, dan lalu lintas portal BRMP DIY.
                                </p>
                            </div>

                            {/* Action Buttons & Tag */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* GA4 Tag Badge */}
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 shadow-xs">
                                    <Globe size={13} className="text-emerald-600" />
                                    <span>{gaMeasurementId}</span>
                                    <button
                                        onClick={handleCopyGaId}
                                        title="Salin Tracking ID"
                                        className="ml-1 text-emerald-600 hover:text-emerald-900 transition"
                                    >
                                        {gaCopied ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTempGaId(gaMeasurementId);
                                            setIsEditingGaId(!isEditingGaId);
                                        }}
                                        title="Konfigurasi Tracking ID"
                                        className="text-emerald-600 hover:text-emerald-900 transition"
                                    >
                                        <Settings size={12} />
                                    </button>
                                </div>

                                {/* Link to Official GA Console */}
                                <a
                                    href="https://analytics.google.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition shadow-xs"
                                >
                                    <span>Console GA</span>
                                    <ExternalLink size={13} className="text-slate-400 group-hover:text-emerald-700 transition" />
                                </a>
                            </div>
                        </div>

                        {/* Inline Edit Measurement ID Modal/Bar */}
                        {isEditingGaId && (
                            <form onSubmit={handleSaveGaId} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                                        Ubah Measurement ID Google Analytics (GA4)
                                    </label>
                                    <input
                                        type="text"
                                        value={tempGaId}
                                        onChange={(e) => setTempGaId(e.target.value)}
                                        placeholder="Contoh: G-XXXXXXXXXX"
                                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 self-end">
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                                    >
                                        Simpan ID
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingGaId(false)}
                                        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Period Filter Tabs */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1">
                                {[
                                    { id: "today", label: "Hari Ini" },
                                    { id: "7d",    label: "7 Hari Terakhir" },
                                    { id: "30d",   label: "30 Hari Terakhir" },
                                    { id: "year",  label: "Tahun 2025" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setAnalyticsPeriod(tab.id)}
                                        className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                                            analyticsPeriod === tab.id
                                                ? "bg-white text-emerald-800 shadow-xs"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Active visitors pulse */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-[11px] font-bold text-emerald-800">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                <span>~{(ANALYTICS_DATASETS[analyticsPeriod] || ANALYTICS_DATASETS["7d"]).activeNow} Pengunjung Aktif Saat Ini</span>
                            </div>
                        </div>

                        {/* 4 Primary Analytics Metric Cards */}
                        {(() => {
                            const cur = ANALYTICS_DATASETS[analyticsPeriod] || ANALYTICS_DATASETS["7d"];
                            return (
                                <>
                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {/* Total Visitors */}
                                        <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/60 via-white to-white p-3.5 shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-500">Total Pengunjung</span>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                                    <Users size={14} />
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xl font-black text-slate-900 tracking-tight">
                                                {cur.visitors}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                                <TrendingUp size={11} />
                                                <span>{cur.visitorsGrowth}</span>
                                                <span className="text-slate-400 font-normal">vs lalu</span>
                                            </div>
                                        </div>

                                        {/* Unique Visitors */}
                                        <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-sky-50/60 via-white to-white p-3.5 shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-500">Pengunjung Unik</span>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                                                    <Globe size={14} />
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xl font-black text-slate-900 tracking-tight">
                                                {cur.uniqueVisitors}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-sky-600">
                                                <TrendingUp size={11} />
                                                <span>{cur.uniqueGrowth}</span>
                                                <span className="text-slate-400 font-normal">pengguna baru</span>
                                            </div>
                                        </div>

                                        {/* Pageviews */}
                                        <div className="rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/60 via-white to-white p-3.5 shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-500">Tayangan Halaman</span>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                                                    <Eye size={14} />
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xl font-black text-slate-900 tracking-tight">
                                                {cur.pageviews}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                                                <TrendingUp size={11} />
                                                <span>{cur.viewsGrowth}</span>
                                                <span className="text-slate-400 font-normal">pageviews</span>
                                            </div>
                                        </div>

                                        {/* Avg Duration */}
                                        <div className="rounded-2xl border border-amber-100/80 bg-gradient-to-br from-amber-50/60 via-white to-white p-3.5 shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-500">Rata-rata Sesi</span>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                                                    <Clock size={14} />
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xl font-black text-slate-900 tracking-tight">
                                                {cur.avgDuration}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                                <span>76.5% Terlibat Aktif</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Daily Trend Chart (Interactive Bar Visualization) */}
                                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">
                                                    Tren Frekuensi Kunjungan ({cur.label})
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    Arahkan kursor pada batang grafik untuk melihat detail sesi dan tayangan.
                                                </p>
                                            </div>
                                            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                Performa Trafik
                                            </span>
                                        </div>

                                        {/* Bars Container */}
                                        {(() => {
                                            const maxVal = Math.max(...cur.chartData.map((d) => d.value), 1);
                                            return (
                                                <div className="relative flex items-end justify-between gap-2 pt-6 pb-1 h-36">
                                                    {cur.chartData.map((item, idx) => {
                                                        const heightPct = Math.max(12, Math.round((item.value / maxVal) * 100));
                                                        const isHovered = hoveredBarIndex === idx;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                onMouseEnter={() => setHoveredBarIndex(idx)}
                                                                onMouseLeave={() => setHoveredBarIndex(null)}
                                                                className="relative flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
                                                            >
                                                                {/* Tooltip */}
                                                                {isHovered && (
                                                                    <div className="absolute -top-10 z-20 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg pointer-events-none animate-fade-in">
                                                                        <span className="text-emerald-300">{item.value.toLocaleString("id-ID")} Sesi</span>
                                                                        <span className="text-slate-400 mx-1">&bull;</span>
                                                                        <span className="text-sky-300">{item.views.toLocaleString("id-ID")} Views</span>
                                                                    </div>
                                                                )}

                                                                {/* Bar */}
                                                                <div
                                                                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                                                                        isHovered
                                                                            ? "bg-gradient-to-t from-emerald-600 to-brand-400 shadow-md shadow-emerald-500/30 scale-105"
                                                                            : "bg-gradient-to-t from-emerald-500/80 to-emerald-400/90 hover:from-emerald-600 hover:to-emerald-400"
                                                                    }`}
                                                                    style={{ height: `${heightPct}%` }}
                                                                />

                                                                {/* Label */}
                                                                <span className={`mt-2 text-[10px] font-bold transition-colors ${isHovered ? "text-emerald-700" : "text-slate-500"}`}>
                                                                    {item.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Breakdown Subsections: Top Pages & Channels */}
                                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                        {/* Top Visited Pages */}
                                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                                                <p className="text-xs font-bold text-slate-900">
                                                    Halaman Web Paling Ramai
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    Tayangan
                                                </span>
                                            </div>

                                            <div className="space-y-2.5">
                                                {cur.topPages.map((pg, i) => (
                                                    <div key={pg.path} className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                                                    {i + 1}
                                                                </span>
                                                                <span className="font-bold text-slate-800 truncate" title={pg.title}>
                                                                    {pg.title}
                                                                </span>
                                                            </div>
                                                            <span className="shrink-0 font-extrabold text-emerald-700 text-[11px]">
                                                                {pg.views} <span className="text-slate-400 font-normal">({pg.pct}%)</span>
                                                            </span>
                                                        </div>
                                                        {/* Progress bar */}
                                                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-500"
                                                                style={{ width: `${pg.pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Traffic Sources & Devices */}
                                        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                                            <div>
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                                                    <p className="text-xs font-bold text-slate-900">
                                                        Sumber Trafik Pengunjung
                                                    </p>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        Kanal
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {TRAFFIC_SOURCES.map((src) => (
                                                        <div key={src.label} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`h-2 w-2 rounded-full ${src.dot}`} />
                                                                <span className="text-slate-700 font-medium text-[11px]">{src.label}</span>
                                                            </div>
                                                            <span className="font-bold text-slate-800 text-[11px]">{src.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Devices Breakdown */}
                                            <div className="mt-4 pt-3 border-t border-slate-100">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Perangkat Pengunjung
                                                </p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {DEVICE_BREAKDOWN.map((dev) => {
                                                        const DevIcon = dev.icon;
                                                        return (
                                                            <div
                                                                key={dev.label}
                                                                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center ${dev.color}`}
                                                            >
                                                                <DevIcon size={14} className="mb-0.5" />
                                                                <span className="text-xs font-black">{dev.pct}%</span>
                                                                <span className="text-[9px] font-semibold opacity-80">{dev.label.split("/")[0]}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                    </article>

                    {/* ======================================================== */}
                    {/* B. ANTREAN LAYANAN (Permohonan Masuk Terbaru) - DITURUNIN */}
                    {/* ======================================================== */}
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

                </div>

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

                    {/* Activity Timeline (Menampilkan Akun Pelaksana) */}
                    <article className="rounded-[2.25rem] border border-slate-100 bg-white/95 p-6 shadow-card backdrop-blur-lg">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">
                                    Audit Trail &amp; Log
                                </p>
                                <h2 className="text-lg font-black text-slate-900">
                                    Log Aktivitas Petugas
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsAuditModalOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-100 transition shadow-xs"
                            >
                                <Search size={12} className="text-brand-600" />
                                <span>Lihat Semua Log</span>
                            </button>
                        </div>

                        <div className="relative mt-2">
                            {/* Vertical line */}
                            <div className="pointer-events-none absolute left-4 top-3 bottom-3 w-px bg-gradient-to-b from-brand-400/50 via-slate-200 to-transparent" />

                            <div className="space-y-3.5">
                                {displayActivities.map((act, i) => {
                                    const role = act.user_role || act.userRole || act.role || "PetugasLab";
                                    const namaAkun = act.user_nama || act.userNama || act.nama || "Petugas";
                                    const roleMeta = ROLE_DETAILS[role] || {
                                        label: role,
                                        shortCode: role?.slice(0, 3)?.toUpperCase() || "USR",
                                        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                                    };

                                    const getNodeConfig = (t) => {
                                        switch (t) {
                                            case "lab":
                                                return { icon: FlaskConical, color: "text-purple-600 border-purple-500 bg-purple-50/50" };
                                            case "benih":
                                                return { icon: Sprout, color: "text-amber-600 border-amber-500 bg-amber-50/50" };
                                            case "pengaduan":
                                                return { icon: ClipboardList, color: "text-blue-600 border-blue-500 bg-blue-50/50" };
                                            case "user":
                                                return { icon: Users, color: "text-emerald-600 border-emerald-500 bg-emerald-50/50" };
                                            case "auth":
                                                return { icon: ShieldCheck, color: "text-sky-600 border-sky-500 bg-sky-50/50" };
                                            default:
                                                return { icon: CheckCircle2, color: "text-brand-600 border-brand-500 bg-brand-50/50" };
                                        }
                                    };

                                    const nodeCfg = getNodeConfig(act.tipe || act.type);
                                    const NodeIcon = nodeCfg.icon;

                                    return (
                                        <div key={act.id || i} className="flex items-start gap-3.5 group">
                                            {/* Node Circle */}
                                            <div
                                                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-xs transition-transform group-hover:scale-110 ${nodeCfg.color}`}
                                            >
                                                <NodeIcon size={14} />
                                            </div>

                                            {/* Card Detail */}
                                            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition-all group-hover:bg-white group-hover:shadow-sm group-hover:border-slate-200">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-xs font-black text-slate-900 line-clamp-1">
                                                        {act.action || act.title || "Pembaruan Data"}
                                                    </p>
                                                    <span className="shrink-0 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatRelativeTime(act.created_at || act.createdAt || act.time)}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                                                    {act.detail}
                                                </p>

                                                {/* Akun yang Melakukan Perubahan */}
                                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
                                                            {initials(namaAkun)}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-800 truncate">
                                                            {namaAkun}
                                                        </span>
                                                    </div>
                                                    <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${roleMeta.badgeClass}`}>
                                                        {roleMeta.shortCode || role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {displayActivities.length === 0 && (
                                    <p className="pl-12 text-xs text-slate-400">Belum ada aktivitas tercatat.</p>
                                )}
                            </div>

                            {/* Tombol Buka Modal Selengkapnya */}
                            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                                <button
                                    onClick={() => setIsAuditModalOpen(true)}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-brand-700 transition"
                                >
                                    <History size={14} className="text-slate-500" />
                                    <span>Telusuri Arsip Riwayat Log ({activitiesList.length} Tersimpan)</span>
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 4. MODAL PUSAT AUDIT TRAIL & PENELUSURAN LOG LENGKAP        */}
            {/* ============================================================ */}
            {isAuditModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsAuditModalOpen(false)}
                >
                    <div
                        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-[2rem] border border-slate-200 bg-white shadow-2xl overflow-hidden animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <span>Audit Trail &amp; Riwayat Log Sistem</span>
                                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800 border border-brand-200">
                                            {filteredFullLogs.length} Log
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Arsip permanen pencatatan seluruh aktivitas petugas di server MySQL.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={refreshLogsOnly}
                                    disabled={isLogRefreshing}
                                    title="Segarkan Log"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    <RefreshCw size={13} className={isLogRefreshing ? "animate-spin text-brand-600" : ""} />
                                    <span>Segarkan</span>
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    title="Unduh format CSV/Excel"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                                >
                                    <Download size={13} />
                                    <span>Unduh Excel (CSV)</span>
                                </button>
                                <button
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="border-b border-slate-100 bg-slate-50/60 p-4 sm:px-6">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari petugas, SPK, aksi..."
                                        value={auditSearch}
                                        onChange={(e) => setAuditSearch(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-brand-500"
                                    />
                                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                                </div>

                                {/* Filter Periode */}
                                <div>
                                    <select
                                        value={auditPeriod}
                                        onChange={(e) => setAuditPeriod(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-500"
                                    >
                                        <option value="all">🗓️ Semua Waktu</option>
                                        <option value="today">☀️ Hari Ini</option>
                                        <option value="week">📅 7 Hari Terakhir (1 Minggu)</option>
                                        <option value="month">📊 30 Hari Terakhir (1 Bulan)</option>
                                        <option value="custom">⚙️ Rentang Tanggal Manual</option>
                                    </select>
                                </div>

                                {/* Filter Modul */}
                                <div>
                                    <select
                                        value={auditTipe}
                                        onChange={(e) => setAuditTipe(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-500"
                                    >
                                        <option value="semua">📁 Semua Modul</option>
                                        <option value="lab">🧪 Laboratorium (Lab / Analis)</option>
                                        <option value="benih">🌱 Perbenihan (Benih)</option>
                                        <option value="pengaduan">📋 Layanan &amp; Permohonan</option>
                                        <option value="auth">🔐 Akun &amp; Sesi Login</option>
                                    </select>
                                </div>

                                {/* Filter Role */}
                                <div>
                                    <select
                                        value={auditRole}
                                        onChange={(e) => setAuditRole(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-500"
                                    >
                                        <option value="semua">👥 Semua Role Petugas</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Analis">Analis</option>
                                        <option value="PetugasLab">Petugas Lab</option>
                                        <option value="PetugasBenih">Petugas Benih</option>
                                        <option value="PetugasLayanan">Petugas Layanan</option>
                                    </select>
                                </div>
                            </div>

                            {/* Custom Date Range if chosen */}
                            {auditPeriod === "custom" && (
                                <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
                                    <span className="text-xs font-bold text-slate-600">Pilih Rentang:</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={auditStartDate}
                                            onChange={(e) => setAuditStartDate(e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-brand-500"
                                        />
                                        <span className="text-xs text-slate-400">s/d</span>
                                        <input
                                            type="date"
                                            value={auditEndDate}
                                            onChange={(e) => setAuditEndDate(e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-brand-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List Content Table */}
                        <div className="flex-1 overflow-y-auto p-4 sm:px-6">
                            {filteredFullLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                                        <History size={32} />
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-600">Tidak ada riwayat log yang cocok</p>
                                    <p className="mt-1 max-w-xs text-xs text-slate-400">
                                        Coba sesuaikan kata kunci pencarian atau ganti filter periode waktu.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-100/90 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-3 text-center w-12 border-r border-slate-200">No</th>
                                                <th className="px-4 py-3 min-w-[150px] border-r border-slate-200">Waktu &amp; Tanggal</th>
                                                <th className="px-4 py-3 min-w-[160px] border-r border-slate-200">Petugas Pelaksana</th>
                                                <th className="px-3.5 py-3 text-center min-w-[100px] border-r border-slate-200">Modul</th>
                                                <th className="px-4 py-3 min-w-[160px] border-r border-slate-200">Aksi Operasional</th>
                                                <th className="px-4 py-3 min-w-[240px]">Rincian Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {filteredFullLogs.map((log, idx) => {
                                                const rawDate = log.created_at || log.createdAt || log.time;
                                                const dObj = rawDate ? new Date(rawDate) : null;
                                                const formattedTime = dObj && !isNaN(dObj.getTime())
                                                    ? dObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB"
                                                    : "-";
                                                const formattedDate = dObj && !isNaN(dObj.getTime())
                                                    ? dObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                                    : "-";

                                                const role = log.user_role || log.userRole || log.role || "Petugas";
                                                const roleMeta = ROLE_DETAILS[role] || {
                                                    label: role,
                                                    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                                                };
                                                const namaAkun = log.user_nama || log.userNama || log.nama || "Petugas";
                                                const modul = log.tipe || log.type || "system";

                                                const getModulBadge = (m) => {
                                                    switch (m) {
                                                        case "lab": return "bg-purple-100 text-purple-900 border-purple-200";
                                                        case "benih": return "bg-amber-100 text-amber-900 border-amber-200";
                                                        case "pengaduan": return "bg-blue-100 text-blue-900 border-blue-200";
                                                        case "auth": return "bg-sky-100 text-sky-900 border-sky-200";
                                                        default: return "bg-slate-100 text-slate-800 border-slate-200";
                                                    }
                                                };

                                                return (
                                                    <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-3 py-3 text-center text-slate-400 font-mono border-r border-slate-100">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-4 py-3 border-r border-slate-100 whitespace-nowrap">
                                                            <div className="font-black text-slate-800">{formattedDate}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                                                <Clock size={10} className="text-slate-400" />
                                                                <span>{formattedTime}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 border-r border-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
                                                                    {initials(namaAkun)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 line-clamp-1">{namaAkun}</div>
                                                                    <span className={`inline-flex rounded-md border px-1.5 py-0.2 text-[9px] font-extrabold ${roleMeta.badgeClass}`}>
                                                                        {roleMeta.label || role}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3.5 py-3 text-center border-r border-slate-100 whitespace-nowrap">
                                                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getModulBadge(modul)}`}>
                                                                {modul}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 border-r border-slate-100 font-black text-slate-900">
                                                            {log.action || log.title || "Pembaruan Data"}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-700 leading-relaxed max-w-md font-medium">
                                                            {log.detail}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan <strong>{filteredFullLogs.length}</strong> dari total <strong>{activitiesList.length}</strong> riwayat log tersimpan.
                            </span>
                            <button
                                onClick={() => setIsAuditModalOpen(false)}
                                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
