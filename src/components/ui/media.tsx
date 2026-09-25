import { cn } from "@/lib/format";
import { Icon } from "./icons";

/* ------------------------------------------------------------------ */
/* Asset manifest                                                      */
/*                                                                     */
/* No brand photography exists yet. FoodImage renders a designed        */
/* placeholder derived from the product name until real files are       */
/* dropped into /public/images/… and listed here.                       */
/* See docs/10-missing-assets.md                                        */
/* ------------------------------------------------------------------ */

export const AVAILABLE_ASSETS = new Set<string>();

const PALETTES = [
  { bg: "#FFFFFF", shape: "#FEB513", accent: "#000000" },
  { bg: "#FEB513", shape: "#FFFFFF", accent: "#000000" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Product / lifestyle image with a designed fallback.
 * The fallback is intentionally art-directed rather than a grey box, so
 * layouts read at full fidelity before the photo shoot happens.
 */
export function FoodImage({
  src,
  alt,
  className,
  rounded = "rounded-[12px]",
  variant = "dish",
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
  variant?: "dish" | "scene" | "portrait";
}) {
  if (AVAILABLE_ASSETS.has(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", rounded, className)} />;
  }

  const p = PALETTES[hash(src) % PALETTES.length];
  const seed = hash(alt);
  const flip = seed % 2 === 0 ? 1 : -1;

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative overflow-hidden", rounded, className)}
      style={{ background: p.bg }}
    >
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {variant === "scene" ? (
          <>
            <rect width="120" height="90" fill={p.bg} />
            <path d="M0 65h120v25H0z" fill={p.shape} />
            <ellipse cx="60" cy="65" rx="39" ry="9" fill={p.accent} />
            <ellipse cx="60" cy="62" rx="24" ry="7" fill={p.bg} stroke={p.accent} strokeWidth="2" />
            <circle cx={35 + flip * 3} cy="35" r="9" fill={p.accent} />
            <path d="M23 60c1-13 7-18 15-18s14 5 15 18z" fill={p.accent} />
            <circle cx={84 - flip * 3} cy="34" r="9" fill={p.shape} stroke={p.accent} strokeWidth="2" />
            <path d="M69 60c2-13 8-18 16-18s14 5 16 18z" fill={p.shape} stroke={p.accent} strokeWidth="2" />
            <g fill={p.accent}>
              <rect x="5" y="7" width="8" height="8" />
              <rect x="21" y="7" width="8" height="8" />
              <rect x="13" y="15" width="8" height="8" />
              <rect x="29" y="15" width="8" height="8" />
            </g>
          </>
        ) : variant === "portrait" ? (
          <>
            <rect width="120" height="90" fill={p.bg} />
            <rect x="7" y="7" width="106" height="76" rx="10" fill={p.shape} />
            <circle cx="44" cy="34" r="12" fill={p.accent} />
            <circle cx="77" cy="32" r="11" fill={p.bg} stroke={p.accent} strokeWidth="2.5" />
            <path d="M17 83c2-23 12-34 28-34s27 11 29 34z" fill={p.accent} />
            <path d="M53 83c2-24 12-35 25-35s24 11 26 35z" fill={p.bg} stroke={p.accent} strokeWidth="2.5" />
            <g fill={p.accent}>
              <rect x="92" y="11" width="7" height="7" />
              <rect x="106" y="11" width="7" height="7" />
              <rect x="99" y="18" width="7" height="7" />
            </g>
          </>
        ) : (
          <>
            <rect width="120" height="90" fill={p.bg} />
            <ellipse cx="60" cy="51" rx="43" ry="29" fill={p.accent} />
            <ellipse cx="60" cy="47" rx="37" ry="24" fill={p.shape} stroke={p.bg} strokeWidth="2" />
            <g fill={p.accent} stroke={p.bg} strokeWidth="1.3" strokeLinejoin="round">
              <path d="M35 42c-5-7 2-13 10-10 5-7 15-2 13 6 5 5 0 12-8 11-4 6-14 2-12-5z" />
              <path d="M58 34c-2-8 8-11 13-5 7-4 14 4 9 10 5 6-2 12-9 9-5 5-14 0-11-7z" />
              <path d="M72 51c1-8 11-10 15-3 8-1 12 8 6 13 3 7-6 12-12 7-7 4-14-4-9-10z" />
              <path d="M46 54c4-7 14-5 15 3 7 2 7 12 0 14-2 7-12 8-15 1-8 0-10-10-3-14z" />
            </g>
            <g fill={p.bg}>
              <circle cx="44" cy="38" r="1.3" />
              <circle cx="67" cy="35" r="1.3" />
              <circle cx="82" cy="56" r="1.3" />
              <circle cx="53" cy="61" r="1.3" />
              <circle cx="62" cy="52" r="1" />
            </g>
            <path d="M9 11h20M9 16h14" stroke={p.accent} strokeWidth="2" />
          </>
        )}
      </svg>
      <div className="grain-layer" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photo strip — the "MAKE IT LAST" motif                              */
/* ------------------------------------------------------------------ */

export function PhotoStrip({
  frames = 4,
  className,
  tilt = 0,
  label = "Photo booth strip",
}: {
  frames?: number;
  className?: string;
  tilt?: number;
  label?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
      className={cn("flex w-24 flex-col gap-1.5 rounded-[10px] bg-white p-1.5 ring-1 ring-ink/10", className)}
    >
      {Array.from({ length: frames }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] rounded-[4px]"
          style={{ background: ["#FEB513", "#FFFFFF", "#FEB513", "#FFFFFF"][i % 4] }}
        >
          <svg viewBox="0 0 40 30" className="size-full">
            <circle cx="20" cy="13" r="6" fill="#FEB513" opacity="0.8" />
            <path d="M6 30c0-7 6-10 14-10s14 3 14 10z" fill="#000000" opacity="0.55" />
          </svg>
        </div>
      ))}
      <p className="pt-0.5 text-center text-[7px] font-bold uppercase tracking-widest text-ink/60">
        Make it last
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Static map placeholder                                              */
/* ------------------------------------------------------------------ */

export function MapView({
  className,
  label,
  pins = [],
  route,
}: {
  className?: string;
  label: string;
  pins?: { x: number; y: number; tone: "branch" | "rider" | "customer"; name: string }[];
  route?: boolean;
}) {
  const toneColor = { branch: "#000000", rider: "#FEB513", customer: "#000000" };
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative overflow-hidden rounded-[14px] bg-mint", className)}
    >
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <rect width="400" height="260" fill="#FFFFFF" />
        {/* Roads */}
        <g stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round">
          <path d="M-10 70H410M-10 170H410M90 -10V270M250 -10V270" />
        </g>
        <g stroke="#FEB513" strokeWidth="3">
          <path d="M-10 120H410M170 -10V270M330 -10V270" />
        </g>
        {/* Blocks */}
        <g fill="#FEB513" opacity="0.35">
          <rect x="105" y="15" width="50" height="40" rx="4" />
          <rect x="190" y="85" width="45" height="30" rx="4" />
          <rect x="270" y="185" width="45" height="45" rx="4" />
          <rect x="15" y="185" width="60" height="40" rx="4" />
        </g>
        {/* Water */}
        <path d="M340 0c25 40 10 90 30 130v130h30V0z" fill="#FEB513" />
        {route && (
          <path
            d="M100 190 C 150 190, 160 120, 210 110 S 290 90, 320 60"
            stroke="#000000"
            strokeWidth="4"
            strokeDasharray="10 8"
            fill="none"
          />
        )}
      </svg>
      {pins.map((pin) => (
        <div
          key={pin.name}
          className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span
            className="flex size-7 items-center justify-center rounded-full text-white ring-3 ring-white"
            style={{ background: toneColor[pin.tone] }}
          >
            <Icon name={pin.tone === "rider" ? "bike" : pin.tone === "branch" ? "home" : "pin"} size={14} />
          </span>
          <span className="mt-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ink ring-1 ring-ink/10">
            {pin.name}
          </span>
        </div>
      ))}
      <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-grey">
        Map placeholder — no map SDK in this prototype
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DuitNow dynamic QR — visual only, encodes nothing                   */
/* ------------------------------------------------------------------ */

export function QRCode({ seed, size = 240, dimmed }: { seed: string; size?: number; dimmed?: boolean }) {
  const grid = 21;
  const cells: boolean[] = [];
  let h = hash(seed);
  for (let i = 0; i < grid * grid; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells.push((h >> 7) % 100 > 52);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7);

  const unit = size / grid;

  return (
    <div
      className={cn("relative bg-white p-3 rounded-[12px]", dimmed && "opacity-25")}
      style={{ width: size + 24, height: size + 24 }}
      role="img"
      aria-label="DuitNow dynamic QR code"
    >
      <svg width={size} height={size} viewBox={`0 0 ${grid} ${grid}`} shapeRendering="crispEdges">
        <rect width={grid} height={grid} fill="#fff" />
        {cells.map((on, i) => {
          const r = Math.floor(i / grid);
          const c = i % grid;
          if (isFinder(r, c) || !on) return null;
          return <rect key={i} x={c} y={r} width="1" height="1" fill="#000000" />;
        })}
        {[
          [0, 0],
          [0, grid - 7],
          [grid - 7, 0],
        ].map(([r, c]) => (
          <g key={`${r}-${c}`}>
            <rect x={c} y={r} width="7" height="7" fill="#000000" rx="1.4" />
            <rect x={c + 1} y={r + 1} width="5" height="5" fill="#fff" rx="1" />
            <rect x={c + 2} y={r + 2} width="3" height="3" fill="#FEB513" rx="0.6" />
          </g>
        ))}
      </svg>
      <span
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px] bg-white px-2 py-1 ring-2 ring-ink"
        style={{ fontSize: unit * 1.6 }}
      >
        <span className="font-display font-bold leading-none text-ink">DuitNow</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const p = PALETTES[hash(name) % PALETTES.length];
  const init = name
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold"
      style={{ width: size, height: size, background: p.shape, color: "#000000", fontSize: size * 0.38 }}
    >
      {init}
    </span>
  );
}
