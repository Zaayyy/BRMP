import { ArrowLeft, Bell, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";

const sections = [
    {
        title: "Akses aplikasi",
        icon: ShieldCheck,
        items: [
            { label: "Autentikasi login", value: "Aktif" },
            { label: "Role pengguna", value: "Petugas, Admin" },
            { label: "Session timeout", value: "30 menit" },
        ],
    },
    {
        title: "Notifikasi",
        icon: Bell,
        items: [
            { label: "Email pemberitahuan", value: "Aktif" },
            { label: "WhatsApp reminder", value: "Nonaktif" },
            { label: "Pengingat stok", value: "Aktif" },
        ],
    },
    {
        title: "Umum",
        icon: SlidersHorizontal,
        items: [
            { label: "Nama sistem", value: "BRMP DIY" },
            { label: "Logo utama", value: "Terpasang" },
            { label: "Warna dashboard", value: "Hijau & Emas" },
        ],
    },
    {
        title: "User management",
        icon: Users,
        items: [
            { label: "Akun aktif", value: "26" },
            { label: "Petugas", value: "18" },
            { label: "Admin", value: "8" },
        ],
    },
];

export default function SettingsPage({ onNavigate }) {
    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <button onClick={() => onNavigate?.("dashboard")} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                    <ArrowLeft size={16} />
                    Kembali ke dashboard
                </button>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">PENGATURAN</p>
                <h1 className="mt-2 text-3xl font-black text-slate-900">Pengaturan aplikasi</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Konfigurasi sanggup dibuat di frontend tanpa backend, serta siap disambungkan ke API saat backend sudah tersedia.</p>
            </header>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {sections.map(({ title, icon: Icon, items }) => (
                    <article key={title} className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                                <Icon size={18} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">{title}</h2>
                        </div>

                        <div className="mt-5 space-y-3">
                            {items.map((item) => (
                                <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                                    <span className="text-sm text-slate-600">{item.label}</span>
                                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}
