import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        // Azul marino (color principal del logo MentorIT)
        brand: {
          50: "#eef3f8",
          100: "#d6e2ee",
          200: "#aec6dd",
          300: "#7ea3c4",
          400: "#4d7aa6",
          500: "#2c5980",
          600: "#1d4365",
          700: "#163450",
          800: "#11283d",
          900: "#0c1d2e",
        },
        // Verde agua (color secundario del logo)
        accent: {
          400: "#5fd6bf",
          500: "#28c1a6",
          600: "#159e86",
        },
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(29, 67, 101, 0.35)",
        "glow-accent": "0 10px 40px -12px rgba(40, 193, 166, 0.45)",
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.9)" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        pop: "pop 0.3s ease-out",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
