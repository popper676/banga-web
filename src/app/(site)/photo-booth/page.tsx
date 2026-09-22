import type { Metadata } from "next";
import { BRANCHES } from "@/lib/mock-data";
import { money, todayHours } from "@/lib/format";
import { Badge, ButtonLink, Callout, Panel, SectionTitle } from "@/components/ui/primitives";
import { FoodImage, PhotoStrip } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Photo Booth",
  description:
    "Sessions from RM1 at both branches. Eat together, snap together, make it last — the BANG GA BANG GA photo booth.",
};

const PRICES = [
  { item: "1 photo strip", sen: 100, note: "One printed strip of four frames" },
  { item: "2 photo strips", sen: 200, note: "One each — the most ordered option" },
  { item: "4 photo strips", sen: 350, note: "For a table of four, cheaper per strip" },
  { item: "Card frame", sen: 400, note: "Cream or teal card frame, collected at the counter" },
];

const STEPS = [
  {
    title: "Add a session to your order",
    body: "Pick the photo booth from the menu and choose how many strips you want printed. It appears on the same receipt as your food.",
    icon: "cart" as const,
  },
  {
    title: "Eat first",
    body: "The booth is at the back of the room, past the drinks counter. There is no queue number — you go when your table is done.",
    icon: "cook" as const,
  },
  {
    title: "Show your receipt at the booth",
    body: "Scan the code on your receipt or show it to the counter. The screen counts you in and takes four frames.",
    icon: "receipt" as const,
  },
  {
    title: "Take it home",
    body: "Strips print in about forty seconds. Ask for a card frame if you want it to survive your bag.",
    icon: "camera" as const,
  },
];

