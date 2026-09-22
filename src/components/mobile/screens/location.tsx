"use client";

import { BRANCHES } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import {
  AndroidHeader,
  DeviceFrame,
  IosHeader,
  Snackbar,
} from "@/components/mobile/device";
import { Badge } from "@/components/ui/primitives";
import { MapView } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  AndroidButton,
  IosButton,
  MobileNotice,
  Overlay,
  ScreenBody,
  ScreenContent,
  designedCloses,
  designedHours,
  designedOpens,
} from "./shared";

const [SS15, TAYLORS] = BRANCHES;

/* ------------------------------------------------------------------ */
/* Location permission                                                 */
/* ------------------------------------------------------------------ */

/** The "why" screen the app shows before it triggers the system prompt. */
function PermissionBackdrop() {
  return (
    <ScreenContent className="px-5 pt-6">
      <h2 className="font-display text-[24px] font-bold leading-tight text-ink">
        Which branch are you ordering from?
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
        We use your location once, to sort the two branches by distance and to check that delivery
        reaches your address. You can always pick a branch by hand instead.
      </p>
      <MapView
        label="Map of Subang Jaya showing both BANG GA BANG GA branches"
        className="mt-5 h-40 w-full"
        pins={[
          { x: 30, y: 60, tone: "branch", name: "SS15" },
          { x: 72, y: 78, tone: "branch", name: "Taylor's" },
        ]}
      />
      <p className="mt-4 text-[13px] leading-snug text-grey">
        Nothing is stored on a server in this prototype, and you can pick a branch by hand at any
        time from the home screen.
      </p>
    </ScreenContent>
  );
}

