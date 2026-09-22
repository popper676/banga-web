/**
 * The delivery manifest for this prototype.
 *
 * Every screen, the states it demonstrates, and where a real asset or a real
 * backend still has to replace a simulation. Rendered by /prototype.
 */

export type Platform = "web" | "ios" | "android" | "admin";

export interface ScreenEntry {
  id: string;
  name: string;
  route: string;
  /** Falsey when the screen only exists inside a device-frame gallery. */
  linkable?: boolean;
  purpose: string;
  states: string[];
}

export interface ScreenGroup {
  id: string;
  title: string;
  platform: Platform;
  intro: string;
  screens: ScreenEntry[];
}

/* ================================================================== */
/* Customer website                                                    */
/* ================================================================== */

const WEB_MARKETING: ScreenGroup = {
  id: "web-marketing",
  title: "Website · brand and discovery",
  platform: "web",
  intro:
    "The storytelling half of the site. This is the only place where scroll reveals and 2.5D depth are allowed, and every effect has a static fallback.",
  screens: [
    {
      id: "home",
      name: "Homepage",
      route: "/",
      linkable: true,
      purpose:
        "Eight-section scroll story: hero, brand story, food identity rail, everyday moments, featured menu, photo booth, locations, closing call to action.",
      states: ["Scroll reveal", "2.5D hero", "Reduced motion", "Live order banner", "Branch selected", "No branch selected"],
    },
    {
      id: "story",
      name: "Our story",
      route: "/story",
      linkable: true,
      purpose: "Long-form brand narrative, halal assurance, the people and the method.",
      states: ["Default", "Reduced motion"],
    },
    {
      id: "promotions",
      name: "Promotions",
      route: "/promotions",
      linkable: true,
      purpose: "Current offers with conditions, validity and branch scope stated up front.",
      states: ["Active offers", "Expiring soon", "Branch-specific", "No active offers"],
    },
    {
      id: "photo-booth",
      name: "Photo booth",
      route: "/photo-booth",
      linkable: true,
      purpose: "The secondary in-store experience concept, shown as an editorial feature.",
      states: ["Default", "Strip gallery"],
    },
    {
      id: "locations",
      name: "Locations",
      route: "/locations",
      linkable: true,
      purpose: "Both branches with hours, distance, fulfilment modes and a route to order.",
      states: ["Open", "Closed", "Not accepting orders", "Future branch coming soon"],
    },
    {
      id: "branch-detail",
      name: "Branch detail",
      route: "/locations/ss15",
      linkable: true,
      purpose: "One branch in depth: map, full weekly hours, contact, delivery radius, parking.",
      states: ["Open", "Closed today", "Paused with a reason"],
    },
    {
      id: "contact",
      name: "Contact",
      route: "/contact",
      linkable: true,
      purpose: "General enquiries, per-branch phone numbers and a support form.",
      states: ["Empty form", "Validation errors", "Submitted"],
    },
  ],
};

