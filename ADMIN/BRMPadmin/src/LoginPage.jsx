import { useState } from "react";
import { authService } from "./services/apiService";

function BrmpLogo() {
    return <img src="/LOGO-KEMENTAN.png" alt="Logo BRMP DIY" className="h-44 w-44 sm:h-52 sm:w-52 object-contain drop-shadow-[0_14px_26px_rgba(15,110,58,0.18)]" />;
}

export default function LoginPage({ onLogin }) {
    const [form, setForm] = useState({ username: "admin@brmpdiy.go.id", password: "Password123!" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username.trim() || !form.password.trim()) {
            setError("Silakan isi username/email dan password terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Panggil API POST /api/auth/login ke backend
            const response = await authService.login({
                email: form.username.trim(),
                password: form.password,
            });

            if (response && response.success) {
                if (onLogin) onLogin(response.data?.user);
            } else {
                setError(response?.message || "Login gagal. Periksa username/email dan password Anda.");
            }
        } catch (err) {
            setError(err.message || "Gagal terhubung ke backend server. Pastikan server backend aktif.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-visual">
                    <div className="visual-glow" />
                    <div className="brand-chip">BRMP DIY</div>
                    <div className="brand-mark">
                        <BrmpLogo />
                    </div>
                    <h1>Dashboard Petugas</h1>
                    <p className="subtitle">Sistem informasi benih dan pengelolaan data BRMP DIY untuk petugas dan admin.</p>
                    <div className="visual-stats">
                        <div>
                            <strong>Petugas</strong>
                            <span>Operasional</span>
                        </div>
                        <div>
                            <strong>Admin</strong>
                            <span>Pengelolaan</span>
                        </div>
                    </div>
                </div>

                <div className="login-panel">
                    <div className="login-header">
                        <span className="mini-tag">Akses Petugas & Admin</span>
                        <h2>Selamat datang</h2>
                        <p>Masuk untuk mengelola data, stok, dan aktivitas dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <label>
                            <span>Email / Username</span>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Masukkan email / username (admin@brmpdiy.go.id)"
                            />
                        </label>

                        <label>
                            <span>Password</span>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Masukkan password (Password123!)"
                            />
                        </label>

                        <div className="row-between">
                            <label className="checkbox-wrap">
                                <input type="checkbox" defaultChecked />
                                <span>Ingat saya</span>
                            </label>
                            <button type="button" className="link-button" onClick={() => alert("Silakan hubungi administrator IT BRMP DIY untuk reset password.")}>
                                Lupa password?
                            </button>
                        </div>

                        {error ? <p className="error-text">{error}</p> : null}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Memverifikasi..." : "Masuk ke Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
