import type { Metadata } from "next";
import { Badge, ButtonLink, Panel, SectionTitle } from "@/components/ui/primitives";
import { FoodImage, PhotoStrip } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "A Korean couple, a phrase that means “nice to meet you”, and three years of boneless chicken in Subang Jaya. The story behind BANG GA BANG GA.",
};

const MILESTONES = [
  {
    year: "2023",
    title: "SS15 opens its doors",
    body: "A twelve-seat shoplot on Jalan SS15/4D, one fryer, and a sauce recipe written on the back of a receipt. We sold out of soy garlic on day three.",
  },
  {
    year: "2024",
    title: "We go boneless only",
    body: "Students told us bones slowed lunch down. We rewrote the whole menu around boneless chicken and kept every individual set under RM20.",
  },
  {
    year: "2025",
    title: "The photo booth arrives",
    body: "We gave up four seats for a curtain, a camera and a printer. People started staying after the meal instead of leaving straight after it.",
  },
  {
    year: "2026",
    title: "Taylor's Lakeside opens",
    body: "Our second kitchen, inside the Student Life Centre, with a shorter prep time for the gap between classes and a booth of its own.",
  },
];

const KITCHEN_RULES = [
  {
    title: "No alcohol, no mirin",
    body: "Every sauce is cooked in-house each morning with rice vinegar, honey and stock. Nothing in our kitchen is deglazed with cooking wine, and mirin never enters the building.",
  },
  {
    title: "Kimchi without fish sauce",
    body: "Our napa cabbage kimchi is fermented on site with a vegetable and pear base. No fish sauce, no shrimp paste, no anchovy stock — so every table can share the same bowl.",
  },
  {
    title: "Separate preparation",
    body: "Chicken is sourced from suppliers we can name, and preparation, frying and plating are kept to their own stations and colour-coded boards.",
  },
  {
    title: "Ask us anything",
    body: "If you want to know what is in a sauce, ask the counter. We would rather answer the question than have you guess.",
  },
];