const WEB_ORDERING: ScreenGroup = {
  id: "web-ordering",
  title: "Website · ordering flow",
  platform: "web",
  intro:
    "Deliberately motion-light. From here on the interface is fast and flat, and the amount owed is never off screen at a moment of decision.",
  screens: [
    {
      id: "menu",
      name: "Menu",
      route: "/menu",
      linkable: true,
      purpose: "Category navigation, filters, per-branch availability and quick add.",
      states: ["Loaded", "Loading skeletons", "Filtered", "Sold out items", "Branch closed", "No results"],
    },
    {
      id: "product",
      name: "Dish detail",
      route: "/menu/soy-garlic-boneless",
      linkable: true,
      purpose: "Required and optional option groups, add-ons with price deltas, kitchen note.",
      states: ["Available", "Sold out at this branch", "Option validation error", "Promotion applied"],
    },
    {
      id: "search",
      name: "Search results",
      route: "/search?q=kimchi",
      linkable: true,
      purpose: "Cross-menu search with matching categories and promotions.",
      states: ["Results", "Empty query", "Zero results", "Loading"],
    },
    {
      id: "cart",
      name: "Cart",
      route: "/cart",
      linkable: true,
      purpose: "Line editing, promo code, fulfilment toggle, minimum order rules, upsell.",
      states: ["Items", "Empty", "Unavailable line", "Below minimum", "Branch closed", "Promo applied", "Promo rejected"],
    },
    {
      id: "checkout",
      name: "Checkout",
      route: "/checkout",
      linkable: true,
      purpose: "Fulfilment choice, address or pickup details, scheduling, contact, order note.",
      states: ["Delivery", "Pickup", "New address", "Outside delivery radius", "Validation errors", "Scheduled later"],
    },
    {
      id: "payment",
      name: "Payment",
      route: "/checkout/payment",
      linkable: true,
      purpose:
        "Visa via Maybank and DuitNow dynamic QR via OXPay, with every failure mode a customer can actually hit.",
      states: [
        "Method selection",
        "Card entry",
        "Card validation error",
        "Processing",
        "Declined",
        "Duplicate prevented",
        "Confirmation delayed",
        "Success",
        "QR generating",
        "QR live with countdown",
        "QR not yet paid",
        "QR expired",
        "Already paid",
        "Offline",
      ],
    },
    {
      id: "confirmation",
      name: "Order confirmed",
      route: "/checkout/confirmation",
      linkable: true,
      purpose: "Paid, now waiting on the branch. Shows the response window and the refund promise.",
      states: ["Waiting for branch", "Accepted", "Rejected with automatic refund", "Timed out with automatic refund"],
    },
    {
      id: "tracking",
      name: "Live order tracking",
      route: "/orders/o-0138",
      linkable: true,
      purpose: "Status timeline, ETA, rider details, map, and the rules on what can still be changed.",
      states: [
        "Preparing",
        "Ready for pickup",
        "Searching for a rider",
        "No rider available",
        "Out for delivery",
        "Delivered",
        "Delivery failed",
        "Cancelled",
        "Refunded",
      ],
    },
    {
      id: "receipt",
      name: "Receipt",
      route: "/orders/o-0138/receipt",
      linkable: true,
      purpose: "Print-ready itemised receipt with provider references and any refund.",
      states: ["Paid", "Refunded", "Partially refunded", "Print layout"],
    },
    {
      id: "track",
      name: "Find my order",
      route: "/track",
      linkable: true,
      purpose: "Guest lookup by order code plus phone or email.",
      states: ["Empty", "Not found", "Found", "Signed-in shortcut"],
    },
  ],
};

const WEB_ACCOUNT: ScreenGroup = {
  id: "web-account",
  title: "Website · account and system",
  platform: "web",
  intro:
    "Authentication is simulated throughout. No credential is ever validated, stored or transmitted in this prototype.",
  screens: [
    { id: "login", name: "Sign in", route: "/login", linkable: true, purpose: "Email or phone sign-in with a simulated outcome.", states: ["Empty", "Validation errors", "Wrong credentials", "Success"] },
    { id: "register", name: "Create account", route: "/register", linkable: true, purpose: "Registration with password strength and a simulated one-time code.", states: ["Empty", "Validation errors", "Email already registered", "OTP step", "Success"] },
    { id: "guest", name: "Continue as guest", route: "/guest", linkable: true, purpose: "Order without an account, with the trade-offs stated.", states: ["Empty", "Validation errors", "Ready to continue"] },
    { id: "account", name: "Account overview", route: "/account", linkable: true, purpose: "Profile, saved payment methods, loyalty and quick links.", states: ["Signed in", "Signed out", "Active order pinned"] },
    { id: "addresses", name: "Saved addresses", route: "/account/addresses", linkable: true, purpose: "Address book with default, notes and distance to branch.", states: ["List", "Empty", "Add", "Outside radius error"] },
    { id: "order-history", name: "Order history", route: "/account/orders", linkable: true, purpose: "Past orders with reorder and receipt access.", states: ["All", "Active", "Completed", "Cancelled and refunded", "Empty", "Reorder with unavailable items"] },
    { id: "notifications", name: "Notification preferences", route: "/account/notifications", linkable: true, purpose: "Channel matrix plus notification history.", states: ["Defaults", "All off", "Order updates locked on"] },
    { id: "legal", name: "Legal documents", route: "/legal/refunds", linkable: true, purpose: "Terms, privacy, refund policy, halal assurance and cookies.", states: ["Terms", "Privacy", "Refund policy", "Halal", "Cookies", "Unknown document"] },
    { id: "offline", name: "Offline", route: "/offline", linkable: true, purpose: "What still works without a connection and what does not.", states: ["Offline", "Reconnecting"] },
    { id: "notfound", name: "Not found", route: "/this-route-does-not-exist", linkable: true, purpose: "404 with a search field and routes back into the menu.", states: ["404"] },
    { id: "errorboundary", name: "Error boundary", route: "/", linkable: false, purpose: "Global error screen with a request id and a reset action.", states: ["Fatal error"] },
  ],
};

