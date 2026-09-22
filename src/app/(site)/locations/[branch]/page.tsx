import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRANCHES, CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { branchStatus, dayName, etaRange, todayHours } from "@/lib/format";
import {
  Badge,
  ButtonLink,
  Callout,
  EmptyState,
  Panel,
  SectionTitle,
  Stat,
} from "@/components/ui/primitives";
import { MapView } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { BranchOrderButton } from "@/components/site/story-branch-order-button";

export function generateStaticParams() {
  return BRANCHES.map((b) => ({ branch: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ branch: string }>;
}): Promise<Metadata> {
  const { branch: id } = await params;
  const branch = BRANCHES.find((b) => b.id === id);
  if (!branch) return { title: "Branch not found" };
  return {
    title: branch.name,
    description: `${branch.name} — ${branch.address}, ${branch.postcode} ${branch.city}. Opening hours, delivery radius, phone number and what's available today.`,
  };
}

export default async function BranchPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch: id } = await params;
  const branch = BRANCHES.find((b) => b.id === id);
  if (!branch) notFound();

  const status = branchStatus(branch);
  const soldOut = PRODUCTS.filter((p) => p.availability[branch.id] === "sold_out");
  const lowStock = PRODUCTS.filter((p) => p.availability[branch.id] === "low");
  const boothProducts = PRODUCTS.filter((p) => p.categoryId === "photobooth");
  const boothAvailable = boothProducts.some((p) => p.availability[branch.id] !== "sold_out");
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 7 : jsDay;

  const categoryName = (categoryId: string) =>
    CATEGORIES.find((c) => c.id === categoryId)?.name ?? "Menu";

  return (
    <>
      {/* HEADER */}
      <section className="bg-mint" aria-labelledby="branch-title">
        <div className="container-page py-10 lg:py-14">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-grey">
              <li>
                <Link href="/locations" className="font-medium text-deep hover:underline">
                  Locations
                </Link>
              </li>
              <li aria-hidden>
                <Icon name="chevronRight" size={13} />
              </li>
              <li aria-current="page" className="font-medium text-ink">
                {branch.shortName}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 id="branch-title" className="max-w-[16ch] text-[clamp(32px,5.5vw,64px)] leading-[0.98] text-ink">
                {branch.name}
              </h1>
              <p className="mt-4 text-[16px] leading-relaxed text-ink/80">
                {branch.address}
                <br />
                {branch.postcode} {branch.city}, Selangor
              </p>
              <p className="mt-2 text-[14px] italic text-grey">{branch.mapHint}</p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <Badge tone={status.open ? "success" : "neutral"} icon={status.open ? "check" : "clock"} soft={!status.open}>
                {status.label} · {status.detail}
              </Badge>
              <BranchOrderButton branchId={branch.id} branchName={branch.shortName} />
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="container-page py-10 lg:py-14" aria-labelledby="map-title">
        <h2 id="map-title" className="sr-only">
          Map and directions
        </h2>
        <MapView
          className="h-64 w-full sm:h-80 lg:h-[26rem]"
          label={`Map showing ${branch.name} at ${branch.address}, ${branch.city}`}
          pins={[{ x: 50, y: 58, tone: "branch", name: branch.shortName }]}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Distance" value={`${branch.distanceKm} km`} sub="From the prototype's mock location" icon="pin" />
          <Stat label="Pickup time" value={etaRange(branch, "pickup")} sub="Typical, once the branch accepts" icon="bag" />
          <Stat label="Delivery time" value={etaRange(branch, "delivery")} sub="Typical, door to door" icon="bike" />
          <Stat label="Delivery radius" value={`${branch.deliveryRadiusKm} km`} sub="Measured from the branch" icon="location" />
        </div>
      </section>

      {/* HOURS + CONTACT */}
      <section className="container-page pb-4" aria-labelledby="hours-title">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Panel className="p-6">
            <h2 id="hours-title" className="text-[22px]">
              Opening hours
            </h2>
            <p className="mt-1.5 text-[14px] text-grey">
              Kitchen closes fifteen minutes before the branch does. Today: {todayHours(branch)}.
            </p>
            <table className="num mt-5 w-full border-collapse text-[15px]">
              <caption className="sr-only">Weekly opening hours for {branch.name}</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Hours</th>
                </tr>
              </thead>
              <tbody>
                {branch.hours.map((h) => {
                  const isToday = h.day === todayIndex;
                  return (
                    <tr
                      key={h.day}
                      className={
                        isToday
                          ? "border-b border-line/70 bg-mint last:border-0"
                          : "border-b border-line/70 last:border-0"
                      }
                    >
                      <th scope="row" className="py-2.5 pl-2 text-left font-medium text-ink">
                        {dayName(h.day)}
                        {isToday && (
                          <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cream">
                            Today
                          </span>
                        )}
                      </th>
                      <td className="py-2.5 pr-2 text-right font-semibold text-ink">
                        {h.opens} – {h.closes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          <div className="flex flex-col gap-5">
            <Panel className="p-6">
              <h2 className="text-[22px]">Contact and directions</h2>
              <dl className="mt-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                    <Icon name="phone" size={16} />
                  </span>
                  <div>
                    <dt className="text-[13px] text-grey">Call the branch</dt>
                    <dd className="num text-[16px] font-semibold text-ink">
                      <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="hover:underline">
                        {branch.phone}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                    <Icon name="pin" size={16} />
                  </span>
                  <div>
                    <dt className="text-[13px] text-grey">Finding the door</dt>
                    <dd className="text-[15px] leading-relaxed text-ink">{branch.mapHint}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                    <Icon name="location" size={16} />
                  </span>
                  <div>
                    <dt className="text-[13px] text-grey">Coordinates</dt>
                    <dd className="num text-[15px] font-medium text-ink">
                      {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
                    </dd>
                  </div>
                </div>
              </dl>
              <p className="mt-5 text-[13px] leading-relaxed text-grey">
                Turn-by-turn directions are not part of this prototype — the map above is a drawn
                placeholder, not a live map service.
              </p>
            </Panel>

            <Panel className="p-6">
              <h2 className="text-[22px]">How you can order</h2>
              <ul className="mt-4 flex flex-col gap-3 text-[15px]">
                <li className="flex items-center gap-2.5">
                  <Icon name={branch.supportsDineIn ? "check" : "cross"} size={17} />
                  <span className={branch.supportsDineIn ? "text-ink" : "text-grey"}>
                    Dine-in {branch.supportsDineIn ? "available" : "not available"}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name={branch.supportsPickup ? "check" : "cross"} size={17} />
                  <span className={branch.supportsPickup ? "text-ink" : "text-grey"}>
                    Pickup {branch.supportsPickup ? `available · ready in ${etaRange(branch, "pickup")}` : "not available"}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name={branch.supportsDelivery ? "check" : "cross"} size={17} />
                  <span className={branch.supportsDelivery ? "text-ink" : "text-grey"}>
                    Delivery {branch.supportsDelivery ? `within ${branch.deliveryRadiusKm} km` : "not available"}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name={boothAvailable ? "camera" : "cross"} size={17} />
                  <span className={boothAvailable ? "text-ink" : "text-grey"}>
                    Photo booth {boothAvailable ? "available · sessions from RM1" : "out of service today"}
                  </span>
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/photo-booth" variant="secondary" iconStart="camera">
                  About the booth
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" iconEnd="arrowRight">
                  Contact us
                </ButtonLink>
              </div>
            </Panel>
          </div>
        </div>
      </section>

      {/* AVAILABILITY TODAY */}
      <section className="container-page py-14 lg:py-20" aria-labelledby="availability-title">
        <SectionTitle
          overline="Availability"
          title={<span id="availability-title">WHAT&rsquo;S OFF THE MENU TODAY</span>}
          lead={`Stock is tracked per branch. This is what the ${branch.shortName} kitchen has marked for today.`}
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Panel className="p-6">
            <h3 className="flex items-center gap-2 text-[19px]">
              <Icon name="cross" size={17} />
              Sold out today
            </h3>
            {soldOut.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  compact
                  icon="check"
                  title="Everything is available"
                  body={`Nothing is sold out at ${branch.shortName} right now.`}
                />
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-2.5">
                {soldOut.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-cream/50 px-3.5 py-3"
                  >
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{p.name}</span>
                      <span className="block text-[13px] text-grey">{categoryName(p.categoryId)}</span>
                    </span>
                    <Badge tone="danger" icon="cross" soft>
                      Sold out
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-6">
            <h3 className="flex items-center gap-2 text-[19px]">
              <Icon name="alert" size={17} />
              Low stock
            </h3>
            {lowStock.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  compact
                  icon="check"
                  title="Nothing running low"
                  body="The kitchen has not flagged anything for today."
                />
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-2.5">
                {lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-cream/50 px-3.5 py-3"
                  >
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{p.name}</span>
                      <span className="block text-[13px] text-grey">{categoryName(p.categoryId)}</span>
                    </span>
                    <Badge tone="warning" icon="alert" soft>
                      Low stock
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Callout tone="info" icon="clock" title="Availability changes during service" className="mt-6">
          Items are marked sold out by the kitchen as they run out and reset the next morning. The
          menu always shows the state of the branch you are ordering from.
        </Callout>

        <div className="mt-8 flex flex-wrap gap-3">
          <BranchOrderButton branchId={branch.id} branchName={branch.shortName} />
          <ButtonLink href="/locations" size="lg" variant="secondary" iconStart="chevronLeft">
            All locations
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
