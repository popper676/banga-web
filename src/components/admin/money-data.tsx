"use client";

/**
 * Transaction, refund and promotion data for the money screens.
 * Two providers only: Maybank for Visa cards, OXPay for DuitNow QR.
 * Nothing here is a real reference and no key of any kind is stored.
 */

import type { PaymentMethod, PaymentProvider } from "@/lib/types";
import type { Tone } from "@/lib/status";
import type { IconKey } from "@/components/ui/icons";

export type TxStatus =
  | "paid"
  | "processing"
  | "delayed"
  | "declined"
  | "expired"
  | "refunded"
  | "partially_refunded";

export const TX_STATUS: Record<TxStatus, { label: string; tone: Tone; icon: IconKey; blurb: string }> = {
  paid: { label: "Paid", tone: "success", icon: "check", blurb: "Captured by the provider." },
  processing: {
    label: "Processing",
    tone: "info",
    icon: "hourglass",
    blurb: "Authorised and waiting for capture confirmation.",
  },
  delayed: {
    label: "Confirmation delayed",
    tone: "warning",
    icon: "hourglass",
    blurb: "The bank has the money but has not confirmed yet.",
  },
  declined: {
    label: "Declined",
    tone: "danger",
    icon: "cross",
    blurb: "The issuing bank refused the payment.",
  },
  expired: {
    label: "QR expired",
    tone: "warning",
    icon: "clock",
    blurb: "The DuitNow QR timed out before it was scanned.",
  },
  refunded: { label: "Refunded", tone: "success", icon: "refund", blurb: "Returned in full." },
  partially_refunded: {
    label: "Partially refunded",
    tone: "warning",
    icon: "refund",
    blurb: "Part of the order was returned.",
  },
};

export interface TxEvent {
  label: string;
  at: string;
  actor: "Maybank" | "OXPay" | "System" | "Finance" | "Branch";
  note?: string;
}

export interface Transaction {
  id: string;
  internalId: string;
  orderCode: string;
  orderId?: string;
  at: string;
  customer: string;
  branchId: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  amount: number;
  status: TxStatus;
  reference: string;
  cardBrand?: "Visa";
  maskedCard?: string;
  duitnowReference?: string;
  qrExpiresAt?: string;
  bankResponseCode?: string;
  bankResponseText?: string;
  settlementBatch?: string;
  payoutExpectedOn?: string;
  settledOn?: string;
  refundedAmount?: number;
  notice?: string;
  events: TxEvent[];
}

const visa = (masked: string) => ({ method: "visa" as PaymentMethod, provider: "Maybank" as PaymentProvider, cardBrand: "Visa" as const, maskedCard: masked });
const qr = (ref: string, expiry: string) => ({
  method: "duitnow_qr" as PaymentMethod,
  provider: "OXPay" as PaymentProvider,
  duitnowReference: ref,
  qrExpiresAt: expiry,
});

