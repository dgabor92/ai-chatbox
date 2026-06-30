/** @type {import('tailwindcss').Config} */
export default {
  // tailwind.config.js
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        card: "#5c4438",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".drag": {
          "-webkit-app-region": "drag",
        },
        ".no-drag": {
          "-webkit-app-region": "no-drag",
        },
      });
    },
  ],
};
