/**
 * Typed domain model for the BANG GA BANG GA prototype.
 * UI only — every value here is served from src/lib/mock-data.ts.
 */

export type FulfilmentType = "pickup" | "delivery";

export type Availability = "available" | "low" | "sold_out";

export interface Branch {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  lat: number;
  lng: number;
  deliveryRadiusKm: number;
  supportsDineIn: boolean;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  prepTimeMinutes: number;
  /** Mon=1 … Sun=7 */
  hours: { day: number; opens: string; closes: string }[];
  /** Simulated distance from the prototype's mock user location */
  distanceKm: number;
  mapHint: string;
}

export interface OptionChoice {
  id: string;
  name: string;
  priceDelta: number;
  soldOutAt?: string[];
}

export interface OptionGroup {
  id: string;
  name: string;
  helper?: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  choices: OptionChoice[];
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  koreanName?: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  tags: string[];
  spiceLevel: 0 | 1 | 2 | 3;
  allergens: string[];
  muslimFriendly: boolean;
  popular: boolean;
  signature: boolean;
  optionGroupIds: string[];
  /** Per-branch availability, keyed by branch id */
  availability: Record<string, Availability>;
  promotionId?: string;
  kcal: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  icon: string;
}

export interface Promotion {
  id: string;
  code?: string;
  name: string;
  badge: string;
  description: string;
  type: "percentage" | "fixed" | "free_delivery" | "bundle";
  value: number;
  minSpend: number;
  branchIds: string[];
  endsOn: string;
  terms: string[];
}

export interface CartLineOption {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  priceDelta: number;
}

export interface CartLine {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  options: CartLineOption[];
  notes?: string;
  /** Set when a branch switch or revalidation made this line unavailable */
  unavailableAt?: string;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "WAITING_FOR_BRANCH"
  | "ACCEPTED"
  | "REJECTED"
  | "PREPARING"
  | "READY"
  | "LALAMOVE_BOOKED"
  | "RIDER_PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "FAILED"
  | "CANCELLED";

export type PaymentMethod = "visa" | "duitnow_qr";

export type PaymentProvider = "Maybank" | "OXPay";

export type PaymentStatus =
  | "unpaid"
  | "processing"
  | "paid"
  | "declined"
  | "expired"
  | "delayed"
  | "refund_pending"
  | "refunded"
  | "manual_refund_required";

export interface PaymentRecord {
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  reference: string;
  maskedCard?: string;
  paidAt?: string;
  refundReference?: string;
  refundRequestedAt?: string;
  refundCompletedAt?: string;
  refundNote?: string;
  manualRefundReason?: string;
}

export interface DeliveryRecord {
  provider: "Lalamove";
  quotationId?: string;
  bookingId?: string;
  fee: number;
  status: "not_booked" | "finding_rider" | "assigned" | "picked_up" | "delivering" | "delivered" | "failed";
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  riderPlate?: string;
  etaMinutes?: number;
  failureReason?: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  state: string;
  notes?: string;
  isDefault: boolean;
}

export interface OrderEvent {
  status: OrderStatus;
  label: string;
  at: string;
  actor: "system" | "customer" | "branch" | "kitchen" | "rider";
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  isGuest: boolean;
  branchId: string;
  fulfilment: FulfilmentType;
  address?: Address;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  events: OrderEvent[];
  payment: PaymentRecord;
  delivery?: DeliveryRecord;
  promotionCode?: string;
  customerNotes?: string;
  rejectionReason?: string;
  /** Prototype rule: branch must respond within 5 minutes */
  branchSlaSeconds: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedOn: string;
  orderCount: number;
  lifetimeSpend: number;
  favouriteBranchId: string;
  tags: string[];
}

export type AdminRole =
  | "Super Admin"
  | "Branch Manager"
  | "Branch Staff"
  | "Kitchen"
  | "Finance";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  branchId: string | null;
  lastActive: string;
  active: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  role: AdminRole;
  action: string;
  entity: string;
  detail: string;
}
