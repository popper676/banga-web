import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn, money, moneyLabel } from "@/lib/format";
import { AVAILABILITY, ORDER_STATUS, PAYMENT_STATUS, type Tone } from "@/lib/status";
import type { Availability, OrderStatus, PaymentStatus } from "@/lib/types";
import { Icon, type IconKey } from "./icons";

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "dark";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-teal text-black hover:bg-black hover:text-white active:bg-black border-transparent",
  secondary: "bg-white text-ink border-ink/20 hover:border-ink hover:bg-mint",
  ghost: "bg-transparent text-ink border-transparent hover:bg-ink/6",
  destructive: "bg-white text-black border-black/40 hover:bg-black hover:text-white",
  dark: "bg-ink text-white border-transparent hover:bg-deep",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

interface ButtonBase {
  variant?: Variant;
  size?: Size;
  iconStart?: IconKey;
  iconEnd?: IconKey;
  loading?: boolean;
  full?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  iconStart,
  iconEnd,
  loading,
  full,
  className,
  children,
  disabled,
  ...rest
}: ButtonBase & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold transition-colors",
        "disabled:opacity-45 disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        full && "w-full",
        className,
      )}
    >
      {loading ? (
        <span className="spin inline-block size-4 rounded-full border-2 border-current border-t-transparent" />
      ) : (
        iconStart && <Icon name={iconStart} size={size === "sm" ? 15 : 17} />
      )}
      {children}
      {iconEnd && !loading && <Icon name={iconEnd} size={size === "sm" ? 15 : 17} />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  iconStart,
  iconEnd,
  full,
  className,
  children,
}: ButtonBase & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold transition-colors",
        VARIANT[variant],
        SIZE[size],
        full && "w-full",
        className,
      )}
    >
      {iconStart && <Icon name={iconStart} size={size === "sm" ? 15 : 17} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === "sm" ? 15 : 17} />}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

const TONE: Record<Tone, string> = {
  neutral: "bg-ink/6 text-ink border-ink/12",
  info: "bg-mint text-deep border-deep/25",
  success: "bg-deep text-white border-transparent",
  warning: "bg-yellow text-ink border-ink/15",
  danger: "bg-cta text-white border-transparent",
};

const TONE_SOFT: Record<Tone, string> = {
  neutral: "bg-ink/5 text-grey border-ink/10",
  info: "bg-mint text-deep border-deep/20",
  success: "bg-mint text-deep border-deep/25",
  warning: "bg-yellow/35 text-black border-yellow",
  danger: "bg-cta/10 text-cta border-cta/30",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  soft,
  className,
}: {
  tone?: Tone;
  icon?: IconKey;
  children: ReactNode;
  soft?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold leading-none whitespace-nowrap",
        soft ? TONE_SOFT[tone] : TONE[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

/** Order status — icon + text, never colour alone. */
export function StatusBadge({
  status,
  audience = "customer",
  soft,
}: {
  status: OrderStatus;
  audience?: "customer" | "admin";
  soft?: boolean;
}) {
  const meta = ORDER_STATUS[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon} soft={soft}>
      {audience === "admin" ? meta.admin : meta.customer}
    </Badge>
  );
}

export function PaymentBadge({ status, soft }: { status: PaymentStatus; soft?: boolean }) {
  const meta = PAYMENT_STATUS[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon} soft={soft}>
      {meta.label}
    </Badge>
  );
}

export function AvailabilityChip({
  state,
  branchName,
  soft = true,
}: {
  state: Availability;
  branchName?: string;
  soft?: boolean;
}) {
  const meta = AVAILABILITY[state];
  if (state === "available") return null;
  return (
    <Badge tone={meta.tone} icon={meta.icon} soft={soft}>
      {meta.label}
      {branchName ? ` at ${branchName}` : ""}
    </Badge>
  );
}

export function PromoBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
      <Icon name="tag" size={12} />
      {children}
    </span>
  );
}

