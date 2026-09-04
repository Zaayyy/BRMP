import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ArrowRight } from "lucide-react";

/**
 * Global helper function to trigger the popup from anywhere
 * @param {Object} options
 * @param {'success'|'error'|'warning'|'info'} [options.type='success']
 * @param {string} [options.title]
 * @param {string} [options.message]
 * @param {Object|Array|string} [options.details]
 * @param {string} [options.confirmText='Mengerti']
 * @param {number} [options.autoCloseMs=4500]
 * @param {Function} [options.onConfirm]
 */
export const triggerFeedbackPopup = (options = {}) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("brmp_feedback_popup", { detail: options }));
  }
};

if (typeof window !== "undefined") {
  window.showFeedbackPopup = triggerFeedbackPopup;
}

export default function FeedbackPopup({
  isOpen: propIsOpen,
  onClose: propOnClose,
  type: propType,
  title: propTitle,
  message: propMessage,
  details: propDetails,
  confirmText: propConfirmText,
  autoCloseMs: propAutoCloseMs,
}) {
  const [modalState, setModalState] = useState(null);

  // Listen to global trigger event
  useEffect(() => {
    const handleEvent = (e) => {
      if (e?.detail) {
        setModalState({
          type: e.detail.type || "success",
          title: e.detail.title || (e.detail.type === "error" ? "Gagal Memproses Tindakan" : "Tindakan Berhasil Diselesaikan!"),
          message: e.detail.message || "",
          details: e.detail.details || null,
          confirmText: e.detail.confirmText || "Mengerti",
          autoCloseMs: e.detail.autoCloseMs !== undefined ? e.detail.autoCloseMs : 4500,
          onConfirm: e.detail.onConfirm || null,
        });
      }
    };

    window.addEventListener("brmp_feedback_popup", handleEvent);
    return () => window.removeEventListener("brmp_feedback_popup", handleEvent);
  }, []);

  // Sync with direct props if provided
  useEffect(() => {
    if (propIsOpen !== undefined) {
      if (propIsOpen) {
        setModalState({
          type: propType || "success",
          title: propTitle || (propType === "error" ? "Gagal Memproses Tindakan" : "Tindakan Berhasil Diselesaikan!"),
          message: propMessage || "",
          details: propDetails || null,
          confirmText: propConfirmText || "Mengerti",
          autoCloseMs: propAutoCloseMs !== undefined ? propAutoCloseMs : 4500,
          onConfirm: null,
        });
      } else {
        setModalState(null);
      }
    }
  }, [propIsOpen, propType, propTitle, propMessage, propDetails, propConfirmText, propAutoCloseMs]);

  // Auto-close timer
  useEffect(() => {
    if (!modalState || !modalState.autoCloseMs || modalState.autoCloseMs <= 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, modalState.autoCloseMs);

    return () => clearTimeout(timer);
  }, [modalState]);

  const handleClose = () => {
    if (modalState?.onConfirm) {
      try {
        modalState.onConfirm();
      } catch (err) {}
    }
    setModalState(null);
    if (propOnClose) propOnClose();
  };

  if (!modalState) return null;

  const { type = "success", title, message, details, confirmText = "Mengerti" } = modalState;

  // Theme config based on type
  const themeConfig = {
    success: {
      bgGlow: "from-emerald-500/15 via-teal-500/5 to-transparent",
      iconBg: "bg-emerald-100 text-emerald-600 ring-emerald-50 border-emerald-200",
      btnBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25",
      badgeBorder: "border-emerald-200 bg-emerald-50/50",
      icon: <CheckCircle2 size={36} strokeWidth={2.4} className="text-emerald-600 animate-bounce" />,
      defaultTitle: "Tindakan Berhasil!",
      accentBar: "bg-emerald-500",
    },
    error: {
      bgGlow: "from-rose-500/15 via-red-500/5 to-transparent",
      iconBg: "bg-rose-100 text-rose-600 ring-rose-50 border-rose-200",
      btnBg: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-600/25",
      badgeBorder: "border-rose-200 bg-rose-50/50",
      icon: <AlertCircle size={36} strokeWidth={2.4} className="text-rose-600" />,
      defaultTitle: "Terjadi Kesalahan",
      accentBar: "bg-rose-500",
    },
    warning: {
      bgGlow: "from-amber-500/15 via-yellow-500/5 to-transparent",
      iconBg: "bg-amber-100 text-amber-700 ring-amber-50 border-amber-200",
      btnBg: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-amber-600/25",
      badgeBorder: "border-amber-200 bg-amber-50/50",
      icon: <AlertTriangle size={36} strokeWidth={2.4} className="text-amber-600" />,
      defaultTitle: "Peringatan",
      accentBar: "bg-amber-500",
    },
    info: {
      bgGlow: "from-sky-500/15 via-blue-500/5 to-transparent",
      iconBg: "bg-sky-100 text-sky-600 ring-sky-50 border-sky-200",
      btnBg: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-600/25",
      badgeBorder: "border-sky-200 bg-sky-50/50",
      icon: <Info size={36} strokeWidth={2.4} className="text-sky-600" />,
      defaultTitle: "Informasi Sistem",
      accentBar: "bg-sky-500",
    },
  };

  const currentTheme = themeConfig[type] || themeConfig.success;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] bg-white p-7 text-center shadow-2xl border border-slate-100 transition-all transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow & Decorative Bar */}
        <div className={`absolute -top-12 -left-12 -right-12 h-36 bg-gradient-to-b ${currentTheme.bgGlow} pointer-events-none rounded-full blur-2xl`} />
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${currentTheme.accentBar}`} />

        {/* Close Icon Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        {/* Big Icon Circle */}
        <div className="relative mx-auto mb-4 mt-2 flex h-20 w-20 items-center justify-center rounded-3xl ring-8 border shadow-sm transition-transform duration-300 hover:scale-105">
          <div className={`absolute inset-0 rounded-3xl ${currentTheme.iconBg}`} />
          <div className="relative z-10">{currentTheme.icon}</div>
        </div>

        {/* Title & Message */}
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          {title || currentTheme.defaultTitle}
        </h3>
        <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-xs mx-auto mb-4">
          {message}
        </p>

        {/* Details Box (if provided) */}
        {details && (
          <div className={`mb-5 rounded-2xl p-3.5 text-left text-xs border ${currentTheme.badgeBorder}`}>
            {typeof details === "string" ? (
              <p className="font-semibold text-slate-800 break-words">{details}</p>
            ) : Array.isArray(details) ? (
              <ul className="space-y-1 text-slate-700 font-medium">
                {details.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            ) : typeof details === "object" ? (
              <div className="space-y-1.5 text-slate-700">
                {Object.entries(details).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">{k}:</span>
                    <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200/60">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={handleClose}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-black shadow-lg transition-all active:scale-98 ${currentTheme.btnBg}`}
        >
          <span>{confirmText}</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
