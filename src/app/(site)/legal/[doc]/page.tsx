import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROTOTYPE_RULES } from "@/lib/mock-data";

const DOCS = {
  privacy: {
    title: "Privacy policy",
    updated: "1 September 2026",
    sections: [
      {
        id: "who",
        h: "Who we are",
        body: "BANG GA BANG GA Sdn Bhd operates the restaurant, website, mobile application and this ordering prototype. We collect only what we need to take an order, deliver it and keep a record of payment.",
      },
      {
        id: "data",
        h: "What we collect",
        body: "Name, phone, email, delivery address, order contents, payment references (never full card numbers), device tokens for push, and basic diagnostics. Location is requested only when you tap Order Now, and you can always type an address instead.",
      },
      {
        id: "use",
        h: "How we use it",
        body: "To fulfil orders, talk to the branch, run refunds, send the status you asked for, and improve the menu. We do not sell personal data. Payment processing is done by Maybank (Visa) and OXPay (DuitNow QR) under their own policies.",
      },
      {
        id: "rights",
        h: "Your rights",
        body: "Under Malaysia's PDPA you can ask to see, correct or delete your account data. Email privacy@bangga.my. Guest orders are kept against the order code until the retention period ends.",
      },
    ],
  },
  terms: {
    title: "Terms of service",
    updated: "1 September 2026",
    sections: [
      {
        id: "orders",
        h: "Ordering",
        body: "An order is an offer to buy. It is accepted only when the branch confirms. Prices include 6% SST. Menu availability and prices are set per branch and can change during the day.",
      },
      {
        id: "account",
        h: "Accounts and guests",
        body: "You may order as a guest. Creating an account lets us attach history and saved addresses. You are responsible for the phone number you give us — we use it to reach you about the order.",
      },
      {
        id: "conduct",
        h: "Use of the service",
        body: "Do not abuse promotions, place fraudulent orders, or attempt to access staff tools. We may refuse an order that we cannot fulfil safely.",
      },
    ],
  },
  refunds: {
    title: "Refund policy",
    updated: "1 September 2026",
    sections: [
      {
        id: "cancel",
        h: "Cancelling",
        body: PROTOTYPE_RULES.cancelBeforePayment + " " + PROTOTYPE_RULES.cancelAfterConfirm,
      },
      {
        id: "reject",
        h: "If the branch rejects",
        body: "A rejected order always starts a refund for the amount paid. You will see the refund reference on the confirmation screen and on the receipt.",
      },
      {
        id: "sla",
        h: "If the branch does not respond",
        body: PROTOTYPE_RULES.branchSlaLabel,
      },
      {
        id: "timing",
        h: "How long a refund takes",
        body: PROTOTYPE_RULES.refundTimingLabel,
      },
      {
        id: "manual",
        h: "Manual refunds",
        body: "Some DuitNow QR payments cannot be reversed automatically. In that case Finance transfers the refund and records a bank reference. You will still see refund pending, then refunded, with that reference.",
      },
    ],
  },
  cookies: {
    title: "Cookie policy",
    updated: "1 September 2026",
    sections: [
      {
        id: "what",
        h: "What we use",
        body: "This prototype stores cart, branch choice and simulation flags in the browser. There are no advertising cookies and no third-party trackers.",
      },
      {
        id: "control",
        h: "Control",
        body: "Clearing site data in the browser resets the prototype to the designed mock orders. A production build would offer a cookie banner only if analytics were added.",
      },
    ],
  },
  halal: {
    title: "Halal assurance",
    updated: "1 September 2026",
    sections: [
      {
        id: "kitchen",
        h: "The kitchen",
        body: "Both branches are Muslim-friendly Korean kitchens. No pork, no alcohol, no mirin. Sauces are made in-house. Certification artwork and JAKIM numbers are still outstanding — see the missing assets list.",
      },
      {
        id: "menu",
        h: "The menu",
        body: "Every dish on the customer menu is marked Muslim-friendly. Allergens are listed on the dish page. If a recipe changes, the dish page is the source of truth, not a social post.",
      },
    ],
  },
} as const;

type DocId = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const d = DOCS[doc as DocId];
  return { title: d?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc as DocId];
  if (!d) notFound();

  return (
    <div className="container-page max-w-3xl py-12 lg:py-16">
      <nav aria-label="Legal documents" className="flex flex-wrap gap-2 text-[13px] font-semibold">
        {(Object.keys(DOCS) as DocId[]).map((id) => (
          <Link
            key={id}
            href={`/legal/${id}`}
            className={`rounded-full border px-3 py-1.5 ${id === doc ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}
          >
            {DOCS[id].title}
          </Link>
        ))}
      </nav>
      <h1 className="mt-8 text-[clamp(28px,4vw,44px)]">{d.title}</h1>
      <p className="mt-2 text-[14px] text-grey">Last updated {d.updated} · BANG GA BANG GA Sdn Bhd</p>
      <ol className="mt-6 flex flex-col gap-2 text-[14px]">
        {d.sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="text-deep underline-offset-2 hover:underline">
              {s.h}
            </a>
          </li>
        ))}
      </ol>
      {d.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-24 mt-10">
          <h2 className="text-[22px]">{s.h}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
