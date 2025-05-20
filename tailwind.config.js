/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1075E9",
        gradientEnd: "rgba(25, 46, 235, 0.9)",
        // Add your custom colors from the code
        coursePurple: "rgba(217, 115, 245, 0.45)",
        courseYellow: "rgba(243, 220, 139, 0.69)",
        courseRed: "rgba(239, 110, 116, 0.55)",
      },
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")],
};
