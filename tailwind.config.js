/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2FA084",
          secondary: "#578FCA",
          accent: "#6FCF97",
          light: "#A1E3F9",
          hover: "#267D68",
          softbg: "#E8F7EF",
        },
        bg: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1E293B",
        },
        border: {
          light: "#E5E7EB",
          dark: "#334155",
        },
        text: {
          "heading-light": "#1F2937",
          "para-light": "#6B7280",
          "heading-dark": "#F8FAFC",
          "para-dark": "#CBD5E1",
        },
        footer: {
          bg: "#111827",
          text: "#CBD5E1",
          hover: "#6FCF97",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideInLeft: "slideInLeft 0.3s ease-out",
        slideInRight: "slideInRight 0.3s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