/* ================================================================== */
/* Mobile                                                             */
/* ================================================================== */

const MOBILE: ScreenGroup = {
  id: "mobile",
  title: "Mobile applications · iOS and Android",
  platform: "ios",
  intro:
    "Every mobile screen is designed twice, once per platform, at 393×852 for iOS and 360×800 for Android. The chrome, the sheets, the switches and the feedback patterns all follow the host platform rather than being drawn once and stretched.",
  screens: [
    { id: "m-gallery", name: "Frame gallery index", route: "/mobile", linkable: true, purpose: "Entry point explaining the two platforms and linking every frame.", states: ["Index"] },
    { id: "m-ios", name: "All iOS frames", route: "/mobile/ios", linkable: true, purpose: "Complete iOS screen set in device frames.", states: ["All iOS screens"] },
    { id: "m-android", name: "All Android frames", route: "/mobile/android", linkable: true, purpose: "Complete Android screen set in device frames.", states: ["All Android screens"] },
    { id: "m-flow", name: "Ordering flow sequence", route: "/mobile/flow", linkable: true, purpose: "The full order journey laid out left to right for both platforms.", states: ["Sequence"] },
    { id: "m-onboarding", name: "Splash and onboarding", route: "/mobile/ios#onboarding", linkable: false, purpose: "Brand splash then three onboarding cards.", states: ["Splash", "Onboarding 1 to 3", "Skip"] },
    { id: "m-branch", name: "Location permission and branch selector", route: "/mobile/ios#branch", linkable: false, purpose: "Platform-native permission prompt then branch choice.", states: ["Permission", "Denied", "Branch list", "Closed branch", "Coming soon branch"] },
    { id: "m-home", name: "Home", route: "/mobile/ios#home", linkable: false, purpose: "Greeting, branch chip, promos, categories, featured dishes.", states: ["Default", "Live order banner"] },
    { id: "m-menu", name: "Menu and search", route: "/mobile/ios#menu", linkable: false, purpose: "Sticky category tabs, dish list, filters, search.", states: ["Browse", "Filtered", "Sold out", "Search focus", "Results", "Zero results"] },
    { id: "m-dish", name: "Dish detail", route: "/mobile/ios#dish", linkable: false, purpose: "Options, add-ons, quantity and a sticky add-to-cart bar.", states: ["Available", "Required option missing", "Sold out"] },
    { id: "m-cart", name: "Cart and checkout", route: "/mobile/ios#cart", linkable: false, purpose: "Line editing then fulfilment, address and contact.", states: ["Items", "Unavailable line", "Empty", "Delivery", "Pickup"] },
    { id: "m-payment", name: "Payment", route: "/mobile/ios#payment", linkable: false, purpose: "Visa via Maybank and DuitNow QR via OXPay on a phone.", states: ["Method choice", "Card entry", "Processing", "Success", "Declined", "QR live", "QR expired", "Delayed"] },
    { id: "m-confirm", name: "Confirmation and tracking", route: "/mobile/ios#confirm", linkable: false, purpose: "Branch response window then the live timeline.", states: ["Waiting", "Accepted", "Rejected and refunded", "Timed out", "Out for delivery", "Pickup code"] },
    { id: "m-account", name: "Orders, receipt and account", route: "/mobile/ios#account", linkable: false, purpose: "History, receipt sheet, profile, addresses, cards, preferences.", states: ["List", "Receipt sheet", "Profile", "Signed out"] },
    { id: "m-system", name: "Notifications and system states", route: "/mobile/ios#system", linkable: false, purpose: "Push permission, notification list, offline, error, force update.", states: ["Permission", "Notifications", "Offline", "Server error", "Force update"] },
  ],
};

