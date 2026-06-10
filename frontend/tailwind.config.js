/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          500: "#3b6fe0",
          600: "#2f59c2",
          700: "#2747a0",
        },
      },
    },
  },
  plugins: [],
};
