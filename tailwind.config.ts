import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        // OWL PRINT — identidade da logo (azul-marinho + dourado)
        leather: "#15395B", // Navy (cor principal / textos escuros)
        premium: "#1E4A78", // Navy claro
        champagne: "#BF9B4F", // Dourado
        ink: "#12273F", // Azul quase preto
        burgundy: "#B23A3A", // Vermelho elegante (erros)
        cream: "#F7F5EF", // Creme
      },
      fontFamily: {
        // CORRIGIDO: usa as variáveis que o layout realmente define
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 20px 60px -20px rgba(18,39,63,0.45)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
