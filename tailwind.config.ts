import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FFFFFF",
        hairline: "#D8D8D8",
        muted: "#6B6B6B",
        plate: "#F4C430",
      },
      fontFamily: {
        display: ["var(--font-condensed)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