export function BranchOpenBadge({ open, detail }: { open: boolean; detail: string }) {
  return (
    <Badge tone={open ? "success" : "neutral"} icon={open ? "check" : "clock"} soft={!open}>
      {open ? "Open now" : "Closed"} · {detail}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Price                                                               */
/* ------------------------------------------------------------------ */

export function Price({
  sen,
  original,
  size = "md",
  className,
}: {
  sen: number;
  original?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-[14px]", md: "text-[17px]", lg: "text-[24px]" };
  return (
    <span className={cn("num font-semibold text-ink", sizes[size], className)}>
      <span
        aria-label={
          original ? `Was ${moneyLabel(original)}, now ${moneyLabel(sen)}` : moneyLabel(sen)
        }
      >
        <span aria-hidden={original ? undefined : true}>{money(sen)}</span>
      </span>
      {original !== undefined && original > sen && (
        <span aria-hidden className="ml-2 font-normal text-grey line-through">
          {money(original)}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <As className={cn("rounded-[16px] border border-line bg-white", className)}>{children}</As>
  );
}

export function SectionTitle({
  overline,
  title,
  lead,
  align = "left",
  className,
}: {
  overline?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {overline && (
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-deep">
          {overline}
        </p>
      )}
      <h2 className="text-[clamp(28px,4vw,52px)] leading-[1.05]">{title}</h2>
      {lead && <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-grey">{lead}</p>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

/* ------------------------------------------------------------------ */
/* Callout / notification banner                                       */
/* ------------------------------------------------------------------ */

const CALLOUT: Record<Tone, string> = {
  neutral: "border-line bg-white",
  info: "border-deep/25 bg-mint",
  success: "border-deep/30 bg-mint",
  warning: "border-yellow bg-yellow/25",
  danger: "border-cta/35 bg-cta/8",
};

const CALLOUT_ICON: Record<Tone, IconKey> = {
  neutral: "sparkle",
  info: "shield",
  success: "check",
  warning: "alert",
  danger: "alert",
};

export function Callout({
  tone = "info",
  title,
  children,
  icon,
  action,
  className,
  role,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: IconKey;
  action?: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={cn("flex gap-3 rounded-[14px] border p-4", CALLOUT[tone], className)}
    >
      <span className="mt-0.5 shrink-0 text-ink">
        <Icon name={icon ?? CALLOUT_ICON[tone]} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-[15px] font-semibold text-ink">{title}</p>}
        {children && (
          <div className={cn("text-[14px] leading-relaxed text-ink/80", title && "mt-1")}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading · empty · error                                             */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-[10px]", className)} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-[16px] border border-line bg-white p-3">
      <Skeleton className="mb-3 aspect-[4/3] w-full rounded-[12px]" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-3 h-3 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="size-9 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="h-3.5 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function EmptyState({
  icon = "box",
  title,
  body,
  action,
  compact,
}: {
  icon?: IconKey;
  title: string;
  body?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[16px] border border-dashed border-line bg-white text-center",
        compact ? "gap-2 p-6" : "gap-3 p-10",
      )}
    >
      <span className="deco-frame flex size-14 items-center justify-center text-deep">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="text-[18px]">{title}</h3>
      {body && <p className="max-w-[44ch] text-[14px] leading-relaxed text-grey">{body}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body,
  requestId,
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string;
  body?: string;
  requestId?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-[16px] border border-cta/30 bg-cta/6 p-8 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-cta/12 text-cta">
        <Icon name="alert" size={22} />
      </span>
      <h3 className="text-[18px]">{title}</h3>
      {body && <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink/75">{body}</p>}
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} iconStart="refund">
          {retryLabel}
        </Button>
      )}
      {requestId && (
        <p className="num text-[12px] text-grey">
          Reference for support: <span className="font-semibold">{requestId}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function Stat({
  value,
  label,
  sub,
  tone = "neutral",
  icon,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
  tone?: Tone;
  icon?: IconKey;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border p-4",
        tone === "warning" ? "border-yellow bg-yellow/20" : "border-line bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-grey">{label}</p>
        {icon && (
          <span className="text-grey">
            <Icon name={icon} size={15} />
          </span>
        )}
      </div>
      <p className="num mt-2 font-display text-[26px] font-bold leading-none text-ink">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-grey">{sub}</p>}
    </div>
  );
}

export function KeyValue({ k, v, mono }: { k: ReactNode; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <dt className="text-[14px] text-grey">{k}</dt>
      <dd className={cn("text-right text-[14px] font-medium text-ink", mono && "num")}>{v}</dd>
    </div>
  );
}
