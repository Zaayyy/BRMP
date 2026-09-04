import {
    ArrowLeft, CheckCircle2, Edit3, Eye, FileText, Filter, Plus, Search,
    Trash2, RefreshCw, Loader2, Save, X, ExternalLink, Pencil, Phone,
    FlaskConical, Tag, Calendar, DollarSign, ChevronRight, CreditCard,
    UploadCloud, FileCheck, Check, Clock, AlertCircle, BookOpen, Layers,
    Activity
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { internalLabService, internalSettingsService, authService } from "./services/apiService";
import UpdateLabStatusModal from "./UpdateLabStatusModal";
import { triggerFeedbackPopup } from "./components/FeedbackPopup";

const tabMeta = {
    "laboratorium-jenis-sampel": {
        title: "1. Kategori & Label Jenis Sampel",
        breadcrumb: "Laboratorium / Jenis Sampel",
        description: "Kelola label dan kategori pengujian laboratorium (Tanah [TH], Air [A], Pupuk [P], dan Jaringan Tanaman [TMN]).",
    },
    "laboratorium-masuk": {
        title: "2. Sampel Masuk (Menunggu Pembayaran)",
        breadcrumb: "Laboratorium / Sampel Masuk (Belum Bayar)",
        description: "Pendaftaran sampel baru dan data sampel yang belum lunas. Setelah pembayaran lunas, sampel otomatis berpindah ke tahap Proses Pengujian.",
    },
    "laboratorium-proses-uji": {
        title: "3. Proses Pengujian Laboratorium (Sudah Lunas)",
        breadcrumb: "Laboratorium / Proses Pengujian",
        description: "Daftar sampel yang telah lunas dan sedang dalam tahap pengujian analisis oleh analis laboratorium.",
    },
    "laboratorium-buku-analis": {
        title: "4. Buku Register Catatan Analis (Parameter & Tahap Uji)",
        breadcrumb: "Laboratorium / Buku Analis",
        description: "Buku kerja harian analis laboratorium: daftar rincian nomor SPK, kode sampel, jumlah, parameter uji, dan status tahapan analisis untuk tracking pemohon.",
    },
    "laboratorium-laporan-selesai": {
        title: "5. Laporan & Sertifikat Selesai (LHU)",
        breadcrumb: "Laboratorium / Laporan Selesai",
        description: "Daftar pengujian yang telah selesai. Tambahkan dan unggah file sertifikat / dokumen Laporan Hasil Uji (LHU PDF) resmi.",
    },
};

// 5 Tahapan Status Uji Laboratorium Berurutan:
// 1. Pembayaran -> 2. Verif Sampel -> 3. Pengujian -> 4. Analis Data -> 5. Selesai
export const STATUS_UJI_STAGES = [
    { value: "Pembayaran", label: "1. Pembayaran", badgeClass: "bg-rose-100 text-rose-900 border border-rose-300 font-bold", dotClass: "bg-rose-500", icon: "💳" },
    { value: "Verif Sampel", label: "2. Verif Sampel", badgeClass: "bg-sky-100 text-sky-900 border border-sky-300 font-bold", dotClass: "bg-sky-500", icon: "🔍" },
    { value: "Pengujian", label: "3. Pengujian", badgeClass: "bg-purple-100 text-purple-900 border border-purple-300 font-bold", dotClass: "bg-purple-500", icon: "🧪" },
    { value: "Analis Data", label: "4. Analis Data", badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-bold", dotClass: "bg-amber-500", icon: "📊" },
    { value: "Selesai", label: "5. Selesai", badgeClass: "bg-emerald-100 text-emerald-900 border border-emerald-300 font-black", dotClass: "bg-emerald-500", icon: "✓" },
];

export const getStatusUjiBadge = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s.includes("pembayaran") || s === "belum bayar" || s === "diterima") {
        return { label: "Pembayaran", badgeClass: "bg-rose-100 text-rose-900 border border-rose-300 font-bold", dotClass: "bg-rose-500" };
    }
    if (s.includes("verif") || s.includes("preparasi") || s.includes("registrasi")) {
        return { label: "Verif Sampel", badgeClass: "bg-sky-100 text-sky-900 border border-sky-300 font-bold", dotClass: "bg-sky-500" };
    }
    if (s.includes("pengujian") || s.includes("ekstraksi") || s.includes("destruksi") || s === "proses") {
        return { label: "Pengujian", badgeClass: "bg-purple-100 text-purple-900 border border-purple-300 font-bold", dotClass: "bg-purple-500" };
    }
    if (s.includes("analis") || s.includes("analisis") || s.includes("data") || s.includes("kalkulasi")) {
        return { label: "Analis Data", badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-bold", dotClass: "bg-amber-500" };
    }
    if (s.includes("selesai") || s.includes("lhu") || s.includes("sertifikat")) {
        return { label: "Selesai", badgeClass: "bg-emerald-100 text-emerald-900 border border-emerald-300 font-black", dotClass: "bg-emerald-500" };
    }
    return { label: status || "Pengujian", badgeClass: "bg-purple-100 text-purple-900 border border-purple-300 font-bold", dotClass: "bg-purple-500" };
};

const SAMPLE_CATEGORIES = [
    { key: "TANAH", label: "Tanah [TH]", code: "TH", placeholder: "Contoh: 1089 atau 1105-1252" },
    { key: "AIR", label: "Air [A]", code: "A", placeholder: "Contoh: 274-275 atau 276" },
    { key: "PUPUK", label: "Pupuk (PO / PA) [P]", code: "P", placeholder: "Contoh: PA. 196 atau PO. 197-198" },
    { key: "TMN", label: "Jaringan Tanaman [TMN]", code: "TMN", placeholder: "Contoh: 388 atau 327-333" },
];

const CUS_OPTIONS = [
    { value: "CE-1", label: "CE-1" },
    { value: "CE-2", label: "CE-2" },
    { value: "CE-3", label: "CE-3" },
    { value: "I", label: "I (Internal)" },
];

const TAHAP_PROSES_OPTIONS = [
    "1. Penerimaan & Registrasi Sampel",
    "2. Preparasi & Pengeringan Sampel (Giling/Ayak)",
    "3. Destruksi / Ekstraksi Kimia di Laboratorium",
    "4. Analisis Instrumen / Spektrometri / Titrasi",
    "5. Pengolahan Data & Validasi Hasil Analisis",
    "6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)",
];

const PARAMETER_PRESETS = [
    "pH H2O, pH KCl, C-org, N-tot, P-tsd, K-tsd, NTK (Ca, Mg, K, Na), KTK, Kejenuhan Basa",
    "Kadar Air, Tekstur, BV",
    "Logam Berat (Pb, Cd, As, Hg)",
    "Total (N, P, K), C/N ratio, C-org",
    "DHL, pH, Salinitas Air",
];

// Helper tanggal hari ini dalam format YYYY-MM-DD lokal
export const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// Helper formula SPK: CUS/Bulan-Tahun/Urutan (mendukung template dinamis dari Pengaturan)
const formatSpk = (cus, dateStr, noReg, customTemplate = null) => {
    try {
        const d = dateStr ? new Date(dateStr) : new Date();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);
        const urutan = String(noReg || "1").trim();
        const cleanCus = (cus || "CE-3").trim();

        const template = customTemplate || (() => {
            try {
                const cached = localStorage.getItem("brmp_system_settings");
                return cached ? JSON.parse(cached)?.format_spk : null;
            } catch {
                return null;
            }
        })() || "CE-{KATEGORI}/{BULAN}-{TAHUN}/{NO}";

        if (template && template.includes("{")) {
            return template
                .replace("{KATEGORI}", cleanCus)
                .replace("{BULAN}", month)
                .replace("{TAHUN}", year)
                .replace("{NO}", urutan);
        }
        return `${cleanCus}/${month}-${year}/${urutan}`;
    } catch {
        const now = new Date();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const y = String(now.getFullYear()).slice(-2);
        return `${cus || "CE-3"}/${m}-${y}/${noReg || "1"}`;
    }
};

