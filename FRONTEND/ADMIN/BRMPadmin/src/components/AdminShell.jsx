import {
    ArrowUpRight,
    Bell,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    FlaskConical,
    LayoutDashboard,
    LogOut,
    Settings,
    Sprout,
    Users,
    TrendingUp,
    AlertCircle,
    Zap,
} from "lucide-react";
import { authService, ROLE_DETAILS } from "../services/apiService";

const ALL_SIDEBAR_ITEMS = [
    { label: "Dashboard",    icon: LayoutDashboard, key: "dashboard", roles: ["Admin"] },
    { label: "Permohonan",   icon: ClipboardList,   key: "permohonan", roles: ["Admin", "PetugasLayanan"] },
    {
        label: "Laboratorium",
        icon: FlaskConical,
        key: "laboratorium-jenis-sampel",
        roles: ["Admin", "PetugasLab", "Analis"],
        children: [
            { label: "Jenis Sampel", key: "laboratorium-jenis-sampel", roles: ["Admin", "PetugasLab"] },
            { label: "Masuk (Belum Bayar)", key: "laboratorium-masuk", roles: ["Admin", "PetugasLab"] },
            { label: "Proses Pengujian", key: "laboratorium-proses-uji", roles: ["Admin", "PetugasLab"] },
            { label: "Laporan Selesai", key: "laboratorium-laporan-selesai", roles: ["Admin", "PetugasLab"] },
            { label: "Buku Analis (Parameter)", key: "laboratorium-buku-analis", roles: ["Admin", "Analis"] },
        ],
    },
    {
        label: "Data Benih",
        icon: Sprout,
        key: "benih-jenis-benih",
        roles: ["Admin", "PetugasBenih"],
        children: [
            { label: "Jenis Benih",  key: "benih-jenis-benih" },
            { label: "Update Benih", key: "benih-update-benih" },
        ],
    },
    { label: "User",        icon: Users,    key: "user", roles: ["Admin"] },
    { label: "Pengaturan",  icon: Settings, key: "pengaturan", roles: ["Admin"] },
];

