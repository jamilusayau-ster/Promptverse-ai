import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0A0E1F",       // deep space navy background
        surface: "#12162C",     // card / panel surface
        surface2: "#191F3D",    // elevated surface
        border: "#262C4D",
        ink: "#E9EBF7",         // primary text
        muted: "#8A90B8",       // secondary text
        electric: "#4D7FFF",    // electric blue accent
        violet: "#8B5CF6",      // violet accent
        gold: "#F5B841",        // premium accent
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "node-glow":
          "radial-gradient(60% 60% at 50% 40%, rgba(77,127,255,0.25) 0%, rgba(139,92,246,0.12) 45%, rgba(10,14,31,0) 75%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
