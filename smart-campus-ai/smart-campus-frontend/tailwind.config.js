/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        card: "rgba(17, 24, 39, 0.65)",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          light: "#818cf8",
        },
        accent: {
          teal: "#14b8a6",
          rose: "#f43f5e",
          amber: "#f59e0b",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
        },
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glassGlow: "0 0 25px rgba(99, 102, 241, 0.25)",
        cardGlass: "0 4px 24px -1px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseSlow: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}