export const TRANSACTIONS: Transaction[] = [
  {
    id: "pay-0138",
    internalId: "PAY-2026-0138",
    orderCode: "BG-260921-0138",
    orderId: "o-0138",
    at: "2026-09-21T19:02:41+08:00",
    customer: "Aisyah Rahman",
    branchId: "ss15",
    amount: 5600,
    status: "paid",
    reference: "MBB-TXN-9F2A4C71",
    settlementBatch: "MBB-BATCH-20260921-A",
    payoutExpectedOn: "2026-09-23",
    ...visa("•••• •••• •••• 4242"),
    events: [
      { label: "Payment authorised", at: "21 Sep 2026, 19:02:38", actor: "Maybank", note: "3-D Secure passed" },
      { label: "Payment captured", at: "21 Sep 2026, 19:02:41", actor: "Maybank" },
      { label: "Webhook received", at: "21 Sep 2026, 19:02:43", actor: "System", note: "payment.captured" },
      { label: "Queued for settlement", at: "21 Sep 2026, 23:00:00", actor: "Maybank", note: "Batch MBB-BATCH-20260921-A" },
    ],
  },
  {
    id: "pay-0137",
    internalId: "PAY-2026-0137",
    orderCode: "BG-260921-0137",
    orderId: "o-0137",
    at: "2026-09-21T18:55:52+08:00",
    customer: "Wei Jie Tan",
    branchId: "ss15",
    amount: 2067,
    status: "paid",
    reference: "OXP-QR-5512B803",
    settlementBatch: "OXP-BATCH-20260921-2",
    payoutExpectedOn: "2026-09-22",
    ...qr("DN2026092118554412", "2026-09-21T19:05:00+08:00"),
    events: [
      { label: "Dynamic QR generated", at: "21 Sep 2026, 18:55:10", actor: "OXPay", note: "Valid for 10 minutes" },
      { label: "QR scanned by customer", at: "21 Sep 2026, 18:55:44", actor: "OXPay" },
      { label: "Payment captured", at: "21 Sep 2026, 18:55:52", actor: "OXPay" },
      { label: "Webhook received", at: "21 Sep 2026, 18:55:55", actor: "System", note: "duitnow.paid" },
    ],
  },
  {
    id: "pay-0136",
    internalId: "PAY-2026-0136",
    orderCode: "BG-260921-0136",
    orderId: "o-0136",
    at: "2026-09-21T18:31:33+08:00",
    customer: "Kumar Devaraj",
    branchId: "taylors",
    amount: 11342,
    status: "paid",
    reference: "MBB-TXN-1D77E902",
    settlementBatch: "MBB-BATCH-20260921-A",
    payoutExpectedOn: "2026-09-23",
    ...visa("•••• •••• •••• 7714"),
    events: [
      { label: "Payment authorised", at: "21 Sep 2026, 18:31:30", actor: "Maybank" },
      { label: "Payment captured", at: "21 Sep 2026, 18:31:33", actor: "Maybank" },
      { label: "Webhook received", at: "21 Sep 2026, 18:31:36", actor: "System", note: "payment.captured" },
      { label: "Queued for settlement", at: "21 Sep 2026, 23:00:00", actor: "Maybank" },
    ],
  },
  {
    id: "pay-0135",
    internalId: "PAY-2026-0135",
    orderCode: "BG-260921-0135",
    orderId: "o-0135",
    at: "2026-09-21T18:12:19+08:00",
    customer: "Sarah Lim",
    branchId: "ss15",
    amount: 4869,
    refundedAmount: 4869,
    status: "refunded",
    reference: "MBB-TXN-4410CC28",
    settlementBatch: "MBB-BATCH-20260921-A",
    payoutExpectedOn: "2026-09-23",
    notice:
      "Automatic refund created when SS15 rejected the order. Reversal reference MBB-RF-8842.",
    ...visa("•••• •••• •••• 1902"),
    events: [
      { label: "Payment authorised", at: "21 Sep 2026, 18:12:16", actor: "Maybank" },
      { label: "Payment captured", at: "21 Sep 2026, 18:12:19", actor: "Maybank" },
      { label: "Webhook received", at: "21 Sep 2026, 18:12:22", actor: "System", note: "payment.captured" },
      { label: "Branch rejected the order", at: "21 Sep 2026, 18:16:01", actor: "Branch", note: "An item is unavailable right now" },
      { label: "Refund submitted", at: "21 Sep 2026, 18:16:04", actor: "System", note: "MBB-RF-8842 · full amount" },
      { label: "Refund completed", at: "22 Sep 2026, 09:41:00", actor: "Maybank", note: "Funds returned to the card ending 1902" },
    ],
  },
  {
    id: "pay-0134",
    internalId: "PAY-2026-0134",
    orderCode: "BG-260921-0134",
    orderId: "o-0134",
    at: "2026-09-21T17:40:38+08:00",
    customer: "Nurul Izzah",
    branchId: "taylors",
    amount: 4717,
    status: "paid",
    reference: "OXP-QR-99B21D40",
    settlementBatch: "OXP-BATCH-20260921-1",
    payoutExpectedOn: "2026-09-22",
    notice:
      "Auto-rejected after no branch response in 5 minutes. OXPay cannot reverse this transaction type automatically, so Finance must refund manually.",
    ...qr("DN2026092117403388", "2026-09-21T17:50:00+08:00"),
    events: [
      { label: "Dynamic QR generated", at: "21 Sep 2026, 17:40:02", actor: "OXPay" },
      { label: "Payment captured", at: "21 Sep 2026, 17:40:38", actor: "OXPay" },
      { label: "Webhook received", at: "21 Sep 2026, 17:40:41", actor: "System", note: "duitnow.paid" },
      { label: "Order auto-rejected", at: "21 Sep 2026, 17:45:38", actor: "System", note: "Prototype rule: no branch response within 5 minutes" },
      { label: "Manual refund required", at: "21 Sep 2026, 17:45:39", actor: "System", note: "Queued to Finance" },
    ],
  },
  {
    id: "pay-0133",
    internalId: "PAY-2026-0133",
    orderCode: "BG-260920-0133",
    orderId: "o-0133",
    at: "2026-09-20T19:20:29+08:00",
    customer: "Aisyah Rahman",
    branchId: "ss15",
    amount: 5473,
    status: "paid",
    reference: "MBB-TXN-77C10A55",
    settlementBatch: "MBB-BATCH-20260920-A",
    payoutExpectedOn: "2026-09-22",
    settledOn: "2026-09-22",
    ...visa("•••• •••• •••• 4242"),
    events: [
      { label: "Payment authorised", at: "20 Sep 2026, 19:20:26", actor: "Maybank" },
      { label: "Payment captured", at: "20 Sep 2026, 19:20:29", actor: "Maybank" },
      { label: "Webhook received", at: "20 Sep 2026, 19:20:31", actor: "System", note: "payment.captured" },
      { label: "Settled to the business account", at: "22 Sep 2026, 08:10:00", actor: "Maybank", note: "Batch MBB-BATCH-20260920-A" },
    ],
  },
  {
    id: "pay-0132",
    internalId: "PAY-2026-0132",
    orderCode: "BG-260918-0132",
    orderId: "o-0132",
    at: "2026-09-18T12:40:44+08:00",
    customer: "Aisyah Rahman",
    branchId: "taylors",
    amount: 1579,
    refundedAmount: 250,
    status: "partially_refunded",
    reference: "OXP-QR-2277AA10",
    settlementBatch: "OXP-BATCH-20260918-3",
    payoutExpectedOn: "2026-09-19",
    settledOn: "2026-09-19",
    notice: "One unavailable drink was refunded; the food order was completed.",
    ...qr("DN2026091812404410", "2026-09-18T12:50:00+08:00"),
    events: [
      { label: "Dynamic QR generated", at: "18 Sep 2026, 12:40:10", actor: "OXPay" },
      { label: "Payment captured", at: "18 Sep 2026, 12:40:44", actor: "OXPay" },
      { label: "Webhook received", at: "18 Sep 2026, 12:40:47", actor: "System", note: "duitnow.paid" },
      { label: "Partial refund submitted", at: "18 Sep 2026, 13:02:00", actor: "Finance", note: "RM2.50 · unavailable drink" },
      { label: "Refund completed", at: "19 Sep 2026, 10:14:00", actor: "OXPay", note: "OXP-RF-1180" },
      { label: "Settled net of refund", at: "19 Sep 2026, 08:05:00", actor: "OXPay" },
    ],
  },
  {
    id: "pay-0131",
    internalId: "PAY-2026-0131",
    orderCode: "BG-260921-0131",
    orderId: "o-0131",
    at: "2026-09-21T17:05:12+08:00",
    customer: "Daniel Foo",
    branchId: "ss15",
    amount: 3300,
    status: "paid",
    reference: "MBB-TXN-3390FF12",
    settlementBatch: "MBB-BATCH-20260921-A",
    payoutExpectedOn: "2026-09-23",
    notice:
      "Lalamove found no rider, so this paid order needs a refund decision. It is in the refund queue.",
    ...visa("•••• •••• •••• 3310"),
    events: [
      { label: "Payment authorised", at: "21 Sep 2026, 17:05:09", actor: "Maybank" },
      { label: "Payment captured", at: "21 Sep 2026, 17:05:12", actor: "Maybank" },
      { label: "Webhook received", at: "21 Sep 2026, 17:05:15", actor: "System", note: "payment.captured" },
      { label: "Delivery failed", at: "21 Sep 2026, 17:37:00", actor: "System", note: "No rider accepted within 12 minutes" },
    ],
  },
  {
    id: "pay-0130",
    internalId: "PAY-2026-0130",
    orderCode: "BG-260921-0130",
    orderId: "o-0130",
    at: "2026-09-21T18:44:20+08:00",
    customer: "Mei Ling Chow",
    branchId: "taylors",
    amount: 3498,
    status: "paid",
    reference: "OXP-QR-6631CD07",
    settlementBatch: "OXP-BATCH-20260921-2",
    payoutExpectedOn: "2026-09-22",
    ...qr("DN2026092118441120", "2026-09-21T18:54:00+08:00"),
    events: [
      { label: "Dynamic QR generated", at: "21 Sep 2026, 18:43:52", actor: "OXPay" },
      { label: "Payment captured", at: "21 Sep 2026, 18:44:20", actor: "OXPay" },
      { label: "Webhook received", at: "21 Sep 2026, 18:44:24", actor: "System", note: "duitnow.paid" },
    ],
  },
  {
    id: "pay-0129",
    internalId: "PAY-2026-0129",
    orderCode: "BG-260921-0129",
    orderId: "o-0129",
    at: "2026-09-21T19:06:10+08:00",
    customer: "Hafiz Zainal",
    branchId: "ss15",
    amount: 2547,
    status: "expired",
    reference: "OXP-QR-PENDING-0129",
    notice:
      "The QR was never scanned, so no money moved. The customer can generate a new QR from the payment screen.",
    ...qr("DN2026092119061000", "2026-09-21T19:16:00+08:00"),
    events: [
      { label: "Dynamic QR generated", at: "21 Sep 2026, 19:06:10", actor: "OXPay", note: "Valid for 10 minutes" },
      { label: "QR expired without payment", at: "21 Sep 2026, 19:16:10", actor: "OXPay" },
      { label: "Order left unpaid", at: "21 Sep 2026, 19:16:12", actor: "System", note: "Customer may cancel or retry" },
    ],
  },
  {
    id: "pay-0128",
    internalId: "PAY-2026-0128",
    orderCode: "BG-260921-0141",
    at: "2026-09-21T16:48:02+08:00",
    customer: "Farhan Idris",
    branchId: "ss15",
    amount: 4180,
    status: "declined",
    reference: "MBB-TXN-DEC-77B1",
    bankResponseCode: "51",
    bankResponseText: "Insufficient funds",
    notice:
      "No money left the customer's account and no order was created. Nothing to refund.",
    ...visa("•••• •••• •••• 8890"),
    events: [
      { label: "Payment attempt received", at: "21 Sep 2026, 16:48:00", actor: "System" },
      { label: "Authorisation declined", at: "21 Sep 2026, 16:48:02", actor: "Maybank", note: "Response code 51 · Insufficient funds" },
      { label: "Customer shown a retry screen", at: "21 Sep 2026, 16:48:03", actor: "System", note: "Card details are never stored" },
    ],
  },
  {
    id: "pay-0127",
    internalId: "PAY-2026-0127",
    orderCode: "BG-260921-0142",
    at: "2026-09-21T16:20:44+08:00",
    customer: "Suriani Abdullah",
    branchId: "taylors",
    amount: 2890,
    status: "delayed",
    reference: "OXP-QR-DLY-2210",
    notice:
      "OXPay has the payment but the bank confirmation is late. The customer sees a waiting screen and cannot be charged twice — the order is locked to this single reference.",
    ...qr("DN2026092116204400", "2026-09-21T16:30:00+08:00"),
    events: [
      { label: "Dynamic QR generated", at: "21 Sep 2026, 16:20:20", actor: "OXPay" },
      { label: "QR scanned by customer", at: "21 Sep 2026, 16:20:44", actor: "OXPay" },
      { label: "Bank confirmation pending", at: "21 Sep 2026, 16:21:10", actor: "OXPay", note: "Retry window 30 minutes" },
      { label: "Duplicate charge blocked", at: "21 Sep 2026, 16:23:02", actor: "System", note: "Second scan rejected — one reference per order" },
    ],
  },
  {
    id: "pay-0126",
    internalId: "PAY-2026-0126",
    orderCode: "BG-260921-0143",
    at: "2026-09-21T15:58:31+08:00",
    customer: "Jeremy Wong",
    branchId: "ss15",
    amount: 6720,
    status: "processing",
    reference: "MBB-TXN-PRC-1188",
    ...visa("•••• •••• •••• 2201"),
    events: [
      { label: "Payment authorised", at: "21 Sep 2026, 15:58:29", actor: "Maybank" },
      { label: "Capture requested", at: "21 Sep 2026, 15:58:31", actor: "System" },
      { label: "Waiting for capture confirmation", at: "21 Sep 2026, 15:58:33", actor: "Maybank" },
    ],
  },
  {
    id: "pay-0125",
    internalId: "PAY-2026-0125",
    orderCode: "BG-260920-0144",
    at: "2026-09-20T13:12:09+08:00",
    customer: "Priya Raman",
    branchId: "taylors",
    amount: 3150,
    status: "declined",
    reference: "MBB-TXN-DEC-5521",
    bankResponseCode: "05",
    bankResponseText: "Do not honour",
    notice: "The issuing bank gave no reason. The customer paid again with DuitNow QR instead.",
    ...visa("•••• •••• •••• 6612"),
    events: [
      { label: "Payment attempt received", at: "20 Sep 2026, 13:12:07", actor: "System" },
      { label: "Authorisation declined", at: "20 Sep 2026, 13:12:09", actor: "Maybank", note: "Response code 05 · Do not honour" },
    ],
  },
];

