import React from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * Reusable premium StatCard component.
 * Props:
 *   icon        – Lucide icon component
 *   label       – short card label (uppercase)
 *   value       – big number/text
 *   badgeText   – badge below value
 *   variant     – "emerald" | "sky" | "amber" | "violet" | "rose"
 *   subtext     – secondary info bottom right
 *   onClick     – navigation handler
 *   delay       – animation-delay css value
 */
const variantMap = {
    emerald: {
        iconBg:    "from-brand-500 to-brand-700",
        iconShadow:"rgba(37,196,122,0.35)",
        badge:     "bg-brand-50 text-brand-700 border-brand-200/60",
        bar:       "from-brand-500 to-brand-700",
        dot:       "bg-brand-400",
        glow:      "hover:shadow-glow",
        accentBg:  "from-brand-500/5 to-brand-500/0",
    },
    sky: {
        iconBg:    "from-sky-500 to-blue-600",
        iconShadow:"rgba(14,165,233,0.35)",
        badge:     "bg-sky-50 text-sky-700 border-sky-200/60",
        bar:       "from-sky-500 to-blue-600",
        dot:       "bg-sky-400",
        glow:      "hover:shadow-glow-sky",
        accentBg:  "from-sky-500/5 to-sky-500/0",
    },
    amber: {
        iconBg:    "from-amber-400 to-orange-500",
        iconShadow:"rgba(245,158,11,0.35)",
        badge:     "bg-amber-50 text-amber-700 border-amber-200/60",
        bar:       "from-amber-400 to-orange-500",
        dot:       "bg-amber-400",
        glow:      "hover:shadow-glow-amber",
        accentBg:  "from-amber-500/5 to-amber-500/0",
    },
    violet: {
        iconBg:    "from-violet-500 to-purple-600",
        iconShadow:"rgba(139,92,246,0.35)",
        badge:     "bg-violet-50 text-violet-700 border-violet-200/60",
        bar:       "from-violet-500 to-purple-600",
        dot:       "bg-violet-400",
        glow:      "hover:shadow-glow-violet",
        accentBg:  "from-violet-500/5 to-violet-500/0",
    },
    rose: {
        iconBg:    "from-rose-500 to-red-600",
        iconShadow:"rgba(244,63,94,0.35)",
        badge:     "bg-rose-50 text-rose-700 border-rose-200/60",
        bar:       "from-rose-500 to-red-600",
        dot:       "bg-rose-400",
        glow:      "hover:shadow-glow",
        accentBg:  "from-rose-500/5 to-rose-500/0",
    },
};

export default function StatCard({
    icon: Icon,
    label,
    value,
    badgeText,
    variant = "emerald",
    subtext,
    onClick,
    delay = "0s",
}) {
    const v = variantMap[variant] || variantMap.emerald;

    return (
        <div
            onClick={onClick}
            style={{ animationDelay: delay }}
            className={`
                group relative overflow-hidden rounded-[1.75rem] bg-white/90
                border border-slate-100 backdrop-blur-md
                shadow-card transition-all duration-300
                ${v.glow}
                hover:-translate-y-1.5 hover:shadow-card-hover hover:border-slate-200/80
                animate-fade-up
                ${onClick ? "cursor-pointer" : ""}
            `}
        >
            {/* Gradient accent stripe top */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${v.bar} rounded-t-[1.75rem]`} />

            {/* Subtle accent bg */}
            <div className={`pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-gradient-to-tl ${v.accentBg} blur-2xl`} />

            <div className="relative p-5">
                {/* Top row: label + icon */}
                <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {label}
                    </p>
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${v.iconBg} text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        style={{ boxShadow: `0 8px 24px ${v.iconShadow}` }}
                    >
                        {Icon && <Icon size={20} strokeWidth={2.3} />}
                    </div>
                </div>

                {/* Value */}
                <div className="mt-2.5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    {value}
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-slate-100" />

                {/* Footer */}
                <div className="flex items-center justify-between gap-2">
                    {badgeText && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${v.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${v.dot} animate-dot-pulse`} />
                            {badgeText}
                        </span>
                    )}
                    {subtext && (
                        <span className="truncate text-[11px] font-semibold text-slate-400">
                            {subtext}
                        </span>
                    )}
                    {onClick && (
                        <ArrowUpRight
                            size={15}
                            className="ml-auto shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-current"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
