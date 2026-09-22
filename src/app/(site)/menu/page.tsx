import type { Metadata } from "next";
import { MenuBrowser } from "@/components/site/menu-browser";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Boneless Korean chicken, individual sets under RM20, sharing platters, sides and drinks. Prices and availability shown for the branch you are ordering from.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <MenuBrowser initialCategory={first(params.category)} initialQuery={first(params.q)} />
  );
}
