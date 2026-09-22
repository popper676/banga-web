"use client";

import { useState } from "react";
import {
  color,
  colorDistribution,
  colorRoles,
  motion,
  radius,
  space,
  typeScale,
  breakpoints,
  touchTarget,
} from "@/lib/tokens";
import { cn } from "@/lib/format";
import { Icons, Icon, type IconKey } from "@/components/ui/icons";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { FoodImage } from "@/components/ui/media";
import { Reveal, ParallaxScene } from "@/components/site/reveal";
import {
  DoDont,
  DsGrid,
  DsItem,
  DsSection,
  TokenTable,
  contrast,
  contrastVerdict,
} from "./kit";

/* ================================================================== */
/* Colour                                                              */
/* ================================================================== */

export function ColourSection() {
  const [onSurface, setOnSurface] = useState<keyof typeof color>("cream");

  return (
    <DsSection
      id="colour"
      number="01"
      title="Colour"
      lead={
        <>
          Twelve tokens, one rule for how much of each to use, and a measured contrast ratio for
          every text pairing. Ratios below are computed from the hex values at render time, so this
          page cannot drift away from the truth.
        </>
      }
    >
      {/* distribution */}
      <div>
        <h3 className="text-[17px]">The 60 / 30 / 10 split</h3>
        <p className="mt-1 max-w-2xl text-[14px] text-grey">
          Warm neutrals carry the page, teal and ink carry the brand, and coral and yellow are
          rationed so a call to action is never competing with decoration.
        </p>
        <div className="mt-3 flex h-16 overflow-hidden rounded-[12px] border border-line">
          {colorDistribution.map((d) => (
            <div
              key={d.label}
              style={{ background: d.hex, width: `${d.pct}%` }}
              className="flex items-center justify-center"
            >
              <span
                className="num text-[13px] font-bold"
                style={{ color: contrast(d.hex, color.ink) >= 4.5 ? color.ink : color.white }}
              >
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {colorDistribution.map((d) => (
            <li key={d.label} className="flex items-center gap-2 text-[13px] text-grey">
              <span
                className="size-3 rounded-full border border-line"
                style={{ background: d.hex }}
                aria-hidden
              />
              {d.label}
            </li>
          ))}
        </ul>
      </div>

      {/* swatches */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-[17px]">Palette and measured contrast</h3>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            Text measured against
            <select
              value={onSurface}
              onChange={(e) => setOnSurface(e.target.value as keyof typeof color)}
              className="h-10 rounded-full border border-line bg-white px-3 pr-8 text-[13px] font-semibold"
            >
              <option value="cream">Warm cream page</option>
              <option value="white">White card</option>
              <option value="ink">Dark ink section</option>
              <option value="mint">Soft mint fill</option>
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {colorRoles.map((role) => {
            const ratio = contrast(role.hex, color[onSurface]);
            const verdict = contrastVerdict(ratio);
            return (
              <div key={role.token} className="overflow-hidden rounded-[14px] border border-line bg-white">
                <div
                  className="flex h-24 items-end justify-between p-3"
                  style={{ background: role.hex }}
                >
                  <span
                    className="font-display text-[15px] font-bold"
                    style={{ color: role.on }}
                  >
                    {role.name}
                  </span>
                  <span className="num text-[12px] font-semibold" style={{ color: role.on }}>
                    {role.hex}
                  </span>
                </div>
                <div className="p-3">
                  <p className="num text-[11px] uppercase tracking-wide text-grey">
                    --color-{role.token}
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-ink">{role.use}</p>
                  <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5">
                    <Badge
                      tone={verdict.tone === "pass" ? "success" : verdict.tone === "warn" ? "warning" : "danger"}
                      soft
                    >
                      {verdict.label}
                    </Badge>
                    <span className="num text-[12px] font-semibold text-ink">
                      {ratio.toFixed(2)}:1
                    </span>
                    <span className="text-[12px] text-grey">as text on {onSurface}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DoDont
        dos={[
          "Use CTA coral only for the single most important action on a screen.",
          "Pair dark ink text with cream or white, which measures above 12:1.",
          "Add an icon or a word next to every colour-coded status.",
          "Use soft mint for selected and success fills rather than saturated teal.",
        ]}
        donts={[
          "Never set body text in soft coral or primary teal on cream — both fail AA.",
          "Never use colour as the only signal that an order is late or rejected.",
          "Never place teal text on mint; the two are too close in luminance.",
          "Never introduce a colour that is not in this palette for a one-off screen.",
        ]}
      />
    </DsSection>
  );
}

/* ================================================================== */
/* Typography                                                          */
/* ================================================================== */

export function TypographySection() {
  return (
    <DsSection
      id="type"
      number="02"
      title="Typography"
      lead={
        <>
          Poppins for display, Inter for everything you read at length, and tabular Inter for money,
          times and order codes so figures line up in tables. Korean characters appear only as
          decorative accents, never as the only label for an action.
        </>
      }
    >
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-[16px] border border-line bg-white">
        {typeScale.map((t) => {
          const px = parseInt(t.size, 10);
          const display = t.font.startsWith("Poppins");
          return (
            <div key={t.name} className="grid gap-3 p-5 lg:grid-cols-[1fr_220px]">
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-ink",
                    display ? "font-display font-extrabold" : "font-semibold",
                  )}
                  style={{ fontSize: Math.min(px, 64), lineHeight: 1.08 }}
                >
                  Bang Ga Bang Ga
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 self-center text-[12.5px] lg:grid-cols-1">
                <div className="flex justify-between gap-2">
                  <dt className="text-grey">Style</dt>
                  <dd className="font-semibold text-ink">{t.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-grey">Font</dt>
                  <dd className="text-ink">{t.font}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-grey">Desktop</dt>
                  <dd className="num text-ink">{t.size}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-grey">Mobile</dt>
                  <dd className="num text-ink">{t.mobile}</dd>
                </div>
                <div className="col-span-2 flex justify-between gap-2 lg:col-span-1">
                  <dt className="text-grey">Used for</dt>
                  <dd className="text-right text-ink">{t.use}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <DsGrid cols={2}>
        <DsItem
          name="Tabular figures"
          spec="Inter · font-variant-numeric: tabular-nums · .num"
          usage="Every price, order code, countdown, phone number and table figure uses the .num utility so columns align and digits do not jitter while a timer counts down."
        >
          <div className="w-full">
            <table className="w-full text-[15px]">
              <tbody className="num">
                <tr>
                  <td className="py-1 text-ink">BGG-2411-0038</td>
                  <td className="py-1 text-right font-semibold text-ink">RM 48.90</td>
                </tr>
                <tr>
                  <td className="py-1 text-ink">BGG-2411-0111</td>
                  <td className="py-1 text-right font-semibold text-ink">RM 128.00</td>
                </tr>
                <tr>
                  <td className="py-1 text-ink">BGG-2411-0207</td>
                  <td className="py-1 text-right font-semibold text-ink">RM 9.50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DsItem>

        <DsItem
          name="Measure and rhythm"
          spec="Body 16 / 26 · max 68ch · headings 1.08–1.2"
          usage="Long-form copy on the story and legal pages is capped at roughly 68 characters a line. Display headings tighten to 1.08 so large type does not float apart."
        >
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-ink">
            We grill over open flame, season by hand, and serve food that tastes like somebody&rsquo;s
            kitchen rather than a factory. Everything on this menu is halal certified.
          </p>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Space, radius, elevation                                            */
/* ================================================================== */

export function SpaceSection() {
  return (
    <DsSection
      id="space"
      number="03"
      title="Space, radius and elevation"
      lead="A 4-point scale, five corner radii and deliberately few shadows. Surfaces are separated by a warm hairline border first and a shadow only when something genuinely floats."
    >
      <DsItem
        name="Spacing scale"
        spec="4pt base · 0 4 8 12 16 24 32 48 64 96 128"
        usage="Use 16 inside cards, 24 between cards, 48 between content groups and 96 or 128 between page sections. Mobile drops one step at each level."
        wide
      >
        <div className="flex w-full flex-wrap items-end gap-3">
          {space.slice(1).map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div className="rounded-[4px] bg-teal" style={{ width: s, height: Math.max(s, 8) }} />
              <span className="num text-[11px] text-grey">{s}</span>
            </div>
          ))}
        </div>
      </DsItem>

      <DsGrid cols={2}>
        <DsItem
          name="Corner radius"
          spec={`sm ${radius.sm} · card ${radius.card} · lg ${radius.lg} · xl ${radius.xl} · pill`}
          usage="Cards and panels use 16. Images and hero surfaces use 24 or 32. Buttons, chips and badges are fully rounded pills."
        >
          {Object.entries(radius).map(([k, v]) => (
            <div key={k} className="flex flex-col items-center gap-1.5">
              <div
                className="size-16 border border-line bg-mint"
                style={{ borderRadius: v === 999 ? 999 : v }}
              />
              <span className="num text-[11px] text-grey">{k}</span>
            </div>
          ))}
        </DsItem>

        <DsItem
          name="Elevation"
          spec="Hairline · raised · floating · overlay"
          usage="Only overlays and the sticky mobile order bar are allowed to cast a real shadow. Everything else separates with the warm line colour."
          surface="cream"
        >
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-line bg-white p-3 text-[12px] text-ink">
              Hairline · cards
            </div>
            <div className="rounded-[12px] bg-white p-3 text-[12px] text-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              Raised · hover
            </div>
            <div className="rounded-[12px] bg-white p-3 text-[12px] text-ink shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
              Floating · sticky bars
            </div>
            <div className="rounded-[12px] bg-white p-3 text-[12px] text-ink shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
              Overlay · dialogs
            </div>
          </div>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Motion                                                              */
/* ================================================================== */

export function MotionSection() {
  const [replay, setReplay] = useState(0);

  return (
    <DsSection
      id="motion"
      number="04"
      title="Motion and 2.5D"
      lead={
        <>
          Storytelling pages may move. Ordering screens may not. Depth is produced with layered
          images on a CSS perspective rather than a 3D engine, and every effect has a static poster
          fallback for reduced motion, slow devices and print.
        </>
      }
    >
      <TokenTable
        caption="Motion duration tokens and where each is used"
        head={["Token", "Duration", "Easing", "Used for"]}
        rows={[
          ["instant", `${motion.duration.instant}ms`, "linear", "Hover and press feedback"],
          ["fast", `${motion.duration.fast}ms`, motion.easing, "Chips, toggles, quantity steppers"],
          ["base", `${motion.duration.base}ms`, motion.easing, "Dialogs, drawers, toasts, tab changes"],
          ["slow", `${motion.duration.slow}ms`, motion.easing, "Bottom sheets, page section reveals"],
          ["story", `${motion.duration.story}ms`, motion.easing, "Homepage scroll reveals only"],
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-line bg-white p-4">
        <Button variant="secondary" iconStart="refund" onClick={() => setReplay((r) => r + 1)}>
          Replay the reveals
        </Button>
        <p className="text-[13px] text-grey">
          Reduced motion turns all of this into a 200ms fade: {motion.reducedMotion}.
        </p>
      </div>

      <div key={replay} className="grid gap-4 lg:grid-cols-2">
        <DsItem
          name="Scroll reveal"
          spec="IntersectionObserver · once · translateY 24px + fade · story duration"
          usage="Applied to section blocks on marketing pages. Never applied to menu items, cart lines, checkout fields or admin tables, because content that fades in is content you cannot scan."
          surface="cream"
        >
          <div className="grid w-full gap-2.5 sm:grid-cols-3">
            {(["Grill", "Season", "Serve"] as const).map((label, i) => (
              <Reveal key={label} delay={(i + 1) as 1 | 2 | 3}>
                <div className="rounded-[12px] border border-line bg-white p-4 text-center">
                  <p className="font-display text-[17px] font-bold text-ink">{label}</p>
                  <p className="num mt-0.5 text-[12px] text-grey">step {i + 1}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </DsItem>

        <DsItem
          name="2.5D parallax scene"
          spec="scene-25d · perspective · [data-depth] layers · pointer + scroll offset"
          usage="Layers carry a data-depth value and move at different rates to imply depth: a flat background, the subject, and a foreground element. The observer pauses the work when the scene leaves the viewport, and reduced motion never starts it at all, leaving a static poster."
          surface="ink"
        >
          <div className="w-full">
            <ParallaxScene className="relative h-52 w-full overflow-hidden rounded-[16px] bg-deep">
              <div
                data-depth="0.2"
                aria-hidden
                className="absolute inset-0 opacity-45 [background:radial-gradient(circle_at_30%_35%,#6EC7CE_0,transparent_55%),radial-gradient(circle_at_75%_70%,#000000_0,transparent_50%)]"
              />
              <div data-depth="0.5" className="absolute inset-0 flex items-center justify-center">
                <FoodImage
                  src="/food/korean-fried-chicken.jpg"
                  alt="Korean fried chicken"
                  rounded="rounded-full"
                  className="size-32"
                />
              </div>
              <div data-depth="0.9" className="absolute inset-x-0 bottom-4 flex justify-center">
                <span className="rounded-full bg-yellow px-3 py-1 font-display text-[13px] font-bold text-ink">
                  Foreground layer
                </span>
              </div>
            </ParallaxScene>
          </div>
        </DsItem>
      </div>

      <DoDont
        dos={[
          "Animate opacity and transform only, so scroll stays at 60fps.",
          "Respect prefers-reduced-motion at the component level, not globally.",
          "Lazy-load any heavy visual and hold layout space with an aspect ratio.",
          "Keep the whole ordering flow motion-light: state changes, not choreography.",
        ]}
        donts={[
          "Never animate height, width, top or left on scroll.",
          "Never gate content behind an animation that has to finish first.",
          "Never autoplay a hero video with sound, or without a poster image.",
          "Never add parallax to the cart, checkout, payment or admin screens.",
        ]}
      />
    </DsSection>
  );
}

/* ================================================================== */
/* Grid and frames                                                     */
/* ================================================================== */

export function GridSection() {
  return (
    <DsSection
      id="grid"
      number="05"
      title="Grid, breakpoints and frames"
      lead="Three web frames, two phone frames and two admin frames. Touch targets follow each platform's own minimum, which is stricter than the WCAG 2.2 requirement."
    >
      <TokenTable
        caption="Design frames for every platform"
        head={["Platform", "Frame", "Width", "Grid"]}
        rows={[
          ...breakpoints.web.map((b) => [
            "Customer website",
            b.name,
            <span key={b.name} className="num">
              {b.w}px
            </span>,
            b.grid,
          ]),
          ...breakpoints.mobile.map((b) => [
            "Mobile application",
            b.name,
            <span key={b.name} className="num">
              {b.w} × {b.h}
            </span>,
            "Single column · 16 margin",
          ]),
          ...breakpoints.admin.map((b) => [
            "Admin console",
            b.name,
            <span key={b.name} className="num">
              {b.w}px
            </span>,
            b.grid,
          ]),
        ]}
      />

      <DsGrid cols={2}>
        <DsItem
          name="Twelve column desktop grid"
          spec="1440 frame · 80 margin · 24 gutter · 1200 content"
          usage="The menu grid runs four columns, the cart runs eight plus four, and long-form prose is capped at seven columns for readability."
          surface="cream"
        >
          <div className="grid w-full grid-cols-12 gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[4px] bg-teal/35" />
            ))}
          </div>
        </DsItem>

        <DsItem
          name="Touch targets"
          spec={`Web ${touchTarget.web}px min · iOS ${touchTarget.ios}px · Android ${touchTarget.android}px`}
          usage="Every interactive element in this prototype is at least 44px tall, which clears both platform guidance and WCAG 2.2 target size. Adjacent small controls get extra spacing instead of shrinking."
        >
          <div className="flex w-full flex-wrap items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-11 items-center justify-center rounded-full bg-mint text-deep">
                <Icon name="plus" size={18} />
              </div>
              <span className="num text-[11px] text-grey">44</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-12 items-center justify-center rounded-full bg-mint text-deep">
                <Icon name="cart" size={19} />
              </div>
              <span className="num text-[11px] text-grey">48</span>
            </div>
            <Button size="sm">Small button is still 44 tall</Button>
          </div>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Iconography and imagery                                             */
/* ================================================================== */

export function IconSection() {
  const keys = Object.keys(Icons) as IconKey[];
  return (
    <DsSection
      id="icons"
      number="06"
      title="Iconography and imagery"
      lead={`One inline SVG set of ${keys.length} glyphs on a 24px grid with a 1.8px stroke, drawn in the codebase rather than pulled from a library, so weight and corner treatment stay consistent with the brand.`}
    >
      <div className="rounded-[16px] border border-line bg-white p-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
          {keys.map((k) => (
            <div
              key={k}
              className="flex flex-col items-center gap-1.5 rounded-[10px] border border-line px-2 py-3"
            >
              <span className="text-ink">
                <Icon name={k} size={20} />
              </span>
              <span className="num truncate text-[10.5px] text-grey">{k}</span>
            </div>
          ))}
        </div>
      </div>

      <DsGrid cols={2}>
        <DsItem
          name="Food image placeholder"
          spec="FoodImage · deterministic shapes from a seed · 4:3, 1:1, 16:9"
          usage="Until photography is shot, every dish renders a designed placeholder derived from its name, so layouts are reviewed at final density and nothing looks broken. Swapping in real files is a one-line change in the image manifest."
        >
          <div className="grid w-full grid-cols-3 gap-2">
            <FoodImage src="/food/buldak.jpg" alt="Spicy buldak chicken" className="aspect-square" />
            <FoodImage src="/food/kimchi-jjigae.jpg" alt="Kimchi jjigae" className="aspect-square" />
            <FoodImage src="/food/tteokbokki.jpg" alt="Tteokbokki" className="aspect-square" />
          </div>
        </DsItem>

        <DsItem
          name="Editorial decoration"
          spec="Grain overlay · deco frame · Korean accent characters"
          usage="Korean characters, hand-drawn frames and a subtle paper grain carry the editorial feel. They are always decorative, marked aria-hidden, and never the only way to understand a control."
          surface="cream"
        >
          <div className="grid w-full grid-cols-3 gap-2">
            <div className="grain flex aspect-square items-center justify-center rounded-[12px] bg-teal">
              <span className="font-display text-[26px] font-extrabold text-ink" aria-hidden>
                방가
              </span>
            </div>
            <div className="deco-frame flex aspect-square items-center justify-center rounded-[12px] bg-white">
              <span className="text-[12px] font-semibold text-grey">Deco frame</span>
            </div>
            <div className="flex aspect-square items-center justify-center rounded-[12px] bg-yellow">
              <span className="font-display text-[13px] font-bold text-ink">Promo</span>
            </div>
          </div>
        </DsItem>
      </DsGrid>

      <Panel className="p-4">
        <h3 className="text-[15px]">Brand mark</h3>
        <p className="mt-1 text-[14px] text-grey">
          The wordmark is set in Poppins ExtraBold with the Korean accent 방가 as an optional
          companion. Minimum clear space equals the height of the letter B.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <span className="font-display text-[22px] font-extrabold leading-none text-ink">
            BANG GA<br />BANG GA
          </span>
          <span className="flex size-12 items-center justify-center rounded-[13px] bg-teal font-display text-[19px] font-extrabold text-ink">
            방
          </span>
          <span className="flex size-12 items-center justify-center rounded-[13px] bg-ink font-display text-[19px] font-extrabold text-cream">
            방
          </span>
        </div>
      </Panel>
    </DsSection>
  );
}
