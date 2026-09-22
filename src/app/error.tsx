"use client";

import { Button, ButtonLink } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const id = error.digest ?? "BG-ERR-4412";
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-cta/12 text-cta">
        <Icon name="alert" size={26} />
      </span>
      <h1 className="mt-5 text-[clamp(28px,4vw,44px)]">Something went wrong</h1>
      <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-ink/80">
        The kitchen is fine — this screen had an error. Try again, or go home. If it keeps happening,
        quote the reference below when you contact us.
      </p>
      <p className="num mt-4 text-[13px] text-grey">Reference {id}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