/* ================================================================== */
/* Admin                                                              */
/* ================================================================== */

const ADMIN_OPS: ScreenGroup = {
  id: "admin-ops",
  title: "Admin console · live operations",
  platform: "admin",
  intro:
    "Denser, calmer and faster than the customer site. These are the screens branch staff look at all evening, so nothing animates and nothing hides behind a hover.",
  screens: [
    { id: "a-login", name: "Admin sign-in", route: "/admin/login", linkable: true, purpose: "Staff sign-in with branch scope and a simulated second factor.", states: ["Empty", "Wrong password", "Locked", "Two-factor", "Success"] },
    { id: "a-dashboard", name: "Dashboard", route: "/admin", linkable: true, purpose: "Today's figures, what needs attention, and branch comparison.", states: ["Normal", "Needs attention", "Quiet day", "Loading"] },
    { id: "a-orders", name: "Order management", route: "/admin/orders", linkable: true, purpose: "Filterable order table with bulk actions and a detail drawer.", states: ["All", "Saved views", "Filtered", "Bulk selection", "Empty", "Loading"] },
    { id: "a-order", name: "Order detail", route: "/admin/orders/o-0138", linkable: true, purpose: "Everything about one order plus the legal next actions.", states: ["Waiting", "Preparing", "Out for delivery", "Completed", "Rejected", "Refunded"] },
    { id: "a-confirm", name: "Branch confirmation queue", route: "/admin/confirmation", linkable: true, purpose: "Accept or reject incoming orders inside the response window.", states: ["Queue with countdown", "Accepting", "Rejecting with a reason", "Timed out", "All caught up"] },
    { id: "a-kitchen", name: "Kitchen status board", route: "/admin/kitchen", linkable: true, purpose: "Glanceable board from confirmed through to handed over.", states: ["Normal", "Late orders", "Busy mode", "Full-screen board", "Empty"] },
    { id: "a-delivery", name: "Delivery booking and tracking", route: "/admin/delivery", linkable: true, purpose: "Courier quote, rider assignment and live delivery state.", states: ["Quote", "Searching", "No rider available", "Assigned", "Picked up", "Delivered", "Failed"] },
  ],
};

const ADMIN_CATALOGUE: ScreenGroup = {
  id: "admin-catalogue",
  title: "Admin console · catalogue",
  platform: "admin",
  intro: "Menu, options and stock are all per branch, which is what makes a third branch a data change rather than a redesign.",
  screens: [
    { id: "a-menu", name: "Menu management", route: "/admin/menu", linkable: true, purpose: "Products with pricing, media, options and availability.", states: ["List", "Drawer editor", "Bulk actions", "Validation error", "Unsaved changes"] },
    { id: "a-categories", name: "Categories", route: "/admin/categories", linkable: true, purpose: "Ordering and visibility of menu categories.", states: ["List", "Reordering", "Hidden category", "Add"] },
    { id: "a-options", name: "Options and add-ons", route: "/admin/options", linkable: true, purpose: "Option groups with selection rules and price deltas.", states: ["Groups", "Editing rules", "In-use conflict"] },
    { id: "a-inventory", name: "Branch inventory", route: "/admin/inventory", linkable: true, purpose: "Dish availability matrix across branches with daily reset.", states: ["Matrix", "Low stock", "Sold out", "Bulk reset"] },
  ],
};

