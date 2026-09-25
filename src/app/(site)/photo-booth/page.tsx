import type { Metadata } from "next";
import { BRANCHES } from "@/lib/mock-data";
import { todayHours } from "@/lib/format";
import { Badge, ButtonLink, Panel, SectionTitle } from "@/components/ui/primitives";
import { PhotoStrip } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Photo Booth",
  description: "Enjoy the BANG GA BANG GA photo booth when you visit our outlets.",
};

const MOMENTS = [
  { title: "Eat together", body: "Enjoy your Korean favourites first.", icon: "cook" as const },
  { title: "Step inside", body: "Find the booth inside the outlet.", icon: "camera" as const },
  { title: "Take it home", body: "Leave with a photo strip and a memory.", icon: "sparkle" as const },
];

export default function PhotoBoothPage() {
  return (
    <>
      <section className="on-dark grain relative overflow-hidden bg-black text-white">
        <div className="grain-layer" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1fr_0.8fr] lg:py-24">
          <Reveal>
            <Badge tone="warning" icon="camera">At our outlets</Badge>
            <h1 className="mt-5 text-[clamp(42px,7vw,88px)] leading-[0.94] text-yellow">
              EAT. SNAP. REMEMBER.
            </h1>
            <p className="mt-6 max-w-[42ch] text-[18px] leading-relaxed text-white/78">
              Our photo booth is part of the in-store experience—not an online product. Visit us,
              enjoy your meal and capture the moment.
            </p>
            <ButtonLink href="/locations" size="lg" className="mt-8" iconStart="pin" iconEnd="arrowRight">
              Find an outlet
            </ButtonLink>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative mx-auto flex h-80 max-w-sm items-center justify-center rounded-[28px] border border-yellow/40 bg-yellow/10">
              <PhotoStrip frames={4} tilt={-7} className="float-slow w-28" />
              <div className="absolute left-7 top-8" aria-hidden>
                <PhotoStrip frames={3} tilt={11} className="float-slower w-20" />
              </div>
              <div className="absolute bottom-7 right-5" aria-hidden>
                <PhotoStrip frames={3} tilt={-12} className="float-slower w-20" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 lg:py-22" aria-labelledby="moment-title">
        <Reveal>
          <SectionTitle
            overline="Make it last"
            title={<span id="moment-title">MORE THAN A MEAL</span>}
            lead="A simple extra moment when you dine with us."
          />
        </Reveal>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {MOMENTS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) as 0 | 1 | 2} as="li">
              <Panel className="h-full p-6">
                <span className="flex size-11 items-center justify-center rounded-full bg-yellow text-black">
                  <Icon name={item.icon} size={20} />
                </span>
                <p className="mt-5 text-[12px] font-bold tracking-[0.15em] text-grey">0{i + 1}</p>
                <h2 className="mt-1 text-[22px]">{item.title}</h2>
                <p className="mt-2 text-[15px] text-grey">{item.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-yellow py-16 lg:py-20" aria-labelledby="outlets-title">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              overline="Visit us"
              title={<span id="outlets-title">PHOTO BOOTH AT OUR OUTLETS</span>}
            />
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {BRANCHES.map((branch, i) => (
              <Reveal key={branch.id} delay={(i % 2) as 0 | 1}>
                <Panel className="flex h-full flex-col border-black p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-[21px]">{branch.name}</h2>
                    <Badge tone="success" icon="camera">Available</Badge>
                  </div>
                  <p className="mt-2 text-[14px] text-grey">
                    {branch.address}, {branch.postcode} {branch.city}
                  </p>
                  <p className="num mt-3 text-[13px] font-semibold text-ink">Today · {todayHours(branch)}</p>
                  <ButtonLink href={`/locations/${branch.id}`} variant="secondary" className="mt-5 self-start" iconEnd="arrowRight">
                    View outlet
                  </ButtonLink>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
