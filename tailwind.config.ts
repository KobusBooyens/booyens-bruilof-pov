import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Earthy, sage-forward palette drawn from the invite's colour guide.
        linen: "#F4EEE2", // warm cream page background
        parchment: "#FBF7EF", // card surface
        sand: "#EAE0CF", // subtle fills
        line: "#E1D7C5", // hairline borders
        sage: "#7E8B6A", // primary
        "sage-deep": "#4F5A41", // dark salie
        clay: "#B9764F", // restrained terracotta accent
        "clay-deep": "#9A5C39",
        mauve: "#A98A7D", // mauve-brown
        ink: "#372E26", // primary text
        stone: "#7A6F62", // muted text
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(55,46,38,0.04), 0 8px 24px -12px rgba(55,46,38,0.18)",
        photo: "0 2px 4px rgba(55,46,38,0.08), 0 12px 28px -14px rgba(55,46,38,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
