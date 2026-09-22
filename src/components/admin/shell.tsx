"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BRANCHES, MOCK_ORDERS } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Icon, type IconKey } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/media";
import { Badge } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Navigation model                                                    */
/* ------------------------------------------------------------------ */

export interface AdminNavItem {
  href: string;
  label: string;
  icon: IconKey;
  badge?: "waiting" | "failed";
}

export const ADMIN_NAV: { group: string; items: AdminNavItem[] }[] = [
  {
    group: "Live operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: "grid" },
      { href: "/admin/orders", label: "Orders", icon: "list" },
      { href: "/admin/confirmation", label: "Branch confirmation", icon: "hourglass", badge: "waiting" },
      { href: "/admin/kitchen", label: "Kitchen status", icon: "cook" },
      { href: "/admin/delivery", label: "Delivery tracking", icon: "bike", badge: "failed" },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { href: "/admin/menu", label: "Menu management", icon: "box" },
      { href: "/admin/categories", label: "Categories", icon: "list" },
      { href: "/admin/options", label: "Options & add-ons", icon: "filter" },
      { href: "/admin/inventory", label: "Branch inventory", icon: "bag" },
    ],
  },
  {
    group: "Money",
    items: [
      { href: "/admin/payments", label: "Payments", icon: "card" },
      { href: "/admin/refunds", label: "Refunds", icon: "refund" },
      { href: "/admin/reports", label: "Reports", icon: "chart" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { href: "/admin/promotions", label: "Promotions", icon: "tag" },
      { href: "/admin/customers", label: "Customers", icon: "users" },
    ],
  },
  {
    group: "Configuration",
    items: [
      { href: "/admin/branches", label: "Branch management", icon: "pin" },
      { href: "/admin/users", label: "Admins & roles", icon: "shield" },
      { href: "/admin/printer", label: "Printer & POS", icon: "printer" },
      { href: "/admin/audit", label: "Audit logs", icon: "eye" },
      { href: "/admin/settings", label: "System settings", icon: "settings" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export function AdminShell({
  title,
  description,
  actions,
  children,
  fullBleed,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const pathname = usePathname();
  const { orders } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [scope, setScope] = useState<string>("all");

  const waiting = orders.filter((o) => o.status === "WAITING_FOR_BRANCH").length;
  const failed = orders.filter((o) => o.status === "FAILED").length;
  const badgeValue = (b?: AdminNavItem["badge"]) =>
    b === "waiting" ? waiting : b === "failed" ? failed : 0;

  const Sidebar = (
    <nav
      aria-label="Admin sections"
      className={cn(
        "flex h-full flex-col overflow-y-auto border-r border-line-dark bg-ink text-cream",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-teal font-display text-[13px] font-extrabold text-ink">
          방
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-[13px] font-extrabold leading-tight">
              BANG GA BANG GA
            </p>
            <p className="text-[11px] text-cream/55">Admin console</p>
          </div>
        )}
      </div>

      <div className="flex-1 py-3">
        {ADMIN_NAV.map((section) => (
          <div key={section.group} className="mb-3">
            {!collapsed && (
              <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal">
                {section.group}
              </p>
            )}
            <ul>
              {section.items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const count = badgeValue(item.badge);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "mx-2 flex min-h-10 items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors",
                        active ? "bg-teal text-ink" : "text-cream/80 hover:bg-white/8 hover:text-white",
                        collapsed && "justify-center",
                      )}
                    >
                      <Icon name={item.icon} size={17} />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {count > 0 && (
                        <span
                          className={cn(
                            "num rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            active ? "bg-ink text-white" : "bg-cta text-white",
                            collapsed && "absolute right-1 top-1",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/10 p-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-[10px] px-2 text-[12px] font-semibold text-cream/70 hover:bg-white/8 hover:text-white"
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={16} />
          {!collapsed && "Collapse"}
        </button>
        <Link
          href="/"
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-[10px] px-2 text-[12px] font-semibold text-cream/70 hover:bg-white/8 hover:text-white"
        >
          <Icon name="logout" size={16} />
          {!collapsed && "Exit to website"}
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-cream">
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">{Sidebar}</div>

      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setMobileNav(false)} aria-hidden />
          <div className="relative h-full w-60">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <button
              onClick={() => setMobileNav(true)}
              aria-label="Open admin navigation"
              className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-mint lg:hidden"
            >
              <Icon name="menu" size={20} />
            </button>

            <BranchScope value={scope} onChange={setScope} />

            <div className="relative ml-auto hidden max-w-72 flex-1 md:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey">
                <Icon name="search" size={16} />
              </span>
              <label htmlFor="admin-search" className="sr-only">
                Search orders, customers or products
              </label>
              <input
                id="admin-search"
                type="search"
                placeholder="Search orders, customers…"
                className="h-10 w-full rounded-full border border-line bg-cream/60 pl-9 pr-3 text-[14px] text-ink placeholder:text-grey/70"
              />
            </div>

            <Link
              href="/admin/confirmation"
              className="relative flex size-10 items-center justify-center rounded-full border border-line text-ink hover:bg-mint"
              aria-label={`Alerts, ${waiting + failed} needing attention`}
            >
              <Icon name="bell" size={17} />
              {waiting + failed > 0 && (
                <span className="num absolute -right-0.5 -top-0.5 rounded-full bg-cta px-1.5 text-[10px] font-bold text-white">
                  {waiting + failed}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2 border-l border-line pl-3">
              <Avatar name="Aisyah Nordin" size={32} />
              <div className="hidden leading-tight sm:block">
                <p className="text-[13px] font-semibold text-ink">Aisyah Nordin</p>
                <p className="text-[11px] text-grey">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main id="main" className={cn("flex-1", fullBleed ? "" : "px-4 py-6 lg:px-6 lg:py-8")}>
          {!fullBleed && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-[clamp(22px,2.6vw,30px)] leading-tight">{title}</h1>
                {description && <p className="mt-1 text-[14px] text-grey">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function BranchScope({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[12px] font-semibold uppercase tracking-wide text-grey sm:inline">
        Branch
      </span>
      <label htmlFor="branch-scope" className="sr-only">
        Branch scope
      </label>
      <select
        id="branch-scope"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-line bg-white px-3 pr-8 text-[13px] font-semibold text-ink"
      >
        <option value="all">All branches</option>
        {BRANCHES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.shortName}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared admin pieces                                           */
/* ------------------------------------------------------------------ */

export function AdminCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[14px] border border-line bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          {title && <h2 className="text-[15px]">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** "Needs attention" list used on the dashboard and the delivery board. */
export function AlertRow({
  tone,
  title,
  detail,
  href,
  actionLabel,
}: {
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
      <Badge tone={tone} icon={tone === "info" ? "sparkle" : "alert"} soft>
        {tone === "danger" ? "Urgent" : tone === "warning" ? "Attention" : "Info"}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-grey">{detail}</p>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-line px-3 text-[13px] font-semibold text-ink hover:bg-mint"
      >
        {actionLabel}
        <Icon name="chevronRight" size={14} />
      </Link>
    </li>
  );
}

/** Convenience: today's operational counts, shared by several screens. */
export function useOpsCounts() {
  const { orders } = useStore();
  return {
    waiting: orders.filter((o) => o.status === "WAITING_FOR_BRANCH").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
    delivering: orders.filter((o) =>
      ["LALAMOVE_BOOKED", "RIDER_PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status),
    ).length,
    failed: orders.filter((o) => o.status === "FAILED").length,
    refunds: orders.filter((o) => o.status === "REFUND_PENDING").length,
    total: MOCK_ORDERS.length,
  };
}
