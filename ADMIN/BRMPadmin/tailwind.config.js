/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            colors: {
                brand: {
                    50:  "#f0fdf6",
                    100: "#dcfcec",
                    200: "#b9f5d9",
                    300: "#86ebbf",
                    400: "#4dd89e",
                    500: "#25c47a",
                    600: "#16a061",
                    700: "#127d4e",
                    800: "#10623e",
                    900: "#0f5033",
                    950: "#072f1e",
                },
                gold: {
                    400: "#fbbf24",
                    500: "#f59e0b",
                },
            },
            boxShadow: {
                glow:        "0 0 0 1px rgba(37,196,122,0.12), 0 16px 40px -6px rgba(22,160,97,0.20)",
                "glow-lg":   "0 0 0 1px rgba(37,196,122,0.12), 0 24px 56px -8px rgba(22,160,97,0.28)",
                "glow-amber":"0 16px 40px -6px rgba(245,158,11,0.20)",
                "glow-sky":  "0 16px 40px -6px rgba(14,165,233,0.20)",
                "glow-violet":"0 16px 40px -6px rgba(139,92,246,0.20)",
                "card":      "0 2px 8px -2px rgba(10,40,20,0.04), 0 8px 24px -4px rgba(10,40,20,0.06)",
                "card-hover":"0 8px 20px -4px rgba(10,40,20,0.06), 0 20px 40px -8px rgba(10,40,20,0.10)",
                "sidebar":   "4px 0 32px -4px rgba(5,20,10,0.30)",
                "inner-sm":  "inset 0 1px 0 rgba(255,255,255,0.15)",
            },
            animation: {
                "fade-up":      "fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both",
                "scale-in":     "scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
                "slide-right":  "slideRight 0.5s cubic-bezier(0.16,1,0.3,1) both",
                "dot-pulse":    "dotPulse 2s ease-in-out infinite",
                "spin-slow":    "spin 2.5s linear infinite",
                "shimmer":      "shimmerKf 1.8s ease-in-out infinite",
            },
            keyframes: {
                fadeUp: {
                    "0%":   { opacity:"0", transform:"translateY(16px)" },
                    "100%": { opacity:"1", transform:"translateY(0)" },
                },
                scaleIn: {
                    "0%":   { opacity:"0", transform:"scale(0.95)" },
                    "100%": { opacity:"1", transform:"scale(1)" },
                },
                slideRight: {
                    "0%":   { opacity:"0", transform:"translateX(-16px)" },
                    "100%": { opacity:"1", transform:"translateX(0)" },
                },
                dotPulse: {
                    "0%, 100%": { opacity:"1", transform:"scale(1)" },
                    "50%":      { opacity:"0.5", transform:"scale(0.8)" },
                },
                shimmerKf: {
                    "0%":   { backgroundPosition:"-400% 0" },
                    "100%": { backgroundPosition:"400% 0" },
                },
            },
            backdropBlur: {
                xs: "4px",
            },
        },
    },
    plugins: [],
};
