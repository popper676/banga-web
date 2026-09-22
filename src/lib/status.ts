import type { OrderStatus, PaymentStatus, Availability } from "./types";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * Status is never colour alone — every entry carries an icon name and a text
 * label, and the badge component renders both.
 */
export interface StatusMeta {
  /** What operations staff see */
  admin: string;
  /** What the customer sees */
  customer: string;
  tone: Tone;
  icon: IconName;
  /** Step in the customer-facing tracker, or null if it is not a tracker step */
  step: 0 | 1 | 2 | 3 | 4 | null;
}

export type IconName =
  | "clock"
  | "check"
  | "check-double"
  | "cross"
  | "cook"
  | "bag"
  | "bike"
  | "pin"
  | "alert"
  | "refund"
  | "card"
  | "qr"
  | "hourglass";

export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  PENDING_PAYMENT: { admin: "Pending payment", customer: "Waiting for payment", tone: "neutral", icon: "clock", step: null },
  PAID: { admin: "Paid", customer: "Payment received", tone: "success", icon: "check", step: 0 },
  WAITING_FOR_BRANCH: { admin: "Waiting for branch", customer: "Sending to the kitchen", tone: "warning", icon: "hourglass", step: 0 },
  ACCEPTED: { admin: "Accepted", customer: "Order confirmed", tone: "success", icon: "check", step: 0 },
  REJECTED: { admin: "Rejected", customer: "Order declined", tone: "danger", icon: "cross", step: null },
  PREPARING: { admin: "Preparing", customer: "Cooking now", tone: "info", icon: "cook", step: 1 },
  READY: { admin: "Ready", customer: "Ready", tone: "info", icon: "bag", step: 2 },
  LALAMOVE_BOOKED: { admin: "Lalamove booked", customer: "Finding your rider", tone: "info", icon: "bike", step: 2 },
  RIDER_PICKED_UP: { admin: "Rider picked up", customer: "Picked up", tone: "info", icon: "bike", step: 3 },
  OUT_FOR_DELIVERY: { admin: "Out for delivery", customer: "On the way", tone: "info", icon: "bike", step: 3 },
  DELIVERED: { admin: "Delivered", customer: "Delivered", tone: "success", icon: "pin", step: 4 },
  COMPLETED: { admin: "Completed", customer: "Completed", tone: "success", icon: "check-double", step: 4 },
  REFUND_PENDING: { admin: "Refund pending", customer: "Refund in progress", tone: "warning", icon: "refund", step: null },
  REFUNDED: { admin: "Refunded", customer: "Refunded", tone: "success", icon: "refund", step: null },
  FAILED: { admin: "Failed", customer: "Something went wrong", tone: "danger", icon: "alert", step: null },
  CANCELLED: { admin: "Cancelled", customer: "Cancelled", tone: "neutral", icon: "cross", step: null },
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone; icon: IconName }> = {
  unpaid: { label: "Unpaid", tone: "neutral", icon: "clock" },
  processing: { label: "Processing", tone: "info", icon: "hourglass" },
  paid: { label: "Paid", tone: "success", icon: "check" },
  declined: { label: "Declined", tone: "danger", icon: "cross" },
  expired: { label: "QR expired", tone: "warning", icon: "clock" },
  delayed: { label: "Confirmation delayed", tone: "warning", icon: "hourglass" },
  refund_pending: { label: "Refund pending", tone: "warning", icon: "refund" },
  refunded: { label: "Refunded", tone: "success", icon: "refund" },
  manual_refund_required: { label: "Manual refund required", tone: "danger", icon: "alert" },
};

export const AVAILABILITY: Record<Availability, { label: string; tone: Tone; icon: IconName }> = {
  available: { label: "Available", tone: "success", icon: "check" },
  low: { label: "Low stock", tone: "warning", icon: "alert" },
  sold_out: { label: "Sold out", tone: "danger", icon: "cross" },
};

/** Customer-facing tracker steps. Pickup replaces the last two. */
export const DELIVERY_STEPS = ["Confirmed", "Preparing", "Ready", "On the way", "Delivered"] as const;
export const PICKUP_STEPS = ["Confirmed", "Preparing", "Ready for pickup", "Collected"] as const;

/** Legal transitions — the admin status control only ever offers these. */
export const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ["PAID", "FAILED", "CANCELLED"],
  PAID: ["WAITING_FOR_BRANCH"],
  WAITING_FOR_BRANCH: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING"],
  REJECTED: ["REFUND_PENDING"],
  PREPARING: ["READY"],
  READY: ["LALAMOVE_BOOKED", "COMPLETED"],
  LALAMOVE_BOOKED: ["RIDER_PICKED_UP", "FAILED"],
  RIDER_PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: ["REFUND_PENDING"],
  REFUND_PENDING: ["REFUNDED", "FAILED"],
  FAILED: ["REFUND_PENDING", "CANCELLED"],
};

export const REJECTION_REASONS = [
  "An item is unavailable right now",
  "The kitchen is too busy to take this order",
  "We are outside opening hours",
  "Delivery is not possible to this address",
  "Duplicate order",
] as const;

/** A customer may only cancel before payment completes. */
export function canCustomerCancel(status: OrderStatus): boolean {
  return status === "PENDING_PAYMENT";
}
