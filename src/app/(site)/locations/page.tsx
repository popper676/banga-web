import type { Metadata } from "next";
import Link from "next/link";
import { BRANCHES } from "@/lib/mock-data";
import { etaRange, todayHours } from "@/lib/format";
import { Badge, ButtonLink, Callout, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";
import { BranchCard } from "@/components/site/branch-card";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Two locations, one Korean experience. Find BANG GA BANG GA at SS15 Subang Jaya and Taylor's Lakeside Campus — hours, delivery radius and directions.",
};

const YES = (
  <span className="inline-flex items-center gap-1.5 font-semibold text-deep">
    <Icon name="check" size={15} />
    Yes
  </span>
);

const NO = (
  <span className="inline-flex items-center gap-1.5 font-semibold text-grey">
    <Icon name="cross" size={15} />
    No
  </span>
);

export default function LocationsPage() {
  return (
    <>
      {/* HERO */}
      <section className="grain relative overflow-hidden bg-teal" aria-labelledby="locations-title">
        <div className="grain-layer" />
        <div className="container-page relative py-14 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream">
            Find us
          </span>
          <h1
            id="locations-title"
            className="mt-5 max-w-[18ch] text-[clamp(36px,6.5vw,80px)] leading-[0.96] text-ink"
          >
            TWO LOCATIONS. ONE KOREAN EXPERIENCE.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink/80 lg:text-[19px]">
            Whether you are a student, catching up with friends, spending time with family, or
            trying Korean food for the first time, there is always a seat waiting for you.
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-ink/75">
            <li className="flex items-center gap-1.5">
              <Icon name="home" size={15} /> Dine-in at both
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="bag" size={15} /> Pickup at both
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="bike" size={15} /> Delivery within 6–8 km
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="camera" size={15} /> Photo booth at both
            </li>
          </ul>
        </div>
      </section>

      {/* BRANCH CARDS */}
      <section className="container-page py-16 lg:py-20" aria-labelledby="branches-title">
        <Reveal>
          <SectionTitle
            overline="Our branches"
            title={<span id="branches-title">WHERE TO FIND US</span>}
            lead="Both kitchens cook the same menu. Availability and prep time can differ by branch, so pick the one you are ordering from before you add to cart."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {BRANCHES.map((branch, i) => (
            <Reveal key={branch.id} delay={(i % 2) as 0 | 1}>
              <BranchCard branch={branch} showHours />
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-white py-16 lg:py-20" aria-labelledby="compare-title">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              overline="Side by side"
              title={<span id="compare-title">COMPARE THE BRANCHES</span>}
            />
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-8 overflow-x-auto rounded-[16px] border border-line bg-white">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">
                  Distance, opening hours, fulfilment options and delivery radius for each branch
                </caption>
                <thead>
                  <tr className="border-b border-line bg-cream/60">
                    <th scope="col" className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-grey">
                      <span className="sr-only">Detail</span>
                    </th>
                    {BRANCHES.map((b) => (
                      <th
                        key={b.id}
                        scope="col"
                        className="px-5 py-3.5 text-[14px] font-bold text-ink"
                      >
                        <Link href={`/locations/${b.id}`} className="hover:underline">
                          {b.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Distance from you
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="num px-5 py-3.5 font-semibold text-ink">
                        {b.distanceKm} km
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Today&rsquo;s hours
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="num px-5 py-3.5 font-semibold text-ink">
                        {todayHours(b)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Dine-in
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="px-5 py-3.5">
                        {b.supportsDineIn ? YES : NO}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Pickup
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="px-5 py-3.5">
                        {b.supportsPickup ? YES : NO}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Delivery
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="px-5 py-3.5">
                        {b.supportsDelivery ? YES : NO}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Delivery radius
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="num px-5 py-3.5 font-semibold text-ink">
                        {b.deliveryRadiusKm} km
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line/70">
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Typical delivery time
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="num px-5 py-3.5 font-semibold text-ink">
                        {etaRange(b, "delivery")}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className="px-5 py-3.5 text-left font-medium text-grey">
                      Photo booth
                    </th>
                    {BRANCHES.map((b) => (
                      <td key={b.id} className="px-5 py-3.5">
                        <Badge tone="success" icon="camera" soft>
                          Available
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <Callout
              tone="info"
              icon="location"
              title="More branches are on the way"
              className="mt-6"
            >
              The branch selector in the header is built for a growing list — menu availability,
              prep times, delivery radius and hours are all stored per branch, so a third kitchen
              appears everywhere in the app without a redesign.
            </Callout>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/menu" size="lg" iconEnd="arrowRight">
                Start an order
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="secondary">
                Contact a branch
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
