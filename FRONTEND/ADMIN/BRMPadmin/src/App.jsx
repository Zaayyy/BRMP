import { useState, useCallback } from "react";
import LoginPage from "./LoginPage";
import AdminDashboardPage from "./AdminDashboardPage";
import LaboratoriumPage from "./LaboratoriumPage";
import PermohonanPage from "./PermohonanPage";
import AdminShell from "./components/AdminShell";
import BenihPage from "./BenihPage";
import AddBenihPage from "./AddBenihPage";
import UpdateBenihPage from "./UpdateBenihPage";
import AddUpdateStokPage from "./AddUpdateStokPage";
import UserMen from "./usermen";
import SettingsPage from "./SettingsPage";
import { authService } from "./services/apiService";
import { useAutoLogout } from "./hooks/useAutoLogout";

const getDefaultViewForRole = (role) => {
    switch (role) {
        case "Admin":
            return "dashboard";
        case "PetugasLab":
            return "laboratorium-jenis-sampel";
        case "Analis":
            return "laboratorium-buku-analis";
        case "PetugasLayanan":
            return "permohonan";
        case "PetugasBenih":
            return "benih-jenis-benih";
        default:
            return "pengaturan";
    }
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return Boolean(authService.getToken());
    });
    
    const user = authService.getUser();
    const userRole = user?.role || "Admin";

    const [activeView, setActiveView] = useState(() => {
        return getDefaultViewForRole(userRole);
    });

    const handleLogout = useCallback(() => {
        authService.logout();
        setIsLoggedIn(false);
        setActiveView("dashboard");
    }, []);

    // Auto-logout jika tidak aktif selama 30 menit (30 * 60 * 1000 ms)
    useAutoLogout({
        isLoggedIn,
        onLogout: handleLogout,
        timeoutMs: 30 * 60 * 1000,
    });

    // Validasi izin akses view berdasarkan role
    const handleNavigate = (view) => {
        const fallback = getDefaultViewForRole(userRole);

        // Dashboard, Manajemen User, dan Pengaturan HANYA untuk Admin
        if ((view === "dashboard" || view === "user" || view === "pengaturan") && userRole !== "Admin") {
            setActiveView(fallback);
            return;
        }

        // Permohonan HANYA untuk Admin & PetugasLayanan
        if (view === "permohonan" && userRole !== "Admin" && userRole !== "PetugasLayanan") {
            setActiveView(fallback);
            return;
        }

        // Role Analis: Hanya boleh akses Buku Analis
        if (userRole === "Analis") {
            if (view !== "laboratorium-buku-analis") {
                setActiveView("laboratorium-buku-analis");
                return;
            }
        }

        // Role PetugasLab: Boleh akses menu lab KECUALI Buku Analis
        if (userRole === "PetugasLab") {
            if (view === "laboratorium-buku-analis" || !view.startsWith("laboratorium")) {
                setActiveView("laboratorium-jenis-sampel");
                return;
            }
        }

        // Modul Laboratorium
        if (view.startsWith("laboratorium")) {
            if (userRole !== "Admin" && userRole !== "PetugasLab" && userRole !== "Analis") {
                setActiveView(fallback);
                return;
            }
        }

        // Modul Benih
        if (view.startsWith("benih") && userRole !== "Admin" && userRole !== "PetugasBenih") {
            setActiveView(fallback);
            return;
        }

        setActiveView(view);
    };

    const isLaboratoriumView = activeView.startsWith("laboratorium");

    if (!isLoggedIn) {
        return (
            <LoginPage
                onLogin={(loggedUser) => {
                    const role = loggedUser?.role || authService.getUser()?.role || "Admin";
                    setIsLoggedIn(true);
                    setActiveView(getDefaultViewForRole(role));
                }}
            />
        );
    }

    return (
        <AdminShell activeView={activeView} onNavigate={handleNavigate} onLogout={handleLogout}>
            {activeView === "permohonan" ? (
                <PermohonanPage onNavigate={handleNavigate} />
            ) : isLaboratoriumView ? (
                <LaboratoriumPage activeTab={activeView} onNavigate={handleNavigate} />
            ) : activeView === "benih-tambah-jenis-benih" ? (
                <AddBenihPage onNavigate={handleNavigate} />
            ) : activeView === "benih-tambah-update-stok" ? (
                <AddUpdateStokPage onNavigate={handleNavigate} />
            ) : activeView === "benih-update-benih" ? (
                <UpdateBenihPage onNavigate={handleNavigate} />
            ) : activeView.startsWith("benih") ? (
                <BenihPage activeTab={activeView} onNavigate={handleNavigate} />
            ) : activeView === "user" ? (
                <UserMen onNavigate={handleNavigate} />
            ) : activeView === "pengaturan" ? (
                <SettingsPage onNavigate={handleNavigate} />
            ) : (
                <AdminDashboardPage onNavigate={handleNavigate} />
            )}
        </AdminShell>
    );
}