const ADMIN_MONEY: ScreenGroup = {
  id: "admin-money",
  title: "Admin console · payments, refunds and reporting",
  platform: "admin",
  intro:
    "The screens support has to trust during a dispute. Every payment shows its provider, its reference and its full event log, so a screen can be matched against a bank statement.",
  screens: [
    { id: "a-payments", name: "Payment management", route: "/admin/payments", linkable: true, purpose: "All transactions by method, provider and status, with reconciliation.", states: ["All", "Filtered", "Mismatch banner", "Empty", "Export"] },
    { id: "a-payment", name: "Payment detail", route: "/admin/payments/pay-0138", linkable: true, purpose: "Method, provider, amount, status, references, provider event log, settlement and refund action.", states: ["Paid", "Declined with bank code", "Delayed", "Refunded", "Partially refunded"] },
    { id: "a-refunds", name: "Refund management", route: "/admin/refunds", linkable: true, purpose: "Automatic and manual refunds with an approval workflow.", states: ["Pending", "Approved", "Processing", "Completed", "Rejected", "Automatic from branch rejection"] },
    { id: "a-reports", name: "Reports and analytics", route: "/admin/reports", linkable: true, purpose: "Revenue, mix, prep time, rejection reasons, refund rate, peak hours.", states: ["Range selected", "Branch comparison", "No data in range"] },
  ],
};

const ADMIN_CONFIG: ScreenGroup = {
  id: "admin-config",
  title: "Admin console · marketing and configuration",
  platform: "admin",
  intro: "Everything that changes how the customer-facing product behaves, guarded by roles and written to an immutable audit log.",
  screens: [
    { id: "a-promotions", name: "Promotion management", route: "/admin/promotions", linkable: true, purpose: "Codes, conditions, windows, caps and a customer-facing preview.", states: ["Active", "Scheduled", "Expired", "Conflict warning", "Usage chart"] },
    { id: "a-customers", name: "Customer management", route: "/admin/customers", linkable: true, purpose: "Customer records, history, addresses and support actions.", states: ["List", "Detail drawer", "Repeat customers", "Blocked"] },
    { id: "a-branches", name: "Branch management", route: "/admin/branches", linkable: true, purpose: "Hours, radius, fees, minimums, pause switch and future branches.", states: ["Two live branches", "Paused with a reason", "Holiday closure", "Adding a future branch"] },
    { id: "a-users", name: "Admins and roles", route: "/admin/users", linkable: true, purpose: "Staff accounts, branch scope and the permission matrix.", states: ["List", "Invite", "Permission matrix", "Suspended"] },
    { id: "a-printer", name: "Printer and POS", route: "/admin/printer", linkable: true, purpose: "Devices, routing rules, test prints and the retry queue.", states: ["Connected", "Offline device", "Test print preview", "Failed queue"] },
    { id: "a-audit", name: "Audit logs", route: "/admin/audit", linkable: true, purpose: "Immutable record of who changed what, with before and after values.", states: ["All", "Filtered", "Expanded diff"] },
    { id: "a-settings", name: "System settings", route: "/admin/settings", linkable: true, purpose: "Ordering rules, payment and delivery providers, tax, templates, maintenance.", states: ["Per-section save", "Dirty state", "Sandbox mode", "Maintenance mode"] },
  ],
};

const REFERENCE: ScreenGroup = {
  id: "reference",
  title: "Reference",
  platform: "web",
  intro: "The two pages that document the rest.",
  screens: [
    { id: "ds", name: "Design system", route: "/design-system", linkable: true, purpose: "Tokens, components, status vocabulary and accessibility commitments, rendered from live code.", states: ["Full documentation"] },
    { id: "index", name: "Screen index", route: "/prototype", linkable: true, purpose: "This page: every screen, every simulated state and every outstanding asset.", states: ["Index"] },
  ],
};

export const SCREEN_GROUPS: ScreenGroup[] = [
  WEB_MARKETING,
  WEB_ORDERING,
  WEB_ACCOUNT,
  MOBILE,
  ADMIN_OPS,
  ADMIN_CATALOGUE,
  ADMIN_MONEY,
  ADMIN_CONFIG,
  REFERENCE,
];