export const txById = (id: string) => TRANSACTIONS.find((t) => t.id === id);

/* ------------------------------------------------------------------ */
/* Reconciliation                                                      */
/* ------------------------------------------------------------------ */

export interface Mismatch {
  id: string;
  reference: string;
  provider: PaymentProvider;
  ours: number;
  theirs: number;
  detail: string;
}

export const MISMATCHES: Mismatch[] = [
  {
    id: "mm-1",
    reference: "OXP-QR-6631CD07",
    provider: "OXPay",
    ours: 3498,
    theirs: 3398,
    detail:
      "OXPay's settlement file is RM1.00 lower than our record. Likely a provider fee posted against the transaction instead of the batch.",
  },
  {
    id: "mm-2",
    reference: "MBB-TXN-PRC-1188",
    provider: "Maybank",
    ours: 6720,
    theirs: 0,
    detail:
      "Authorised but no capture webhook after 90 minutes. Check the Maybank portal before refunding — the customer may already be charged.",
  },
];

/* ------------------------------------------------------------------ */
/* Refund queue                                                       */
/* ------------------------------------------------------------------ */

export type RefundStatus = "pending" | "approved" | "processing" | "completed" | "rejected";

export const REFUND_STATUS: Record<RefundStatus, { label: string; tone: Tone; icon: IconKey }> = {
  pending: { label: "Pending approval", tone: "warning", icon: "hourglass" },
  approved: { label: "Approved", tone: "info", icon: "check" },
  processing: { label: "Processing", tone: "info", icon: "refund" },
  completed: { label: "Completed", tone: "success", icon: "check-double" },
  rejected: { label: "Rejected", tone: "danger", icon: "cross" },
};

