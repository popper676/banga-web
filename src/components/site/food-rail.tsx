"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";

/**
 * Horizontal food rail for the homepage food-identity section.
 *
 * It is a real scroll container with arrow buttons, scroll-snap and
 * focusable links — no scroll hijacking, and it works with keyboard,
 * touch and a trackpad.
 */
export function FoodIdentityRail() {
  const ref = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const items = PRODUCTS.filter((p) => p.signature || p.tags.includes("Under RM20")).slice(0, 7);

  const scrollBy = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    const delta = (card?.clientWidth ?? 280) + 16;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = (card?.clientWidth ?? 280) + 16;
    setIndex(Math.round(el.scrollLeft / w));
  };

  return (
    <div className="mt-10">
      <ul
        ref={ref}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Signature dishes"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-10 xl:px-14"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((p) => (
          <li key={p.id} className="w-[76vw] max-w-72 shrink-0 snap-start sm:w-64">
            <Link
              href={`/menu/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-deep/12 bg-white transition-colors hover:border-ink/40"
            >
              <FoodImage src={p.image} alt={p.name} className="aspect-[5/4] w-full" rounded="rounded-none" />
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[15px] font-semibold leading-snug text-ink">{p.name}</p>
                {p.koreanName && (
                  <p lang="ko" className="mt-0.5 text-[13px] text-grey">
                    {p.koreanName}
                  </p>
                )}
                <p className="num mt-auto pt-3 text-[16px] font-bold text-ink">{money(p.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="container-page flex items-center gap-3">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll dishes left"
          className="flex size-10 items-center justify-center rounded-full border border-deep/25 bg-white text-ink hover:bg-ink hover:text-white"
        >
          <Icon name="chevronLeft" size={18} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll dishes right"
          className="flex size-10 items-center justify-center rounded-full border border-deep/25 bg-white text-ink hover:bg-ink hover:text-white"
        >
          <Icon name="chevronRight" size={18} />
        </button>
        <div className="ml-2 flex gap-1.5" aria-hidden>
          {items.map((p, i) => (
            <span
              key={p.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/25",
              )}
            />
          ))}
        </div>
        <p className="num ml-auto text-[13px] text-grey">
          {index + 1} / {items.length}
        </p>
      </div>
    </div>
  );
}
