import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Admin console", template: "%s · BANG GA BANG GA admin" },
  description:
    "Restaurant admin console prototype — orders, branch confirmation, kitchen, delivery, payments and configuration. Mock data only.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {children}
    </>
  );
}
