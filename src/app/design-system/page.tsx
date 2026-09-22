import type { Metadata } from "next";
import Link from "next/link";
import { DsNav, type DsEntry } from "@/components/ds/kit";
import {
  ColourSection,
  GridSection,
  IconSection,
  MotionSection,
  SpaceSection,
  TypographySection,
} from "@/components/ds/foundations";
import {
  AccessibilitySection,
  ButtonSection,
  DataSection,
  FormSection,
  OverlaySection,
  PaymentStatesSection,
  StatusSection,
  SurfaceSection,
} from "@/components/ds/components";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "The BANG GA BANG GA design system — colour with measured contrast, type, space, motion, and every reusable component across the website, mobile apps and admin console.",
};

const ENTRIES: DsEntry[] = [
  { id: "colour", label: "Colour" },
  { id: "type", label: "Typography" },
  { id: "space", label: "Space and radius" },
  { id: "motion", label: "Motion and 2.5D" },
  { id: "grid", label: "Grid and frames" },
  { id: "icons", label: "Icons and imagery" },
  { id: "buttons", label: "Buttons" },
  { id: "status", label: "Status system" },
  { id: "forms", label: "Forms" },
  { id: "surfaces", label: "Cards and surfaces" },
  { id: "overlays", label: "Overlays" },
  { id: "data", label: "Data display" },
  { id: "payment", label: "Payment states" },
  { id: "a11y", label: "Accessibility" },
];

export default function DesignSystemPage() {
  return (
    <div className="bg-cream">
      <a href="#ds-main" className="skip-link">
        Skip to main content
      </a>

      {/* ---------------- header ---------------- */}
      <header className="border-b border-line bg-ink text-cream">
        <div className="container-page py-10 lg:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="num text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
                BANG GA BANG GA · design system
              </p>
              <h1 className="mt-2 font-display text-[clamp(32px,5vw,58px)] font-extrabold leading-[1.04]">
                One language for four
                <br />
                places it has to work
              </h1>
              <p className="mt-4 text-[16px] leading-relaxed text-cream/80">
                Everything on this page is the live code used by the customer website, the iOS and
                Android app frames and the admin console. Nothing here is a screenshot, so it cannot
                fall out of date with the prototype.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/prototype"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal px-5 text-[14px] font-bold text-ink hover:bg-teal/85"
                >
                  Screen index
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-[14px] font-semibold text-cream hover:bg-white/10"
                >
                  Customer website
                </Link>
                <Link
                  href="/mobile"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-[14px] font-semibold text-cream hover:bg-white/10"
                >
                  Mobile frames
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-[14px] font-semibold text-cream hover:bg-white/10"
                >
                  Admin console
                </Link>
              </div>
            </div>

            <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-4 rounded-[16px] border border-white/15 bg-white/5 p-5">
              {[
                ["Platforms", "4"],
                ["Colour tokens", "12"],
                ["Type styles", "8"],
                ["Order states", "14"],
                ["Payment states", "16"],
                ["Target", "WCAG 2.2 AA"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dd className="num font-display text-[24px] font-extrabold leading-none text-teal">
                    {v}
                  </dd>
                  <dt className="mt-1 text-[12px] text-cream/70">{k}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      {/* ---------------- body ---------------- */}
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12 lg:py-14">
        <DsNav entries={ENTRIES} />

        <main id="ds-main" className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="principles-h">
            <h2 id="principles-h" className="text-[clamp(22px,2.8vw,30px)]">
              Four principles
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                {
                  n: "Warm before clever",
                  b: "The brand is a welcome, not a tech product. Cream paper, hand-drawn frames and generous type come first; effects come last.",
                },
                {
                  n: "Storytelling pages move, ordering screens do not",
                  b: "Scroll reveals and 2.5D depth live on the homepage and the story. From the menu onwards the interface is fast, flat and quiet.",
                },
                {
                  n: "Never leave money ambiguous",
                  b: "At every step the customer knows the amount, whether they have been charged, and what happens if something fails. Duplicate charges are structurally impossible.",
                },
                {
                  n: "Two branches today, many tomorrow",
                  b: "Branch is a first-class dimension in every screen and every token: availability, hours, fees and menus are all per branch, so adding a third changes data and not design.",
                },
              ].map((p) => (
                <div key={p.n} className="rounded-[16px] border border-line bg-white p-5">
                  <h3 className="text-[16px] leading-snug">{p.n}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-grey">{p.b}</p>
                </div>
              ))}
            </div>
          </section>

          <ColourSection />
          <TypographySection />
          <SpaceSection />
          <MotionSection />
          <GridSection />
          <IconSection />
          <ButtonSection />
          <StatusSection />
          <FormSection />
          <SurfaceSection />
          <OverlaySection />
          <DataSection />
          <PaymentStatesSection />
          <AccessibilitySection />

          <section className="border-t border-line pt-10">
            <h2 className="text-[clamp(22px,2.8vw,30px)]">Where the tokens live</h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-grey">
              Design tokens are declared once and mirrored, so the same hex and the same duration
              reach every platform without being retyped.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                ["src/lib/tokens.ts", "The source of truth, typed, imported by this page"],
                ["src/app/globals.css", "Tailwind @theme block for the website and admin console"],
                ["mobile/src/theme/tokens.ts", "React Native mirror for the Expo applications"],
                ["src/lib/status.ts", "Order, payment and availability status metadata plus the legal transitions"],
              ].map(([path, note]) => (
                <li
                  key={path}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[12px] border border-line bg-white px-4 py-3"
                >
                  <code className="num text-[13px] font-semibold text-deep">{path}</code>
                  <span className="text-[13.5px] text-grey">{note}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