// Helper SLA Dinamis (membaca konfigurasi sla_hari, sla_kuning_hari, sla_merah_hari)
export const getSlaInfo = (dateStr, customSlaSettings = null) => {
    let maxSla = 45;
    let yellowDays = 14;
    let redDays = 7;

    const currentSettings = customSlaSettings || (() => {
        try {
            const cached = localStorage.getItem("brmp_system_settings");
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    })();

    if (currentSettings) {
        if (currentSettings.sla_hari !== undefined && currentSettings.sla_hari !== "") {
            maxSla = Math.max(1, parseInt(currentSettings.sla_hari, 10) || 45);
        }
        if (currentSettings.sla_kuning_hari !== undefined && currentSettings.sla_kuning_hari !== "") {
            yellowDays = Math.max(1, parseInt(currentSettings.sla_kuning_hari, 10) || 14);
        }
        if (currentSettings.sla_merah_hari !== undefined && currentSettings.sla_merah_hari !== "") {
            redDays = Math.max(1, parseInt(currentSettings.sla_merah_hari, 10) || 7);
        }
    }

    if (!dateStr) {
        return {
            daysRemaining: maxSla,
            daysElapsed: 0,
            status: "safe",
            color: "emerald",
            label: `Sisa ${maxSla} hari (Aman)`,
            badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            dotClass: "bg-emerald-500",
        };
    }

    try {
        const start = new Date(dateStr);
        if (isNaN(start.getTime())) {
            return {
                daysRemaining: maxSla,
                daysElapsed: 0,
                status: "safe",
                color: "emerald",
                label: `Sisa ${maxSla} hari (Aman)`,
                badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
                dotClass: "bg-emerald-500",
            };
        }

        const now = new Date();
        start.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - start.getTime();
        const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysRemaining = maxSla - daysElapsed;

        if (daysRemaining <= 0) {
            return {
                daysRemaining,
                daysElapsed,
                status: "overdue",
                color: "rose",
                label: daysRemaining === 0 ? `Batas Hari Ini (${maxSla} Hari)` : `Lewat ${Math.abs(daysRemaining)} hari`,
                badgeClass: "bg-rose-100 text-rose-900 border border-rose-300 font-black",
                dotClass: "bg-rose-600 animate-ping",
            };
        } else if (daysRemaining <= redDays) {
            return {
                daysRemaining,
                daysElapsed,
                status: "critical",
                color: "rose",
                label: `🚨 Sisa ${daysRemaining} hari (Kritis)`,
                badgeClass: "bg-rose-100 text-rose-900 border border-rose-300 font-extrabold",
                dotClass: "bg-rose-500 animate-pulse",
            };
        } else if (daysRemaining <= yellowDays) {
            return {
                daysRemaining,
                daysElapsed,
                status: "warning",
                color: "amber",
                label: `⚠️ Sisa ${daysRemaining} hari (Perhatian)`,
                badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
                dotClass: "bg-amber-500",
            };
        } else {
            return {
                daysRemaining,
                daysElapsed,
                status: "safe",
                color: "emerald",
                label: `✓ Sisa ${daysRemaining} hari (Aman)`,
                badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold",
                dotClass: "bg-emerald-500",
            };
        }
    } catch {
        return {
            daysRemaining: maxSla,
            daysElapsed: 0,
            status: "safe",
            color: "emerald",
            label: `Sisa ${maxSla} hari (Aman)`,
            badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            dotClass: "bg-emerald-500",
        };
    }
};

// Helper Auto-Generate Kode Sampel Berurutan:
// Menghitung angka maksimum terakhir pada kategori terkait, lalu menghasilkan urutan (misal TH 1 + 5 sampel = 2-6)
export const getNextSampleRange = (categoryKey, countStr, samplesList = []) => {
    const count = Math.max(1, parseInt(countStr || "1", 10) || 1);
    let fieldKey = "sampel_tanah";
    let altFieldKey = "sampelTanah";
    if (categoryKey === "AIR") { fieldKey = "sampel_air"; altFieldKey = "sampelAir"; }
    else if (categoryKey === "PUPUK") { fieldKey = "sampel_pupuk"; altFieldKey = "sampelPupuk"; }
    else if (categoryKey === "TMN") { fieldKey = "sampel_tanaman"; altFieldKey = "sampelTanaman"; }

    let maxNumber = 0;

    samplesList.forEach((item) => {
        const rawVal = String(item[fieldKey] || item[altFieldKey] || "").trim();
        if (!rawVal) return;

        const numbers = rawVal.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            numbers.forEach((numStr) => {
                const parsed = parseInt(numStr, 10);
                if (!isNaN(parsed) && parsed > maxNumber) {
                    maxNumber = parsed;
                }
            });
        }
    });

    const startNum = maxNumber + 1;
    if (count === 1) {
        return `${startNum}`;
    } else {
        const endNum = startNum + count - 1;
        return `${startNum}-${endNum}`;
    }
};

