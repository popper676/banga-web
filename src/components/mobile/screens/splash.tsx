"use client";

import { useState } from "react";
import { BRANCHES } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import { DeviceFrame } from "@/components/mobile/device";
import { FoodImage } from "@/components/ui/media";
import { Icon, type IconKey } from "@/components/ui/icons";
import { AndroidButton, IosButton, ScreenBody } from "./shared";

/* ------------------------------------------------------------------ */
/* Splash                                                              */
/* ------------------------------------------------------------------ */

export function IosSplash() {
  return (
    <DeviceFrame
      platform="ios"
      title="Launch screen"
      caption="A static launch image, exactly as iOS requires — no spinner, no network call, no text that would need translating."
      bg="bg-teal"
    >
      <ScreenBody platform="ios" clip className="items-center justify-center px-8">
        <div className="grain absolute inset-0">
          <div className="grain-layer" />
        </div>
        <div className="relative flex flex-col items-center text-center">
          <span className="deco-frame flex size-20 items-center justify-center text-ink">
            <span className="font-display text-[30px] font-extrabold leading-none">방가</span>
          </span>
          <h2 className="mt-6 font-display text-[30px] font-extrabold leading-[0.95] text-ink">
            BANG GA
            <br />
            BANG GA
          </h2>
          <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.22em] text-ink/70">
            Tradition &amp; Trendy
          </p>
        </div>
        <p className="absolute bottom-10 left-0 right-0 text-center text-[11px] text-ink/55">
          Muslim-friendly Korean · Subang Jaya
        </p>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidSplash() {
  return (
    <DeviceFrame
      platform="android"
      title="Splash screen"
      caption="The Android 12+ splash API: the adaptive launcher icon animates in the centre of a windowBackground, with the brand line as a footer."
      bg="bg-cream"
    >
      <ScreenBody platform="android" clip className="items-center justify-center">
        <div className="flex size-30 items-center justify-center rounded-full bg-teal">
          <span className="font-display text-[34px] font-extrabold leading-none text-ink">방가</span>
        </div>
        <p className="absolute bottom-12 left-0 right-0 text-center font-display text-[15px] font-bold uppercase tracking-[0.18em] text-ink">
          Bang Ga Bang Ga
        </p>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="h-1 w-24 overflow-hidden rounded-full bg-mint">
            <span className="block h-full w-2/3 rounded-full bg-deep" />
          </span>
        </div>
      </ScreenBody>
    </DeviceFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */

interface Card {
  icon: IconKey;
  title: string;
  body: string;
  image: string;
  alt: string;
}

const CARDS: Card[] = [
  {
    icon: "pin",
    title: "Two branches, one standard",
    body: `Order from ${BRANCHES[0].name} or ${BRANCHES[1].name}. Every item you add is checked against the branch you picked, so nothing surprises you at checkout.`,
    image: "/images/brand/ss15-dining-room.jpg",
    alt: "The BANG GA BANG GA dining room in SS15 Subang Jaya",
  },
  {
    icon: "shield",
    title: "Muslim-friendly, every item",
    body: "No pork, no lard and no alcohol anywhere in our kitchen. Even the kimchi is fermented without fish sauce or shrimp paste, so the whole table can share.",
    image: "/images/food/house-kimchi.jpg",
    alt: "House kimchi fermented without fish sauce",
  },
  {
    icon: "bike",
    title: "Collect fast, or have it sent",
    body: `Pickup is ready in about ${BRANCHES[0].prepTimeMinutes} minutes. Delivery runs within ${BRANCHES[0].deliveryRadiusKm} km of SS15 through Lalamove, with live tracking.`,
    image: "/images/food/soy-garlic-boneless.jpg",
    alt: "A box of soy garlic boneless chicken ready for collection",
  },
];

function OnboardingArt({ card }: { card: Card }) {
  return (
    <div className="relative">
      <FoodImage
        src={card.image}
        alt={card.alt}
        variant="scene"
        className="aspect-[4/3] w-full"
        rounded="rounded-[28px_6px_28px_6px]"
      />
      <span className="absolute -bottom-4 left-4 flex size-12 items-center justify-center rounded-[14px] bg-ink text-cream">
        <Icon name={card.icon} size={22} />
      </span>
    </div>
  );
}

export function IosOnboarding() {
  const [index, setIndex] = useState(1);
  const card = CARDS[index];
  const last = index === CARDS.length - 1;
  return (
    <DeviceFrame
      platform="ios"
      title="Onboarding · card 2 of 3"
      caption="Skip sits top-right in the navigation area. Dots sit directly above a full-width rounded-rectangle button. Tap the dots to page through."
    >
      <ScreenBody platform="ios" clip>
        <div className="flex h-11 items-center justify-end px-4">
          <span className="text-[16px] font-normal text-deep">Skip</span>
        </div>
        <div className="flex-1 px-6 pt-2">
          <OnboardingArt card={card} />
          <h2 className="mt-9 font-display text-[28px] font-extrabold leading-[1.08] text-ink">
            {card.title}
          </h2>
          <p className="mt-2.5 text-[16px] leading-relaxed text-ink/80">{card.body}</p>
        </div>
        <div className="px-6 pb-9">
          <div className="flex justify-center gap-1.5 pb-5">
            {CARDS.map((c, i) => (
              <button
                key={c.title}
                type="button"
                aria-label={`Go to card ${i + 1} of ${CARDS.length}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="flex size-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "rounded-full transition-all",
                    i === index ? "h-2 w-5 bg-ink" : "size-2 bg-ink/25",
                  )}
                />
              </button>
            ))}
          </div>
          <IosButton tone="primary">{last ? "Get started" : "Continue"}</IosButton>
        </div>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidOnboarding() {
  const [index, setIndex] = useState(1);
  const card = CARDS[index];
  const last = index === CARDS.length - 1;
  return (
    <DeviceFrame
      platform="android"
      title="Onboarding · card 2 of 3"
      caption="Material pager: Skip is a text button on the left, the filled Next button is on the right, and the dots sit between them. Tap the dots to page through."
    >
      <ScreenBody platform="android" clip>
        <div className="flex-1 px-5 pt-8">
          <OnboardingArt card={card} />
          <h2 className="mt-9 font-display text-[26px] font-bold leading-[1.12] text-ink">
            {card.title}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink/80">{card.body}</p>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-8 pt-4">
          <span className="ripple inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-bold text-deep">
            Skip
          </span>
          <div className="flex gap-1.5">
            {CARDS.map((c, i) => (
              <button
                key={c.title}
                type="button"
                aria-label={`Go to card ${i + 1} of ${CARDS.length}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="flex size-6 items-center justify-center"
              >
                <span
                  className={cn("size-2 rounded-full", i === index ? "bg-deep" : "bg-ink/20")}
                />
              </button>
            ))}
          </div>
          <AndroidButton tone="filled" full={false} icon={last ? "check" : undefined}>
            {last ? "Start" : "Next"}
          </AndroidButton>
        </div>
      </ScreenBody>
    </DeviceFrame>
  );
}
