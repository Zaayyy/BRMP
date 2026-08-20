import React, { useState } from "react";

/**
 * Pure-SVG interactive donut chart for status distribution.
 */
export default function StatusDonutChart({ data = [], totalCount = 0 }) {
    const [hovered, setHovered] = useState(null);

    const total = totalCount > 0
        ? totalCount
        : data.reduce((s, d) => s + (d.value || 0), 0);

    const SIZE   = 172;
    const STROKE = 22;
    const R      = (SIZE - STROKE) / 2;
    const CIRC   = 2 * Math.PI * R;

    let acc = 0;

    const activeItem = hovered !== null ? data[hovered] : null;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
                {/* Donut SVG */}
                <div className="relative mx-auto sm:mx-0" style={{ width: SIZE, height: SIZE }}>
                    <svg
                        width={SIZE}
                        height={SIZE}
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        style={{ transform: "rotate(-90deg)" }}
                    >
                        {/* Background ring */}
                        <circle
                            cx={SIZE/2} cy={SIZE/2} r={R}
                            fill="none" stroke="#f0f4f2" strokeWidth={STROKE}
                        />

                        {total === 0 ? (
                            <circle
                                cx={SIZE/2} cy={SIZE/2} r={R}
                                fill="none" stroke="#e2ebe6" strokeWidth={STROKE}
                                strokeDasharray={`${CIRC} ${CIRC}`}
                            />
                        ) : (
                            data.map((item, idx) => {
                                if (!item.value) return null;
                                const pct   = item.value / total;
                                const dash  = CIRC * pct;
                                const gap   = CIRC - dash;
                                const offset= -CIRC * acc;
                                acc += pct;

                                return (
                                    <circle
                                        key={idx}
                                        cx={SIZE/2} cy={SIZE/2} r={R}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth={hovered === idx ? STROKE + 5 : STROKE}
                                        strokeDasharray={`${dash} ${gap}`}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        style={{ cursor:"pointer", transition:"stroke-width 0.2s" }}
                                        onMouseEnter={() => setHovered(idx)}
                                        onMouseLeave={() => setHovered(null)}
                                    />
                                );
                            })
                        )}
                    </svg>

                    {/* Center text */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            {activeItem ? activeItem.value : total}
                        </span>
                        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {activeItem ? activeItem.label : "Total"}
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-2">
                    {data.map((item, idx) => {
                        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        const isH = hovered === idx;

                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => setHovered(idx)}
                                onMouseLeave={() => setHovered(null)}
                                className={`
                                    flex items-center justify-between rounded-xl px-3 py-2.5
                                    text-xs font-semibold cursor-pointer transition-all duration-150
                                    ${isH ? "bg-slate-100 scale-[1.01]" : "hover:bg-slate-50"}
                                `}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full transition-transform"
                                        style={{ background: item.color, transform: isH ? "scale(1.3)" : "scale(1)" }}
                                    />
                                    <span className="text-slate-600">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">{item.value}</span>
                                    <span className="text-[10px] text-slate-400">({pct}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
