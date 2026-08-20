import React from "react";

export default function SkeletonDashboard() {
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-7 pb-10">
            {/* Header */}
            <div className="rounded-[2.5rem] border border-white/80 bg-white/80 p-6 sm:p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <div className="h-3.5 w-32 skeleton-shimmer" />
                        <div className="h-9 w-80 skeleton-shimmer" />
                        <div className="h-3.5 w-60 skeleton-shimmer" />
                    </div>
                    <div className="flex gap-3">
                        <div className="h-12 w-32 rounded-2xl skeleton-shimmer" />
                        <div className="h-12 w-44 rounded-2xl skeleton-shimmer" />
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="rounded-[1.75rem] border border-slate-100 bg-white p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="h-3 w-24 skeleton-shimmer" />
                            <div className="h-11 w-11 rounded-2xl skeleton-shimmer" />
                        </div>
                        <div className="h-10 w-28 skeleton-shimmer" />
                        <div className="h-px bg-slate-100" />
                        <div className="h-6 w-32 rounded-full skeleton-shimmer" />
                    </div>
                ))}
            </div>

            {/* Content Section */}
            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                <div className="rounded-[2.25rem] border border-slate-100 bg-white p-6 space-y-5">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                        <div className="space-y-2">
                            <div className="h-3 w-24 skeleton-shimmer" />
                            <div className="h-6 w-52 skeleton-shimmer" />
                        </div>
                        <div className="h-10 w-36 rounded-2xl skeleton-shimmer" />
                    </div>
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />
                    ))}
                </div>
                <div className="space-y-6">
                    <div className="rounded-[2.25rem] border border-slate-100 bg-white p-6 space-y-4">
                        <div className="h-6 w-40 skeleton-shimmer" />
                        <div className="h-44 rounded-2xl skeleton-shimmer" />
                    </div>
                    <div className="rounded-[2.25rem] border border-slate-100 bg-white p-6 space-y-4">
                        <div className="h-6 w-40 skeleton-shimmer" />
                        {[1,2,3].map(i => (
                            <div key={i} className="h-14 rounded-2xl skeleton-shimmer" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
