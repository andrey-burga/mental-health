/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryHeader: "#4A90E2",
        primaryBody: "#F9F9F9",
        primaryFooter: "#2C3E50",
      },
    },
  },
  plugins: [],
};
