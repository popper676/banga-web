"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/primitives";
import { BranchChip } from "./branch-switcher";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our Story" },
  { href: "/menu", label: "Menu" },
  { href: "/promotions", label: "Promotions" },
  { href: "/photo-booth", label: "Photo Booth" },
  { href: "/locations", label: "Locations" },
  { href: "/track", label: "Track Order" },
];

export function Logo({
  size = "md",
  onDark,
  duotone,
}: {
  size?: "sm" | "md";
  onDark?: boolean;
  duotone?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-display font-extrabold leading-none tracking-tight",
        size === "sm" ? "text-[15px]" : "text-[17px]",
        duotone ? "text-[#feb513]" : onDark ? "text-white" : "text-ink",
      )}
      aria-label="BANG GA BANG GA home"
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-[10px] font-display text-[13px] font-extrabold",
          size === "sm" ? "size-7" : "size-8",
          duotone
            ? "bg-[#feb513] text-black"
            : onDark
              ? "bg-teal text-ink"
              : "bg-ink text-cream",
        )}
        aria-hidden
      >
        방
      </span>
      <span className="hidden sm:inline">BANG GA BANG GA</span>
      <span className="sm:hidden">BANG GA</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cartCount, sim } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <>
      <a href="#main" className="skip-link focus:skip-link-focus">
        Skip to main content
      </a>

      {sim.offline && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 bg-ink px-4 py-2 text-[13px] font-medium text-white"
        >
          <Icon name="wifiOff" size={15} />
          You&rsquo;re offline. Menu is showing the last saved version and ordering is paused.
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors",
          isHome
            ? scrolled
              ? "border-[#feb513]/35 bg-black/95 backdrop-blur-sm"
              : "border-transparent bg-black"
            : scrolled
              ? "border-line bg-cream/95 backdrop-blur-sm"
              : "border-transparent bg-cream",
        )}
      >
        <div className="container-page flex h-16 items-center gap-3 lg:h-18">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            aria-expanded={drawer}
            className={cn(
              "flex size-10 items-center justify-center rounded-full lg:hidden",
              isHome ? "text-[#feb513] hover:bg-[#feb513] hover:text-black" : "text-ink hover:bg-mint",
            )}
          >
            <Icon name="menu" size={20} />
          </button>

          <Logo duotone={isHome} />

          <nav aria-label="Main" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-[14px] font-medium transition-colors",
                    isHome
                      ? active
                        ? "bg-[#feb513] text-black"
                        : "text-[#feb513] hover:bg-[#feb513] hover:text-black"
                      : active
                        ? "bg-ink text-white"
                        : "text-ink hover:bg-mint",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block">
              <BranchChip
                className={isHome ? "!border-[#feb513] !bg-black !text-[#feb513]" : undefined}
              />
            </div>
            <Link
              href="/account"
              aria-label="Your account"
              className={cn(
                "hidden size-10 items-center justify-center rounded-full border sm:flex",
                isHome
                  ? "border-[#feb513] bg-black text-[#feb513] hover:bg-[#feb513] hover:text-black"
                  : "border-line bg-white text-ink hover:border-ink",
              )}
            >
              <Icon name="user" size={17} />
            </Link>
            <Link
              href="/cart"
              className={cn(
                "relative flex h-10 items-center gap-2 rounded-full border px-3",
                isHome
                  ? "border-[#feb513] bg-black text-[#feb513] hover:bg-[#feb513] hover:text-black"
                  : "border-line bg-white text-ink hover:border-ink",
              )}
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            >
              <Icon name="cart" size={17} />
              <span className="num text-[13px] font-bold">{cartCount}</span>
            </Link>
            <ButtonLink
              href="/menu"
              size="md"
              className={cn(
                "hidden sm:inline-flex",
                isHome && "!border-[#feb513] !bg-[#feb513] !text-black hover:!bg-black hover:!text-[#feb513]",
              )}
            >
              Order Now
            </ButtonLink>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawer(false)} aria-hidden />
          <div
            className={cn(
              "sheet-up relative h-full w-[86%] max-w-80 overflow-auto p-5",
              isHome ? "bg-black text-[#feb513]" : "bg-cream",
            )}
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo size="sm" duotone={isHome} />
              <button
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  isHome ? "text-[#feb513] hover:bg-[#feb513] hover:text-black" : "hover:bg-mint",
                )}
              >
                <Icon name="cross" size={18} />
              </button>
            </div>
            <div className="mb-5">
              <BranchChip
                className={cn(
                  "w-full justify-start",
                  isHome && "!border-[#feb513] !bg-black !text-[#feb513]",
                )}
              />
            </div>
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border-b py-3.5 font-display text-[19px] font-bold",
                    isHome ? "border-[#feb513]/35 text-[#feb513]" : "border-line text-ink",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/account" className={cn("border-b py-3.5 font-display text-[19px] font-bold", isHome ? "border-[#feb513]/35 text-[#feb513]" : "border-line text-ink")}>
                Account
              </Link>
              <Link href="/login" className={cn("border-b py-3.5 font-display text-[19px] font-bold", isHome ? "border-[#feb513]/35 text-[#feb513]" : "border-line text-ink")}>
                Log in
              </Link>
            </nav>
            <ButtonLink
              href="/menu"
              full
              className={cn(
                "mt-6",
                isHome && "!border-[#feb513] !bg-[#feb513] !text-black",
              )}
            >
              Order Now
            </ButtonLink>
          </div>
        </div>
      )}
    </>
  );
}

/** Persistent ordering nav for small screens on commerce routes. */
export function MobileOrderBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cartCount } = useStore();
  const items = [
    { href: "/", label: "Home", icon: "home" as const },
    { href: "/menu", label: "Menu", icon: "list" as const },
    { href: "/cart", label: "Cart", icon: "cart" as const, badge: cartCount },
    { href: "/account/orders", label: "Orders", icon: "receipt" as const },
    { href: "/account", label: "Account", icon: "user" as const },
  ];
  return (
    <nav
      aria-label="Ordering"
      className={cn(
        "no-print sticky bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] lg:hidden",
        isHome ? "border-[#feb513]/35 bg-black" : "border-line bg-white",
      )}
    >
      <ul className="grid grid-cols-5">
        {items.map((i) => {
          const active = i.href === "/" ? pathname === "/" : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  isHome
                    ? active
                      ? "text-[#feb513]"
                      : "text-[#feb513]/55"
                    : active
                      ? "text-ink"
                      : "text-grey",
                )}
              >
                <Icon name={i.icon} size={19} />
                {i.label}
                {i.badge ? (
                  <span
                    className={cn(
                      "num absolute right-[22%] top-1.5 rounded-full px-1.5 text-[10px] font-bold",
                      isHome ? "bg-[#feb513] text-black" : "bg-cta text-white",
                    )}
                  >
                    {i.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
