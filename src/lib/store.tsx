"use client";

/**
 * Prototype state. Everything is in-memory + localStorage — there is no
 * backend, no Supabase and no real payment or delivery provider anywhere
 * in this project.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ORDERS, MOCK_USER, PROMOTIONS, SAVED_ADDRESSES, branchById } from "./mock-data";
import { SST_RATE, orderCode } from "./format";
import type {
  Address,
  CartLine,
  FulfilmentType,
  Order,
  OrderEvent,
  OrderStatus,
  PaymentMethod,
} from "./types";

/* ------------------------------------------------------------------ */
/* Simulation switches — driven by the floating prototype panel        */
/* ------------------------------------------------------------------ */

export interface SimSettings {
  reducedMotion: boolean;
  /** How the branch responds on the confirmation screen */
  branchResponse: "accept" | "reject" | "timeout";
  /** What happens when the customer submits the Visa card form */
  cardOutcome: "success" | "declined" | "delayed" | "duplicate";
  /** What happens on the DuitNow QR screen */
  qrOutcome: "success" | "expire" | "delayed";
  /** Whether Lalamove finds a rider */
  riderOutcome: "normal" | "no_rider";
  /** Whether the provider supports an automatic reversal */
  refundMode: "auto" | "manual";
  /** Time compression so reviewers do not wait 5 real minutes */
  fastForward: boolean;
  /** Simulate a lost connection */
  offline: boolean;
  /** Signed-in vs guest */
  signedIn: boolean;
}

const DEFAULT_SIM: SimSettings = {
  reducedMotion: false,
  branchResponse: "accept",
  cardOutcome: "success",
  qrOutcome: "success",
  riderOutcome: "normal",
  refundMode: "auto",
  fastForward: true,
  offline: false,
  signedIn: true,
};

/* ------------------------------------------------------------------ */
/* Checkout draft                                                      */
/* ------------------------------------------------------------------ */

export interface CheckoutDraft {
  fulfilment: FulfilmentType;
  addressId: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryNotes: string;
  promotionCode: string | null;
  paymentMethod: PaymentMethod | null;
  createAccount: boolean;
}

const DEFAULT_DRAFT: CheckoutDraft = {
  fulfilment: "delivery",
  addressId: "addr-home",
  contactName: MOCK_USER.name,
  contactPhone: MOCK_USER.phone,
  contactEmail: MOCK_USER.email,
  deliveryNotes: "",
  promotionCode: null,
  paymentMethod: null,
  createAccount: false,
};

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone: "neutral" | "success" | "warning" | "danger";
  actionLabel?: string;
  onAction?: () => void;
}

/* ------------------------------------------------------------------ */
/* Totals                                                              */
/* ------------------------------------------------------------------ */

export interface Totals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  promotionLabel?: string;
}

