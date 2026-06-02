/** @type {import('tailwindcss').Config} */
// KIRAN Dashboard Design System - Tailwind Config and Font Extensions
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zinc: {
          850: "#1f1f22",
          900: "#18181b",
          950: "#09090b",
        }
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
