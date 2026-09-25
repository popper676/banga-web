import Link from "next/link";
import { BRANCHES } from "@/lib/mock-data";
import { todayHours } from "@/lib/format";
import { Icon } from "@/components/ui/icons";

const GROUPS = [
  {
    title: "Order",
    links: [
      { href: "/menu", label: "Full menu" },
      { href: "/promotions", label: "Promotions" },
      { href: "/track", label: "Track an order" },
      { href: "/account/orders", label: "Order history" },
    ],
  },
  {
    title: "Visit",
    links: [
      { href: "/locations", label: "Locations" },
      { href: "/photo-booth", label: "Photo booth" },
      { href: "/story", label: "Our story" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/refunds", label: "Refund policy" },
      { href: "/screens", label: "Prototype screen index" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="no-print on-dark mt-24 bg-black text-[#feb513]">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-[22px] font-extrabold leading-tight text-[#feb513]">
              BANG GA BANG GA
            </p>
            <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-[#feb513]/75">
              Korean flavours. Good food. Great memories. Muslim-friendly Korean dining in Subang
              Jaya, with a photo booth to make it last.
            </p>
            <p className="mt-5 font-display text-[15px] font-bold uppercase tracking-[0.2em] text-[#feb513]">
              Make it last.
            </p>
          </div>

          {GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#feb513]">
                {g.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-[#feb513]/80 hover:text-[#feb513] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-[#feb513]/25 pt-8 sm:grid-cols-2">
          {BRANCHES.map((b) => (
            <div key={b.id}>
              <p className="font-display text-[16px] font-bold text-[#feb513]">{b.name}</p>
              <p className="mt-1 text-[13px] text-[#feb513]/70">
                {b.address}, {b.postcode} {b.city}
              </p>
              <p className="num mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#feb513]/70">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="clock" size={13} /> Today {todayHours(b)}
                </span>
                <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-[#feb513]">
                  <Icon name="phone" size={13} /> {b.phone}
                </a>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#feb513]/25 pt-6 text-[12px] text-[#feb513]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BANG GA BANG GA Sdn Bhd. All rights reserved.</p>
          <p>
            UI prototype — mock data only. No live payment, delivery or database services are
            connected.
          </p>
        </div>
      </div>
    </footer>
  );
}
