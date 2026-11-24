/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4338CA",
          light: "#6366F1",
          dark: "#3730A3",
        },
        primaryHeader: "#4A90E2",
        primaryBody: "#F9F9F9",
        primaryFooter: "#2C3E50",
        neutral: {
          850: "#1F1F23",
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "2xs": "0 1px 1px 0 rgb(0 0 0 / 0.03)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "spin-slow": "spin 18s linear infinite",
        fadeIn: "fadeIn 0.35s ease-out forwards",
      },
    },
  },

  plugins: [],
};