export function computeTotals(
  lines: CartLine[],
  fulfilment: FulfilmentType,
  branchId: string,
  promotionCode: string | null,
): Totals {
  const subtotal = lines
    .filter((l) => !l.unavailableAt)
    .reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const branch = branchById(branchId);
  const baseDelivery = fulfilment === "delivery" ? (branch.id === "ss15" ? 650 : 720) : 0;

  let discount = 0;
  let deliveryFee = baseDelivery;
  let promotionLabel: string | undefined;

  const promo = PROMOTIONS.find((p) => p.code && p.code === promotionCode);
  if (promo && subtotal >= promo.minSpend && promo.branchIds.includes(branchId)) {
    promotionLabel = promo.name;
    if (promo.type === "percentage") discount = Math.round((subtotal * promo.value) / 100);
    if (promo.type === "fixed") discount = promo.value;
    if (promo.type === "free_delivery") {
      discount = 0;
      deliveryFee = 0;
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * SST_RATE);
  const total = taxable + deliveryFee + tax;

  return { subtotal, discount, deliveryFee, tax, total, promotionLabel };
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface StoreValue {
  hydrated: boolean;

  branchId: string;
  setBranchId: (id: string) => void;

  lines: CartLine[];
  cartCount: number;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  markUnavailable: (lineIds: string[], branchId: string) => void;

  draft: CheckoutDraft;
  patchDraft: (patch: Partial<CheckoutDraft>) => void;
  resetDraft: () => void;

  addresses: Address[];
  addAddress: (address: Omit<Address, "id">) => string;

  totals: Totals;

  orders: Order[];
  activeOrderId: string | null;
  createOrder: () => Order;
  patchOrder: (id: string, patch: Partial<Order>, event?: OrderEvent) => void;
  setStatus: (id: string, status: OrderStatus, label: string, actor?: OrderEvent["actor"], note?: string) => void;
  orderById: (id: string) => Order | undefined;

  sim: SimSettings;
  patchSim: (patch: Partial<SimSettings>) => void;

  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const STORAGE_KEY = "bangga.prototype.v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [branchId, setBranchIdState] = useState("ss15");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [draft, setDraft] = useState<CheckoutDraft>(DEFAULT_DRAFT);
  const [addresses, setAddresses] = useState<Address[]>(SAVED_ADDRESSES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [sim, setSim] = useState<SimSettings>(DEFAULT_SIM);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [seq, setSeq] = useState(139);

  /* ---- hydrate ---- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{
          branchId: string;
          lines: CartLine[];
          draft: CheckoutDraft;
          sim: SimSettings;
        }>;
        if (saved.branchId) setBranchIdState(saved.branchId);
        if (saved.lines) setLines(saved.lines);
        if (saved.draft) setDraft({ ...DEFAULT_DRAFT, ...saved.draft });
        if (saved.sim) setSim({ ...DEFAULT_SIM, ...saved.sim });
      }
    } catch {
      /* prototype only — ignore storage failures */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ branchId, lines, draft, sim }),
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, branchId, lines, draft, sim]);

  /* ---- reduced motion flag on <html> ---- */
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(sim.reducedMotion);
  }, [sim.reducedMotion]);

  /* ---- cart ---- */
  const addLine = useCallback((incoming: Omit<CartLine, "lineId">) => {
    setLines((prev) => {
      const signature = `${incoming.productId}|${incoming.options
        .map((o) => o.choiceId)
        .sort()
        .join(",")}|${incoming.notes ?? ""}`;
      const existing = prev.find(
        (l) =>
          `${l.productId}|${l.options.map((o) => o.choiceId).sort().join(",")}|${l.notes ?? ""}` ===
          signature,
      );
      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId ? { ...l, quantity: l.quantity + incoming.quantity } : l,
        );
      }
      return [...prev, { ...incoming, lineId: `l-${Date.now()}-${prev.length}` }];
    });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.lineId !== lineId)
        : prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const markUnavailable = useCallback((lineIds: string[], atBranch: string) => {
    setLines((prev) =>
      prev.map((l) =>
        lineIds.includes(l.lineId) ? { ...l, unavailableAt: atBranch } : { ...l, unavailableAt: undefined },
      ),
    );
  }, []);

  const setBranchId = useCallback((id: string) => setBranchIdState(id), []);

  /* ---- draft ---- */
  const patchDraft = useCallback(
    (patch: Partial<CheckoutDraft>) => setDraft((d) => ({ ...d, ...patch })),
    [],
  );
  const resetDraft = useCallback(() => setDraft(DEFAULT_DRAFT), []);

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    const id = `addr-${Date.now()}`;
    setAddresses((prev) => [...prev, { ...address, id }]);
    return id;
  }, []);

  /* ---- totals ---- */
  const totals = useMemo(
    () => computeTotals(lines, draft.fulfilment, branchId, draft.promotionCode),
    [lines, draft.fulfilment, draft.promotionCode, branchId],
  );

  /* ---- orders ---- */
  const createOrder = useCallback((): Order => {
    const code = orderCode(seq);
    const id = `o-${seq}`;
    const address = addresses.find((a) => a.id === draft.addressId);
    const order: Order = {
      id,
      code,
      customerName: draft.contactName || "Guest",
      customerPhone: draft.contactPhone,
      customerEmail: draft.contactEmail,
      isGuest: !sim.signedIn,
      branchId,
      fulfilment: draft.fulfilment,
      address: draft.fulfilment === "delivery" ? address : undefined,
      lines: lines.filter((l) => !l.unavailableAt),
      subtotal: totals.subtotal,
      discount: totals.discount,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      total: totals.total,
      status: "PENDING_PAYMENT",
      placedAt: new Date().toISOString(),
      branchSlaSeconds: 300,
      promotionCode: draft.promotionCode ?? undefined,
      customerNotes: draft.deliveryNotes || undefined,
      payment: {
        method: draft.paymentMethod ?? "visa",
        provider: draft.paymentMethod === "duitnow_qr" ? "OXPay" : "Maybank",
        status: "unpaid",
        amount: totals.total,
        reference: draft.paymentMethod === "duitnow_qr" ? `OXP-QR-${code.slice(-8)}` : `MBB-TXN-${code.slice(-8)}`,
      },
      delivery:
        draft.fulfilment === "delivery"
          ? { provider: "Lalamove", fee: totals.deliveryFee, status: "not_booked" }
          : undefined,
      events: [
        {
          status: "PENDING_PAYMENT",
          label: "Order created",
          at: new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false }),
          actor: "customer",
        },
      ],
    };
    setOrders((prev) => [order, ...prev]);
    setActiveOrderId(id);
    setSeq((s) => s + 1);
    return order;
  }, [seq, addresses, draft, sim.signedIn, branchId, lines, totals]);

  const patchOrder = useCallback((id: string, patch: Partial<Order>, event?: OrderEvent) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, ...patch, events: event ? [...o.events, event] : o.events }
          : o,
      ),
    );
  }, []);

  const setStatus = useCallback(
    (id: string, status: OrderStatus, label: string, actor: OrderEvent["actor"] = "system", note?: string) => {
      const at = new Date().toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status, events: [...o.events, { status, label, at, actor, note }] } : o,
        ),
      );
    },
    [],
  );

  const orderById = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  /* ---- sim ---- */
  const patchSim = useCallback((patch: Partial<SimSettings>) => setSim((s) => ({ ...s, ...patch })), []);

  /* ---- toasts ---- */
  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5200);
  }, []);

  const dismissToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const value: StoreValue = {
    hydrated,
    branchId,
    setBranchId,
    lines,
    cartCount: lines.reduce((n, l) => n + l.quantity, 0),
    addLine,
    updateQuantity,
    removeLine,
    clearCart,
    markUnavailable,
    draft,
    patchDraft,
    resetDraft,
    addresses,
    addAddress,
    totals,
    orders,
    activeOrderId,
    createOrder,
    patchOrder,
    setStatus,
    orderById,
    sim,
    patchSim,
    toasts,
    pushToast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