export default function PhotoBoothPage() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                        */}
      {/* ---------------------------------------------------------- */}
      <section
        className="on-dark grain relative overflow-hidden bg-deep text-cream"
        aria-labelledby="booth-hero-title"
      >
        <div className="grain-layer" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink">
              Photo booth
            </span>
            <h1
              id="booth-hero-title"
              className="mt-5 text-[clamp(38px,7vw,88px)] leading-[0.94] text-white"
            >
              MORE THAN A MEAL.
            </h1>
            <p className="mt-4 font-display text-[clamp(26px,4.4vw,56px)] leading-none text-teal">
              MAKE IT LAST.
            </p>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-cream/80 lg:text-[19px]">
              Good food brings people together. Great moments are worth keeping. Step into the booth
              after your meal and walk out with something you can put on a fridge.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/menu/photo-booth-session" size="lg" iconEnd="arrowRight">
                Add a session from RM1
              </ButtonLink>
              <ButtonLink href="/locations" size="lg" variant="dark">
                Find a booth
              </ButtonLink>
            </div>
          </div>

          {/* Decorative strips — static under reduced motion (handled in CSS) */}
          <div className="relative mx-auto flex h-96 w-full max-w-md items-center justify-center">
            <div className="absolute inset-x-8 inset-y-0 rounded-[24px] bg-ink/45" aria-hidden />
            <div className="absolute left-8 top-0 h-full w-10 rounded-l-[24px] bg-coral/70" aria-hidden />
            <div className="absolute right-8 top-0 h-full w-10 rounded-r-[24px] bg-coral/70" aria-hidden />
            <PhotoStrip
              frames={4}
              tilt={-6}
              className="float-slow w-28"
              label="A four-frame photo strip printed at the booth"
            />
            <div className="absolute left-2 top-10" aria-hidden>
              <PhotoStrip frames={3} tilt={12} className="float-slower w-20" />
            </div>
            <div className="absolute bottom-6 right-0" aria-hidden>
              <PhotoStrip frames={3} tilt={-14} className="float-slower w-20" />
            </div>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow px-4 py-2 text-[13px] font-bold text-ink">
              Sessions from RM1
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* WHAT IT IS                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="container-page py-20 lg:py-28" aria-labelledby="what-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <Reveal>
            <SectionTitle
              overline="What it is"
              title={<span id="what-title">A REAL BOOTH, AT THE BACK OF THE ROOM</span>}
            />
            <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-ink/80">
              <p>
                It is a proper Korean-style photo booth: a curtain, a bench, a ring light and a
                printer that still smells faintly warm when the strip comes out.
              </p>
              <p>
                Four frames, a countdown on screen, and about forty seconds between the last shot
                and the print. Two of you fit comfortably, four of you fit if you are friendly.
              </p>
              <p>
                Nothing is uploaded anywhere. The booth prints your strip and clears the frames for
                the next person, which is the only kind of photo storage we want to be responsible
                for.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Badge tone="info" icon="camera">
                Four frames per strip
              </Badge>
              <Badge tone="info" icon="clock">
                About 3 minutes start to finish
              </Badge>
              <Badge tone="info" icon="shield">
                Nothing stored after printing
              </Badge>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid grid-cols-2 gap-3">
              <FoodImage
                src="/images/booth/curtain.jpg"
                alt="The coral curtain and bench inside the photo booth at the SS15 branch"
                variant="scene"
                className="aspect-[3/4] w-full"
                rounded="rounded-[18px]"
              />
              <FoodImage
                src="/images/booth/printer.jpg"
                alt="A freshly printed photo strip coming out of the booth printer"
                variant="scene"
                className="aspect-square w-full"
                rounded="rounded-[18px]"
              />
              <FoodImage
                src="/images/booth/friends.jpg"
                alt="Four friends squeezing into the booth and laughing at the countdown screen"
                variant="scene"
                className="aspect-square w-full"
                rounded="rounded-[18px]"
              />
              <FoodImage
                src="/images/booth/frames.jpg"
                alt="Cream and teal card frames stacked on the counter next to finished strips"
                variant="scene"
                className="aspect-[3/4] w-full"
                rounded="rounded-[18px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* PRICING                                                     */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-mint py-20 lg:py-24" aria-labelledby="pricing-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionTitle
              overline="Pricing"
              title={<span id="pricing-title">FROM RM1</span>}
              lead="A session is one ringgit. Everything after that is how many copies you want to walk out with."
            />
            <Callout tone="warning" icon="clock" title="Same day, same branch" className="mt-7">
              A session is tied to the branch you ordered from and is used on the same day. It does
              not carry over to another visit, and it cannot be moved between SS15 and
              Taylor&rsquo;s Lakeside.
            </Callout>
          </Reveal>

          <Reveal delay={1}>
            <Panel className="overflow-hidden">
              <table className="w-full border-collapse text-left">
                <caption className="border-b border-line px-5 py-4 text-left">
                  <span className="block font-display text-[17px] font-bold text-ink">
                    Photo booth price list
                  </span>
                  <span className="mt-1 block text-[13px] text-grey">
                    Prices include the session. Add-ons are charged with your food order.
                  </span>
                </caption>
                <thead>
                  <tr className="border-b border-line bg-cream/60">
                    <th scope="col" className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-grey">
                      Option
                    </th>
                    <th scope="col" className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-grey">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PRICES.map((row) => (
                    <tr key={row.item} className="border-b border-line/70 last:border-0">
                      <th scope="row" className="px-5 py-4 text-left align-top">
                        <span className="block text-[15px] font-semibold text-ink">{row.item}</span>
                        <span className="mt-0.5 block text-[13px] font-normal text-grey">
                          {row.note}
                        </span>
                      </th>
                      <td className="num px-5 py-4 text-right align-top text-[16px] font-bold text-ink">
                        {money(row.sen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-line bg-white px-5 py-4">
                <ButtonLink href="/menu/photo-booth-session" full iconEnd="arrowRight">
                  Add a session to your order
                </ButtonLink>
                <p className="mt-3 text-[12px] leading-relaxed text-grey">
                  Sets and platters qualify for the Meal + Booth offer, which drops a session to
                  RM1 automatically.
                </p>
              </div>
            </Panel>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* HOW IT WORKS                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="container-page py-20 lg:py-24" aria-labelledby="steps-title">
        <Reveal>
          <SectionTitle
            overline="How it works"
            title={<span id="steps-title">FOUR STEPS, NO APP</span>}
          />
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={(i % 3) as 0 | 1 | 2} as="li">
              <div className="h-full rounded-[18px] border border-line bg-white p-6">
                <span className="flex size-11 items-center justify-center rounded-full bg-mint text-deep">
                  <Icon name={step.icon} size={19} />
                </span>
                <p className="num mt-4 font-display text-[13px] font-bold text-teal">
                  Step 0{i + 1}
                </p>
                <h3 className="mt-1 text-[19px] leading-snug">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-grey">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* WHERE                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-white py-20 lg:py-24" aria-labelledby="where-title">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              overline="Where"
              title={<span id="where-title">BOTH BRANCHES HAVE A BOOTH</span>}
              lead="Same machine, same prices, same four frames. The SS15 booth is behind the drinks counter; the Taylor's Lakeside booth is beside the lake-deck window."
            />
          </Reveal>

          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            {BRANCHES.map((branch, i) => (
              <Reveal key={branch.id} delay={(i % 2) as 0 | 1}>
                <Panel className="flex h-full flex-col p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-[21px] leading-snug">{branch.name}</h3>
                    <Badge tone="success" icon="camera" soft>
                      Booth available
                    </Badge>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-grey">
                    {branch.address}, {branch.postcode} {branch.city}
                  </p>
                  <p className="num mt-3 flex items-center gap-2 text-[14px] text-ink">
                    <Icon name="clock" size={15} />
                    Booth open with the kitchen · today {todayHours(branch)}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-grey">
                    Last session is taken fifteen minutes before closing so the printer has time to
                    finish.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ButtonLink href={`/locations/${branch.id}`} variant="secondary" iconStart="pin">
                      Branch details
                    </ButtonLink>
                    <ButtonLink href="/menu/photo-booth-session" variant="ghost" iconEnd="arrowRight">
                      Add a session
                    </ButtonLink>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* GALLERY                                                     */}
      {/* ---------------------------------------------------------- */}
      <section className="container-page py-20 lg:py-24" aria-labelledby="gallery-title">
        <Reveal>
          <SectionTitle
            overline="Gallery"
            title={<span id="gallery-title">STRIPS FROM LAST WEEK</span>}
            lead="Printed with permission, pinned to the board by the counter. Ask us to add yours."
          />
        </Reveal>

        <Reveal delay={1}>
          <ul className="mt-10 flex flex-wrap items-start justify-center gap-6 sm:gap-8">
            {[
              { frames: 4, tilt: -7, label: "A photo strip of two friends pulling faces at the camera" },
              { frames: 4, tilt: 5, label: "A photo strip of a family of four squeezed onto the booth bench" },
              { frames: 3, tilt: -3, label: "A photo strip of a couple sharing a corn dog between frames" },
              { frames: 4, tilt: 9, label: "A photo strip of a study group holding up their sets" },
              { frames: 3, tilt: -10, label: "A photo strip of a birthday table wearing paper crowns" },
            ].map((strip, i) => (
              <li key={i}>
                <PhotoStrip
                  frames={strip.frames}
                  tilt={strip.tilt}
                  label={strip.label}
                  className="w-24 sm:w-28"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CTA                                                         */}
      {/* ---------------------------------------------------------- */}
      <section
        className="grain relative overflow-hidden bg-cta py-20 text-white lg:py-24"
        aria-labelledby="booth-cta-title"
      >
        <div className="grain-layer" />
        <div className="container-page relative text-center">
          <Reveal>
            <h2 id="booth-cta-title" className="text-[clamp(30px,5.5vw,68px)] leading-[0.99]">
              EAT TOGETHER. SNAP TOGETHER.
            </h2>
            <p className="mt-5 font-display text-[clamp(22px,3.5vw,40px)] tracking-tight text-yellow">
              MAKE IT LAST.
            </p>
            <p className="mx-auto mt-5 max-w-[44ch] text-[17px] leading-relaxed text-white/85">
              Add a session while you order your food. Use it the same day, at the same branch, with
              whoever is at the table.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/menu/photo-booth-session" size="lg" variant="secondary">
                Add a session from RM1
              </ButtonLink>
              <ButtonLink href="/menu" size="lg" variant="dark">
                Explore the menu
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
