import { useState, useEffect } from "react";
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

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return Boolean(authService.getToken());
    });
    const [activeView, setActiveView] = useState("dashboard");

    const user = authService.getUser();
    const userRole = user?.role || "Admin";

    // Validasi izin akses view berdasarkan role
    const handleNavigate = (view) => {
        if (view === "user" && userRole !== "Admin") {
            setActiveView("dashboard");
            return;
        }
        if (view === "permohonan" && userRole !== "Admin" && userRole !== "PetugasLayanan") {
            setActiveView("dashboard");
            return;
        }
        if (view.startsWith("laboratorium") && userRole !== "Admin" && userRole !== "PetugasLab") {
            setActiveView("dashboard");
            return;
        }
        if (view.startsWith("benih") && userRole !== "Admin" && userRole !== "PetugasBenih") {
            setActiveView("dashboard");
            return;
        }
        setActiveView(view);
    };

    const isLaboratoriumView = activeView.startsWith("laboratorium");

    if (!isLoggedIn) {
        return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
    }

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setActiveView("dashboard");
    };

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