export default function LaboratoriumPage({ activeTab, onNavigate }) {
    const user = authService.getUser();
    const userRole = user?.role || "Admin";
    const isAnalis = userRole === "Analis";
    const isPetugasLab = userRole === "PetugasLab";

    let effectiveActiveTab = activeTab;
    if (isAnalis) {
        effectiveActiveTab = "laboratorium-buku-analis";
    } else if (isPetugasLab && activeTab === "laboratorium-buku-analis") {
        effectiveActiveTab = "laboratorium-masuk";
    }

    const current = tabMeta[effectiveActiveTab] ?? tabMeta["laboratorium-masuk"];
    const [labSamples, setLabSamples] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState(null);

    // Modal Edit Status & Keterangan Petugas
    const [editModalItem, setEditModalItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Jenis Sampel State dengan 4 Label Baku Resmi
    const [sampleRows, setSampleRows] = useState(() => {
        try {
            localStorage.removeItem("brmp_sample_types");
            const saved = localStorage.getItem("brmp_sample_types_v3");
            return saved ? JSON.parse(saved) : [
                { no: 1, code: "TH", name: "Tanah / Soil", desc: "Analisis sifat kimia dan kesuburan tanah (N, P, K, C-Organik, pH)" },
                { no: 2, code: "P", name: "Pupuk Organik & Anorganik (PO / PA)", desc: "Uji kadar hara pupuk tunggal/majemuk (PO / PA)" },
                { no: 3, code: "A", name: "Air Irigasi / Baku", desc: "Kualitas air irigasi, daya hantar listrik (DHL), dan cemaran" },
                { no: 4, code: "TMN", name: "Jaringan Tanaman / Daun", desc: "Analisis serapan hara makro & mikro pada daun/jaringan tanaman" },
            ];
        } catch {
            return [
                { no: 1, code: "TH", name: "Tanah / Soil", desc: "Analisis sifat kimia dan kesuburan tanah (N, P, K, C-Organik, pH)" },
                { no: 2, code: "P", name: "Pupuk Organik & Anorganik (PO / PA)", desc: "Uji kadar hara pupuk tunggal/majemuk (PO / PA)" },
                { no: 3, code: "A", name: "Air Irigasi / Baku", desc: "Kualitas air irigasi, daya hantar listrik (DHL), dan cemaran" },
                { no: 4, code: "TMN", name: "Jaringan Tanaman / Daun", desc: "Analisis serapan hara makro & mikro pada daun/jaringan tanaman" },
            ];
        }
    });

    const [newSampleName, setNewSampleName] = useState("");
    const [newSampleCode, setNewSampleCode] = useState("");
    const [newSampleDesc, setNewSampleDesc] = useState("");
    const [editingSampleId, setEditingSampleId] = useState(null);
    const [editingSampleData, setEditingSampleData] = useState({ code: "", name: "", desc: "" });

    // Form Tambah Sampel Register Baru
    const getTodayDate = () => new Date().toISOString().slice(0, 10);
    const [cusCode, setCusCode] = useState("CE-3");
    const [currentNextNo, setCurrentNextNo] = useState(293);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("TANAH");
    const [sampleCodeValue, setSampleCodeValue] = useState("");
    const [newEntry, setNewEntry] = useState({
        spk: "",
        tanggal_masuk: getTodayDate(),
        nama_pemohon: "",
        telepon: "",
        biaya: "",
        jumlah_sampel: "1",
        parameter_uji: "",
        status_bayar: "Belum Bayar",
        tahap_proses: "1. Penerimaan & Registrasi Sampel",
        keterangan: "",
        status_uji: "Proses",
    });

    // 1. Fetch live data laboratorium dari backend
    const fetchLabData = async () => {
        setIsLoading(true);
        try {
            const res = await internalLabService.getAll();
            if (res && res.success && Array.isArray(res.data)) {
                setLabSamples(res.data);
                // Hitung nomor urutan berikutnya dari SPK atau no_reg
                const maxNo = res.data.reduce((max, item) => {
                    let num = parseInt(item.no_reg || item.noReg || "0", 10);
                    if (isNaN(num) || num === 0) {
                        const parts = (item.spk || item.noSpk || item.kode_tracking || "").split("/");
                        num = parseInt(parts[parts.length - 1] || "0", 10);
                    }
                    return !isNaN(num) && num > max ? num : max;
                }, 292);
                const nextNo = maxNo + 1;
                setCurrentNextNo(nextNo);
                setNewEntry((prev) => ({
                    ...prev,
                    spk: prev.spk ? prev.spk : formatSpk(cusCode, prev.tanggal_masuk, nextNo),
                }));

                // Auto-generate sample code awal jika masih kosong
                if (!sampleCodeValue) {
                    const autoCode = getNextSampleRange("TANAH", "1", res.data);
                    setSampleCodeValue(autoCode);
                }
            }
        } catch (err) {
            console.warn("Lab fetch:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // State Pengaturan Sistem & SLA Dinamis
    const [slaSettings, setSlaSettings] = useState(() => {
        try {
            const cached = localStorage.getItem("brmp_system_settings");
            return cached ? JSON.parse(cached) : { sla_hari: "45", sla_kuning_hari: "14", sla_merah_hari: "7", format_spk: "CE-{KATEGORI}/{BULAN}-{TAHUN}/{NO}" };
        } catch {
            return { sla_hari: "45", sla_kuning_hari: "14", sla_merah_hari: "7", format_spk: "CE-{KATEGORI}/{BULAN}-{TAHUN}/{NO}" };
        }
    });

    useEffect(() => {
        fetchLabData();

        // Ambil pengaturan sistem terbaru dari server & dengarkan event update
        const fetchSettings = async () => {
            try {
                const res = await internalSettingsService.get();
                if (res && res.success && res.data && Object.keys(res.data).length > 0) {
                    setSlaSettings(res.data);
                    localStorage.setItem("brmp_system_settings", JSON.stringify(res.data));
                }
            } catch (err) {
                console.warn("Could not fetch SLA settings:", err);
            }
        };
        fetchSettings();

        const handleSettingsUpdated = (e) => {
            try {
                const updated = e?.detail || JSON.parse(localStorage.getItem("brmp_system_settings") || "{}");
                if (updated && Object.keys(updated).length > 0) {
                    setSlaSettings(updated);
                }
            } catch (err) {}
        };
        window.addEventListener("brmp_settings_updated", handleSettingsUpdated);
        return () => window.removeEventListener("brmp_settings_updated", handleSettingsUpdated);
    }, []);

    // Reaktif Auto-Generate Kode Sampel Berurutan secara Real-Time
    useEffect(() => {
        if (isAddFormOpen) {
            const autoCode = getNextSampleRange(selectedCategory, newEntry.jumlah_sampel, labSamples);
            setSampleCodeValue(autoCode);
        }
    }, [isAddFormOpen, selectedCategory, newEntry.jumlah_sampel, labSamples]);

    // Helper buka form tambah dan langsung generate SPK & Kode Sampel
    const handleOpenAddForm = () => {
        const today = getTodayDate();
        setIsAddFormOpen(true);
        setNewEntry((prev) => ({
            ...prev,
            tanggal_masuk: today,
            spk: formatSpk(cusCode, today, currentNextNo),
        }));
        const autoCode = getNextSampleRange(selectedCategory, newEntry.jumlah_sampel, labSamples);
        setSampleCodeValue(autoCode);
    };

    // Update Kategori Sampel dan otomatis generate kode rentang baru
    const handleCategoryChange = (newCat) => {
        setSelectedCategory(newCat);
        const autoCode = getNextSampleRange(newCat, newEntry.jumlah_sampel, labSamples);
        setSampleCodeValue(autoCode);
    };

    // Update Jumlah Sampel dan otomatis generate rentang kode baru
    const handleJumlahSampelChange = (newJml) => {
        setNewEntry((prev) => ({ ...prev, jumlah_sampel: newJml }));
        const autoCode = getNextSampleRange(selectedCategory, newJml, labSamples);
        setSampleCodeValue(autoCode);
    };

    // Update SPK otomatis ketika CUS atau Tanggal berubah
    const handleCusChange = (newCus) => {
        setCusCode(newCus);
        setNewEntry((prev) => ({
            ...prev,
            spk: formatSpk(newCus, prev.tanggal_masuk, currentNextNo),
        }));
    };

    const handleDateChange = (newDate) => {
        setNewEntry((prev) => ({
            ...prev,
            tanggal_masuk: newDate,
            spk: formatSpk(cusCode, newDate, currentNextNo),
        }));
    };

    // Filter per Tahapan Workflow
    const filterBySearch = (list) => {
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((row) =>
            (row.nama_pemohon || "").toLowerCase().includes(q) ||
            (row.spk || "").toLowerCase().includes(q) ||
            (row.kode_tracking || "").toLowerCase().includes(q) ||
            (row.no_reg || "").toString().toLowerCase().includes(q) ||
            (row.telepon || "").toLowerCase().includes(q) ||
            (row.sampel_tanah || "").toLowerCase().includes(q) ||
            (row.sampel_air || "").toLowerCase().includes(q) ||
            (row.sampel_pupuk || "").toLowerCase().includes(q) ||
            (row.sampel_tanaman || "").toLowerCase().includes(q) ||
            (row.tahap_proses || row.tahapProses || "").toLowerCase().includes(q) ||
            (row.parameter_uji || row.parameterUji || "").toLowerCase().includes(q) ||
            (row.keterangan || "").toLowerCase().includes(q)
        );
    };

    // Tahap 2: Sampel Masuk (Belum Bayar)
    const unpaidSamples = useMemo(() => {
        const list = labSamples.filter((row) => (row.status_bayar || row.statusBayar || "Belum Bayar") !== "Lunas");
        return filterBySearch(list);
    }, [labSamples, search]);

    // Tahap 3: Proses Pengujian (Sudah Lunas & Belum Selesai)
    const inTestingSamples = useMemo(() => {
        const list = labSamples.filter(
            (row) =>
                (row.status_bayar || row.statusBayar) === "Lunas" &&
                (row.status_uji || row.statusUji) !== "Selesai"
        );
        return filterBySearch(list);
    }, [labSamples, search]);

    // Tahap 4: Buku Analis (Semua sampel aktif & parameter uji)
    const analystBookSamples = useMemo(() => {
        return filterBySearch(labSamples);
    }, [labSamples, search]);

    // Tahap 5: Laporan & Sertifikat Selesai (Status Uji Selesai)
    const finishedSamples = useMemo(() => {
        const list = labSamples.filter((row) => (row.status_uji || row.statusUji) === "Selesai");
        return filterBySearch(list);
    }, [labSamples, search]);

    // Handle Jenis Sampel
    const addSampleType = () => {
        const name = newSampleName.trim();
        const code = newSampleCode.trim().toUpperCase();
        if (!name || !code) {
            alert("Kode label dan nama sampel wajib diisi!");
            return;
        }
        const updated = [...sampleRows, { no: sampleRows.length + 1, code, name, desc: newSampleDesc.trim() }];
        setSampleRows(updated);
        localStorage.setItem("brmp_sample_types_v3", JSON.stringify(updated));
        setNewSampleName("");
        setNewSampleCode("");
        setNewSampleDesc("");
    };

    const saveSampleType = () => {
        if (!editingSampleData.name.trim() || !editingSampleData.code.trim()) return;
        const updated = sampleRows.map((r) =>
            r.no === editingSampleId
                ? { ...r, code: editingSampleData.code.trim().toUpperCase(), name: editingSampleData.name.trim(), desc: editingSampleData.desc.trim() }
                : r
        );
        setSampleRows(updated);
        localStorage.setItem("brmp_sample_types_v3", JSON.stringify(updated));
        setEditingSampleId(null);
        triggerFeedbackPopup({
            type: "success",
            title: "Jenis Sampel Diperbarui! ✨",
            message: `Label dan kategori jenis sampel '${editingSampleData.name}' (${editingSampleData.code}) berhasil disimpan.`,
        });
    };

    const deleteSampleType = (no) => {
        if (confirm("Hapus kategori jenis sampel ini?")) {
            const updated = sampleRows.filter((r) => r.no !== no);
            setSampleRows(updated);
            localStorage.setItem("brmp_sample_types_v3", JSON.stringify(updated));
            triggerFeedbackPopup({
                type: "info",
                title: "Kategori Dihapus",
                message: "Kategori jenis sampel telah berhasil dihapus dari sistem.",
            });
        }
    };

    // Handle Create Sampel Masuk (Default Belum Bayar)
    const handleCreateLab = async (e) => {
        e.preventDefault();
        if (!newEntry.nama_pemohon.trim()) {
            alert("Nama pemohon / instansi wajib diisi.");
            return;
        }

        setActionLoading(true);
        try {
            const sampleCodeClean = (sampleCodeValue.trim() || getNextSampleRange(selectedCategory, newEntry.jumlah_sampel, labSamples)).trim();
            const spkFinal = newEntry.spk.trim() || formatSpk(cusCode, newEntry.tanggal_masuk, currentNextNo);
            const spkParts = spkFinal.split("/");
            const extractedNoReg = spkParts.length > 1 ? spkParts[spkParts.length - 1] : String(currentNextNo);

            const payload = {
                no_reg: extractedNoReg,
                spk: spkFinal,
                kode_tracking: spkFinal,
                nama_pemohon: newEntry.nama_pemohon.trim(),
                sampel_tanah: selectedCategory === "TANAH" ? sampleCodeClean : null,
                sampel_air: selectedCategory === "AIR" ? sampleCodeClean : null,
                sampel_pupuk: selectedCategory === "PUPUK" ? sampleCodeClean : null,
                sampel_tanaman: selectedCategory === "TMN" ? sampleCodeClean : null,
                jumlah_sampel: newEntry.jumlah_sampel ? newEntry.jumlah_sampel.trim() : "1",
                parameter_uji: newEntry.parameter_uji ? newEntry.parameter_uji.trim() : "",
                telepon: newEntry.telepon.trim() || null,
                biaya: newEntry.biaya.trim() || null,
                status_bayar: newEntry.status_bayar || "Belum Bayar",
                status_uji: newEntry.status_bayar === "Lunas" ? "Verif Sampel" : "Pembayaran",
                tahap_proses: newEntry.tahap_proses || "1. Penerimaan & Registrasi Sampel",
                keterangan: newEntry.keterangan ? newEntry.keterangan.trim() : "",
                tanggal_masuk: newEntry.tanggal_masuk,
            };

            const res = await internalLabService.create(payload);
            if (res && res.success) {
                triggerFeedbackPopup({
                    type: "success",
                    title: "Pendaftaran Sampel Berhasil! 🎉",
                    message: "Sampel baru telah resmi dicatat ke dalam buku register laboratorium.",
                    details: {
                        "Nomor SPK": payload.spk,
                        "Kode Sampel": sampleCodeClean,
                        "Pemohon": payload.nama_pemohon,
                        "Status Bayar": payload.status_bayar,
                    },
                });
                const nextNo = currentNextNo + 1;
                setCurrentNextNo(nextNo);
                setNewEntry({
                    spk: formatSpk(cusCode, getTodayDate(), nextNo),
                    tanggal_masuk: getTodayDate(),
                    nama_pemohon: "",
                    telepon: "",
                    biaya: "",
                    jumlah_sampel: "1",
                    parameter_uji: "",
                    status_bayar: "Belum Bayar",
                    tahap_proses: "1. Penerimaan & Registrasi Sampel",
                    keterangan: "",
                    status_uji: "Pembayaran",
                });
                setSampleCodeValue("");
                setIsAddFormOpen(false);
                fetchLabData();
            }
        } catch (err) {
            triggerFeedbackPopup({
                type: "error",
                title: "Gagal Mendaftarkan Sampel",
                message: err.message || "Terjadi kendala saat mendaftarkan sampel ke server.",
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Aksi 1-Klik: Tandai Bayar Lunas (Pindah ke Tahap 3: Proses Pengujian)
    const handleMarkAsPaid = async (id, spk) => {
        setActionLoading(true);
        try {
            await internalLabService.updateStatus(id, { 
                status_bayar: "Lunas",
                status_uji: "Verif Sampel",
                tahap_proses: "2. Preparasi & Verifikasi Sampel"
            });
            setLabSamples((prev) =>
                prev.map((item) => (item.id === id ? { 
                    ...item, 
                    status_bayar: "Lunas",
                    status_uji: "Verif Sampel",
                    tahap_proses: "2. Preparasi & Verifikasi Sampel"
                } : item))
            );
            triggerFeedbackPopup({
                type: "success",
                title: "Pembayaran Lunas! 💳",
                message: `Pembayaran berkas SPK ${spk || `#${id}`} telah diverifikasi lunas dan otomatis dipindahkan ke menu 'Proses Pengujian'.`,
                details: {
                    "Nomor SPK": spk || `#${id}`,
                    "Tahap Baru": "2. Preparasi & Verifikasi Sampel",
                    "Status": "Lunas",
                },
            });
        } catch (err) {
            triggerFeedbackPopup({
                type: "error",
                title: "Gagal Mengubah Status Pembayaran",
                message: err.message || "Gagal memperbarui status ke server.",
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Aksi 1-Klik: Tandai Uji Selesai (Pindah ke Tahap 5: Laporan Selesai)
    const handleMarkAsFinished = async (id, spk) => {
        setActionLoading(true);
        try {
            const today = new Date().toISOString().slice(0, 10);
            await internalLabService.updateStatus(id, { 
                status_uji: "Selesai", 
                tahap_proses: "6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)",
                tanggal_selesai: today 
            });
            setLabSamples((prev) =>
                prev.map((item) => (item.id === id ? { 
                    ...item, 
                    status_uji: "Selesai", 
                    tahap_proses: "6. Penerbitan & Pengesahan Laporan Hasil Uji (LHU)",
                    tanggal_selesai: today 
                } : item))
            );
            triggerFeedbackPopup({
                type: "success",
                title: "Pengujian Selesai Dilakukan! 🧪",
                message: `Pengujian teknis SPK ${spk || `#${id}`} selesai. Berkas otomatis dipindahkan ke menu 'Laporan Selesai' untuk penerbitan sertifikat LHU.`,
                details: {
                    "Nomor SPK": spk || `#${id}`,
                    "Tahap Baru": "6. Penerbitan & Pengesahan LHU",
                    "Status": "Selesai",
                },
            });
        } catch (err) {
            triggerFeedbackPopup({
                type: "error",
                title: "Gagal Mengubah Status Pengujian",
                message: err.message || "Gagal memperbarui status ke server.",
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Format tanggal tampilan
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" });
        } catch {
            return dateStr;
        }
    };

    const activeCategoryObj = SAMPLE_CATEGORIES.find((c) => c.key === selectedCategory) || SAMPLE_CATEGORIES[0];

    // Helper untuk mengambil kode sampel aktif
    const getSampleCodeDisplay = (row) => {
        if (row.sampel_tanah || row.sampelTanah) return { code: "TH", val: `TH.${row.sampel_tanah || row.sampelTanah}`, color: "amber" };
        if (row.sampel_air || row.sampelAir) return { code: "A", val: `A.${row.sampel_air || row.sampelAir}`, color: "sky" };
        if (row.sampel_pupuk || row.sampelPupuk) return { code: "P", val: `P.${row.sampel_pupuk || row.sampelPupuk}`, color: "purple" };
        if (row.sampel_tanaman || row.sampelTanaman) return { code: "TMN", val: `TMN.${row.sampel_tanaman || row.sampelTanaman}`, color: "emerald" };
        return { code: "-", val: "-", color: "slate" };
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            {/* Header */}
            <header className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <button onClick={() => onNavigate?.("dashboard")} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                            <ArrowLeft size={14} />
                            Kembali ke dashboard
                        </button>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">{current.breadcrumb}</p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{current.title}</h1>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{current.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start">
                        <button
                            onClick={fetchLabData}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
                        >
                            <RefreshCw size={13} className={isLoading ? "animate-spin text-brand-600" : ""} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Workflow Navigation Bar */}
                {isAnalis ? (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-purple-950">Buku Catatan Analis Laboratorium</h3>
                                <p className="text-[11px] text-purple-700/80">Khusus Analis: Pengisian parameter uji analisis dan update tahapan proses pengujian</p>
                            </div>
                        </div>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 border border-purple-200">
                            ✓ Akses Khusus Analis
                        </span>
                    </div>
                ) : isPetugasLab ? (
                    /* Petugas Laboratorium: 4 Tahap Lengkap (Tanpa Buku Analis) */
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <button
                            onClick={() => onNavigate?.("laboratorium-jenis-sampel")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-jenis-sampel" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 1</p>
                                <p className="text-xs font-black">Jenis Sampel</p>
                            </div>
                            <Tag size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-masuk")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-masuk" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 2</p>
                                <p className="text-xs font-black">Belum Bayar ({unpaidSamples.length})</p>
                            </div>
                            <CreditCard size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-proses-uji")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-proses-uji" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 3</p>
                                <p className="text-xs font-black">Proses Uji ({inTestingSamples.length})</p>
                            </div>
                            <FlaskConical size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-laporan-selesai")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-laporan-selesai" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 4</p>
                                <p className="text-xs font-black">Laporan Selesai ({finishedSamples.length})</p>
                            </div>
                            <FileCheck size={16} />
                        </button>
                    </div>
                ) : (
                    /* Admin (Superadmin): Semua 5 Menu Termasuk Buku Analis */
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        <button
                            onClick={() => onNavigate?.("laboratorium-jenis-sampel")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-jenis-sampel" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 1</p>
                                <p className="text-xs font-black">Jenis Sampel</p>
                            </div>
                            <Tag size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-masuk")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-masuk" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 2</p>
                                <p className="text-xs font-black">Belum Bayar ({unpaidSamples.length})</p>
                            </div>
                            <CreditCard size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-proses-uji")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-proses-uji" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 3</p>
                                <p className="text-xs font-black">Proses Uji ({inTestingSamples.length})</p>
                            </div>
                            <FlaskConical size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-buku-analis")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-buku-analis" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Buku Analis</p>
                                <p className="text-xs font-black">Parameter & Progres</p>
                            </div>
                            <BookOpen size={16} />
                        </button>

                        <button
                            onClick={() => onNavigate?.("laboratorium-laporan-selesai")}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                                activeTab === "laboratorium-laporan-selesai" ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/50"
                            }`}
                        >
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-75">Tahap 4</p>
                                <p className="text-xs font-black">Laporan Selesai ({finishedSamples.length})</p>
                            </div>
                            <FileCheck size={16} />
                        </button>
                    </div>
                )}
            </header>

            {/* Notification Banner */}
            {notification && (
                <div className="rounded-2xl bg-emerald-700 text-white p-4 shadow-lg flex items-center justify-between animate-fadeIn border border-emerald-600">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} />
                        <span className="font-bold text-sm">{notification}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white text-lg font-bold">✕</button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAHAP 1: KELOLA JENIS SAMPEL & LABEL */}
            {/* ========================================================================= */}
            {effectiveActiveTab === "laboratorium-jenis-sampel" && (
                <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Daftar Kategori & Kode Label Sampel</h2>
                            <p className="text-xs text-slate-500 mt-1">Kode label singkatan resmi untuk buku register laboratorium BRMP DIY</p>
                        </div>
                    </div>

                    {/* Form Tambah Kategori */}
                    <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Tambah Jenis Sampel Baru</p>
                        <div className="grid gap-3 sm:grid-cols-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Kode Label (contoh: TH, A, P, TMN)</label>
                                <input
                                    type="text"
                                    value={newSampleCode}
                                    onChange={(e) => setNewSampleCode(e.target.value)}
                                    placeholder="Contoh: TH"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs uppercase font-bold outline-none focus:border-brand-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Jenis Sampel</label>
                                <input
                                    type="text"
                                    value={newSampleName}
                                    onChange={(e) => setNewSampleName(e.target.value)}
                                    placeholder="Contoh: Benih / Biji Tanaman"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Keterangan / Parameter</label>
                                <input
                                    type="text"
                                    value={newSampleDesc}
                                    onChange={(e) => setNewSampleDesc(e.target.value)}
                                    placeholder="Opsional parameter uji"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-500"
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={addSampleType}
                                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm flex items-center gap-1.5"
                            >
                                <Plus size={14} />
                                <span>Tambah Kategori</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Kategori */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">No</th>
                                    <th className="px-4 py-3 text-left w-24">Kode Label</th>
                                    <th className="px-4 py-3 text-left">Nama Kategori Sampel</th>
                                    <th className="px-4 py-3 text-left">Deskripsi & Ruang Lingkup</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {sampleRows.map((row) => (
                                    <tr key={row.no} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3.5 text-slate-400 font-mono font-bold">{row.no}</td>
                                        <td className="px-4 py-3.5">
                                            {editingSampleId === row.no ? (
                                                <input
                                                    type="text"
                                                    value={editingSampleData.code}
                                                    onChange={(e) => setEditingSampleData({ ...editingSampleData, code: e.target.value })}
                                                    className="w-16 uppercase rounded-lg border border-brand-400 px-2 py-1 text-xs font-bold"
                                                />
                                            ) : (
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase border ${
                                                    row.code === "TH" ? "bg-amber-100 text-amber-900 border-amber-300" :
                                                    row.code === "A" ? "bg-sky-100 text-sky-900 border-sky-300" :
                                                    row.code === "P" ? "bg-purple-100 text-purple-900 border-purple-300" :
                                                    row.code === "TMN" ? "bg-emerald-100 text-emerald-900 border-emerald-300" :
                                                    "bg-slate-100 text-slate-800 border-slate-300"
                                                }`}>
                                                    {row.code}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-slate-800">
                                            {editingSampleId === row.no ? (
                                                <input
                                                    type="text"
                                                    value={editingSampleData.name}
                                                    onChange={(e) => setEditingSampleData({ ...editingSampleData, name: e.target.value })}
                                                    className="w-full rounded-lg border border-brand-400 px-2 py-1 text-xs outline-none"
                                                />
                                            ) : (
                                                row.name
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600">
                                            {editingSampleId === row.no ? (
                                                <input
                                                    type="text"
                                                    value={editingSampleData.desc}
                                                    onChange={(e) => setEditingSampleData({ ...editingSampleData, desc: e.target.value })}
                                                    className="w-full rounded-lg border border-brand-400 px-2 py-1 text-xs outline-none"
                                                />
                                            ) : (
                                                row.desc || <span className="text-slate-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            {editingSampleId === row.no ? (
                                                <div className="inline-flex gap-2">
                                                    <button onClick={saveSampleType} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save size={15} /></button>
                                                    <button onClick={() => setEditingSampleId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={15} /></button>
                                                </div>
                                            ) : (
                                                <div className="inline-flex gap-2">
                                                    <button onClick={() => {
                                                        setEditingSampleId(row.no);
                                                        setEditingSampleData({ code: row.code, name: row.name, desc: row.desc || "" });
                                                    }} className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"><Edit3 size={15} /></button>
                                                    <button onClick={() => deleteSampleType(row.no)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* TAHAP 2: DATA MASUK REGISTER (BELUM BAYAR) */}
            {/* ========================================================================= */}
            {effectiveActiveTab === "laboratorium-masuk" && (
                <>
                    {/* Header Banner & Tombol Tambah Sampel Masuk (Form Hide Default) */}
                    {!isAddFormOpen ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[2rem] border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white p-6 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20">
                                    <Plus size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        Pendaftaran Sampel Masuk (Buku Register)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Daftarkan sampel baru masuk dari pemohon / instansi. Format SPK: <strong>[CUS]/[Bulan-Tahun]/[Urutan]</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleOpenAddForm}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all self-start sm:self-center"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                <span>+ Tambah Sampel Masuk</span>
                            </button>
                        </div>
                    ) : (
                        /* Form Pendaftaran Sampel Baru (Terbuka saat tombol diklik) */
                        <form onSubmit={handleCreateLab} className="rounded-[2rem] border border-emerald-200/80 bg-white p-6 shadow-md animate-in fade-in zoom-in-98 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Form Registrasi Sampel Masuk Baru
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Nomor SPK & Kode Sampel otomatis: <strong>[CUS]/[Bulan-Tahun]/[Urutan]</strong>. Status awal: <strong>Belum Bayar</strong>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddFormOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1.5"
                                >
                                    <X size={14} />
                                    <span>Tutup Form</span>
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* 1. Tanggal Masuk */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">1. TGL (Tanggal Masuk) *</label>
                                    <input
                                        required
                                        type="date"
                                        value={newEntry.tanggal_masuk}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                                    />
                                </div>

                                {/* 2. Nama Pemohon */}
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">2. NAMA (Pemohon / Instansi) *</label>
                                    <input
                                        required
                                        type="text"
                                        value={newEntry.nama_pemohon}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, nama_pemohon: e.target.value }))}
                                        placeholder="Contoh: Departemen Tanah UGM / SMKN 1 Cangkringan"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white font-semibold"
                                    />
                                </div>

                                {/* 3. Kode CUS */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                                        <span>3. Kode CUS (Pemohon) *</span>
                                        <span className="text-[10px] text-brand-700 font-bold bg-brand-50 px-1.5 py-0.5 rounded">CE1,2,3,I</span>
                                    </label>
                                    <select
                                        value={cusCode}
                                        onChange={(e) => handleCusChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-brand-900 outline-none focus:border-brand-500 focus:bg-white cursor-pointer"
                                    >
                                        {CUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 4. Nomor SPK (Otomatis & Bisa Diedit) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700">4. SPK (Nomor SPK) *</label>
                                        <button
                                            type="button"
                                            onClick={() => setNewEntry((prev) => ({ ...prev, spk: formatSpk(cusCode, prev.tanggal_masuk, currentNextNo) }))}
                                            className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition flex items-center gap-1 shadow-sm"
                                            title="Generate ulang nomor SPK berdasarkan CUS/Bulan-Tahun/Urutan"
                                        >
                                            <span>⚡ Auto Generate</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={newEntry.spk}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, spk: e.target.value }))}
                                        placeholder="Contoh: CE-3/09-26/293"
                                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/50 px-3.5 py-2.5 text-xs font-mono font-black text-brand-900 outline-none focus:border-brand-500 focus:bg-white"
                                    />
                                </div>

                                {/* 5. DROPDOWN PILIH 1 JENIS KATEGORI SAMPEL */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">5. Jenis Kategori Sampel *</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:bg-white cursor-pointer"
                                    >
                                        {SAMPLE_CATEGORIES.map((cat) => (
                                            <option key={cat.key} value={cat.key}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 6. Jumlah Sampel */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">6. Jumlah Sampel *</label>
                                    <input
                                        type="text"
                                        value={newEntry.jumlah_sampel}
                                        onChange={(e) => handleJumlahSampelChange(e.target.value)}
                                        placeholder="Contoh: 1 / 5 / 148"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
                                    />
                                </div>

                                {/* 7. INPUT KODE / RENTANG SAMPEL (AUTO-GENERATE BERURUTAN) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700">7. Kode Sampel *</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const auto = getNextSampleRange(selectedCategory, newEntry.jumlah_sampel, labSamples);
                                                    setSampleCodeValue(auto);
                                                }}
                                                className="text-[10px] font-extrabold text-purple-800 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded transition flex items-center gap-1 shadow-sm"
                                                title="Hitung otomatis rentang urutan nomor sampel dari database"
                                            >
                                                <span>⚡ Auto Generate</span>
                                            </button>
                                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                selectedCategory === "TANAH" ? "bg-amber-100 text-amber-900 border border-amber-200" :
                                                selectedCategory === "AIR" ? "bg-sky-100 text-sky-900 border border-sky-200" :
                                                selectedCategory === "PUPUK" ? "bg-purple-100 text-purple-900 border border-purple-200" :
                                                "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                            }`}>
                                                {activeCategoryObj.code}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={sampleCodeValue}
                                        onChange={(e) => setSampleCodeValue(e.target.value)}
                                        placeholder={activeCategoryObj.placeholder}
                                        className="w-full rounded-xl border border-purple-300 bg-purple-50/40 px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-brand-500 focus:bg-white text-slate-900"
                                    />
                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Otomatis: {activeCategoryObj.code}.{sampleCodeValue || "-"} (Urutan lanjutan dari data terakhir)
                                    </p>
                                </div>

                                {/* 8. Status Pembayaran Awal */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">8. Status Pembayaran *</label>
                                    <select
                                        value={newEntry.status_bayar}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, status_bayar: e.target.value }))}
                                        className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white font-bold text-rose-800 cursor-pointer"
                                    >
                                        <option value="Belum Bayar">⏳ Belum Bayar</option>
                                        <option value="Lunas">✓ Lunas (Langsung Masuk Uji)</option>
                                    </select>
                                </div>

                                {/* 9. Tahap Proses Uji */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">9. Tahap Proses Pengujian Awal *</label>
                                    <input
                                        type="text"
                                        value={newEntry.tahap_proses}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, tahap_proses: e.target.value }))}
                                        placeholder="Contoh: 1. Penerimaan & Registrasi Sampel"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
                                    />
                                    <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                                        <span className="text-[10px] text-slate-400 font-bold">Pilihan Cepat:</span>
                                        {TAHAP_PROSES_OPTIONS.slice(0, 3).map((t, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setNewEntry((prev) => ({ ...prev, tahap_proses: t }))}
                                                className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                            >
                                                {t.split('.')[0]}. {t.split('.')[1]?.trim().split('&')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 10. Telepon */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">10. TELEPON / WA</label>
                                    <input
                                        type="text"
                                        value={newEntry.telepon}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, telepon: e.target.value }))}
                                        placeholder="Contoh: 081226571495"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white font-mono"
                                    />
                                </div>

                                {/* 11. Biaya */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">11. BIAYA / Tarif</label>
                                    <input
                                        type="text"
                                        value={newEntry.biaya}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, biaya: e.target.value }))}
                                        placeholder="Contoh: Rp 250.000 / -"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddFormOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
                                >
                                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                                    <span>Simpan Sampel Masuk</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tabel Daftar Sampel Belum Bayar */}
                    <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span>Daftar Sampel Masuk - Menunggu Pembayaran ({unpaidSamples.length})</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Klik <strong>'Tandai Lunas'</strong> setelah pemohon membayar agar sampel masuk ke tahap <strong>Proses Pengujian</strong>.</p>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <Search size={14} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari SPK, Nama, Telp..."
                                    className="bg-transparent text-xs outline-none w-44 sm:w-56"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                <thead className="bg-slate-100/80 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-3 py-3 w-12 text-center">NO</th>
                                        <th className="px-3 py-3 w-20">TGL</th>
                                        <th className="px-3.5 py-3 min-w-[140px]">NAMA PEMOHON</th>
                                        <th className="px-3.5 py-3 min-w-[130px]">NOMOR SPK</th>
                                        <th className="px-3 py-3 text-center min-w-[100px]">KODE SAMPEL</th>
                                        <th className="px-3 py-3 text-center w-16">JML</th>
                                        <th className="px-3.5 py-3 min-w-[140px]">PARAMETER UJI</th>
                                        <th className="px-3 py-3 min-w-[100px]">BIAYA</th>
                                        <th className="px-3 py-3 text-center min-w-[110px]">STATUS BAYAR</th>
                                        <th className="px-3 py-3 text-right min-w-[160px]">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {unpaidSamples.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-10 text-slate-400 font-semibold">
                                                Tidak ada berkas sampel yang belum dibayar. Semua pembayaran telah berstatus lunas! ✨
                                            </td>
                                        </tr>
                                    ) : (
                                        unpaidSamples.map((row, idx) => {
                                            const sInfo = getSampleCodeDisplay(row);

                                            return (
                                                <tr key={row.id} className="hover:bg-rose-50/20 transition">
                                                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">{idx + 1}</td>
                                                    <td className="px-3 py-3 font-mono text-slate-600 whitespace-nowrap">{formatDate(row.tanggal_masuk || row.tanggalMasuk)}</td>
                                                    <td className="px-3.5 py-3 font-bold text-slate-900">{row.nama_pemohon || row.namaPemohon}</td>
                                                    <td className="px-3.5 py-3 font-mono font-extrabold text-brand-800 whitespace-nowrap">{row.spk || row.noSpk || row.kode_tracking}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-${sInfo.color}-100 text-${sInfo.color}-900`}>
                                                            {sInfo.val}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-bold text-slate-800 font-mono">
                                                        {row.jumlah_sampel || row.jumlahSampel || row.jumlah || "1"}
                                                    </td>
                                                    <td className="px-3.5 py-3 text-slate-700 max-w-xs truncate" title={row.parameter_uji || row.parameterUji || "-"}>
                                                        {row.parameter_uji || row.parameterUji || <span className="text-slate-300 italic">-</span>}
                                                    </td>
                                                    <td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">{row.biaya || "-"}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                                            <Clock size={10} />
                                                            <span>Belum Bayar</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleMarkAsPaid(row.id, row.spk)}
                                                                disabled={actionLoading}
                                                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition"
                                                                title="Tandai pembayaran telah lunas"
                                                            >
                                                                <CreditCard size={12} />
                                                                <span>Tandai Lunas</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditModalItem(row);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
                                                                title="Edit data"
                                                            >
                                                                <Pencil size={12} />
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
                    </section>
                </>
            )}

            {/* ========================================================================= */}
            {/* TAHAP 3: PROSES PENGUJIAN (SUDAH LUNAS) */}
            {/* ========================================================================= */}
            {effectiveActiveTab === "laboratorium-proses-uji" && (
                <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FlaskConical size={18} className="text-brand-600" />
                                <span>Sampel Dalam Tahap Pengujian Laboratorium ({inTestingSamples.length})</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Semua sampel berikut telah LUNAS dan sedang dianalisis teknis. Klik <strong>'Selesai Pengujian'</strong> setelah analisis tuntas.</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari SPK, Nama, Sampel..."
                                className="bg-transparent text-xs outline-none w-44 sm:w-56"
                            />
                        </div>
                    </div>

                    {/* SLA Monitoring Banner Dinamis */}
                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 p-3.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm">
                                🟢
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-emerald-900 block">SLA Aman (&gt; {slaSettings.sla_kuning_hari || 14} Hari)</span>
                                <span className="text-lg font-black text-emerald-950">
                                    {inTestingSamples.filter(r => getSlaInfo(r.tanggal_masuk || r.tanggalMasuk, slaSettings).status === "safe").length} <span className="text-xs font-semibold text-emerald-700">Sampel</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-amber-50/80 border border-amber-200 p-3.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black text-sm">
                                🟡
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-amber-900 block">Peringatan (≤ {slaSettings.sla_kuning_hari || 14} Hari Sisa)</span>
                                <span className="text-lg font-black text-amber-950">
                                    {inTestingSamples.filter(r => getSlaInfo(r.tanggal_masuk || r.tanggalMasuk, slaSettings).status === "warning").length} <span className="text-xs font-semibold text-amber-700">Sampel</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-rose-50/80 border border-rose-200 p-3.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 font-black text-sm">
                                🔴
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-rose-900 block">Kritis / Jatuh Tempo (≤ {slaSettings.sla_merah_hari || 7} Hari)</span>
                                <span className="text-lg font-black text-rose-950">
                                    {inTestingSamples.filter(r => ["critical", "overdue"].includes(getSlaInfo(r.tanggal_masuk || r.tanggalMasuk, slaSettings).status)).length} <span className="text-xs font-semibold text-rose-700">Sampel</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                            <thead className="bg-slate-100/90 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-3 py-3 w-12 text-center">NO</th>
                                    <th className="px-3.5 py-3 min-w-[130px]">NOMOR SPK</th>
                                    <th className="px-3 py-3 text-center min-w-[100px]">KODE SAMPEL</th>
                                    <th className="px-3 py-3 text-center w-14">JML</th>
                                    <th className="px-3.5 py-3 min-w-[160px]">SLA / TENGGAT ({slaSettings.sla_hari || 45} HARI)</th>
                                    <th className="px-3.5 py-3 min-w-[140px]">TAHAPAN ANALISIS</th>
                                    <th className="px-3.5 py-3 min-w-[150px]">PARAMETER UJI</th>
                                    <th className="px-3 py-3 text-center min-w-[80px]">BAYAR</th>
                                    <th className="px-3.5 py-3 min-w-[120px]">CATATAN ANALIS</th>
                                    <th className="px-3 py-3 text-right min-w-[170px]">AKSI ANALISIS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {inTestingSamples.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-10 text-slate-400 font-semibold">
                                            Tidak ada sampel aktif dalam tahap pengujian saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    inTestingSamples.map((row, idx) => {
                                        const sInfo = getSampleCodeDisplay(row);
                                        const sla = getSlaInfo(row.tanggal_masuk || row.tanggalMasuk, slaSettings);

                                        return (
                                            <tr key={row.id} className="hover:bg-slate-50 transition">
                                                <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">{idx + 1}</td>
                                                <td className="px-3.5 py-3 font-mono font-extrabold text-brand-800 whitespace-nowrap">{row.spk || row.noSpk || row.kode_tracking}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-${sInfo.color}-100 text-${sInfo.color}-900`}>
                                                        {sInfo.val}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center font-bold text-slate-800 font-mono">
                                                    {row.jumlah_sampel || row.jumlahSampel || row.jumlah || "1"}
                                                </td>
                                                {/* SLA Aging Indicator */}
                                                <td className="px-3.5 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] ${sla.badgeClass}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${sla.dotClass || "bg-current"}`} />
                                                            <span>{sla.label}</span>
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-mono pl-1">
                                                            Tgl Masuk: {formatDate(row.tanggal_masuk || row.tanggalMasuk)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-3">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-900 border border-emerald-200">
                                                        <Activity size={12} className="text-emerald-600 flex-shrink-0" />
                                                        <span>{row.tahap_proses || row.tahapProses || "3. Pengujian Lab"}</span>
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-3 text-slate-800 font-medium max-w-xs">
                                                    <div className="line-clamp-2" title={row.parameter_uji || row.parameterUji || ""}>
                                                        {row.parameter_uji || row.parameterUji || <span className="text-slate-300 italic">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        ✓ Lunas
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-3 text-slate-600 max-w-xs">
                                                    <div className="line-clamp-2" title={row.keterangan || ""}>
                                                        {row.keterangan || <span className="text-slate-300 italic">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleMarkAsFinished(row.id, row.spk)}
                                                            disabled={actionLoading}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-800 shadow-sm transition"
                                                            title="Selesaikan analisis dan teruskan ke tahap upload sertifikat"
                                                        >
                                                            <Check size={13} />
                                                            <span>Selesai Uji</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditModalItem(row);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                            title="Edit tahapan & parameter"
                                                        >
                                                            <Pencil size={11} />
                                                            <span>Update</span>
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
                </section>
            )}

            {/* ========================================================================= */}
            {/* TAHAP 4: BUKU ANALIS / LOGBOOK PARAMETER & TAHAPAN UJI */}
            {/* ========================================================================= */}
            {effectiveActiveTab === "laboratorium-buku-analis" && (
                <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen size={18} className="text-brand-600" />
                                <span>Buku Register Catatan Analis (Parameter & Tahap Pengujian)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Format buku catatan analis: <strong>No, Kode SPK, Kode Sampel, Jumlah, SLA Tenggat 45 Hari, Tahap Proses, Parameter Uji</strong>.</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari SPK, Kode Sampel, Parameter..."
                                className="bg-transparent text-xs outline-none w-48 sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-300 shadow-sm">
                        <table className="min-w-full divide-y divide-slate-300 text-xs text-left font-sans">
                            <thead className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider text-[11px] border-b-2 border-slate-300">
                                <tr>
                                    <th className="px-3.5 py-3 w-14 text-center border-r border-slate-200">No.</th>
                                    <th className="px-4 py-3 min-w-[130px] border-r border-slate-200">Kode SPK</th>
                                    <th className="px-4 py-3 min-w-[110px] border-r border-slate-200">Kode Sampel</th>
                                    <th className="px-3.5 py-3 w-16 text-center border-r border-slate-200">Jml</th>
                                    <th className="px-3.5 py-3 min-w-[150px] border-r border-slate-200">SLA Tenggat ({slaSettings.sla_hari || 45} Hari)</th>
                                    <th className="px-4 py-3 min-w-[180px] border-r border-slate-200">Tahap Proses Uji</th>
                                    <th className="px-4 py-3 min-w-[200px] border-r border-slate-200">Parameter Uji</th>
                                    <th className="px-3.5 py-3 text-center min-w-[90px] border-r border-slate-200">Status</th>
                                    <th className="px-4 py-3 text-right min-w-[130px]">Aksi Analis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {analystBookSamples.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-10 text-slate-400 font-semibold">
                                            Tidak ada data buku catatan analis yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    analystBookSamples.map((row, idx) => {
                                        const sInfo = getSampleCodeDisplay(row);
                                        const sla = getSlaInfo(row.tanggal_masuk || row.tanggalMasuk, slaSettings);

                                        return (
                                            <tr key={row.id} className="hover:bg-emerald-50/20 transition font-medium">
                                                {/* No */}
                                                <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                                                    {idx + 1}
                                                </td>

                                                {/* Kode SPK */}
                                                <td className="px-4 py-3 font-mono font-black text-brand-900 border-r border-slate-100 whitespace-nowrap">
                                                    {row.spk || row.noSpk || row.kode_tracking}
                                                </td>

                                                {/* Kode Sampel */}
                                                <td className="px-4 py-3 font-mono font-extrabold border-r border-slate-100 whitespace-nowrap">
                                                    <span className={`inline-block px-2 py-0.5 rounded bg-${sInfo.color}-100 text-${sInfo.color}-950 border border-${sInfo.color}-300`}>
                                                        {sInfo.val}
                                                    </span>
                                                </td>

                                                {/* Jumlah */}
                                                <td className="px-3.5 py-3 text-center font-mono font-black text-slate-800 border-r border-slate-100">
                                                    {row.jumlah_sampel || row.jumlahSampel || row.jumlah || "1"}
                                                </td>

                                                {/* SLA Deadline */}
                                                <td className="px-3.5 py-3 border-r border-slate-100 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] ${sla.badgeClass}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${sla.dotClass || "bg-current"}`} />
                                                        <span>{sla.label}</span>
                                                    </span>
                                                </td>

                                                {/* Tahap Proses Uji */}
                                                <td className="px-4 py-3 border-r border-slate-100">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-950 border border-emerald-200">
                                                        <Activity size={12} className="text-emerald-700 flex-shrink-0" />
                                                        <span>{row.tahap_proses || row.tahapProses || "3. Destruksi / Ekstraksi Kimia"}</span>
                                                    </span>
                                                </td>

                                                {/* Parameter Uji */}
                                                <td className="px-4 py-3 text-slate-800 leading-relaxed border-r border-slate-100 max-w-md font-semibold">
                                                    {row.parameter_uji || row.parameterUji ? (
                                                        <span>{row.parameter_uji || row.parameterUji}</span>
                                                    ) : (
                                                        <span className="text-slate-300 italic">Belum diisi parameter</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3.5 py-3 text-center border-r border-slate-100 whitespace-nowrap">
                                                    {(() => {
                                                        const st = getStatusUjiBadge(row.status_uji);
                                                        return (
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] ${st.badgeClass}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${st.dotClass || "bg-current"}`} />
                                                                <span>{st.label}</span>
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Aksi Analis */}
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            setEditModalItem(row);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-black text-purple-800 hover:bg-purple-100 transition shadow-sm"
                                                    >
                                                        <Pencil size={11} />
                                                        <span>Update Tahap</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* TAHAP 5: LAPORAN & SERTIFIKAT SELESAI */}
            {/* ========================================================================= */}
            {effectiveActiveTab === "laboratorium-laporan-selesai" && (
                <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FileCheck size={18} className="text-emerald-600" />
                                <span>Hasil Uji Selesai - Penerbitan Sertifikat LHU ({finishedSamples.length})</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Seluruh pengujian teknis telah selesai. Petugas dapat <strong>mengunggah file sertifikat / Laporan Hasil Uji (PDF)</strong> untuk diakses oleh pemohon.</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari SPK, Nama, Hasil..."
                                className="bg-transparent text-xs outline-none w-44 sm:w-56"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                            <thead className="bg-slate-100/80 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-3 py-3 w-12 text-center">NO</th>
                                    <th className="px-3.5 py-3 min-w-[130px]">NOMOR SPK</th>
                                    <th className="px-3.5 py-3 min-w-[140px]">NAMA PEMOHON</th>
                                    <th className="px-3 py-3 text-center min-w-[110px]">KODE SAMPEL</th>
                                    <th className="px-3.5 py-3 min-w-[150px]">PARAMETER UJI & CATATAN</th>
                                    <th className="px-3 py-3 w-24">TGL SELESAI</th>
                                    <th className="px-3 py-3 text-right min-w-[200px]">DOKUMEN SERTIFIKAT LHU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {finishedSamples.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                                            Belum ada sampel pengujian dengan status selesai.
                                        </td>
                                    </tr>
                                ) : (
                                    finishedSamples.map((row, idx) => {
                                        const sInfo = getSampleCodeDisplay(row);

                                        return (
                                            <tr key={row.id} className="hover:bg-emerald-50/20 transition">
                                                <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">{idx + 1}</td>
                                                <td className="px-3.5 py-3 font-mono font-extrabold text-brand-800 whitespace-nowrap">{row.spk || row.noSpk || row.kode_tracking}</td>
                                                <td className="px-3.5 py-3 font-bold text-slate-900">{row.nama_pemohon || row.namaPemohon}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-${sInfo.color}-100 text-${sInfo.color}-900`}>
                                                        {sInfo.val}
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-3 text-slate-600 max-w-xs">
                                                    <div className="font-bold text-slate-800 truncate">{row.parameter_uji || row.parameterUji || "-"}</div>
                                                    <div className="line-clamp-1 text-[11px] text-slate-400">{row.keterangan || "Analisis tuntas memenuhi standar laboratorium."}</div>
                                                </td>
                                                <td className="px-3 py-3 text-slate-500 font-mono whitespace-nowrap">
                                                    {formatDate(row.tanggal_selesai || row.tanggalSelesai)}
                                                </td>
                                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {row.hasil_dokumen_url || row.hasilDokumenUrl ? (
                                                            <a
                                                                href={row.hasil_dokumen_url || row.hasilDokumenUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-black hover:bg-emerald-700 shadow-sm transition"
                                                            >
                                                                <FileCheck size={13} />
                                                                <span>Lihat Sertifikat</span>
                                                                <ExternalLink size={11} />
                                                            </a>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditModalItem(row);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-3 py-1.5 text-xs font-black hover:bg-brand-700 shadow-sm transition"
                                                            >
                                                                <UploadCloud size={13} />
                                                                <span>Upload Sertifikat PDF</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setEditModalItem(row);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Pencil size={11} />
                                                            <span>Edit</span>
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
                </section>
            )}

            {/* Modal Update Data & Status Uji Laboratorium */}
            <UpdateLabStatusModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditModalItem(null);
                }}
                trackingItem={editModalItem}
                onSuccess={() => {
                    fetchLabData();
                    setNotification("Data pengujian dan status laboratorium berhasil diperbarui!");
                    setTimeout(() => setNotification(null), 3500);
                }}
            />
        </div>
    );
}
