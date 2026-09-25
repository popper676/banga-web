/**
 * BANG GA BANG GA — shared design tokens.
 *
 * Single source of truth. Mirrored by:
 *  - src/app/globals.css        (@theme block, web + admin)
 *  - mobile/src/theme/tokens.ts (React Native / Expo)
 */

export const color = {
  teal: "#FEB513",
  deep: "#000000",
  ink: "#000000",
  cream: "#FFFFFF",
  coral: "#F2B326",
  cta: "#000000",
  ctaDark: "#F2B326",
  yellow: "#FEB513",
  mint: "#FFFFFF",
  white: "#FFFFFF",
  grey: "#000000",
  line: "#000000",
  lineDark: "#FEB513",
} as const;

export const colorRoles = [
  { name: "Brand yellow", token: "teal", hex: color.teal, use: "Brand fills, highlights and primary actions", on: color.ink },
  { name: "Black", token: "ink", hex: color.ink, use: "Text, dark surfaces and strong actions", on: color.white },
  { name: "White", token: "white", hex: color.white, use: "Page backgrounds, cards and reversed text", on: color.ink },
] as const;

/** Strict three-colour brand distribution. */
export const colorDistribution = [
  { label: "White", pct: 55, hex: color.white },
  { label: "Black", pct: 30, hex: color.ink },
  { label: "Brand yellow", pct: 15, hex: color.teal },
] as const;

export const typeScale = [
  { name: "Display XL", font: "Poppins Bold", size: "96 / 96", mobile: "40 / 44", use: "Hero headline" },
  { name: "Display L", font: "Poppins Bold", size: "64 / 68", mobile: "32 / 36", use: "Section headings" },
  { name: "Display M", font: "Poppins Bold", size: "44 / 50", mobile: "28 / 32", use: "Sub-sections" },
  { name: "Heading", font: "Poppins SemiBold", size: "28 / 36", mobile: "22 / 28", use: "Card group titles" },
  { name: "Title", font: "Inter SemiBold", size: "20 / 28", mobile: "18 / 24", use: "Product name, dialog title" },
  { name: "Body", font: "Inter Regular", size: "16 / 26", mobile: "16 / 24", use: "Default copy" },
  { name: "Small", font: "Inter Regular", size: "14 / 20", mobile: "14 / 20", use: "Meta, helper text" },
  { name: "Caption", font: "Inter Medium", size: "12 / 16", mobile: "12 / 16", use: "Badges, table meta" },
] as const;

export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

export const radius = { sm: 8, card: 16, lg: 24, xl: 32, pill: 999 } as const;

export const motion = {
  duration: { instant: 100, fast: 160, base: 240, slow: 400, story: 600 },
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  reducedMotion: "Large movement becomes opacity-only, ≤200ms",
} as const;

export const breakpoints = {
  web: [
    { name: "Desktop", w: 1440, grid: "12 col · 80 margin · 24 gutter" },
    { name: "Tablet", w: 1024, grid: "8 col · 40 margin · 20 gutter" },
    { name: "Mobile", w: 390, grid: "4 col · 20 margin · 16 gutter" },
  ],
  mobile: [
    { name: "iOS", w: 393, h: 852 },
    { name: "Android", w: 360, h: 800 },
  ],
  admin: [
    { name: "Desktop", w: 1440, grid: "240px sidebar + fluid" },
    { name: "Laptop", w: 1280, grid: "64px icon rail + fluid" },
  ],
} as const;

/** Minimum touch targets — WCAG 2.2 AA + platform guidance */
export const touchTarget = { web: 24, ios: 44, android: 48 } as const;
