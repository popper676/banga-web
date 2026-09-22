import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Simulated sign-in for the BANG GA BANG GA operations console. Prototype only — no real authentication.",
};

/** Deliberately outside AdminShell: the console chrome appears after sign-in. */
export default function AdminLoginPage() {
  return <AdminLoginForm />;
}