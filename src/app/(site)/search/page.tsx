import type { Metadata } from "next";
import { SearchScreen } from "@/components/site/search-screen";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search every BANG GA BANG GA dish, sauce, set and side. Filter by category, spice level and what is in stock at your branch today.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return <SearchScreen initialQuery={first(params.q) ?? ""} />;
}
