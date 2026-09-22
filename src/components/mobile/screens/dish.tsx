"use client";

import { productById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import {
  AndroidHeader,
  DeviceFrame,
  IosHeader,
  MobileActionBar,
} from "@/components/mobile/device";
import { Badge } from "@/components/ui/primitives";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  AndroidButton,
  IosButton,
  MobileChip,
  PlatformStepper,
  ScreenBody,
  ScreenContent,
  SpiceLevel,
} from "./shared";

const DISH = productById("p-soy")!;
const FIRE = productById("p-gochu")!;

function DishBody({
  soldOut,
  missing,
  platform,
}: {
  soldOut?: boolean;
  missing?: boolean;
  platform: "ios" | "android";
}) {
  const dish = soldOut ? FIRE : DISH;
  return (
    <ScreenContent pad={false}>
      <FoodImage src={dish.image} alt={dish.name} variant="dish" className="aspect-[4/3] w-full" />
      <div className="px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-grey">
              {dish.koreanName}
            </p>
            <h2 className="mt-1 font-display text-[24px] font-extrabold leading-tight text-ink">
              {dish.name}
            </h2>
          </div>
          <SpiceLevel level={dish.spiceLevel} />
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{dish.description}</p>
        <p className="num mt-3 font-display text-[22px] font-bold">{money(dish.price)}</p>
        {soldOut && (
          <Badge tone="danger" icon="cross" className="mt-2" soft>
            Sold out at SS15 tonight
          </Badge>
        )}

        <p className="mt-5 text-[12px] font-bold uppercase tracking-wide text-grey">Size · choose 1</p>
        <div className="mt-2 flex gap-2">
          <MobileChip active={!missing} platform={platform}>
            Regular
          </MobileChip>
          <MobileChip platform={platform}>Large · +{money(500)}</MobileChip>
        </div>
        {missing && (
          <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-cta">
            <Icon name="alert" size={14} /> Choose a size to add this dish
          </p>
        )}

        <p className="mt-5 text-[12px] font-bold uppercase tracking-wide text-grey">Sauce</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <MobileChip active platform={platform}>
            Soy garlic
          </MobileChip>
          <MobileChip platform={platform}>Yangnyeom</MobileChip>
          <MobileChip platform={platform}>Honey butter</MobileChip>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] font-semibold">Quantity</p>
          <PlatformStepper platform={platform} quantity={1} />
        </div>
      </div>
    </ScreenContent>
  );
}

export function IosDish() {
  return (
    <DeviceFrame
      platform="ios"
      title="Dish detail"
      caption="Sticky add-to-cart bar. Required options sit above quantity so a miss is obvious before the tap."
    >
      <ScreenBody platform="ios">
        <IosHeader title="Signature" back="Menu" />
        <DishBody platform="ios" />
        <MobileActionBar>
          <IosButton icon="plus">Add · {money(DISH.price)}</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidDish() {
  return (
    <DeviceFrame
      platform="android"
      title="Dish detail"
      caption="Material: filled bottom button, 16dp side padding, no iOS-style blur on the bar."
    >
      <ScreenBody platform="android">
        <AndroidHeader title="Signature chicken" back />
        <DishBody platform="android" />
        <MobileActionBar>
          <AndroidButton icon="plus">Add to cart · {money(DISH.price)}</AndroidButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosDishMissingOption() {
  return (
    <DeviceFrame
      platform="ios"
      title="Required option missing"
      id="dish-missing"
      caption="The primary button stays disabled until size is chosen. The error is text plus icon, not colour alone."
    >
      <ScreenBody platform="ios">
        <IosHeader title="Signature" back="Menu" />
        <DishBody platform="ios" missing />
        <MobileActionBar>
          <IosButton tone="plain">Choose a size first</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosDishSoldOut() {
  return (
    <DeviceFrame
      platform="ios"
      title="Sold out at this branch"
      id="dish-soldout"
      caption="The dish is still readable. Add to cart is replaced with a reason, not a dead button."
    >
      <ScreenBody platform="ios">
        <IosHeader title="Signature" back="Menu" />
        <DishBody platform="ios" soldOut />
        <MobileActionBar>
          <IosButton tone="plain">Notify me when it’s back</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}
