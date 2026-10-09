/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        strongmate: {
          red: "#DC2626",
          darkred: "#991B1B",
          dark: "#111827",
          charcoal: "#1F2937",
          gray: "#374151",
          light: "#F9FAFB",
        },
        qlumate: {
          green: "#16A34A",
          darkgreen: "#14532D",
          lightgreen: "#DCFCE7",
          orange: "#EA580C",
          yellow: "#EAB308",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
