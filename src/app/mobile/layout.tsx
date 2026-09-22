import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mobile prototype",
  description: "iOS and Android screen galleries for the BANG GA BANG GA ordering apps. UI only.",
};

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="border-b border-line bg-white">
        <div className="container-page flex h-12 items-center gap-4 text-[13px] font-semibold">
          <Link href="/" className="text-deep hover:underline">
            Website
          </Link>
          <Link href="/mobile" className="text-ink">
            Mobile
          </Link>
          <Link href="/admin" className="text-deep hover:underline">
            Admin
          </Link>
          <Link href="/prototype" className="ml-auto text-deep hover:underline">
            Screen index
          </Link>
        </div>
      </div>
      <div id="main">{children}</div>
    </div>
  );
}