export function IosLocationPermission() {
  return (
    <DeviceFrame
      platform="ios"
      title="Location permission"
      caption="The iOS system alert: centred, three stacked choices, and the recommended option in semibold. The app explains why before triggering it."
    >
      <ScreenBody platform="ios" clip>
        <IosHeader title="Choose a branch" back="Home" />
        <PermissionBackdrop />

        <Overlay align="center">
          <div
            role="alertdialog"
            aria-labelledby="ios-loc-title"
            aria-describedby="ios-loc-body"
            className="mx-auto w-[270px] overflow-hidden rounded-[14px] bg-cream/95 text-center backdrop-blur"
          >
            <div className="px-4 pb-4 pt-5">
              <p id="ios-loc-title" className="text-[17px] font-semibold leading-snug text-ink">
                Allow “BANG GA BANG GA” to use your location?
              </p>
              <p id="ios-loc-body" className="mt-1.5 text-[13px] leading-snug text-ink/80">
                We sort SS15 and Taylor&rsquo;s Lakeside by distance and check that delivery reaches
                you.
              </p>
              <div className="mt-3 overflow-hidden rounded-[8px]">
                <MapView label="Preview of the map shown while the alert is open" className="h-16 w-full" />
              </div>
            </div>
            <div className="border-t border-ink/12">
              <span className="ios-press block border-b border-ink/12 px-4 py-3 text-[17px] text-deep">
                Allow Once
              </span>
              <span className="ios-press block border-b border-ink/12 px-4 py-3 text-[17px] font-semibold text-deep">
                Allow While Using App
              </span>
              <span className="ios-press block px-4 py-3 text-[17px] text-deep">Don&rsquo;t Allow</span>
            </div>
          </div>
        </Overlay>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidLocationPermission() {
  return (
    <DeviceFrame
      platform="android"
      title="Location permission"
      caption="The Android runtime permission dialog: 28px corners, an icon above left-aligned text, and the three choices as full-width text rows."
    >
      <ScreenBody platform="android" clip>
        <AndroidHeader title="Choose a branch" back />
        <PermissionBackdrop />

        <Overlay align="center">
          <div
            role="alertdialog"
            aria-labelledby="and-loc-title"
            aria-describedby="and-loc-body"
            className="rounded-[28px] bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-mint text-deep">
              <Icon name="location" size={22} />
            </span>
            <p id="and-loc-title" className="mt-4 font-display text-[20px] font-semibold leading-snug text-ink">
              Allow Bang Ga Bang Ga to access this device&rsquo;s location?
            </p>
            <p id="and-loc-body" className="mt-2 text-[14px] leading-relaxed text-ink/80">
              Used to sort branches by distance and to check the delivery radius. Precise location is
              not required.
            </p>
            <div className="mt-4 flex flex-col">
              <span className="ripple min-h-12 rounded-[10px] px-2 py-3 text-[14px] font-bold text-deep">
                While using the app
              </span>
              <span className="ripple min-h-12 rounded-[10px] px-2 py-3 text-[14px] font-bold text-deep">
                Only this time
              </span>
              <span className="ripple min-h-12 rounded-[10px] px-2 py-3 text-[14px] font-bold text-deep">
                Don&rsquo;t allow
              </span>
            </div>
          </div>
        </Overlay>
      </ScreenBody>
    </DeviceFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Branch selector                                                     */
/* ------------------------------------------------------------------ */

function BranchFacts({ branch }: { branch: (typeof BRANCHES)[number] }) {
  return (
    <dl className="mt-2 flex flex-col gap-1 text-[12px] leading-snug text-grey">
      <div className="flex gap-1.5">
        <dt className="sr-only">Address</dt>
        <dd>
          {branch.address}, {branch.postcode} {branch.city}
        </dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="sr-only">Opening hours today</dt>
        <dd className="num">Today {designedHours(branch)}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="sr-only">Fulfilment</dt>
        <dd>
          Pickup about {branch.prepTimeMinutes} min · delivery within {branch.deliveryRadiusKm} km
        </dd>
      </div>
    </dl>
  );
}

export function IosBranchSelect() {
  return (
    <DeviceFrame
      platform="ios"
      title="Branch selector"
      caption="Grouped rows inside an inset card, a centred navigation title, and the closed branch explained with an inline banner rather than a snackbar."
    >
      <ScreenBody platform="ios">
        <IosHeader title="Choose a branch" back="Home" trailing={<span className="pr-1 text-[16px] text-deep">Map</span>} />
        <ScreenContent>
          <p className="text-[13px] leading-snug text-grey">
            Sorted by distance from your location. Prices and stock are set per branch.
          </p>

          <ul className="mt-3 flex flex-col gap-3">
            <li>
              <div className="rounded-[14px] border-2 border-ink bg-white p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[17px] leading-tight">{SS15.shortName}</h3>
                      <Badge tone="info" soft icon="star">
                        Recommended
                      </Badge>
                    </div>
                    <p className="num mt-0.5 text-[13px] font-semibold text-deep">
                      {SS15.distanceKm} km away
                    </p>
                  </div>
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-deep text-white">
                    <Icon name="check" size={14} />
                  </span>
                </div>
                <div className="mt-2">
                  <Badge tone="success" icon="check">
                    Open now · closes {designedCloses(SS15)}
                  </Badge>
                </div>
                <BranchFacts branch={SS15} />
                <p className="mt-2 border-t border-line pt-2 text-[12px] leading-snug text-grey">
                  {SS15.mapHint}
                </p>
              </div>
            </li>

            <li>
              <div className="rounded-[14px] border border-line bg-white p-3.5 opacity-95">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[17px] leading-tight">{TAYLORS.shortName}</h3>
                    <p className="num mt-0.5 text-[13px] text-grey">{TAYLORS.distanceKm} km away</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="neutral" soft icon="clock">
                    Closed · opens {designedOpens(TAYLORS)}
                  </Badge>
                  <Badge tone="warning" soft icon="alert">
                    Not accepting orders
                  </Badge>
                </div>
                <BranchFacts branch={TAYLORS} />
                <div className="mt-2.5">
                  <MobileNotice tone="warning" title="This branch cannot take your order yet">
                    The kitchen opens at {designedOpens(TAYLORS)}. You can browse the menu, or
                    schedule collection for later today.
                  </MobileNotice>
                </div>
              </div>
            </li>

            <li>
              <div className="rounded-[14px] border border-dashed border-line bg-white/60 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[17px] leading-tight text-grey">Cheras, Kuala Lumpur</h3>
                    <p className="mt-0.5 text-[12px] text-grey">
                      Jalan Cheras Awana · opening early 2027
                    </p>
                  </div>
                  <Badge tone="neutral" soft icon="sparkle">
                    Coming soon
                  </Badge>
                </div>
              </div>
            </li>
          </ul>

          <p className="mt-3 px-1 text-[12px] leading-snug text-grey">
            Switching branch later re-checks your cart, because stock is set per branch each morning.
          </p>
        </ScreenContent>
        <div className="sticky bottom-0 border-t border-line bg-white px-4 pb-6 pt-3">
          <IosButton tone="primary">Order from {SS15.shortName}</IosButton>
        </div>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidBranchSelect() {
  return (
    <DeviceFrame
      platform="android"
      title="Branch selector"
      caption="Left-aligned app bar, elevated Material cards with ripple, and a snackbar carrying the closed-branch message instead of an inline banner."
    >
      <ScreenBody platform="android">
        <AndroidHeader
          title="Choose a branch"
          back
          trailing={
            <span className="ripple mr-1 flex size-11 items-center justify-center rounded-full text-ink">
              <Icon name="pin" size={20} />
            </span>
          }
        />
        <ScreenContent>
          <p className="text-[13px] leading-snug text-grey">
            Sorted by distance from your location. Prices and stock are set per branch.
          </p>

          <ul className="mt-3 flex flex-col gap-3">
            <li>
              <div className="ripple rounded-[16px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-1 ring-deep/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[17px] leading-tight">{SS15.shortName}</h3>
                      <Badge tone="info" soft icon="star">
                        Recommended
                      </Badge>
                    </div>
                    <p className="num mt-0.5 text-[13px] font-semibold text-deep">
                      {SS15.distanceKm} km away
                    </p>
                  </div>
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-deep"
                    aria-hidden
                  >
                    <span className="size-2.5 rounded-full bg-deep" />
                  </span>
                </div>
                <div className="mt-2">
                  <Badge tone="success" icon="check">
                    Open now · closes {designedCloses(SS15)}
                  </Badge>
                </div>
                <BranchFacts branch={SS15} />
                <p className="mt-2 border-t border-line pt-2 text-[12px] leading-snug text-grey">
                  {SS15.mapHint}
                </p>
                <div className="mt-3 flex gap-2">
                  <AndroidButton tone="filled" full={false} className="flex-1">
                    Order here
                  </AndroidButton>
                  <AndroidButton tone="outlined" full={false} icon="phone">
                    Call
                  </AndroidButton>
                </div>
              </div>
            </li>

            <li>
              <div className="rounded-[16px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[17px] leading-tight">{TAYLORS.shortName}</h3>
                    <p className="num mt-0.5 text-[13px] text-grey">{TAYLORS.distanceKm} km away</p>
                  </div>
                  <span
                    className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-grey/50"
                    aria-hidden
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="neutral" soft icon="clock">
                    Closed · opens {designedOpens(TAYLORS)}
                  </Badge>
                  <Badge tone="warning" soft icon="alert">
                    Not accepting orders
                  </Badge>
                </div>
                <BranchFacts branch={TAYLORS} />
                <div className="mt-3 flex gap-2">
                  <span className="ripple inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-ink/8 px-5 text-[14px] font-bold text-grey">
                    Unavailable
                  </span>
                  <AndroidButton tone="text" full={false}>
                    Schedule
                  </AndroidButton>
                </div>
              </div>
            </li>

            <li>
              <div className={cn("rounded-[16px] border border-dashed border-line bg-white/60 p-4")}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[17px] leading-tight text-grey">Cheras, Kuala Lumpur</h3>
                    <p className="mt-0.5 text-[12px] text-grey">
                      Jalan Cheras Awana · opening early 2027
                    </p>
                  </div>
                  <Badge tone="neutral" soft icon="sparkle">
                    Coming soon
                  </Badge>
                </div>
              </div>
            </li>
          </ul>
        </ScreenContent>
        <div className="pb-4">
          <Snackbar
            text={`${TAYLORS.shortName} is closed until ${designedOpens(TAYLORS)}`}
            action="Schedule"
          />
        </div>
      </ScreenBody>
    </DeviceFrame>
  );
}