export const SCREEN_TOTALS = {
  screens: SCREEN_GROUPS.reduce((n, g) => n + g.screens.length, 0),
  states: SCREEN_GROUPS.reduce(
    (n, g) => n + g.screens.reduce((m, s) => m + s.states.length, 0),
    0,
  ),
  routes: SCREEN_GROUPS.reduce((n, g) => n + g.screens.filter((s) => s.linkable).length, 0),
};

/* ================================================================== */
/* Component inventory                                                 */
/* ================================================================== */

export const COMPONENT_INVENTORY: { group: string; file: string; items: string[] }[] = [
  {
    group: "Primitives",
    file: "src/components/ui/primitives.tsx",
    items: [
      "Button",
      "ButtonLink",
      "Badge",
      "StatusBadge",
      "PaymentBadge",
      "AvailabilityChip",
      "PromoBadge",
      "BranchOpenBadge",
      "Price",
      "Panel",
      "SectionTitle",
      "Divider",
      "Callout",
      "Skeleton",
      "SkeletonCard",
      "SkeletonRow",
      "EmptyState",
      "ErrorState",
      "Stat",
      "KeyValue",
    ],
  },
  {
    group: "Forms",
    file: "src/components/ui/forms.tsx",
    items: [
      "TextField",
      "TextAreaField",
      "SelectField",
      "ChoiceRow",
      "Segmented",
      "Chip",
      "QuantityStepper",
      "Toggle",
    ],
  },
  {
    group: "Overlays",
    file: "src/components/ui/overlays.tsx",
    items: ["Dialog", "ConfirmDialog", "Drawer", "BottomSheet", "ToastHost"],
  },
  {
    group: "Media",
    file: "src/components/ui/media.tsx",
    items: ["FoodImage", "PhotoStrip", "MapView", "QRCode", "Avatar"],
  },
  {
    group: "Data display",
    file: "src/components/ui/data.tsx",
    items: [
      "DataTable",
      "Pagination",
      "OrderTracker",
      "EventTimeline",
      "BarChart",
      "TotalsBlock",
      "OrderLinesList",
      "IconStat",
    ],
  },
  {
    group: "Iconography",
    file: "src/components/ui/icons.tsx",
    items: ["Icon", "Icons — one inline SVG set on a 24px grid"],
  },
  {
    group: "Website shell",
    file: "src/components/site/",
    items: [
      "SiteHeader",
      "SiteFooter",
      "MobileOrderBar",
      "BranchChip and BranchDialog",
      "ProductCard",
      "FoodRail",
      "BranchCard",
      "Reveal",
      "ParallaxScene",
    ],
  },
  {
    group: "Admin shell",
    file: "src/components/admin/shell.tsx",
    items: ["AdminShell", "AdminCard", "AlertRow", "ADMIN_NAV", "useOpsCounts"],
  },
  {
    group: "Mobile frames",
    file: "src/components/mobile/device.tsx",
    items: [
      "DeviceFrame",
      "IosHeader",
      "AndroidHeader",
      "IosTabBar",
      "AndroidNavBar",
      "MobileActionBar",
      "Snackbar",
      "SheetHandle",
      "FrameGrid",
      "FrameSection",
      "PlatformDiffNote",
    ],
  },
  {
    group: "Documentation",
    file: "src/components/ds/",
    items: ["DsSection", "DsItem", "DsGrid", "DoDont", "TokenTable", "DsNav", "contrast helpers"],
  },
  {
    group: "Prototype tooling",
    file: "src/components/prototype-panel.tsx",
    items: [
      "PrototypePanel — switches the simulated payment, branch, rider, offline, motion and sign-in outcomes",
    ],
  },
];

/* ================================================================== */
/* Simulation boundary and missing assets                              */
/* ================================================================== */

