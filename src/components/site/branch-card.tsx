"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { branchStatus, dayName, todayHours } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Branch } from "@/lib/types";
import { Badge, Button, ButtonLink } from "@/components/ui/primitives";
import { MapView } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";

export function BranchCard({ branch, showHours }: { branch: Branch; showHours?: boolean }) {
  const status = branchStatus(branch);
  const { setBranchId, pushToast } = useStore();
  const router = useRouter();

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white">
      <MapView
        className="h-44 w-full"
        label={`Map showing ${branch.name}`}
        pins={[{ x: 48, y: 62, tone: "branch", name: branch.shortName }]}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-[21px] leading-snug">{branch.name}</h3>
          <Badge tone={status.open ? "success" : "neutral"} icon={status.open ? "check" : "clock"} soft={!status.open}>
            {status.open ? status.detail : status.detail}
          </Badge>
        </div>

        <p className="mt-2 text-[14px] leading-relaxed text-grey">
          {branch.address}
          <br />
          {branch.postcode} {branch.city}, Selangor
        </p>
        <p className="mt-1.5 text-[13px] italic text-grey">{branch.mapHint}</p>

        <dl className="num mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <dt className="text-grey">Today</dt>
            <dd className="font-semibold text-ink">{todayHours(branch)}</dd>
          </div>
          <div>
            <dt className="text-grey">Phone</dt>
            <dd>
              <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="font-semibold text-ink hover:underline">
                {branch.phone}
              </a>
            </dd>
          </div>
        </dl>

        {showHours && (
          <table className="num mt-4 w-full text-[13px]">
            <caption className="sr-only">Opening hours for {branch.name}</caption>
            <tbody>
              {branch.hours.map((h) => (
                <tr key={h.day} className="border-b border-line/70 last:border-0">
                  <th scope="row" className="py-1.5 text-left font-medium text-grey">
                    {dayName(h.day)}
                  </th>
                  <td className="py-1.5 text-right font-semibold text-ink">
                    {h.opens} – {h.closes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {branch.supportsDineIn && <Badge soft tone="neutral" icon="home">Dine-in</Badge>}
          {branch.supportsPickup && <Badge soft tone="neutral" icon="bag">Pickup</Badge>}
          {branch.supportsDelivery && (
            <Badge soft tone="neutral" icon="bike">
              Delivery within {branch.deliveryRadiusKm} km
            </Badge>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="dark"
            onClick={() => {
              setBranchId(branch.id);
              pushToast({ tone: "success", title: `Now ordering from ${branch.shortName}` });
              router.push("/menu");
            }}
          >
            Order from this branch
          </Button>
          <ButtonLink href={`/locations/${branch.id}`} variant="secondary" iconStart="pin">
            Get directions
          </ButtonLink>
        </div>

        <Link
          href={`/locations/${branch.id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-deep hover:underline"
        >
          Branch details <Icon name="chevronRight" size={14} />
        </Link>
      </div>
    </article>
  );
}
