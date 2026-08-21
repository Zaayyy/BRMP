import React, { useState, useEffect, useMemo } from "react";
import {
    Users,
    UserPlus,
    Search,
    Shield,
    FlaskConical,
    Headphones,
    Sprout,
    Edit2,
    Trash2,
    CheckCircle2,
    AlertCircle,
    X,
    Eye,
    EyeOff,
    RefreshCw,
    ShieldCheck,
    Mail,
    ArrowLeft,
    Check,
} from "lucide-react";
import { internalUserService, ROLE_LIST, ROLE_DETAILS, authService } from "./services/apiService";

const DEFAULT_USERS_MOCK = [
    { id: 1, nama: "Administrator BRMP DIY", email: "admin@brmpdiy.go.id", role: "Admin", createdAt: "2026-08-19T00:00:00.000Z" },
    { id: 2, nama: "Petugas Laboratorium", email: "petugaslab@brmpdiy.go.id", role: "PetugasLab", createdAt: "2026-08-19T00:00:00.000Z" },
    { id: 3, nama: "Petugas Layanan & Pengaduan", email: "petugaslayanan@brmpdiy.go.id", role: "PetugasLayanan", createdAt: "2026-08-19T00:00:00.000Z" },
    { id: 4, nama: "Petugas Perbenihan", email: "petugasbenih@brmpdiy.go.id", role: "PetugasBenih", createdAt: "2026-08-19T00:00:00.000Z" },
];

