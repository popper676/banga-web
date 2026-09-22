import Link from "next/link";
import { ButtonLink } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 py-20 text-center">
      <span className="deco-frame flex size-16 items-center justify-center text-deep">
        <Icon name="search" size={26} />
      </span>
      <p className="mt-6 font-display text-[13px] font-bold uppercase tracking-[0.2em] text-deep">
        404
      </p>
      <h1 className="mt-2 text-[clamp(32px,5vw,52px)] leading-tight">This plate is empty.</h1>
      <p className="mt-3 max-w-[44ch] text-[16px] leading-relaxed text-ink/80">
        The page is not on the menu. Try search, or go back to boneless chicken.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/menu">Explore the menu</ButtonLink>
        <ButtonLink href="/search" variant="secondary">
          Search
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Home
        </ButtonLink>
      </div>
      <p className="mt-8 text-[13px] text-grey">
        Looking for the prototype map?{" "}
        <Link href="/prototype" className="font-semibold text-deep underline">
          Open the screen index
        </Link>
        .
      </p>
    </div>
  );
}