export const SIMULATED: { area: string; detail: string }[] = [
  {
    area: "Authentication",
    detail:
      "Sign-in, registration and the one-time code are visual only. No credential is validated, stored or sent anywhere, and there is no session.",
  },
  {
    area: "Payments",
    detail:
      "No card is charged and no DuitNow QR is registered with a bank. The Maybank and OXPay outcomes are chosen in the prototype panel, and the QR image is a deterministic pattern, not a payable code.",
  },
  {
    area: "Branch response",
    detail:
      "Accept, reject and timeout are driven by a simulated setting and a countdown rather than by a real branch terminal.",
  },
  {
    area: "Delivery",
    detail:
      "Courier quotes, rider assignment and rider location are mock data. The map is an illustrated placeholder with real pin semantics.",
  },
  {
    area: "Persistence",
    detail:
      "Cart, orders and settings live in browser local storage so a demo survives a refresh. There is no database, no Supabase project and no row-level security in this build.",
  },
  {
    area: "Notifications and printing",
    detail:
      "Email, SMS, push and thermal printing all resolve to an on-screen confirmation. Ticket and receipt layouts are real; the transport is not.",
  },
  {
    area: "Reporting",
    detail: "Charts are generated from typed mock figures, not from aggregated order data.",
  },
];

export const MISSING_ASSETS: {
  id: string;
  item: string;
  need: string;
  blocking: "high" | "medium" | "low";
  placeholder: string;
}[] = [
  {
    id: "food-photography",
    item: "Dish photography",
    need: "One 4:3 hero and one 1:1 crop per menu item, shot on a warm neutral surface with consistent lighting and no on-image text.",
    blocking: "high",
    placeholder:
      "FoodImage draws a deterministic illustrated placeholder from the dish name, so density and layout are already final.",
  },
  {
    id: "brand-logo",
    item: "Final logo files",
    need: "Wordmark and the 방가 mark as SVG, in full colour, single colour and reversed, plus a favicon set and app icons at every required iOS and Android size.",
    blocking: "high",
    placeholder: "The wordmark is set live in Poppins ExtraBold with a teal rounded mark.",
  },
  {
    id: "branch-photography",
    item: "Branch interior and exterior photography",
    need: "Two to three images per branch, including the shopfront for wayfinding and the counter for pickup instructions.",
    blocking: "medium",
    placeholder: "Illustrated scene placeholders in the locations cards.",
  },
  {
    id: "maps",
    item: "Real map tiles and geocoding",
    need: "A map provider key, branch coordinates, delivery radius polygons and address autocomplete for Malaysian addresses.",
    blocking: "medium",
    placeholder: "MapView renders an illustrated street grid with correctly labelled pins.",
  },
  {
    id: "halal-cert",
    item: "Halal certification artwork and certificate numbers",
    need: "The JAKIM certificate image and per-branch certificate numbers with expiry dates, for the halal assurance page and the footer.",
    blocking: "high",
    placeholder: "A text badge reading Halal certified, with placeholder certificate copy.",
  },
  {
    id: "legal-copy",
    item: "Reviewed legal copy",
    need: "Terms, privacy notice, refund policy and cookie policy reviewed against Malaysian consumer and PDPA requirements, plus the business registration and SST numbers printed on receipts.",
    blocking: "high",
    placeholder: "Plausible drafted copy that matches the prototype's actual rules.",
  },
  {
    id: "photo-booth",
    item: "Photo booth assets",
    need: "Frame overlay artwork, sticker set and example strips for the in-store experience.",
    blocking: "low",
    placeholder: "PhotoStrip renders coloured frames in the correct proportions.",
  },
  {
    id: "provider-docs",
    item: "Provider integration details",
    need: "Maybank card acquiring and OXPay DuitNow sandbox credentials, webhook payload schemas, settlement timings and the Lalamove quote and booking contracts. These belong in server-side environment variables only.",
    blocking: "high",
    placeholder:
      "Reference formats and event logs are modelled from public documentation; no key exists anywhere in this repository.",
  },
  {
    id: "fonts",
    item: "Licensed font files",
    need: "Self-hosted Poppins and Inter subsets, including Latin Extended, for the production build and the mobile applications.",
    blocking: "low",
    placeholder: "Loaded through next/font in the prototype.",
  },
  {
    id: "copy-ms",
    item: "Bahasa Malaysia translation",
    need: "A full translation pass for every string, including the order status vocabulary and the payment failure messages.",
    blocking: "medium",
    placeholder: "English only, with the language switch present in system settings.",
  },
];
