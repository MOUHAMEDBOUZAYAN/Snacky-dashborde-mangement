import type { Config } from "tailwindcss";

/**
 * Snacky brand tokens (warm orange / green).
 * Tailwind v4 consumes these via CSS `@theme` in `src/app/globals.css`.
 * Keep this file as the single source of truth for brand hex values.
 */
export const snackyBrand = {
  orange: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
    DEFAULT: "#F97316",
  },
  green: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
    DEFAULT: "#16A34A",
  },
  cream: "#FFFBF5",
  charcoal: "#1C1917",
} as const;

const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: snackyBrand.orange,
          green: snackyBrand.green,
          cream: snackyBrand.cream,
          charcoal: snackyBrand.charcoal,
        },
      },
    },
  },
} satisfies Config;

export default config;
