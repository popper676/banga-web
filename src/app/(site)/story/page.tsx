import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/primitives";
import { FoodImage, PhotoStrip } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/site/reveal";
import { SITE_CONTENT } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Korean comfort food, boneless chicken and good memories in Subang Jaya. Meet BANG GA BANG GA.",
};

const { story, media } = SITE_CONTENT;

const PROMISES = [
  { icon: "cook" as const, title: "Korean flavour", body: "Sauces made in-house." },
  { icon: "shield" as const, title: "Muslim-friendly", body: "Made for everyone at the table." },
  { icon: "tag" as const, title: "Everyday value", body: "Individual sets under RM20." },
];

export default function StoryPage() {
  return (
    <>
      <section
        className="relative -mt-22 overflow-hidden bg-black pb-18 pt-32 text-white lg:-mt-24 lg:pb-26 lg:pt-40"
        aria-labelledby="story-hero-title"
      >
        <div className="absolute inset-y-0 right-0 w-[52%] opacity-[0.12]" aria-hidden>
          <Image
            src={media.menuArtwork.src}
            alt=""
            fill
            priority
            sizes="52vw"
            className="object-cover object-top grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />
        </div>
        <div className="grain-layer opacity-25" />

        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#feb513]">
              {story.eyebrow}
            </p>
            <h1
              id="story-hero-title"
              className="mt-5 max-w-[9ch] text-[clamp(48px,8vw,108px)] leading-[0.86] tracking-[-0.055em] text-white"
            >
              {story.title}
            </h1>
            <p className="mt-7 max-w-[44ch] text-[17px] leading-relaxed text-white/72 lg:text-[19px]">
              {story.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/menu" size="lg" iconEnd="arrowRight">
                View the menu
              </ButtonLink>
              <ButtonLink href="/locations" size="lg" variant="dark">
                Find an outlet
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative mx-auto max-w-118 lg:ml-auto">
              <div className="rounded-[32px] border border-white/18 bg-white/7 p-3 backdrop-blur-sm">
                <FoodImage
                  src={media.storyHero.src}
                  alt={media.storyHero.alt}
                  variant="scene"
                  className="aspect-[4/5] w-full"
                  rounded="rounded-[24px]"
                />
              </div>
              <div className="absolute -bottom-5 -left-4 w-34 rounded-[22px] bg-white p-3 shadow-2xl sm:w-42">
                <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
                  <Image
                    src={media.photoBoothLogo.src}
                    alt={media.photoBoothLogo.alt}
                    fill
                    sizes="168px"
                    className="scale-[1.55] object-contain"
                  />
                </div>
              </div>
              <p className="absolute -right-2 top-8 rounded-full bg-[#feb513] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                Image placeholder
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-18 lg:py-28" aria-labelledby="origin-title">
        <div className="grid gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <Reveal>
            <div className="relative grid grid-cols-2 gap-3">
              <FoodImage
                src={media.founders.src}
                alt={media.founders.alt}
                variant="portrait"
                className="aspect-[4/5] w-full"
                rounded="rounded-[28px]"
              />
              <FoodImage
                src={media.restaurant.src}
                alt={media.restaurant.alt}
                variant="scene"
                className="mt-12 aspect-[4/5] w-full"
                rounded="rounded-[28px]"
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] shadow-lg">
                Replace from Admin
              </span>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-black/55">Our beginning</p>
            <h2 id="origin-title" className="mt-3 max-w-[12ch] text-[clamp(36px,5.8vw,72px)] leading-[0.94]">
              {story.originTitle}
            </h2>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-black/68 lg:text-[19px]">
              {story.originBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Born in SS15", "Boneless chicken", "Two outlets"].map((item) => (
                <span key={item} className="rounded-full border border-black/15 px-4 py-2 text-[13px] font-semibold">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#feb513] py-18 lg:py-24" aria-labelledby="promise-title">
        <div className="absolute -right-18 -top-24 size-88 rounded-full border-[54px] border-black/6" aria-hidden />
        <div className="container-page relative">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-black/60">What we promise</p>
                <h2 id="promise-title" className="mt-3 max-w-[12ch] text-[clamp(36px,5.8vw,72px)] leading-[0.92]">
                  {story.promiseTitle}
                </h2>
              </div>
              <p className="max-w-[38ch] text-[16px] leading-relaxed text-black/65 lg:text-right">
                {story.promiseBody}
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PROMISES.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) as 0 | 1 | 2}>
                <article className="h-full rounded-[24px] border border-black/12 bg-white p-6 shadow-[0_14px_0_rgba(0,0,0,0.06)]">
                  <span className="flex size-11 items-center justify-center rounded-full bg-black text-[#feb513]">
                    <Icon name={item.icon} size={19} />
                  </span>
                  <h3 className="mt-8 text-[22px]">{item.title}</h3>
                  <p className="mt-2 text-[15px] text-black/60">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black py-18 text-white lg:py-26" aria-labelledby="booth-title">
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1fr_.85fr]">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#feb513]">At our outlets</p>
            <h2 id="booth-title" className="mt-3 max-w-[10ch] text-[clamp(38px,6vw,78px)] leading-[0.92] text-white">
              {story.photoBoothTitle}
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-white/68">
              {story.photoBoothBody}
            </p>
            <ButtonLink href="/locations" size="lg" className="mt-8">
              Find a photo booth
            </ButtonLink>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative mx-auto flex min-h-80 w-full max-w-112 items-center justify-center rounded-[32px] border border-white/14 bg-white/6 p-8">
              <div className="relative size-52 overflow-hidden rounded-full bg-white p-2 shadow-2xl">
                <Image
                  src={media.photoBoothLogo.src}
                  alt={media.photoBoothLogo.alt}
                  fill
                  sizes="208px"
                  className="scale-[1.55] object-contain"
                />
              </div>
              <PhotoStrip frames={3} tilt={8} className="absolute bottom-5 right-7 w-18" />
              <PhotoStrip frames={3} tilt={-8} className="absolute left-7 top-5 w-18" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 text-center lg:py-22">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-black/55">Two locations</p>
          <h2 className="mx-auto mt-3 max-w-[12ch] text-[clamp(34px,5vw,64px)] leading-[0.94]">COME HUNGRY. LEAVE SMILING.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/menu" size="lg">Order now</ButtonLink>
            <ButtonLink href="/locations" size="lg" variant="secondary">View locations</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
