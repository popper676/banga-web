import type { SVGProps } from "react";

/**
 * Inline stroke icon set. No icon library dependency.
 * Every status pairs one of these with a text label — colour is never the
 * only carrier of meaning.
 */

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export const Icons = {
  clock: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  hourglass: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M7 3h10M7 21h10M8 3v4l4 5 4-5V3M8 21v-4l4-5 4 5v4" />
    </svg>
  ),
  check: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  ),
  "check-double": ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M2 13l4 4L14 7M12 16l1.5 1.5L22 8" />
    </svg>
  ),
  cross: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  cook: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 10a4 4 0 0 1 3.2-3.92 4 4 0 0 1 7.6 0A4 4 0 0 1 19 10v1H5v-1Z" />
      <path d="M6 14h12v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3Z" />
    </svg>
  ),
  bag: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  bike: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M8.5 17h6l-2-8h-3M12.5 9l2-3h3" />
    </svg>
  ),
  pin: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  alert: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 4.5 2.8 20h18.4L12 4.5Z" />
      <path d="M12 10v4.5M12 17.6v.01" />
    </svg>
  ),
  refund: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3.5 9A9 9 0 1 1 3 13.5" />
      <path d="M3 4.5V9h4.5" />
    </svg>
  ),
  card: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6 15h3" />
    </svg>
  ),
  qr: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h6" />
    </svg>
  ),
  cart: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 4h2l2.4 11.2A2 2 0 0 0 9.36 17h8.02a2 2 0 0 0 1.96-1.6L21 8H6" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </svg>
  ),
  search: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  ),
  user: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
  menu: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  chevronDown: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  chevronRight: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  chevronLeft: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  ),
  arrowRight: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  ),
  plus: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 12h14" />
    </svg>
  ),
  trash: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13" />
    </svg>
  ),
  phone: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M6 3h3l1.5 5-2 1.5a12 12 0 0 0 6 6L16 13.5 21 15v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
    </svg>
  ),
  camera: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3.5 8.5h3l1.5-2.5h8L17.5 8.5h3v11h-17v-11Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  ),
  star: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8L12 3.5Z" />
    </svg>
  ),
  filter: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  ),
  printer: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <path d="M7 14h10v6H7z" />
    </svg>
  ),
  download: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 3v11M7.5 10 12 14.5 16.5 10M4 19h16" />
    </svg>
  ),
  bell: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  ),
  settings: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
    </svg>
  ),
  grid: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  list: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  ),
  box: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </svg>
  ),
  tag: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3.5 11.5 11 4h8.5v8.5L12 20l-8.5-8.5Z" />
      <circle cx="15.5" cy="8.5" r="1.3" />
    </svg>
  ),
  chart: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 20V4M4 20h16M8 17V11M13 17V7M18 17v-4" />
    </svg>
  ),
  shield: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 3 5 5.5v6c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5v-6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  wifiOff: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 4l18 18M8.5 14.5a5 5 0 0 1 6 0M5 11a10 10 0 0 1 4-2.4M19 11a10 10 0 0 0-8.5-2.9M12 19h.01" />
    </svg>
  ),
  location: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
    </svg>
  ),
  home: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="m3.5 11 8.5-7 8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z" />
    </svg>
  ),
  receipt: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5.5 3h13v18l-2.2-1.5L14 21l-2-1.5L10 21l-2.3-1.5L5.5 21V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  ),
  eye: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  lock: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  logout: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
    </svg>
  ),
  sparkle: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5Z" />
    </svg>
  ),
  users: ({ size = 16, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-2-4" />
    </svg>
  ),
} satisfies Record<string, (p: P) => React.JSX.Element>;

export type IconKey = keyof typeof Icons;

export function Icon({ name, size = 16, className }: { name: IconKey; size?: number; className?: string }) {
  const Cmp = Icons[name];
  return <Cmp size={size} className={className} />;
}
