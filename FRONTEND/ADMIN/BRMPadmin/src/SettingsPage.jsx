import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    ShieldCheck,
    Bell,
    SlidersHorizontal,
    Lock,
    Key,
    Clock,
    Mail,
    Phone,
    MapPin,
    Building,
    Eye,
    EyeOff,
    Check,
    HelpCircle,
    Database,
} from "lucide-react";
import { internalSettingsService, authService } from "./services/apiService";

export default function SettingsPage({ onNavigate }) {
    const user = authService.getUser();
    const [activeTab, setActiveTab] = useState("umum"); // umum | lab | notifikasi | keamanan

    // State Pengaturan Sistem
    const [settings, setSettings] = useState({
        nama_sistem: "BRMP DIY - Agro Modern Service",
        nama_instansi: "Balai Penerapan Standar Instrumen Pertanian (BRMP) D.I. Yogyakarta",
        email_kontak: "layanan@brmpdiy.my.id",
        whatsapp_hotline: "0812-3456-7890",
        alamat_kantor: "Jl. Gondosuli No. 1, Semaki, Umbulharjo, Kota Yogyakarta, D.I. Yogyakarta 55166",
        sla_hari: "45",
        sla_kuning_hari: "14",
        sla_merah_hari: "7",
        notifikasi_email: "1",
        notifikasi_wa: "1",
        session_timeout_menit: "30",
        format_spk: "CE-{KATEGORI}/{BULAN}-{TAHUN}/{NO}",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    // State Form Ganti Password
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Ambil Pengaturan dari Backend saat Load
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const res = await internalSettingsService.get();
            if (res && res.success && res.data) {
                setSettings((prev) => ({
                    ...prev,
                    ...res.data,
                }));
            }
        } catch (err) {
            console.warn("Gagal memuat pengaturan dari server:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettingChange = (field, value) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveSettings = async (e) => {
        e?.preventDefault();
        setIsSaving(true);
        setToastMessage(null);
        try {
            const res = await internalSettingsService.update(settings);
            setToastMessage({
                type: "success",
                text: res.message || "Pengaturan aplikasi berhasil disimpan ke server database!",
            });
            setTimeout(() => setToastMessage(null), 5000);
        } catch (err) {
            setToastMessage({
                type: "error",
                text: err.message || "Gagal menyimpan pengaturan ke server.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setToastMessage(null);

        if (passwordData.new_password.length < 6) {
            setToastMessage({
                type: "error",
                text: "Password baru minimal 6 karakter.",
            });
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            setToastMessage({
                type: "error",
                text: "Konfirmasi password baru tidak cocok dengan password baru.",
            });
            return;
        }

        setIsSavingPassword(true);
        try {
            const res = await internalSettingsService.changePassword(passwordData);
            setToastMessage({
                type: "success",
                text: res.message || "Kata sandi berhasil diperbarui!",
            });
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
            setTimeout(() => setToastMessage(null), 5000);
        } catch (err) {
            setToastMessage({
                type: "error",
                text: err.message || "Gagal memperbarui password akun.",
            });
        } finally {
            setIsSavingPassword(false);
        }
    };

    const TABS = [
        { id: "umum", label: "Identitas & Umum", icon: SlidersHorizontal },
        { id: "lab", label: "SLA & Laboratorium", icon: Clock },
        { id: "notifikasi", label: "Notifikasi & Sesi", icon: Bell },
        { id: "keamanan", label: "Keamanan Akun Admin", icon: ShieldCheck },
    ];

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
            {/* Header */}
            <header className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => onNavigate?.("dashboard")}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 mb-3"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke dashboard
                    </button>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">PENGATURAN SISTEM</p>
                    <h1 className="mt-1 text-2xl md:text-3xl font-black text-slate-900">Pengaturan Aplikasi & Keamanan</h1>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                        Kelola parameter operasional instansi, batas SLA peringatan uji, dan keamanan akun administrator secara terpusat.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={loadSettings}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        title="Segarkan Data"
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition"
                    >
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>Simpan Pengaturan</span>
                    </button>
                </div>
            </header>

            {/* Toast Alert */}
            {toastMessage && (
                <div
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                        toastMessage.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                >
                    {toastMessage.type === "success" ? (
                        <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                    ) : (
                        <AlertCircle className="text-rose-600 shrink-0" size={20} />
                    )}
                    <span className="text-sm font-semibold flex-1">{toastMessage.text}</span>
                    <button
                        onClick={() => setToastMessage(null)}
                        className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-black/5"
                    >
                        Tutup
                    </button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                isActive
                                    ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                            }`}
                        >
                            <Icon size={18} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
                {/* 1. IDENTITAS & UMUM */}
                {activeTab === "umum" && (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Building className="text-emerald-600" size={20} />
                                Profil & Identitas Instansi
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Informasi resmi yang akan ditampilkan pada dokumen dan portal publik.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Nama Sistem / Aplikasi
                                </label>
                                <input
                                    type="text"
                                    value={settings.nama_sistem}
                                    onChange={(e) => handleSettingChange("nama_sistem", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Nama Resmi Instansi
                                </label>
                                <input
                                    type="text"
                                    value={settings.nama_instansi}
                                    onChange={(e) => handleSettingChange("nama_instansi", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Mail size={14} className="text-slate-400" />
                                    Email Helpdesk / Pelayanan
                                </label>
                                <input
                                    type="email"
                                    value={settings.email_kontak}
                                    onChange={(e) => handleSettingChange("email_kontak", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Phone size={14} className="text-slate-400" />
                                    Nomor WhatsApp Hotline / Informasi
                                </label>
                                <input
                                    type="text"
                                    value={settings.whatsapp_hotline}
                                    onChange={(e) => handleSettingChange("whatsapp_hotline", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                                    <MapPin size={14} className="text-slate-400" />
                                    Alamat Kantor Operasional
                                </label>
                                <textarea
                                    rows={3}
                                    value={settings.alamat_kantor}
                                    onChange={(e) => handleSettingChange("alamat_kantor", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                                <Save size={16} />
                                Simpan Perubahan Identitas
                            </button>
                        </div>
                    </form>
                )}

                {/* 2. SLA & LABORATORIUM */}
                {activeTab === "lab" && (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Clock className="text-emerald-600" size={20} />
                                Standar Waktu Layanan (SLA) Pengujian Laboratorium
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Mengatur batas hari pengerjaan sampel serta indikator warna notifikasi pada tabel analis.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-extrabold uppercase text-emerald-800">Batas Maksimal SLA</span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-200" />
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={settings.sla_hari}
                                        onChange={(e) => handleSettingChange("sla_hari", e.target.value)}
                                        className="w-24 px-3 py-2 rounded-xl border border-emerald-300 font-black text-xl text-emerald-900 bg-white text-center focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                    <span className="text-sm font-bold text-emerald-900">Hari Kerja</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 mt-2">
                                    Target maksimal pengerjaan dari status bayar hingga laporan selesai terbit.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-extrabold uppercase text-amber-800">Peringatan Kuning</span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-200" />
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={settings.sla_kuning_hari}
                                        onChange={(e) => handleSettingChange("sla_kuning_hari", e.target.value)}
                                        className="w-24 px-3 py-2 rounded-xl border border-amber-300 font-black text-xl text-amber-900 bg-white text-center focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                    <span className="text-sm font-bold text-amber-900">Hari Sebelum SLA</span>
                                </div>
                                <p className="text-[11px] text-amber-700 mt-2">
                                    Badge berubah menjadi kuning untuk mengingatkan analis agar mempercepat pengujian.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-extrabold uppercase text-rose-800">Peringatan Kritis (Merah)</span>
                                    <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-200" />
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={settings.sla_merah_hari}
                                        onChange={(e) => handleSettingChange("sla_merah_hari", e.target.value)}
                                        className="w-24 px-3 py-2 rounded-xl border border-rose-300 font-black text-xl text-rose-900 bg-white text-center focus:ring-2 focus:ring-rose-500"
                                        required
                                    />
                                    <span className="text-sm font-bold text-rose-900">Hari Sebelum SLA</span>
                                </div>
                                <p className="text-[11px] text-rose-700 mt-2">
                                    Badge menjadi merah menyala saat sisa waktu mendekati batas akhir SLA.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Format Penomoran SPK Otomatis
                            </label>
                            <input
                                type="text"
                                value={settings.format_spk}
                                onChange={(e) => handleSettingChange("format_spk", e.target.value)}
                                className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-800 bg-slate-50"
                                required
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Variabel yang didukung: <code>{'{KATEGORI}'}</code>, <code>{'{BULAN}'}</code>, <code>{'{TAHUN}'}</code>, <code>{'{NO}'}</code>
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                                <Save size={16} />
                                Simpan Standar SLA
                            </button>
                        </div>
                    </form>
                )}

                {/* 3. NOTIFIKASI & SESI */}
                {activeTab === "notifikasi" && (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Bell className="text-emerald-600" size={20} />
                                Pengaturan Notifikasi & Waktu Sesi Login
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Konfigurasi pengingat otomatis dan batas masa aktif sesi login.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Toggle Email */}
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Email Pemberitahuan Otomatis</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Kirimkan notifikasi email ke petugas saat ada sampel baru atau permohonan masuk.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSettingChange("notifikasi_email", settings.notifikasi_email === "1" ? "0" : "1")}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.notifikasi_email === "1" ? "bg-emerald-600" : "bg-slate-300"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.notifikasi_email === "1" ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Toggle WA */}
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">WhatsApp Reminder & Pelacakan</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Integrasikan nomor WhatsApp pemohon untuk mengirimkan nomor SPK dan info hasil uji LHU.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSettingChange("notifikasi_wa", settings.notifikasi_wa === "1" ? "0" : "1")}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.notifikasi_wa === "1" ? "bg-emerald-600" : "bg-slate-300"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.notifikasi_wa === "1" ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Session Timeout */}
                            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
                                <label className="block text-sm font-bold text-slate-900 mb-1">
                                    Batas Waktu Tidak Aktif (Session Timeout)
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Pengguna akan otomatis di-logout dari sistem jika tidak ada interaksi dalam durasi ini.
                                </p>
                                <select
                                    value={settings.session_timeout_menit}
                                    onChange={(e) => handleSettingChange("session_timeout_menit", e.target.value)}
                                    className="w-full md:w-64 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="15">15 Menit</option>
                                    <option value="30">30 Menit (Standar)</option>
                                    <option value="60">1 Jam (60 Menit)</option>
                                    <option value="120">2 Jam (120 Menit)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                                <Save size={16} />
                                Simpan Notifikasi
                            </button>
                        </div>
                    </form>
                )}

                {/* 4. KEAMANAN & GANTI PASSWORD */}
                {activeTab === "keamanan" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Key className="text-emerald-600" size={20} />
                                Perbarui Kata Sandi Akun Administrator
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Anda saat ini login sebagai: <span className="font-bold text-slate-800">{user?.nama || "Administrator"}</span> ({user?.email})
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="max-w-xl space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Password Saat Ini
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                        placeholder="Masukkan kata sandi lama Anda"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Password Baru
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    placeholder="Minimal 6 karakter"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Konfirmasi Password Baru
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-slate-50/50"
                                    placeholder="Ketik ulang password baru Anda"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition"
                                >
                                    {isSavingPassword ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                                    Perbarui Kata Sandi Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