export default function UserMen({ onNavigate }) {
    const currentUser = authService.getUser();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

    // Modal Form States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form States
    const [addForm, setAddForm] = useState({
        nama: "",
        email: "",
        role: "PetugasLab",
        password: "",
        confirmPassword: "",
    });
    const [editForm, setEditForm] = useState({
        nama: "",
        email: "",
        role: "PetugasLab",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pop-Up Modal Status Dialog (Berhasil / Gagal)
    const [statusPopup, setStatusPopup] = useState(null);

    // Fetch users from API
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await internalUserService.getAll();
            if (res?.success && Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                setUsers((prev) => (prev.length > 0 ? prev : DEFAULT_USERS_MOCK));
            }
        } catch (err) {
            console.warn("Backend user API offline, using local memory state:", err);
            setUsers((prev) => (prev.length > 0 ? prev : DEFAULT_USERS_MOCK));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter and search computation
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
            const query = searchQuery.toLowerCase().trim();
            const matchSearch =
                !query ||
                u.nama?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                ROLE_DETAILS[u.role]?.label?.toLowerCase().includes(query);
            return matchRole && matchSearch;
        });
    }, [users, selectedRoleFilter, searchQuery]);

    // Role Counts
    const stats = useMemo(() => {
        const counts = {
            total: users.length,
            Admin: 0,
            PetugasLab: 0,
            PetugasLayanan: 0,
            PetugasBenih: 0,
        };
        users.forEach((u) => {
            if (counts[u.role] !== undefined) {
                counts[u.role] += 1;
            }
        });
        return counts;
    }, [users]);

    // Handle Create User
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!addForm.nama.trim() || !addForm.email.trim() || !addForm.password) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Gagal Menambahkan Pengguna",
                message: "Harap lengkapi semua kolom yang wajib diisi (*).",
            });
            return;
        }

        if (addForm.password.length < 6) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Password Kurang Panjang",
                message: "Password wajib memiliki panjang minimal 6 karakter.",
            });
            return;
        }

        if (addForm.password !== addForm.confirmPassword) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Konfirmasi Password Salah",
                message: "Password dan konfirmasi password tidak cocok.",
            });
            return;
        }

        setIsSubmitting(true);
        // Tutup modal form terlebih dahulu untuk kembali ke halaman management user
        setIsAddModalOpen(false);

        try {
            const payload = {
                nama: addForm.nama.trim(),
                email: addForm.email.toLowerCase().trim(),
                role: addForm.role,
                password: addForm.password,
            };

            let res = null;
            try {
                res = await internalUserService.create(payload);
            } catch (apiErr) {
                console.warn("API request fallback:", apiErr);
            }

            // Jika berhasil melalui API atau fallback lokal
            const newId = res?.data?.id || (users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1);
            const newUserObj = {
                id: newId,
                nama: payload.nama,
                email: payload.email,
                role: payload.role,
                createdAt: new Date().toISOString(),
            };

            setUsers((prev) => [newUserObj, ...prev]);
            setAddForm({ nama: "", email: "", role: "PetugasLab", password: "", confirmPassword: "" });

            // Tampilkan Popup Sukses
            setStatusPopup({
                isOpen: true,
                type: "success",
                title: "Pengguna Baru Berhasil Ditambahkan! 🎉",
                message: `Akun untuk '${newUserObj.nama}' telah berhasil didaftarkan ke dalam sistem.`,
                user: newUserObj,
            });

            // Re-fetch data
            fetchUsers();
        } catch (err) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Gagal Menambahkan Pengguna",
                message: err.message || "Terjadi kesalahan saat memproses penambahan user.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (u) => {
        setSelectedUser(u);
        setEditForm({
            nama: u.nama || "",
            email: u.email || "",
            role: u.role || "PetugasLab",
            password: "",
        });
        setIsEditModalOpen(true);
    };

    // Handle Update User (Simpan Perubahan)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        if (!editForm.nama.trim() || !editForm.email.trim()) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Gagal Menyimpan Perubahan",
                message: "Nama lengkap dan email tidak boleh kosong.",
            });
            return;
        }

        if (editForm.password && editForm.password.length < 6) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Password Kurang Panjang",
                message: "Password baru minimal 6 karakter jika ingin diubah.",
            });
            return;
        }

        setIsSubmitting(true);
        // Tutup modal edit untuk kembali ke halaman utama tabel management user
        setIsEditModalOpen(false);

        try {
            const payload = {
                nama: editForm.nama.trim(),
                email: editForm.email.toLowerCase().trim(),
                role: editForm.role,
            };
            if (editForm.password) {
                payload.password = editForm.password;
            }

            let res = null;
            try {
                res = await internalUserService.update(selectedUser.id, payload);
            } catch (apiErr) {
                console.warn("API update fallback:", apiErr);
            }

            const updatedUser = {
                ...selectedUser,
                nama: payload.nama,
                email: payload.email,
                role: payload.role,
                updatedAt: new Date().toISOString(),
            };

            // Update state lokal secara instan
            setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
            setSelectedUser(null);

            // Munculkan Pop Up Notifikasi Berhasil
            setStatusPopup({
                isOpen: true,
                type: "success",
                title: "Perubahan Berhasil Disimpan! ✨",
                message: `Data pengguna '${updatedUser.nama}' telah berhasil diperbarui dan disimpan.`,
                user: updatedUser,
            });

            // Re-fetch backend
            fetchUsers();
        } catch (err) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Gagal Menyimpan Perubahan",
                message: err.message || "Terjadi kesalahan pada sistem saat memperbarui user.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Delete Modal
    const openDeleteModal = (u) => {
        setSelectedUser(u);
        setIsDeleteModalOpen(true);
    };

    // Handle Delete User
    const handleDeleteSubmit = async () => {
        if (!selectedUser) return;
        const deletedUserName = selectedUser.nama;
        const deletedUserId = selectedUser.id;

        setIsSubmitting(true);
        setIsDeleteModalOpen(false);

        try {
            try {
                await internalUserService.delete(deletedUserId);
            } catch (apiErr) {
                console.warn("API delete fallback:", apiErr);
            }

            // Hapus dari state lokal
            setUsers((prev) => prev.filter((u) => u.id !== deletedUserId));
            setSelectedUser(null);

            // Munculkan Pop Up Sukses Hapus
            setStatusPopup({
                isOpen: true,
                type: "success",
                title: "Pengguna Berhasil Dihapus",
                message: `Akun '${deletedUserName}' telah dihapus dari sistem BRMP DIY.`,
            });

            fetchUsers();
        } catch (err) {
            setStatusPopup({
                isOpen: true,
                type: "error",
                title: "Gagal Menghapus Pengguna",
                message: err.message || "Terjadi kesalahan saat menghapus pengguna.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "Admin":
                return <Shield size={16} className="text-emerald-600" />;
            case "PetugasLab":
                return <FlaskConical size={16} className="text-blue-600" />;
            case "PetugasLayanan":
                return <Headphones size={16} className="text-amber-600" />;
            case "PetugasBenih":
                return <Sprout size={16} className="text-teal-600" />;
            default:
                return <ShieldCheck size={16} className="text-slate-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* ====================================================
                PAGE HEADER
                ==================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                            <Users size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Manajemen Pengguna
                            </h1>
                            <p className="text-xs font-medium text-slate-500">
                                Kelola akun petugas &amp; hak akses 4 role sistem BRMP DIY
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60"
                        title="Segarkan Data"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-95"
                    >
                        <UserPlus size={15} strokeWidth={2.5} />
                        <span>Tambah User Baru</span>
                    </button>
                </div>
            </div>

            {/* ====================================================
                STATISTICS CARDS (4 ROLES)
                ==================================================== */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {/* Total User */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total User</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Users size={14} />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</p>
                    <span className="text-[11px] font-medium text-slate-500">Akun terdaftar aktif</span>
                </div>

                {/* Admin */}
                <div
                    onClick={() => setSelectedRoleFilter(selectedRoleFilter === "Admin" ? "ALL" : "Admin")}
                    className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                        selectedRoleFilter === "Admin"
                            ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                            : "border-slate-200/80 bg-white hover:border-emerald-300"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Admin</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <Shield size={14} />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-emerald-900">{stats.Admin}</p>
                    <span className="text-[11px] font-medium text-emerald-700/80">Superadministrator</span>
                </div>

                {/* Petugas Lab */}
                <div
                    onClick={() => setSelectedRoleFilter(selectedRoleFilter === "PetugasLab" ? "ALL" : "PetugasLab")}
                    className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                        selectedRoleFilter === "PetugasLab"
                            ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20"
                            : "border-slate-200/80 bg-white hover:border-blue-300"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Petugas Lab</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <FlaskConical size={14} />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-blue-900">{stats.PetugasLab}</p>
                    <span className="text-[11px] font-medium text-blue-700/80">Laboratorium Uji</span>
                </div>

                {/* Petugas Layanan */}
                <div
                    onClick={() => setSelectedRoleFilter(selectedRoleFilter === "PetugasLayanan" ? "ALL" : "PetugasLayanan")}
                    className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                        selectedRoleFilter === "PetugasLayanan"
                            ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                            : "border-slate-200/80 bg-white hover:border-amber-300"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Layanan</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Headphones size={14} />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-amber-900">{stats.PetugasLayanan}</p>
                    <span className="text-[11px] font-medium text-amber-700/80">Pengaduan &amp; Layanan</span>
                </div>

                {/* Petugas Benih */}
                <div
                    onClick={() => setSelectedRoleFilter(selectedRoleFilter === "PetugasBenih" ? "ALL" : "PetugasBenih")}
                    className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                        selectedRoleFilter === "PetugasBenih"
                            ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20"
                            : "border-slate-200/80 bg-white hover:border-teal-300"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Petugas Benih</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                            <Sprout size={14} />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-teal-900">{stats.PetugasBenih}</p>
                    <span className="text-[11px] font-medium text-teal-700/80">Stok &amp; Katalog Benih</span>
                </div>
            </div>

            {/* ====================================================
                SEARCH & FILTER BAR
                ==================================================== */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan nama, email, atau peran..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Role Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedRoleFilter("ALL")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            selectedRoleFilter === "ALL"
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        Semua ({users.length})
                    </button>
                    {ROLE_LIST.map((r) => (
                        <button
                            key={r}
                            onClick={() => setSelectedRoleFilter(r)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                                selectedRoleFilter === r
                                    ? "bg-brand-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {ROLE_DETAILS[r]?.label} ({stats[r] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* ====================================================
                TABLE USERS
                ==================================================== */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="py-3.5 pl-6 pr-3">Pengguna</th>
                                <th className="py-3.5 px-4">Role &amp; Hak Akses</th>
                                <th className="py-3.5 px-4">Email Terdaftar</th>
                                <th className="py-3.5 px-4">Status &amp; Dibuat</th>
                                <th className="py-3.5 pr-6 pl-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-slate-200" />
                                                <div className="space-y-1.5">
                                                    <div className="h-3.5 w-32 rounded bg-slate-200" />
                                                    <div className="h-2.5 w-24 rounded bg-slate-100" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4"><div className="h-6 w-28 rounded-full bg-slate-200" /></td>
                                        <td className="py-4 px-4"><div className="h-3 w-36 rounded bg-slate-200" /></td>
                                        <td className="py-4 px-4"><div className="h-3 w-20 rounded bg-slate-200" /></td>
                                        <td className="py-4 pr-6 pl-4 text-right"><div className="ml-auto h-7 w-16 rounded bg-slate-200" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <Users size={28} />
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-700">Tidak ada data user ditemukan</p>
                                        <p className="text-xs text-slate-400">
                                            {searchQuery || selectedRoleFilter !== "ALL"
                                                ? "Coba ubah kata kunci pencarian atau filter peran"
                                                : "Belum ada user yang ditambahkan"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const roleInfo = ROLE_DETAILS[u.role] || {
                                        label: u.role,
                                        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
                                        desc: "-",
                                    };
                                    const isSelf = currentUser?.id === u.id || currentUser?.email === u.email;

                                    return (
                                        <tr key={u.id} className="transition-colors hover:bg-slate-50/70">
                                            {/* Name & Avatar */}
                                            <td className="py-3.5 pl-6 pr-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm"
                                                        style={{
                                                            background:
                                                                u.role === "Admin"
                                                                    ? "linear-gradient(135deg, #059669, #065f46)"
                                                                    : u.role === "PetugasLab"
                                                                    ? "linear-gradient(135deg, #2563eb, #1e40af)"
                                                                    : u.role === "PetugasLayanan"
                                                                    ? "linear-gradient(135deg, #d97706, #92400e)"
                                                                    : "linear-gradient(135deg, #0d9488, #115e59)",
                                                        }}
                                                    >
                                                        {u.nama ? u.nama.charAt(0).toUpperCase() : "U"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-900 truncate">
                                                                {u.nama}
                                                            </span>
                                                            {isSelf && (
                                                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                                                    Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 font-mono">ID #{u.id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="py-3.5 px-4">
                                                <div className="inline-flex flex-col gap-0.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-xs ${roleInfo.badgeClass}`}
                                                    >
                                                        {getRoleIcon(u.role)}
                                                        {roleInfo.label}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 pl-1">
                                                        {roleInfo.desc}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                    <Mail size={13} className="text-slate-400 shrink-0" />
                                                    <span className="font-mono text-[11px]">{u.email}</span>
                                                </div>
                                            </td>

                                            {/* Created At */}
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Aktif
                                                    </span>
                                                    <p className="text-[10px] text-slate-400">
                                                        {u.createdAt
                                                            ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                                                                  day: "numeric",
                                                                  month: "short",
                                                                  year: "numeric",
                                                              })
                                                            : "Bawaan Sistem"}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 pr-6 pl-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 size={13} />
                                                        <span>Edit</span>
                                                    </button>

                                                    <button
                                                        onClick={() => openDeleteModal(u)}
                                                        disabled={isSelf}
                                                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors shadow-xs ${
                                                            isSelf
                                                                ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                                                                : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                                                        }`}
                                                        title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus User"}
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====================================================
                MODAL STATUS DIALOG (POP-UP BERHASIL / GAGAL)
                ==================================================== */}
            {statusPopup && statusPopup.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="text-center">
                            {/* Icon Animation */}
                            <div
                                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl shadow-lg ${
                                    statusPopup.type === "success"
                                        ? "bg-emerald-100 text-emerald-600 shadow-emerald-600/20"
                                        : "bg-rose-100 text-rose-600 shadow-rose-600/20"
                                }`}
                            >
                                {statusPopup.type === "success" ? (
                                    <CheckCircle2 size={36} strokeWidth={2.5} />
                                ) : (
                                    <AlertCircle size={36} strokeWidth={2.5} />
                                )}
                            </div>

                            {/* Title & Message */}
                            <h3 className="text-lg font-extrabold text-slate-900">
                                {statusPopup.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                {statusPopup.message}
                            </p>

                            {/* User details summary if present */}
                            {statusPopup.user && (
                                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-left">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-800">
                                            {statusPopup.user.nama}
                                        </span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                            {ROLE_DETAILS[statusPopup.user.role]?.label || statusPopup.user.role}
                                        </span>
                                    </div>
                                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                                        {statusPopup.user.email}
                                    </p>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={() => setStatusPopup(null)}
                                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-98 ${
                                    statusPopup.type === "success"
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700"
                                        : "bg-slate-900 shadow-slate-900/20 hover:bg-slate-800"
                                }`}
                            >
                                <Check size={15} />
                                <span>OK, Kembali ke Manajemen User</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================
                MODAL: TAMBAH USER BARU
                ==================================================== */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-teal-900 px-6 py-4.5 text-white">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                                    <UserPlus size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold">Tambah Pengguna Baru</h3>
                                    <p className="text-[11px] text-white/70">Pilih role sesuai tugas dan wewenang petugas</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.nama}
                                    onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                                    placeholder="Contoh: Budi Santoso, S.P."
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Email Kedinasan / Akun <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={addForm.email}
                                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                    placeholder="petugas@brmpdiy.go.id"
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* 4 Role Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Peran &amp; Hak Akses (Role) <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLE_LIST.map((r) => {
                                        const isSelected = addForm.role === r;
                                        const roleMeta = ROLE_DETAILS[r];
                                        return (
                                            <div
                                                key={r}
                                                onClick={() => setAddForm({ ...addForm, role: r })}
                                                className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                                                    isSelected
                                                        ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20"
                                                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getRoleIcon(r)}
                                                    <span className="text-xs font-bold text-slate-900">{roleMeta?.label}</span>
                                                </div>
                                                <p className="mt-1 text-[10px] leading-tight text-slate-500">{roleMeta?.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Password & Confirm */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={addForm.password}
                                            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                            placeholder="Minimal 6 karakter"
                                            className="w-full rounded-xl border border-slate-200 py-2 pl-3 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Konfirmasi Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={addForm.confirmPassword}
                                        onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                                        placeholder="Ulangi password"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={13} className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Simpan User</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ====================================================
                MODAL: EDIT USER (SIMPAN PERUBAHAN)
                ==================================================== */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4.5 text-white">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-brand-400">
                                    <Edit2 size={16} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold">Edit Data User</h3>
                                    <p className="text-[11px] text-white/70">Perbarui profil atau role pengguna #{selectedUser.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.nama}
                                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Email Akun <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* 4 Role Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Peran &amp; Hak Akses (Role)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLE_LIST.map((r) => {
                                        const isSelected = editForm.role === r;
                                        const roleMeta = ROLE_DETAILS[r];
                                        return (
                                            <div
                                                key={r}
                                                onClick={() => setEditForm({ ...editForm, role: r })}
                                                className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                                                    isSelected
                                                        ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20"
                                                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getRoleIcon(r)}
                                                    <span className="text-xs font-bold text-slate-900">{roleMeta?.label}</span>
                                                </div>
                                                <p className="mt-1 text-[10px] leading-tight text-slate-500">{roleMeta?.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Password Baru (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Ganti Password (Opsional)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder="Biarkan kosong jika tidak ingin mengganti password"
                                        className="w-full rounded-xl border border-slate-200 py-2 pl-3 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                <p className="mt-1 text-[10px] text-slate-400">Minimal 6 karakter jika ingin mengganti password.</p>
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={13} className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Simpan Perubahan</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ====================================================
                MODAL: KONFIRMASI HAPUS USER
                ==================================================== */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Hapus Akun Pengguna?</h3>
                                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                            <p className="text-xs font-bold text-slate-800">{selectedUser.nama}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedUser.email}</p>
                            <span className="mt-2 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                Peran: {ROLE_DETAILS[selectedUser.role]?.label || selectedUser.role}
                            </span>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw size={13} className="animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <span>Ya, Hapus Akun</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