export default function AdminShell({ activeView, onNavigate, onLogout, children }) {
    const user = authService.getUser();
    const userRole = user?.role || "Admin";
    const roleMeta = ROLE_DETAILS[userRole] || {
        label: "Administrator",
        shortCode: "ADM",
        desc: "Superadmin",
        badgeClass: "bg-emerald-500/15 text-emerald-700",
    };

    // Filter sidebar items dan children berdasarkan userRole
    const visibleSidebarItems = ALL_SIDEBAR_ITEMS
        .filter((item) => (item.roles ? item.roles.includes(userRole) : true))
        .map((item) => {
            if (Array.isArray(item.children)) {
                const filteredChildren = item.children.filter((c) =>
                    c.roles ? c.roles.includes(userRole) : true
                );
                const defaultKey = userRole === "Analis" && item.key.startsWith("laboratorium")
                    ? "laboratorium-buku-analis"
                    : (filteredChildren[0]?.key || item.key);

                return {
                    ...item,
                    key: defaultKey,
                    children: filteredChildren,
                };
            }
            return item;
        });

    return (
        <div className="min-h-screen lg:flex bg-transparent">
            {/* ====================================================
                SIDEBAR
                ==================================================== */}
            <aside
                className="
                    relative lg:sticky lg:top-0 lg:h-screen lg:w-72 xl:w-80
                    flex-shrink-0
                "
                style={{
                    background: "linear-gradient(165deg, #071a0e 0%, #0c2d1a 30%, #0f3d24 60%, #0e3020 100%)",
                    boxShadow: "4px 0 40px -4px rgba(5,20,10,0.40)",
                }}
            >
                {/* Decorative mesh blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
                    <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-gold-400/8 blur-3xl" />
                </div>

                <div className="relative flex h-full flex-col gap-4 overflow-y-auto p-4">

                    {/* Brand Logo */}
                    <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                        <img
                            src="/images/brmp_emblem.png"
                            alt="BRMP DIY Emblem"
                            className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                        />
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-300">
                                BRMP DIY
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                                Agro Modern Admin
                            </p>
                        </div>
                    </div>

                    {/* Navigation label */}
                    <p className="px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                        Navigasi
                    </p>

                    {/* Nav Items */}
                    <nav className="flex flex-1 flex-col gap-1">
                        {visibleSidebarItems.map((item) => {
                            const Icon = item.icon;
                            const hasChildren = Array.isArray(item.children);
                            const isOpen = hasChildren && (
                                item.key === "benih-jenis-benih"
                                    ? activeView.startsWith("benih")
                                    : item.children.some((c) => c.key === activeView)
                            );
                            const isActive = activeView === item.key || isOpen;

                            return (
                                <div key={item.label}>
                                    <button
                                        onClick={() => onNavigate?.(item.key)}
                                        className={`
                                            group relative w-full flex items-center justify-between gap-3
                                             rounded-xl px-3.5 py-3 text-left text-sm font-semibold
                                            transition-all duration-200
                                            ${isActive
                                                ? "bg-white/12 text-white shadow-inner-sm"
                                                : "text-white/55 hover:bg-white/7 hover:text-white/90"
                                            }
                                        `}
                                    >
                                        {/* Active indicator */}
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                                style={{ background: "linear-gradient(180deg,#25c47a,#0f9957)" }}
                                            />
                                        )}

                                        <span className="flex items-center gap-3">
                                            <span className={`
                                                flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                                                ${isActive
                                                    ? "bg-brand-500 text-white shadow-md"
                                                    : "bg-white/6 text-white/40 group-hover:bg-white/10 group-hover:text-white/70"
                                                }
                                            `}>
                                                <Icon size={16} strokeWidth={2.2} />
                                            </span>
                                            <span>{item.label}</span>
                                        </span>

                                        {hasChildren && (
                                            <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                                                <ChevronDown size={14} />
                                            </span>
                                        )}
                                    </button>

                                    {/* Sub-items */}
                                    {hasChildren && isOpen && (
                                        <div className="mt-1 ml-5 space-y-0.5 border-l border-white/10 pl-4 pb-1">
                                            {item.children.map((child) => {
                                                const isChildActive = activeView === child.key;
                                                return (
                                                    <button
                                                        key={child.key}
                                                        onClick={() => onNavigate?.(child.key)}
                                                        className={`
                                                            w-full text-left rounded-lg px-3 py-2 text-xs font-semibold
                                                            transition-all duration-150
                                                            ${isChildActive
                                                                ? "bg-brand-500/20 text-brand-300 font-bold"
                                                                : "text-white/45 hover:bg-white/6 hover:text-white/80"
                                                            }
                                                        `}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span className={`h-1.5 w-1.5 rounded-full transition-colors ${isChildActive ? "bg-brand-400" : "bg-white/20"}`} />
                                                            {child.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Divider */}
                    <div className="h-px bg-white/8" />

                    {/* Priority Notification Card (Jika role Admin atau PetugasLayanan) */}
                    {(userRole === "Admin" || userRole === "PetugasLayanan") && (
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/6 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-amber-300">
                                <Bell size={15} strokeWidth={2.5} />
                                <span className="text-xs font-bold uppercase tracking-wide">Prioritas Layanan</span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-white/55">
                                Periksa permohonan yang menunggu tanggapan sebelum jam 15.00.
                            </p>
                            <button
                                onClick={() => onNavigate?.("permohonan")}
                                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-300 transition-colors hover:text-amber-200"
                            >
                                Buka daftar <ArrowUpRight size={13} />
                            </button>
                        </div>
                    )}

                    {/* User Badge + Logout */}
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-sm"
                                style={{
                                    background:
                                        userRole === "Admin"
                                            ? "linear-gradient(135deg, #059669, #065f46)"
                                            : userRole === "Analis"
                                            ? "linear-gradient(135deg, #9333ea, #581c87)"
                                            : userRole === "PetugasLab"
                                            ? "linear-gradient(135deg, #2563eb, #1e40af)"
                                            : userRole === "PetugasLayanan"
                                            ? "linear-gradient(135deg, #d97706, #92400e)"
                                            : "linear-gradient(135deg, #0d9488, #115e59)",
                                }}
                            >
                                {roleMeta.shortCode}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-white/90">
                                    {user?.nama || "Petugas BRMP DIY"}
                                </p>
                                <p className="text-[10px] font-medium text-white/50 truncate">
                                    {roleMeta.label}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/55 transition-all duration-200 hover:bg-red-500/15 hover:border-red-400/30 hover:text-red-300"
                        >
                            <LogOut size={14} />
                            Keluar dari Sistem
                        </button>
                    </div>

                </div>
            </aside>

            {/* ====================================================
                MAIN CONTENT
                ==================================================== */}
            <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {children}
            </main>
        </div>
    );
}
