import type { Config } from "tailwindcss";

export default {
  mode: "jit",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "var(--background-base)",
        primary: "var(--text-base)",
        secondary: "var(--text-subdued)",
        accent: "var(--text-bright-accent)",
        "track-hover": "hsla(0, 0%, 100%, 0.1)",
        "track-selected": "hsla(0, 0%, 100%, 0.3)",
      },
    },
  },
  plugins: [],
} satisfies Config;
