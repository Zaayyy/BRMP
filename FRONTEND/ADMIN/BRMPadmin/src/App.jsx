import { useState } from "react";
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



export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeView, setActiveView] = useState("dashboard");

    const isLaboratoriumView = activeView.startsWith("laboratorium");

    if (!isLoggedIn) {
        return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
    }

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <AdminShell activeView={activeView} onNavigate={setActiveView} onLogout={handleLogout}>
            {activeView === "permohonan" ? (
                <PermohonanPage onNavigate={setActiveView} />
            ) : isLaboratoriumView ? (
                <LaboratoriumPage activeTab={activeView} onNavigate={setActiveView} />
            ) : activeView === "benih-tambah-jenis-benih" ? (
                <AddBenihPage onNavigate={setActiveView} />
            ) : activeView === "benih-tambah-update-stok" ? (
                <AddUpdateStokPage onNavigate={setActiveView} />
            ) : activeView === "benih-update-benih" ? (
                <UpdateBenihPage onNavigate={setActiveView} />
            ) : activeView.startsWith("benih") ? (
                <BenihPage activeTab={activeView} onNavigate={setActiveView} />
            ) : activeView === "user" ? (
                <UserMen onNavigate={setActiveView} />
            ) : activeView === "pengaturan" ? (
                <SettingsPage onNavigate={setActiveView} />
            ) : (
                <AdminDashboardPage onNavigate={setActiveView} />
            )}
        </AdminShell>
    );
}
