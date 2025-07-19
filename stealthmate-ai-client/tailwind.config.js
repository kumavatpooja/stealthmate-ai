// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A835f2",       // Deep Indigo
        secondary: "#f23598",     // Teal Cyan
        background: "#F5F7FA",    // Light Background
        surface: "#FFFFFF",       // White
        cta: "#FFB400",           // Mustard Yellow

        textDark: "#333333",      // For default text
        textLight: "#FFFFFF",     // For text on dark bg
        borderGrey: "#D9D9D9",    // Light border
      },
    },
  },
  plugins: [],
};
