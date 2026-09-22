import type { Metadata } from "next";
import Link from "next/link";
import { BRANCHES, PROTOTYPE_RULES } from "@/lib/mock-data";
import { branchStatus, todayHours } from "@/lib/format";
import { Badge, Callout, Panel, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";
import { ContactForm } from "@/components/site/story-contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call SS15 or Taylor's Lakeside directly, send us a message, or read the answers to the questions we get most about halal, allergens, delivery and refunds.",
};

const FAQS = [
  {
    q: "Are you halal certified?",
    a: (
      <>
        <p>
          We describe ourselves as <strong className="font-semibold text-ink">Muslim-friendly</strong>{" "}
          rather than certified. There is no alcohol or mirin in any sauce, our kimchi is fermented
          without fish sauce or shrimp paste, and chicken preparation is kept to its own station
          with colour-coded boards.
        </p>
        <p className="mt-2">
          We are happy to talk through any preparation step at the counter or on the phone. If
          certification matters to your decision, please ask us directly rather than assuming.
        </p>
      </>
    ),
  },
  {
    q: "How do I check allergens?",
    a: (
      <>
        <p>
          Every dish lists its allergens on the menu page, and the detail view shows the full
          ingredient description. The most common ones across our menu are wheat, soy, sesame, dairy
          and egg.
        </p>
        <p className="mt-2">
          Our kitchen is small and shared, so we cannot promise a dish is free from traces of
          another. If an allergy is severe, call the branch before ordering so the kitchen knows
          before your food is started.
        </p>
      </>
    ),
  },
  {
    q: "What area do you deliver to?",
    a: (
      <>
        <p>
          SS15 delivers within 8 km and Taylor&rsquo;s Lakeside within 6 km, measured from the
          branch. If your address falls outside both radii, checkout will offer pickup instead of
          silently failing.
        </p>
        <p className="mt-2">
          Delivery is handled by a third-party rider service. Once a rider collects your order, the
          delivery time is in their hands and the tracking screen shows their live status.
        </p>
      </>
    ),
  },
  {
    q: "How do refunds work?",
    a: (
      <>
        <p>
          You can cancel any time before payment completes. After the branch confirms the order,
          cancellation is no longer possible in the app — contact the branch and they will help.
        </p>
        <p className="mt-2">
          If a branch rejects an order, a refund starts automatically with a reference you can
          quote. {PROTOTYPE_RULES.branchSlaLabel}
        </p>
        <p className="mt-2 text-grey">{PROTOTYPE_RULES.refundTimingLabel}</p>
        <p className="mt-2">
          The full rules are in our{" "}
          <Link href="/legal/refunds" className="font-semibold text-deep underline underline-offset-2">
            refund policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    q: "How does the photo booth session work?",
    a: (
      <>
        <p>
          Add a session to your food order from RM1, then show your receipt at the booth. Sessions
          are used on the same day at the same branch and cannot be transferred to another visit.
        </p>
        <p className="mt-2">
          Extra strips are priced per copy, and a card frame is RM4. Read more on the{" "}
          <Link href="/photo-booth" className="font-semibold text-deep underline underline-offset-2">
            photo booth page
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    q: "Can you handle a large or catering order?",
    a: (
      <>
        <p>
          Yes, with notice. For anything over ten sets or two family feasts, call the branch at
          least a day ahead so the kitchen can plan the fryer around it. Tell us the time you need
          it ready rather than the time you will order.
        </p>
        <p className="mt-2">
          Large orders are paid in the app like any other order. We do not take deposits over the
          phone.
        </p>
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-mint" aria-labelledby="contact-title">
        <div className="container-page py-12 lg:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream">
            Contact
          </span>
          <h1 id="contact-title" className="mt-5 max-w-[18ch] text-[clamp(34px,6vw,72px)] leading-[0.97] text-ink">
            TALK TO US
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink/80 lg:text-[19px]">
            The fastest answer usually comes from the branch itself. For everything else, send us a
            message and we will reply within a working day.
          </p>
        </div>
      </section>

      {/* BRANCH CONTACTS */}
      <section className="container-page py-14 lg:py-18" aria-labelledby="branch-contacts-title">
        <Reveal>
          <SectionTitle
            overline="Call a branch"
            title={<span id="branch-contacts-title">BRANCH CONTACTS</span>}
          />
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {BRANCHES.map((branch, i) => {
            const status = branchStatus(branch);
            return (
              <Reveal key={branch.id} delay={(i % 2) as 0 | 1}>
                <Panel className="flex h-full flex-col p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-[21px] leading-snug">{branch.name}</h3>
                    <Badge
                      tone={status.open ? "success" : "neutral"}
                      icon={status.open ? "check" : "clock"}
                      soft={!status.open}
                    >
                      {status.label} · {status.detail}
                    </Badge>
                  </div>

                  <p className="mt-3 text-[14px] leading-relaxed text-grey">
                    {branch.address}
                    <br />
                    {branch.postcode} {branch.city}, Selangor
                  </p>

                  <dl className="mt-5 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                        <Icon name="phone" size={16} />
                      </span>
                      <div>
                        <dt className="text-[13px] text-grey">Phone</dt>
                        <dd className="num text-[16px] font-semibold text-ink">
                          <a
                            href={`tel:${branch.phone.replace(/\s/g, "")}`}
                            className="hover:underline"
                          >
                            {branch.phone}
                          </a>
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                        <Icon name="clock" size={16} />
                      </span>
                      <div>
                        <dt className="text-[13px] text-grey">Today</dt>
                        <dd className="num text-[16px] font-semibold text-ink">
                          {todayHours(branch)}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                        <Icon name="user" size={16} />
                      </span>
                      <div>
                        <dt className="text-[13px] text-grey">Ask for</dt>
                        <dd className="text-[15px] text-ink">
                          The branch manager on duty, for anything about an order in progress
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <Link
                    href={`/locations/${branch.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-deep hover:underline"
                  >
                    Branch details and hours <Icon name="chevronRight" size={14} />
                  </Link>
                </Panel>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={2}>
          <Callout
            tone="warning"
            icon="phone"
            title="For an order that's already placed, contact the branch directly"
            className="mt-6"
          >
            Once a branch has confirmed your order the kitchen has already started. Calling the
            branch is the only way to change or stop it — a message through this form will not reach
            the kitchen in time. You can find the branch number on your order tracking screen.
          </Callout>
        </Reveal>
      </section>

      {/* FORM */}
      <section className="bg-white py-14 lg:py-20" aria-labelledby="form-title">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <Reveal>
            <SectionTitle
              overline="Everything else"
              title={<span id="form-title">SEND A MESSAGE</span>}
              lead="Feedback, allergens, large orders, lost property, or a compliment for the kitchen — this reaches the team that can answer it."
            />
            <ul className="mt-7 flex flex-col gap-3 text-[15px] text-ink/80">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-deep">
                  <Icon name="clock" size={17} />
                </span>
                We answer between 10:00 and 20:00, seven days a week.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-deep">
                  <Icon name="receipt" size={17} />
                </span>
                Include your order code (it looks like BG-260921-0138) if your message is about an
                order.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-deep">
                  <Icon name="shield" size={17} />
                </span>
                Please do not send card numbers. We will never ask for them.
              </li>
            </ul>
          </Reveal>

          <Reveal delay={1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-14 lg:py-20" aria-labelledby="faq-title">
        <Reveal>
          <SectionTitle
            overline="Answers"
            title={<span id="faq-title">FREQUENTLY ASKED</span>}
            lead="The six questions we are asked most. Each one expands."
          />
        </Reveal>

        <div className="mt-8 flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={(i % 3) as 0 | 1 | 2}>
              <details className="group rounded-[16px] border border-line bg-white">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                  <h3 className="text-[17px] font-semibold leading-snug text-ink">{faq.q}</h3>
                  <span className="shrink-0 text-deep transition-transform group-open:rotate-180">
                    <Icon name="chevronDown" size={18} />
                  </span>
                </summary>
                <div className="border-t border-line px-5 py-4 text-[15px] leading-relaxed text-ink/80">
                  {faq.a}
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <Callout tone="neutral" icon="sparkle" title="Still stuck?" className="mt-6">
          Call the branch you ordered from, or read the{" "}
          <Link href="/legal/terms" className="font-semibold text-deep underline underline-offset-2">
            terms of service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="font-semibold text-deep underline underline-offset-2">
            privacy policy
          </Link>{" "}
          for the formal detail.
        </Callout>
      </section>
    </>
  );
}