export interface RefundRequest {
  id: string;
  paymentId: string;
  orderCode: string;
  customer: string;
  branchId: string;
  amount: number;
  orderTotal: number;
  reason: string;
  requestedBy: string;
  origin: "automatic" | "manual";
  requestedAt: string;
  status: RefundStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  bankReference?: string;
  note?: string;
}

export const REFUND_REQUESTS: RefundRequest[] = [
  {
    id: "rf-1",
    paymentId: "pay-0135",
    orderCode: "BG-260921-0135",
    customer: "Sarah Lim",
    branchId: "ss15",
    amount: 4869,
    orderTotal: 4869,
    reason: "Branch rejected the order — Cheese Lover's Set unavailable",
    requestedBy: "System (branch rejection)",
    origin: "automatic",
    requestedAt: "21 Sep 2026, 18:16",
    status: "completed",
    method: "visa",
    provider: "Maybank",
    bankReference: "MBB-RF-8842",
    note: "Reversal accepted by Maybank and confirmed the next morning.",
  },
  {
    id: "rf-2",
    paymentId: "pay-0134",
    orderCode: "BG-260921-0134",
    customer: "Nurul Izzah",
    branchId: "taylors",
    amount: 4717,
    orderTotal: 4717,
    reason: "No branch response within 5 minutes (prototype rule)",
    requestedBy: "System (auto-reject timeout)",
    origin: "automatic",
    requestedAt: "21 Sep 2026, 17:45",
    status: "pending",
    method: "duitnow_qr",
    provider: "OXPay",
    note: "OXPay cannot reverse this transaction type automatically. Finance must transfer manually and record the bank reference.",
  },
  {
    id: "rf-3",
    paymentId: "pay-0131",
    orderCode: "BG-260921-0131",
    customer: "Daniel Foo",
    branchId: "ss15",
    amount: 3300,
    orderTotal: 3300,
    reason: "Lalamove could not find a rider and the food was never collected",
    requestedBy: "Jun Ho Park · Branch Manager",
    origin: "manual",
    requestedAt: "21 Sep 2026, 17:41",
    status: "pending",
    method: "visa",
    provider: "Maybank",
  },
  {
    id: "rf-4",
    paymentId: "pay-0132",
    orderCode: "BG-260918-0132",
    customer: "Aisyah Rahman",
    branchId: "taylors",
    amount: 250,
    orderTotal: 1579,
    reason: "Drink unavailable — item refunded, food kept",
    requestedBy: "Grace Tan · Finance",
    origin: "manual",
    requestedAt: "18 Sep 2026, 13:02",
    status: "completed",
    method: "duitnow_qr",
    provider: "OXPay",
    bankReference: "OXP-RF-1180",
  },
  {
    id: "rf-5",
    paymentId: "pay-0130",
    orderCode: "BG-260921-0130",
    customer: "Mei Ling Chow",
    branchId: "taylors",
    amount: 900,
    orderTotal: 3498,
    reason: "One kimbap missing from the collected bag",
    requestedBy: "Ravi Menon · Branch Manager",
    origin: "manual",
    requestedAt: "21 Sep 2026, 19:22",
    status: "approved",
    method: "duitnow_qr",
    provider: "OXPay",
  },
  {
    id: "rf-6",
    paymentId: "pay-0136",
    orderCode: "BG-260921-0136",
    customer: "Kumar Devaraj",
    branchId: "taylors",
    amount: 11342,
    orderTotal: 11342,
    reason: "Customer claims the platter never arrived",
    requestedBy: "Farah Yusof · Branch Staff",
    origin: "manual",
    requestedAt: "21 Sep 2026, 19:35",
    status: "rejected",
    method: "visa",
    provider: "Maybank",
    note: "Rider delivery photograph and the customer's signature confirm the drop-off. Rejected with an explanation sent by email.",
  },
  {
    id: "rf-7",
    paymentId: "pay-0137",
    orderCode: "BG-260921-0137",
    customer: "Wei Jie Tan",
    branchId: "ss15",
    amount: 2067,
    orderTotal: 2067,
    reason: "Customer changed their mind before the kitchen started",
    requestedBy: "Grace Tan · Finance",
    origin: "manual",
    requestedAt: "21 Sep 2026, 18:58",
    status: "processing",
    method: "duitnow_qr",
    provider: "OXPay",
  },
];

