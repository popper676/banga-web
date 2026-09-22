import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPONENT_INVENTORY,
  MISSING_ASSETS,
  SCREEN_GROUPS,
  SCREEN_TOTALS,
  SIMULATED,
} from "@/lib/screen-index";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Screen index",
  description:
    "Every screen in the BANG GA BANG GA prototype, the simulated states each one demonstrates, the component inventory, and the assets still outstanding.",
};

const PLATFORM_LABEL = {
  web: "Website",
  ios: "Mobile",
  android: "Mobile",
  admin: "Admin",
} as const;

export default function PrototypeIndexPage() {
  return (
    <div className="bg-cream">
      <a href="#index-main" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b border-line bg-ink text-cream">
        <div className="container-page py-10 lg:py-14">
          <p className="num text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
            BANG GA BANG GA · prototype
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(30px,4.6vw,54px)] font-extrabold leading-[1.05]">
            Screen index
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-cream/80">
            Everything that was designed, where to click it, and what is being simulated. Use the
            floating prototype panel to switch the payment outcome, the branch response, rider
            availability, offline mode, reduced motion and the signed-in state, then walk the flow.
          </p>

          <dl className="mt-7 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {[
              ["Screens", String(SCREEN_TOTALS.screens)],
              ["Clickable routes", String(SCREEN_TOTALS.routes)],
              ["Simulated states", String(SCREEN_TOTALS.states)],
              ["Platforms", "4"],
            ].map(([k, v]) => (
              <div key={k}>
                <dd className="num font-display text-[30px] font-extrabold leading-none text-teal">
                  {v}
                </dd>
                <dt className="mt-1 text-[12.5px] text-cream/70">{k}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal px-5 text-[14px] font-bold text-ink hover:bg-teal/85"
            >
              Start the customer flow
            </Link>
            <Link
              href="/design-system"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-[14px] font-semibold text-cream hover:bg-white/10"
            >
              Design system
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
      </header>

      <main id="index-main" className="container-page py-10 lg:py-14">
        {/* ---------------- the happy path ---------------- */}
        <section aria-labelledby="path-h">
          <h2 id="path-h" className="text-[clamp(22px,2.8vw,30px)]">
            The five-minute walkthrough
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-grey">
            Follow these in order for the complete ordering story, from brand to receipt.
          </p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Homepage", "/", "Scroll the brand story and pick a branch"],
              ["Menu", "/menu", "Filter, see a sold-out dish, quick add"],
              ["Dish detail", "/menu/buldak-fried-chicken", "Choose spice and add-ons"],
              ["Cart", "/cart", "Apply BANGGA5, switch to pickup and back"],
              ["Checkout", "/checkout", "Address, schedule, contact details"],
              ["Payment", "/checkout/payment", "Try a decline, then a DuitNow QR"],
              ["Confirmation", "/checkout/confirmation", "Watch the branch response window"],
              ["Tracking", "/orders/ord-1", "Rider, map, delivery states"],
              ["Receipt", "/orders/ord-1/receipt", "Print-ready, with provider references"],
              ["Confirmation queue", "/admin/confirmation", "Now accept or reject it as staff"],
              ["Kitchen board", "/admin/kitchen", "Move it through preparation"],
              ["Payment detail", "/admin/payments/pay-1", "Reconcile it and issue a refund"],
            ].map(([name, href, note], i) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex h-full items-start gap-3 rounded-[14px] border border-line bg-white p-4 hover:border-deep/40 hover:bg-white"
                >
                  <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-mint text-[12px] font-bold text-deep">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-ink">{name}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-grey">{note}</span>
                    <span className="num mt-1 block text-[12px] text-deep">{href}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- full index ---------------- */}
        <section aria-labelledby="screens-h" className="mt-14 border-t border-line pt-10">
          <h2 id="screens-h" className="text-[clamp(22px,2.8vw,30px)]">
            Every screen
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-grey">
            Grouped by platform. The state list under each screen is what the prototype can actually
            be made to show, not a wish list.
          </p>

          <div className="mt-7 flex flex-col gap-10">
            {SCREEN_GROUPS.map((group) => (
              <div key={group.id} id={group.id} className="scroll-mt-24">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[19px]">{group.title}</h3>
                  <Badge tone="neutral" soft>
                    {PLATFORM_LABEL[group.platform]} · {group.screens.length} screens
                  </Badge>
                </div>
                <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-grey">
                  {group.intro}
                </p>

                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.screens.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-[14px] border border-line bg-white p-4 lg:p-5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="text-[16px] font-semibold text-ink">{s.name}</h4>
                        {s.linkable ? (
                          <Link
                            href={s.route}
                            className="num inline-flex min-h-9 items-center gap-1 rounded-full bg-mint px-3 text-[12.5px] font-semibold text-deep hover:bg-teal/40"
                          >
                            {s.route}
                            <Icon name="arrowRight" size={13} />
                          </Link>
                        ) : (
                          <span className="num text-[12.5px] text-grey">
                            {s.route} · inside a gallery
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-grey">
                        {s.purpose}
                      </p>
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {s.states.map((st) => (
                          <li
                            key={st}
                            className="rounded-full border border-line bg-cream/70 px-2.5 py-1 text-[12px] text-ink"
                          >
                            {st}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- components ---------------- */}
        <section aria-labelledby="components-h" className="mt-14 border-t border-line pt-10">
          <h2 id="components-h" className="text-[clamp(22px,2.8vw,30px)]">
            Component inventory
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-grey">
            Every reusable piece, and the file it lives in. All of them are documented with live
            examples on the{" "}
            <Link href="/design-system" className="font-semibold text-ink underline underline-offset-4">
              design system page
            </Link>
            .
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {COMPONENT_INVENTORY.map((g) => (
              <div key={g.group} className="rounded-[14px] border border-line bg-white p-4">
                <h3 className="text-[15px]">{g.group}</h3>
                <code className="num mt-0.5 block text-[12px] text-deep">{g.file}</code>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {g.items.map((i) => (
                    <li
                      key={i}
                      className="rounded-full border border-line bg-cream/70 px-2.5 py-1 text-[12px] text-ink"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- simulation boundary ---------------- */}
        <section aria-labelledby="sim-h" className="mt-14 border-t border-line pt-10">
          <h2 id="sim-h" className="text-[clamp(22px,2.8vw,30px)]">
            What is simulated
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-grey">
            This build is user interface only. Stating the boundary precisely matters, because
            several screens are convincing enough to be mistaken for a working system.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {SIMULATED.map((s) => (
              <li
                key={s.area}
                className="grid gap-1 rounded-[14px] border border-line bg-white p-4 md:grid-cols-[200px_minmax(0,1fr)] md:gap-4"
              >
                <h3 className="text-[15px] font-semibold text-ink">{s.area}</h3>
                <p className="text-[14px] leading-relaxed text-grey">{s.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- missing assets ---------------- */}
        <section aria-labelledby="assets-h" className="mt-14 border-t border-line pt-10">
          <h2 id="assets-h" className="text-[clamp(22px,2.8vw,30px)]">
            Assets still needed
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-grey">
            Nothing here blocks review of the design. Everything here blocks going live, and the
            high-priority items should be commissioned now because they have lead times.
          </p>
          <div className="mt-6 overflow-x-auto rounded-[16px] border border-line bg-white">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">
                Outstanding assets, what is needed, how blocking each one is, and what stands in for
                it today
              </caption>
              <thead>
                <tr className="border-b border-line bg-cream/60">
                  {["Asset", "What we need", "Priority", "Placeholder in use"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-grey"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MISSING_ASSETS.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 align-top text-[14px] font-semibold text-ink">
                      {a.item}
                    </th>
                    <td className="max-w-md px-4 py-3 align-top text-[13.5px] leading-snug text-grey">
                      {a.need}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge
                        tone={a.blocking === "high" ? "danger" : a.blocking === "medium" ? "warning" : "neutral"}
                        soft
                        icon={a.blocking === "high" ? "alert" : "clock"}
                      >
                        {a.blocking === "high" ? "Commission now" : a.blocking === "medium" ? "Before launch" : "Nice to have"}
                      </Badge>
                    </td>
                    <td className="max-w-xs px-4 py-3 align-top text-[13.5px] leading-snug text-grey">
                      {a.placeholder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
