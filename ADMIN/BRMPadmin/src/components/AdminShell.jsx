import { ArrowUpRight, Bell, ChevronDown, ChevronRight, ClipboardList, FlaskConical, LayoutDashboard, LogOut, Settings, Sprout, Users } from "lucide-react";

const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { label: "Permohonan", icon: ClipboardList, key: "permohonan" },
    {
        label: "Laboratorium",
        icon: FlaskConical,
        key: "laboratorium-jenis-sampel",
        children: [
            { label: "Jenis Sampel", key: "laboratorium-jenis-sampel" },
            { label: "Masuk", key: "laboratorium-masuk" },
            { label: "Laporan Selesai", key: "laboratorium-laporan-selesai" },
        ],
    },
    {
        label: "Data Benih",
        icon: Sprout,
        key: "benih-jenis-benih",
        children: [
            { label: "Jenis Benih", key: "benih-jenis-benih" },
            { label: "Update Benih", key: "benih-update-benih" },
        ],
    },
    { label: "User", icon: Users, key: "user" },
    { label: "Pengaturan", icon: Settings, key: "pengaturan" },
];

export default function AdminShell({ activeView, onNavigate, onLogout, children }) {
    return (
        <div className="min-h-screen lg:flex">
            <aside className="bg-[#123524] text-white lg:sticky lg:top-0 lg:h-screen lg:w-80">
                <div className="flex h-full flex-col gap-6 p-5">
                    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 font-black text-white">B</div>
                        <div>
                            <p className="text-sm font-semibold tracking-[0.22em] text-brand-100">KITA BRMP DIY</p>
                            <p className="text-xs text-white/70">Sistem Layanan Benih</p>
                        </div>
                    </div>

                    <nav className="flex flex-1 flex-col gap-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const hasChildren = Array.isArray(item.children);
                            const isOpen = hasChildren && (item.key === "benih-jenis-benih" ? activeView.startsWith("benih") : item.children.some((child) => child.key === activeView));
                            const isActive = activeView === item.key || isOpen;

                            return (
                                <div key={item.label} className="flex flex-col gap-2">
                                    <button onClick={() => onNavigate?.(item.key)} className={["flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition", isActive ? "bg-brand-500 text-white shadow-glow" : "text-white/75 hover:bg-white/10 hover:text-white"].join(" ")}>
                                        <span className="flex items-center gap-3">
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </span>
                                        {hasChildren ? isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : item.soon ? <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">Soon</span> : null}
                                    </button>

                                    {hasChildren && isOpen ? (
                                        <div className="ml-4 flex flex-col gap-2 border-l border-white/10 pl-3">
                                            {item.children.map((child) => {
                                                const isChildActive = activeView === child.key;
                                                return (
                                                    <button key={child.key} onClick={() => onNavigate?.(child.key)} className={["rounded-xl px-3 py-2 text-left text-xs font-semibold transition", isChildActive ? "bg-brand-400 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"].join(" ")}>
                                                        {child.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </nav>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Bell size={16} />
                            Notifikasi prioritas
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/70">Tiga permohonan menunggu verifikasi hari ini. Prioritaskan yang masuk sebelum jam 15.00.</p>
                        <button className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
                            Lihat daftar
                            <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <button onClick={onLogout} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
                        <LogOut size={18} />
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
