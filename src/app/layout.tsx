import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastHost } from "@/components/ui/overlays";
import { PrototypePanel } from "@/components/prototype-panel";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BANG GA BANG GA — Nice to meet you. Now, let's eat.",
    template: "%s · BANG GA BANG GA",
  },
  description:
    "Muslim-friendly Korean dining in Subang Jaya. Boneless chicken, individual sets under RM20, and a photo booth to make it last. UI prototype.",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-MY" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-cream text-ink antialiased">
        <StoreProvider>
          {children}
          <ToastHost />
          <PrototypePanel />
        </StoreProvider>
      </body>
    </html>
  );
}
