/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#effaf2",
                    100: "#dcf5e4",
                    200: "#b9ebcb",
                    300: "#8dddac",
                    400: "#5dc986",
                    500: "#2ea95c",
                    600: "#1f8649",
                    700: "#1b6b3d",
                    800: "#195634",
                    900: "#18472e",
                },
            },
            boxShadow: {
                glow: "0 18px 40px rgba(31, 134, 73, 0.15)",
            },
        },
    },
    plugins: [],
};
