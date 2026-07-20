/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // toggled via the same "user preference wins over system" logic as v1
  theme: {
    extend: {
      colors: {
        // Carried over 1:1 from v1's style.css CSS variables so the visual
        // identity doesn't change just because the codebase did.
        navy: "#0a2463",
        cyan: "#3ba7e0",
        blue: "#2563eb",
      },
    },
  },
  plugins: [],
};
