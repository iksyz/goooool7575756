/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "pitch-green": "#16a34a",
                "stadium-white": "#f8fafc",
                "referee-yellow": "#facc15",
                "var-blue": "#2563eb",
            },
            boxShadow: {
                premium: "0 12px 30px rgba(2, 44, 34, 0.18)",
                "premium-strong": "0 18px 50px rgba(2, 44, 34, 0.28)",
            },
            backgroundImage: {
                "pitch-pattern":
                    "repeating-linear-gradient(90deg, rgba(5,46,22,0.06) 0 2px, rgba(22,163,74,0.05) 2px 20px)",
            },
        },
    },
    plugins: [],
};
