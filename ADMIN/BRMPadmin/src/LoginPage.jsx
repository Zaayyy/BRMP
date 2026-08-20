import { useState } from "react";
import { authService } from "./services/apiService";
import { Eye, EyeOff, ShieldCheck, Leaf, FlaskConical, Sprout } from "lucide-react";

function BrmpLogo() {
    return (
        <img
            src="/images/brmp_emblem.png"
            alt="Logo BRMP DIY"
            className="h-36 w-36 sm:h-44 sm:w-44 object-contain"
            style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.25))" }}
        />
    );
}

const STATS = [
    { label: "Pengujian Benih", value: "Aktif",   icon: FlaskConical },
    { label: "Katalog Online",  value: "Real-Time", icon: Sprout },
    { label: "Layanan Aduan",   value: "Terpadu",  icon: ShieldCheck },
];

export default function LoginPage({ onLogin }) {
    const [form,      setForm]      = useState({ username: "admin@brmpdiy.go.id", password: "Password123!" });
    const [error,     setError]     = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPw,    setShowPw]    = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim() || !form.password.trim()) {
            setError("Silakan isi email/username dan password terlebih dahulu.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await authService.login({ email: form.username.trim(), password: form.password });
            if (res?.success) {
                if (onLogin) onLogin(res.data?.user);
            } else {
                setError(res?.message || "Login gagal. Periksa kredensial Anda.");
            }
        } catch (err) {
            setError(err.message || "Tidak dapat terhubung ke server. Pastikan backend aktif.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                {/* ============================
                    LEFT — Brand Visual
                    ============================ */}
                <div className="login-visual">
                    <div className="visual-glow" />

                    {/* Live chip */}
                    <span className="brand-chip">
                        BRMP DIY
                    </span>

                    {/* Logo */}
                    <div className="brand-mark">
                        <BrmpLogo />
                    </div>

                    <h1>Dashboard Petugas</h1>

                    <p className="subtitle">
                        Sistem informasi benih dan pengelolaan data BRMP DIY untuk petugas dan administrator.
                    </p>

                    {/* Stats row */}
                    <div className="visual-stats">
                        {STATS.map(({ label, value, icon: Icon }) => (
                            <div key={label}>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", marginBottom:"4px" }}>
                                    <Icon size={14} color="#86ebbf" />
                                    <strong>{value}</strong>
                                </div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ============================
                    RIGHT — Form Panel
                    ============================ */}
                <div className="login-panel">
                    <div className="login-header">
                        <span className="mini-tag">Akses Petugas &amp; Admin</span>
                        <h2>Selamat datang kembali</h2>
                        <p>Masuk untuk mengelola data, stok, dan aktivitas dashboard sistem BRMP DIY.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form" noValidate>
                        {/* Email */}
                        <label>
                            <span>Email / Username</span>
                            <input
                                type="text"
                                id="login-email"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="admin@brmpdiy.go.id"
                                autoComplete="username"
                            />
                        </label>

                        {/* Password */}
                        <label>
                            <span>Password</span>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPw ? "text" : "password"}
                                    id="login-password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password"
                                    autoComplete="current-password"
                                    style={{ paddingRight: "48px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    style={{
                                        position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "var(--text-400)", padding: "4px", lineHeight: 1,
                                    }}
                                    tabIndex={-1}
                                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </label>

                        {/* Row */}
                        <div className="row-between">
                            <label className="checkbox-wrap">
                                <input type="checkbox" defaultChecked />
                                <span>Ingat saya</span>
                            </label>
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => alert("Silakan hubungi administrator IT BRMP DIY untuk reset password.")}
                            >
                                Lupa password?
                            </button>
                        </div>

                        {/* Error */}
                        {error && <p className="error-text" role="alert">{error}</p>}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                            id="login-submit"
                        >
                            {isLoading
                                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
                                    <span style={{ display:"inline-block", width:"18px", height:"18px", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                                    Memverifikasi…
                                  </span>
                                : "Masuk ke Dashboard"
                            }
                        </button>
                    </form>

                    {/* Footer note */}
                    <p style={{ marginTop:"24px", fontSize:"0.78rem", color:"var(--text-400)", textAlign:"center", lineHeight:1.6 }}>
                        Portal internal BRMP DIY. Hak akses dibatasi berdasarkan peran pengguna.
                    </p>
                </div>
            </div>
        </div>
    );
}