/* ------------------------------------------------------------------ */
/* Promotions — admin-only fields                                      */
/* ------------------------------------------------------------------ */

export interface PromoMeta {
  usage: number;
  cap: number;
  startsOn: string;
  firstOrderOnly: boolean;
  fulfilment: "all" | "delivery" | "pickup";
  active: boolean;
  usageByWeek: number[];
  revenue: number;
}

export const PROMO_META: Record<string, PromoMeta> = {
  "promo-student": {
    usage: 412,
    cap: 600,
    startsOn: "2026-01-06",
    firstOrderOnly: false,
    fulfilment: "all",
    active: true,
    usageByWeek: [38, 44, 51, 47, 62, 58, 66, 46],
    revenue: 512400,
  },
  "promo-lunch": {
    usage: 289,
    cap: 400,
    startsOn: "2026-03-02",
    firstOrderOnly: false,
    fulfilment: "all",
    active: true,
    usageByWeek: [22, 31, 34, 40, 38, 42, 39, 43],
    revenue: 388600,
  },
  "promo-weekend": {
    usage: 74,
    cap: 150,
    startsOn: "2026-05-09",
    firstOrderOnly: false,
    fulfilment: "delivery",
    active: true,
    usageByWeek: [6, 8, 9, 11, 10, 8, 12, 10],
    revenue: 741200,
  },
};

export const PROMO_TYPE_LABEL = {
  percentage: "Percentage off",
  fixed: "Fixed amount off",
  free_delivery: "Free delivery",
  bundle: "Bundle price",
} as const;

/* ------------------------------------------------------------------ */
/* Small formatters (src/lib/format.ts is owned by another agent)      */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-21T19:02:41+08:00" → "21 Sep 2026" */
export function dateLabel(iso: string): string {
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "2026-09-21T19:02:41+08:00" → "19:02" */
export function timeLabel(iso: string): string {
  const time = iso.split("T")[1] ?? "";
  return time.slice(0, 5);
}

export function dayOnly(iso: string): string {
  return iso.split("T")[0];
}
