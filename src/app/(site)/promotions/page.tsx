import type { Metadata } from "next";
import { PROMOTIONS } from "@/lib/mock-data";
import type { Promotion } from "@/lib/types";
import { Badge, ButtonLink, Callout, Panel, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";
import { PromoCard } from "@/components/site/story-promo-card";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Student Wednesdays, the weekday Lunch Rush, weekend free delivery and RM1 photo booth sessions. Current offers at BANG GA BANG GA.",
};

/**
 * One finished offer, kept on the page so the expired pattern is visible.
 * Prototype data only — it is not part of PROMOTIONS and cannot be applied.
 */
const EXPIRED_PROMOTION: Promotion = {
  id: "promo-merdeka",
  code: "MERDEKA57",
  name: "Merdeka Weekend",
  badge: "RM5.70 OFF",
  description: "RM5.70 off any sharing platter over the Merdeka long weekend.",
  type: "fixed",
  value: 570,
  minSpend: 6000,
  branchIds: ["ss15", "taylors"],
  endsOn: "2026-09-01",
  terms: [
    "Valid 29 August to 1 September 2026 only.",
    "Sharing Platters category only.",
    "One redemption per order.",
  ],
};

const HOW_IT_WORKS = [
  {
    title: "Pick your food first",
    body: "Offers are checked against your cart, so add everything you want before you apply a code.",
    icon: "cart" as const,
  },
  {
    title: "Enter the code at checkout",
    body: "There is a promo field on the review step. Codes are not case sensitive, and bundle offers apply on their own.",
    icon: "tag" as const,
  },
  {
    title: "We check three things",
    body: "Your branch, your minimum spend and the date. If one does not match, we tell you which one before you pay.",
    icon: "shield" as const,
  },
  {
    title: "One offer per order",
    body: "Discounts do not stack. If two offers apply we keep the one that saves you more and say so on the total.",
    icon: "receipt" as const,
  },
];

export default function PromotionsPage() {
  return (
    <>
      {/* HERO */}
      <section className="grain relative overflow-hidden bg-mint" aria-labelledby="promos-title">
        <div className="grain-layer" />
        <div className="container-page relative py-14 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream">
            Promotions
          </span>
          <h1 id="promos-title" className="mt-5 max-w-[16ch] text-[clamp(36px,6.5vw,80px)] leading-[0.96] text-ink">
            GOOD FOOD, BETTER VALUE.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink/80 lg:text-[19px]">
            Every set is already under RM20. These are the days it costs even less — student
            Wednesdays, the weekday lunch rush, and a photo booth session for a ringgit.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/menu" size="lg" iconEnd="arrowRight">
              Start an order
            </ButtonLink>
            <ButtonLink href="/locations" size="lg" variant="secondary">
              Check branch availability
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* STUDENT HIGHLIGHT */}
      <section className="container-page pt-14 lg:pt-20" aria-labelledby="student-title">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[24px] bg-deep p-7 text-cream lg:p-10">
            <div className="grain-layer" />
            <div className="on-dark relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
                  Students
                </p>
                <h2
                  id="student-title"
                  className="mt-3 text-[clamp(28px,4.2vw,52px)] leading-[1.03] text-white"
                >
                  10% OFF EVERY WEDNESDAY
                </h2>
                <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-cream/80">
                  Show a valid student ID at pickup or to the rider and take 10% off signature
                  chicken, all day, at both branches. Taylor&rsquo;s Lakeside is inside the Student
                  Life Centre, so it is a two-minute walk between classes.
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-cream/85">
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={15} /> Code STUDENT10
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={15} /> Minimum spend RM15
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={15} /> Pickup or delivery
                  </li>
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href="/menu?category=signature-chicken" size="lg">
                    Order signature chicken
                  </ButtonLink>
                  <ButtonLink href="/locations/taylors" size="lg" variant="dark">
                    Taylor&rsquo;s Lakeside details
                  </ButtonLink>
                </div>
              </div>

              <div className="rounded-[18px] border border-white/15 bg-white/6 p-6">
                <p className="font-display text-[15px] font-bold uppercase tracking-wide text-teal">
                  A typical Wednesday
                </p>
                <dl className="num mt-4 flex flex-col gap-3 text-[15px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-cream/75">Soy Garlic Boneless</dt>
                    <dd className="font-semibold text-white">RM16.00</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-cream/75">Iced Barley Tea</dt>
                    <dd className="font-semibold text-white">RM4.50</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/15 pt-3">
                    <dt className="text-cream/75">Student discount</dt>
                    <dd className="font-semibold text-teal">−RM2.05</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/15 pt-3">
                    <dt className="font-semibold text-white">You pay</dt>
                    <dd className="font-display text-[22px] font-bold text-white">RM18.45</dd>
                  </div>
                </dl>
                <p className="mt-4 text-[12px] leading-relaxed text-cream/60">
                  Illustration only. Your total is calculated at checkout and includes SST.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CURRENT OFFERS */}
      <section className="container-page py-16 lg:py-20" aria-labelledby="current-title">
        <Reveal>
          <SectionTitle
            overline="Running now"
            title={<span id="current-title">CURRENT OFFERS</span>}
            lead="Four offers, each with its own branch scope and minimum spend. Copy the code and paste it into the promo field at checkout."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {PROMOTIONS.map((promo, i) => (
            <Reveal key={promo.id} delay={(i % 2) as 0 | 1}>
              <PromoCard promotion={promo} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW PROMOTIONS WORK */}
      <section className="bg-white py-16 lg:py-20" aria-labelledby="how-title">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              overline="Before you order"
              title={<span id="how-title">HOW PROMOTIONS WORK</span>}
            />
          </Reveal>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={(i % 3) as 0 | 1 | 2}>
                <Panel className="h-full p-5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-mint text-deep">
                    <Icon name={step.icon} size={18} />
                  </span>
                  <p className="num mt-4 font-display text-[13px] font-bold text-teal">0{i + 1}</p>
                  <h3 className="mt-1 text-[18px] leading-snug">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-grey">{step.body}</p>
                </Panel>
              </Reveal>
            ))}
          </div>

          <Reveal delay={1}>
            <Callout tone="info" icon="clock" title="Offers are checked when you pay, not when you add to cart" className="mt-6">
              If an offer ends while your cart is still open, the discount drops off at the review
              step and we show you the new total before payment. Nothing is charged without the
              final amount on screen.
            </Callout>
          </Reveal>
        </div>
      </section>

      {/* EXPIRED EXAMPLE */}
      <section className="container-page py-16 lg:py-20" aria-labelledby="expired-title">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle
              overline="Recently ended"
              title={<span id="expired-title">FINISHED OFFERS</span>}
            />
            <Badge tone="neutral" icon="clock" soft>
              Kept here for reference
            </Badge>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <PromoCard promotion={EXPIRED_PROMOTION} expired />
          </Reveal>
          <Reveal delay={1}>
            <Panel className="flex h-full flex-col justify-center p-7">
              <h3 className="text-[20px] leading-snug">Missed one?</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-grey">
                Seasonal offers come back. Turn on promotion notifications in your account and we
                will tell you the day a new one starts — no more than two messages a month.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/account/notifications" variant="secondary" iconStart="bell">
                  Notification settings
                </ButtonLink>
                <ButtonLink href="/menu" variant="ghost" iconEnd="arrowRight">
                  Browse the menu
                </ButtonLink>
              </div>
            </Panel>
          </Reveal>
        </div>
      </section>
    </>
  );
}