export default function StoryPage() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="grain relative overflow-hidden bg-teal" aria-labelledby="story-hero-title">
        <div className="grain-layer" />
        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream">
              Our story
            </span>
            <h1
              id="story-hero-title"
              className="mt-5 text-[clamp(38px,7vw,88px)] leading-[0.94] text-ink"
            >
              TRADITION &amp; TRENDY
            </h1>
            <p className="mt-6 font-display text-[clamp(20px,3vw,32px)] font-bold leading-[1.1] tracking-tight text-deep">
              NICE TO MEET YOU. NOW, LET&rsquo;S EAT.
            </p>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-relaxed text-ink/80 lg:text-[19px]">
              Two people, one fryer and a phrase that means hello. This is how a small Korean
              kitchen in Subang Jaya turned into the place students, families and first-timers eat
              at every week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/menu" size="lg" iconEnd="arrowRight">
                Explore our menu
              </ButtonLink>
              <ButtonLink href="/locations" size="lg" variant="secondary">
                Find us
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-100">
            <FoodImage
              src="/images/brand/story-hero.jpg"
              alt="The dining room at the SS15 branch, with cream tables and a teal counter, full at lunchtime"
              variant="scene"
              className="aspect-[4/5] w-full"
              rounded="rounded-[32px_8px_32px_8px]"
            />
            <div className="absolute -bottom-4 -left-3 rounded-[18px] bg-ink px-5 py-4 text-cream">
              <p className="num font-display text-[26px] font-extrabold leading-none">2023</p>
              <p className="mt-1 text-[12px] uppercase tracking-wider text-cream/70">
                the year it started
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* THE FOUNDERS                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="container-page py-20 lg:py-28" aria-labelledby="founders-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative">
              <FoodImage
                src="/images/brand/founders.jpg"
                alt="Min-jun and Hae-won, the founders of BANG GA BANG GA, standing together behind the SS15 counter"
                variant="portrait"
                className="aspect-[4/5] w-full"
                rounded="rounded-[28px_6px_28px_6px]"
              />
              <div className="absolute -right-3 bottom-6 max-w-[16rem] rounded-[16px] bg-white p-4 shadow-none ring-1 ring-ink/10 lg:-right-8">
                <p className="text-[14px] leading-relaxed text-ink/80">
                  &ldquo;We cooked what we missed. It turned out everyone else missed it too.&rdquo;
                </p>
                <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-deep">
                  Hae-won, co-founder
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <SectionTitle
              overline="The founders"
              title={<span id="founders-title">A KOREAN COUPLE, A LONG WAY FROM HOME</span>}
            />
            <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-ink/80">
              <p>
                Min-jun and Hae-won moved to Malaysia for work and stayed for the people. What they
                could not find was the food they grew up on — the crackle of double-fried chicken,
                a sauce that is sweet before it is hot, rice cakes that pull when you lift them.
              </p>
              <p>
                So they cooked it themselves. First for friends on weekends, then for neighbours who
                had started asking, and eventually for a queue that would not fit in their kitchen.
              </p>
              <p>
                They opened a shoplot in SS15 with the flavours they love and one rule they would
                not bend: everything on the menu has to be something a Muslim friend can eat at the
                same table, from the same plate.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Badge tone="info" icon="pin">
                From Busan and Daegu
              </Badge>
              <Badge tone="info" icon="cook">
                Sauces made every morning
              </Badge>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* THE NAME                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-mint py-20 lg:py-28" aria-labelledby="name-title">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              align="center"
              overline="The name"
              title={<span id="name-title">WHAT BANG GA BANG GA MEANS</span>}
            />
          </Reveal>

          <Reveal delay={1}>
            <div className="mx-auto mt-10 max-w-3xl text-center">
              <p className="font-display text-[clamp(32px,6vw,64px)] leading-none text-deep" lang="ko">
                반가 반가
              </p>
              <p className="mt-4 text-[18px] font-semibold text-ink">
                Bang ga bang ga — &ldquo;Nice to meet you.&rdquo;
              </p>
              <p className="mt-5 text-[17px] leading-relaxed text-ink/80">
                In Korean it is the warm, doubled-up version of a greeting: the one you use when you
                are genuinely happy to see someone. Said twice, it stops being polite and starts
                being pleased.
              </p>
              <p className="mt-4 text-[17px] leading-relaxed text-ink/80">
                We chose it because it is the first thing we want to say to anyone who walks in, and
                because it describes what a good meal actually does. You arrive as strangers to a
                menu. You leave having met something.
              </p>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
              {[
                { k: "방가", en: "How it sounds", d: "Bang-ga, with a soft g — the way you would say it across a table." },
                { k: "반갑습니다", en: "The formal version", d: "What you would say in an office. Ours is the version you use with friends." },
                { k: "잘 먹겠습니다", en: "Before eating", d: "“I will eat well.” The line we hear most often just before the first bite." },
              ].map((item) => (
                <Panel key={item.en} className="p-5 text-center">
                  <p className="font-display text-[24px] text-deep" lang="ko">
                    {item.k}
                  </p>
                  <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-ink">
                    {item.en}
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-grey">{item.d}</p>
                </Panel>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* THREE YEARS IN SUBANG JAYA                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="container-page py-20 lg:py-28" aria-labelledby="years-title">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <SectionTitle
              overline="Three-plus years in Subang Jaya"
              title={<span id="years-title">THE NEIGHBOURHOOD MADE US</span>}
            />
            <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-ink/80">
              <p>
                SS15 is a street of students, night shifts and people who know exactly what they
                want by the time they reach the counter. It is a hard place to be average in, and
                the best possible place to learn.
              </p>
              <p>
                Regulars taught us that lunch has to land in under twenty minutes, that a set is
                only good value if it still feels like a full meal, and that nobody wants to argue
                about spice with their own table.
              </p>
              <p>
                Three years later, the Wednesday student queue still tells us what to cook next. In
                2026 we opened a second kitchen inside Taylor&rsquo;s Lakeside Campus, ten minutes
                down the road, because that queue had started walking.
              </p>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[
                { v: "3+", l: "years open" },
                { v: "2", l: "branches" },
                { v: "<RM20", l: "every set" },
              ].map((s) => (
                <div key={s.l} className="rounded-[16px] border border-deep/15 bg-white p-4">
                  <dt className="sr-only">{s.l}</dt>
                  <dd>
                    <span className="num block font-display text-[26px] font-extrabold leading-none text-ink">
                      {s.v}
                    </span>
                    <span className="mt-1.5 block text-[12px] uppercase tracking-wide text-grey">
                      {s.l}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid grid-cols-2 gap-3">
              <FoodImage
                src="/images/brand/ss15-street.jpg"
                alt="The SS15 shoplot frontage in the evening, with the teal sign lit above the doorway"
                variant="scene"
                className="aspect-[3/4] w-full"
                rounded="rounded-[18px]"
              />
              <FoodImage
                src="/images/brand/kitchen-pass.jpg"
                alt="A cook lifting a basket of boneless chicken out of the fryer at the kitchen pass"
                variant="scene"
                className="aspect-square w-full"
                rounded="rounded-[18px]"
              />
              <FoodImage
                src="/images/brand/regulars.jpg"
                alt="Two regular customers sharing a tray of sets at a window table"
                variant="scene"
                className="aspect-square w-full"
                rounded="rounded-[18px]"
              />
              <FoodImage
                src="/images/brand/taylors-counter.jpg"
                alt="The order counter at the Taylor's Lakeside branch inside the Student Life Centre"
                variant="scene"
                className="aspect-[3/4] w-full"
                rounded="rounded-[18px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* MUSLIM-FRIENDLY KITCHEN                                     */}
      {/* ---------------------------------------------------------- */}
      <section
        className="on-dark grain relative overflow-hidden bg-deep py-20 text-cream lg:py-28"
        aria-labelledby="halal-title"
      >
        <div className="grain-layer" />
        <div className="container-page relative">
          <Reveal>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
              In our kitchen
            </p>
            <h2 id="halal-title" className="max-w-[20ch] text-[clamp(30px,4.6vw,58px)] leading-[1.03] text-white">
              WHAT MUSLIM-FRIENDLY MEANS HERE
            </h2>
            <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-cream/80">
              Muslim-friendly is not a sticker we put on a window. It is a set of decisions we make
              every morning, and we are happy to be asked about any of them.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {KITCHEN_RULES.map((rule, i) => (
              <Reveal key={rule.title} delay={i < 2 ? 1 : 2}>
                <div className="h-full rounded-[18px] border border-white/15 bg-white/6 p-6">
                  <span className="flex size-10 items-center justify-center rounded-full bg-teal text-ink">
                    <Icon name="shield" size={18} />
                  </span>
                  <h3 className="mt-4 text-[20px] text-white">{rule.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-cream/80">{rule.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={3}>
            <p className="mt-8 max-w-[70ch] text-[14px] leading-relaxed text-cream/65">
              We describe ourselves as Muslim-friendly rather than certified. Full allergen
              information for every dish is listed on the menu, and the counter team can talk you
              through any preparation step.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* TIMELINE                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="container-page py-20 lg:py-28" aria-labelledby="timeline-title">
        <Reveal>
          <SectionTitle
            overline="Milestones"
            title={<span id="timeline-title">HOW WE GOT HERE</span>}
            lead="Four years, two kitchens and one menu rewrite. The short version."
          />
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m, i) => (
            <Reveal key={m.year} delay={(i % 3) as 0 | 1 | 2} as="li">
              <div className="relative h-full rounded-[18px] border border-line bg-white p-6">
                <span
                  aria-hidden
                  className="absolute -top-3 left-6 rounded-full bg-ink px-3 py-1 font-display text-[13px] font-bold text-cream"
                >
                  {m.year}
                </span>
                <span className="num block pt-2 font-display text-[13px] font-bold text-teal">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-[19px] leading-snug">{m.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-grey">{m.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CLOSING CTA                                                 */}
      {/* ---------------------------------------------------------- */}
      <section
        className="grain relative overflow-hidden bg-cta py-20 text-white lg:py-28"
        aria-labelledby="story-cta-title"
      >
        <div className="grain-layer" />
        <div className="container-page relative flex flex-col items-center text-center">
          <Reveal>
            <div className="flex justify-center gap-3" aria-hidden>
              <PhotoStrip frames={3} tilt={-8} className="float-slow w-16" />
              <PhotoStrip frames={3} tilt={6} className="float-slower w-16" />
            </div>
            <h2 id="story-cta-title" className="mt-8 text-[clamp(32px,6vw,72px)] leading-[0.98]">
              COME SAY HELLO
            </h2>
            <p className="mx-auto mt-5 max-w-[46ch] text-[18px] leading-relaxed text-white/85">
              There is a seat at SS15 and a seat at Taylor&rsquo;s Lakeside. Bring someone with you
              — the strips print two at a time.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/menu" size="lg" variant="secondary">
                Explore our menu
              </ButtonLink>
              <ButtonLink href="/locations" size="lg" variant="dark">
                Find a location
              </ButtonLink>
              <ButtonLink href="/photo-booth" size="lg" variant="dark">
                See the photo booth
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
