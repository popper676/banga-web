import Link from "next/link";
import { BRANCHES, CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { todayHours } from "@/lib/format";
import { Badge, ButtonLink, SectionTitle } from "@/components/ui/primitives";
import { FoodImage, PhotoStrip } from "@/components/ui/media";
import { ParallaxScene, Reveal } from "@/components/site/reveal";
import { ProductCard } from "@/components/site/product-card";
import { FoodIdentityRail } from "@/components/site/food-rail";
import { BranchCard } from "@/components/site/branch-card";
import { ChickenScrollHero } from "@/components/site/chicken-scroll-hero";
import styles from "./home-page.module.css";

export default function HomePage() {
  const featured = PRODUCTS.filter((p) => p.popular).slice(0, 4);

  return (
    <div className={styles.duotone}>
      {/* S1 — scroll-scrub hero. The final frame remains on the plate. */}
      <ChickenScrollHero />

      {/* ---------------------------------------------------------- */}
      {/* S2 — BRAND STORY                                            */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.whiteSurface} ${styles.storySection} py-20 lg:py-28`} aria-labelledby="story-title">
        <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="order-2 lg:order-1">
            <div className={`${styles.storyVisual} relative`}>
              <span className={styles.visualIndex}>01 / OUR STORY</span>
              <FoodImage
                src="/images/brand/founders.jpg"
                alt="The founders of BANG GA BANG GA in the SS15 dining room"
                variant="portrait"
                className="aspect-[4/5] w-full"
                rounded="rounded-[28px_6px_28px_6px]"
              />
              <div className="absolute -bottom-5 -right-3 rounded-[18px] bg-ink px-5 py-4 text-cream lg:-right-6">
                <p className="num font-display text-[28px] font-extrabold leading-none">3+</p>
                <p className="mt-1 text-[12px] uppercase tracking-wider text-cream/70">
                  years in Subang Jaya
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1} className="order-1 lg:order-2">
            <SectionTitle
              overline="Our story"
              title={<span id="story-title">TRADITION &amp; TRENDY</span>}
            />
            <p className="mt-6 max-w-[36ch] text-[17px] leading-relaxed text-ink/80">
              Korean comfort food. Boneless chicken. Everyday prices.
            </p>
            <ButtonLink href="/story" variant="secondary" className={`${styles.buttonOnWhite} mt-7`} iconEnd="arrowRight">
              Read our story
            </ButtonLink>
          </Reveal>
        </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* S3 — FOOD IDENTITY                                          */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.blackSurface} py-20 lg:py-28`} aria-labelledby="food-title">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              overline="What we serve"
              title={<span id="food-title">TRADITION &amp; TRENDY</span>}
              lead="Korean flavours, boneless chicken and complete meals made for everyday dining."
            />
          </Reveal>
        </div>

        <FoodIdentityRail />

        <div className="container-page mt-12">
          <Reveal delay={1}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { t: "Korean flavours.", d: "Sauces made in-house." },
                { t: "Boneless chicken.", d: "Easy to share and enjoy." },
                { t: "Everyday value.", d: "Individual sets under RM20." },
                { t: "Muslim-friendly.", d: "Welcoming to everyone." },
              ].map((item, i) => (
                <div key={item.t} className="rounded-[16px] border border-deep/15 bg-white p-5">
                  <span className="num font-display text-[13px] font-bold text-teal">
                    0{i + 1}
                  </span>
                  <p className="mt-2 font-display text-[19px] font-bold leading-snug text-ink">
                    {item.t}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-grey">{item.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[18px] border border-deep/20 bg-white p-5">
              <Badge tone="success" icon="shield">
                Muslim-friendly kitchen
              </Badge>
              <Badge tone="warning" icon="tag">
                Individual sets under RM20
              </Badge>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* S4 — EVERYDAY MOMENTS                                       */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.whiteSurface} ${styles.momentsSection} py-20 lg:py-28`} aria-labelledby="moments-title">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <SectionTitle
              overline="Everyday moments"
              title={<span id="moments-title">COME HUNGRY. LEAVE SMILING.</span>}
            />
            <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-ink/80">
              Quick lunch, casual dinner or a table full of friends—we&rsquo;re ready.
            </p>
            <ButtonLink href="/menu" className={`${styles.buttonOnWhite} mt-7`} iconEnd="arrowRight">
              Explore Our Menu
            </ButtonLink>
          </Reveal>

          <Reveal delay={1}>
            <div className={styles.momentsGrid}>
              {[
                { src: "/images/lifestyle/students.jpg", alt: "Students sharing a set meal between classes", label: "Lunch between classes" },
                { src: "/images/lifestyle/friends.jpg", alt: "Friends laughing over a sharing platter", label: "Friends & favourites" },
                { src: "/images/lifestyle/family.jpg", alt: "A family at a table with the family feast", label: "Family table" },
                { src: "/images/lifestyle/counter.jpg", alt: "The counter at the SS15 branch during lunch", label: "Everyday comfort" },
              ].map((img, i) => (
                <div key={img.src} className={styles.momentCard}>
                  <FoodImage
                    src={img.src}
                    alt={img.alt}
                    variant="scene"
                    className="h-full min-h-[180px] w-full"
                    rounded="rounded-none"
                  />
                  <span className={styles.momentNumber}>0{i + 1}</span>
                  <p className={styles.momentLabel}>{img.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* S5 — FEATURED MENU · fast zone, no motion tricks            */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.blackSurface} ${styles.productSection} py-20 lg:py-24`} aria-labelledby="menu-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle overline="Order now" title={<span id="menu-title">POPULAR RIGHT NOW</span>} />
            <ButtonLink href="/menu" variant="secondary" className={styles.buttonOnBlack} iconEnd="arrowRight">
              View full menu
            </ButtonLink>
          </div>

          <nav aria-label="Menu categories" className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/menu?category=${c.slug}`}
                className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#feb513] px-4 text-[14px] font-semibold text-[#feb513] transition-colors hover:bg-[#feb513] hover:text-black"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className={`${styles.productGrid} mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4`}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* S6 — PHOTO BOOTH                                            */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.blackSurface} on-dark grain relative overflow-hidden py-20 lg:py-28`} aria-labelledby="booth-title">
        <div className="grain-layer" />
        <div className="container-page relative grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
              Photo booth
            </p>
            <h2 id="booth-title" className="text-[clamp(32px,5vw,64px)] leading-[1.02] text-[#feb513]">
              MORE THAN A MEAL.
            </h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-[#feb513]/80">
              Finish your meal with a photo at our in-store booth. Bring your friends, take the
              strip home and make the visit last.
            </p>

            <div className="mt-9 border-t border-[#feb513]/35 pt-8">
              <h3 className="font-display text-[clamp(28px,4vw,44px)] leading-none text-teal">
                MAKE IT LAST.
              </h3>
              <p className="mt-4 font-display text-[19px] font-bold text-[#feb513]">
                Eat together. Snap together. Make it last.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/locations" className={styles.buttonOnBlack} iconEnd="arrowRight">
                  Find a photo booth
                </ButtonLink>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <ParallaxScene className={`${styles.photoBoothScene} relative mx-auto flex h-96 w-full max-w-md items-center justify-center`}>
              {/* Curtain */}
              <div className="layer-25d absolute inset-x-8 inset-y-0 rounded-[24px] bg-ink/45" data-depth="0.3" />
              <div className="layer-25d absolute left-8 top-0 h-full w-10 rounded-l-[24px] bg-[#feb513]/70" data-depth="0.6" aria-hidden />
              <div className="layer-25d absolute right-8 top-0 h-full w-10 rounded-r-[24px] bg-[#feb513]/70" data-depth="0.6" aria-hidden />
              <div className="layer-25d relative" data-depth="1.4">
                <PhotoStrip frames={4} tilt={-6} className="float-slow w-28" />
              </div>
              <div className="layer-25d absolute left-2 top-10" data-depth="2.2" aria-hidden>
                <PhotoStrip frames={3} tilt={12} className="float-slower w-20" />
              </div>
              <div className="layer-25d absolute bottom-6 right-0" data-depth="2" aria-hidden>
                <PhotoStrip frames={3} tilt={-14} className="float-slower w-20" />
              </div>
              <span className="layer-25d absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#feb513] px-4 py-2 text-[13px] font-bold text-black" data-depth="2.6">
                Available at our outlets
              </span>
            </ParallaxScene>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* S7 — LOCATIONS                                              */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.tealSurface} container-page py-20 lg:py-28`} aria-labelledby="find-title">
        <Reveal>
          <SectionTitle
            overline="Two locations. One Korean experience."
            title={<span id="find-title">FIND US</span>}
            lead="Choose your nearest outlet for dine-in, pickup or delivery."
          />
        </Reveal>

        <div className={`${styles.branchGrid} mt-10 grid gap-5 lg:grid-cols-2`}>
          {BRANCHES.map((b, i) => (
            <Reveal key={b.id} delay={i === 0 ? 0 : 1}>
              <BranchCard branch={b} />
            </Reveal>
          ))}
        </div>

        <p className="num mt-6 text-[13px] text-grey">
          Today: {BRANCHES.map((b) => `${b.shortName} ${todayHours(b)}`).join(" · ")}
        </p>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* S8 — CLOSING CTA                                            */}
      {/* ---------------------------------------------------------- */}
      <section className={`${styles.blackSurface} grain relative overflow-hidden py-20 lg:py-28`} aria-labelledby="closing-title">
        <div className="grain-layer" />
        <div className="container-page relative text-center">
          <Reveal>
            <p className="font-display text-[13px] font-bold uppercase tracking-[0.3em] text-ink/65">
              BANG GA BANG GA
            </p>
            <h2 id="closing-title" className="mt-4 text-[clamp(34px,6vw,76px)] leading-[0.98]">
              TRADITION &amp; TRENDY
            </h2>
            <p className="mx-auto mt-5 max-w-[42ch] text-[18px] leading-relaxed text-ink/75">
              Korean flavours. Good food. Great memories.
            </p>
            <p className="mt-8 font-display text-[clamp(24px,3.5vw,40px)] tracking-tight text-[#feb513]">
              MAKE IT LAST.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/menu" size="lg" variant="dark" className={styles.buttonOnBlack}>
                Order Now
              </ButtonLink>
              <ButtonLink href="/locations" size="lg" variant="dark" className={styles.buttonOnBlack}>
                Find a Location
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
