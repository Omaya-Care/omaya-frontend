/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Public Sans", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
      },
      colors: {
        brand: {
          plum: "#4A2545",
          navy: "#0F172A",
          berry: "#93406B",
        },
      },
    },
  },
  plugins: [],
};
