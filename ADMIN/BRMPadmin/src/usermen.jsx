import React, { useState } from "react";

const initialUsers = [
    { id: 1, name: "Dea", email: "dea@gmail.com", role: "Operator" },
    { id: 2, name: "Diah Sulistyorini", email: "dsy.nuriyanto@gmail.com", role: "Admin" },
    { id: 3, name: "Andik Susatyo", email: "andik@gmail.com", role: "Viewer" },
];

const roles = ["Operator", "Admin", "Viewer"];

export default function UserMen({ onNavigate }) {
    const [users, setUsers] = useState(initialUsers);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", role: roles[0] });
    const [newUser, setNewUser] = useState({ name: "", email: "", role: roles[0] });

    function startEdit(u) {
        setEditingId(u.id);
        setForm({ name: u.name, email: u.email, role: u.role });
    }

    function saveEdit(id) {
        setUsers((prev) => prev.map((p) => (p.id === id ? { ...p, ...form } : p)));
        setEditingId(null);
    }

    function cancelEdit() {
        setEditingId(null);
    }

    function deleteUser(id) {
        if (!window.confirm("Hapus user ini?")) return;
        setUsers((prev) => prev.filter((p) => p.id !== id));
    }

    function changeRole(id, newRole) {
        setUsers((prev) => prev.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
    }

    function addUser() {
        if (!newUser.name.trim() || !newUser.email.trim()) return;
        const id = users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
        setUsers((prev) => [...prev, { id, ...newUser }]);
        setNewUser({ name: "", email: "", role: roles[0] });
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Manajemen User</h2>
                <button onClick={() => onNavigate?.("dashboard")} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    Kembali
                </button>
            </div>

            <div className="mb-4 flex gap-2">
                <input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Nama" className="rounded border px-3 py-2" />
                <input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="rounded border px-3 py-2" />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="rounded border px-3 py-2">
                    {roles.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
                <button onClick={addUser} className="rounded bg-brand-500 px-4 py-2 text-white">
                    Tambah
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                            <th className="py-2">ID</th>
                            <th className="py-2">Nama</th>
                            <th className="py-2">Email</th>
                            <th className="py-2">Peran</th>
                            <th className="py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t">
                                <td className="py-3 w-12">{u.id}</td>

                                <td className="py-3">{editingId === u.id ? <input className="w-full rounded border px-2 py-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /> : <div className="font-medium">{u.name}</div>}</td>

                                <td className="py-3">{editingId === u.id ? <input className="w-full rounded border px-2 py-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /> : <div className="text-slate-600">{u.email}</div>}</td>

                                <td className="py-3">
                                    {editingId === u.id ? (
                                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded border px-2 py-1">
                                            {roles.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="inline-flex items-center gap-2">
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{u.role}</span>
                                            <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="rounded border px-2 py-1 text-xs">
                                                {roles.map((r) => (
                                                    <option key={r} value={r}>
                                                        {r}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </td>

                                <td className="py-3 space-x-2">
                                    {editingId === u.id ? (
                                        <>
                                            <button onClick={() => saveEdit(u.id)} className="rounded bg-green-600 px-3 py-1 text-white">
                                                Simpan
                                            </button>
                                            <button onClick={cancelEdit} className="rounded border px-3 py-1">
                                                Batal
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(u)} className="rounded border px-3 py-1">
                                                Edit
                                            </button>
                                            <button onClick={() => deleteUser(u.id)} className="rounded bg-red-600 px-3 py-1 text-white">
                                                Hapus
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
