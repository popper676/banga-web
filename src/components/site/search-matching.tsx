"use client";

/**
 * Matching, ranking and highlighting for /search. Pure functions over the mock
 * catalogue — there is no search service anywhere in this prototype.
 */

import { Fragment } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/lib/types";

export function queryTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function haystack(product: Product): string {
  return [
    product.name,
    product.koreanName ?? "",
    product.description,
    product.longDescription,
    ...product.tags,
    ...product.allergens,
  ]
    .join(" ")
    .toLowerCase();
}

/** Every term has to appear somewhere in the dish, in any field. */
export function matchesTerms(product: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const hay = haystack(product);
  return terms.every((term) => hay.includes(term));
}

/** Name hits outrank tag hits, which outrank description hits. */
export function relevance(product: Product, terms: string[]): number {
  if (terms.length === 0) return product.popular ? 1 : 0;
  const name = product.name.toLowerCase();
  const korean = (product.koreanName ?? "").toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (name.startsWith(term)) score += 6;
    else if (name.includes(term)) score += 4;
    if (korean.includes(term)) score += 3;
    if (product.tags.some((tag) => tag.toLowerCase().includes(term))) score += 2;
    if (product.description.toLowerCase().includes(term)) score += 1;
  }
  if (product.popular) score += 0.5;
  if (product.signature) score += 0.25;
  return score;
}

/** A short window of text around the first hit, for description matches. */
function snippet(source: string, terms: string[]): string {
  const lower = source.toLowerCase();
  const at = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, at - 36);
  const end = Math.min(source.length, at + 72);
  return `${start > 0 ? "…" : ""}${source.slice(start, end).trim()}${end < source.length ? "…" : ""}`;
}

export interface MatchContext {
  label: string;
  text: string;
}

/** Where the dish matched, so the highlight has something honest to point at. */
export function matchContext(product: Product, terms: string[]): MatchContext | null {
  if (terms.length === 0) return null;

  const nameHit = terms.some(
    (t) =>
      product.name.toLowerCase().includes(t) ||
      (product.koreanName ?? "").toLowerCase().includes(t),
  );
  if (nameHit) {
    return {
      label: "Name",
      text: product.koreanName ? `${product.name} · ${product.koreanName}` : product.name,
    };
  }

  const tagHit = product.tags.find((tag) => terms.some((t) => tag.toLowerCase().includes(t)));
  if (tagHit) return { label: "Tag", text: tagHit };

  const allergenHit = product.allergens.find((a) =>
    terms.some((t) => a.toLowerCase().includes(t)),
  );
  if (allergenHit) return { label: "Contains", text: allergenHit };

  const source = terms.some((t) => product.description.toLowerCase().includes(t))
    ? product.description
    : product.longDescription;
  return { label: "Description", text: snippet(source, terms) };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Marks each matched substring. Falls back to plain text when nothing matches. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const ordered = [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const parts = text.split(new RegExp(`(${ordered.join("|")})`, "ig"));
  const lookup = new Set(terms);

  return (
    <>
      {parts.map((part, i) =>
        lookup.has(part.toLowerCase()) ? (
          <mark key={i} className="rounded-[3px] bg-yellow px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Spelling help                                                       */
/* ------------------------------------------------------------------ */

const VOCABULARY: string[] = Array.from(
  new Set(
    [
      ...PRODUCTS.flatMap((p) => p.name.toLowerCase().split(/[^a-z0-9]+/)),
      ...PRODUCTS.flatMap((p) => p.tags.map((t) => t.toLowerCase())),
      ...PRODUCTS.flatMap((p) => p.allergens.map((a) => a.toLowerCase())),
      ...CATEGORIES.flatMap((c) => c.name.toLowerCase().split(/\s+/)),
      "kimchi",
      "tteokbokki",
      "yangnyeom",
      "gochujang",
      "kimbap",
      "boneless",
      "halal",
      "sharing",
      "student",
      "delivery",
      "pickup",
    ].filter((word) => word.length > 2),
  ),
);

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** "kimchee" → "kimchi". Null when the query already looks like real words. */
export function spellingSuggestion(query: string): string | null {
  const terms = queryTerms(query);
  if (terms.length === 0) return null;

  let corrected = false;
  const fixed = terms.map((term) => {
    if (term.length < 4 || VOCABULARY.includes(term)) return term;
    let best = term;
    let bestDistance = term.length > 7 ? 3 : 2;
    for (const word of VOCABULARY) {
      if (Math.abs(word.length - term.length) > bestDistance) continue;
      const distance = editDistance(term, word);
      if (distance > 0 && distance <= bestDistance) {
        bestDistance = distance;
        best = word;
      }
    }
    if (best !== term) corrected = true;
    return best;
  });

  return corrected ? fixed.join(" ") : null;
}

/** Closest dishes by name, used when a query returns nothing at all. */
export function nearestProducts(query: string, limit = 3): Product[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  return PRODUCTS.map((product) => {
    const words = `${product.name} ${product.koreanName ?? ""} ${product.tags.join(" ")}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    const distance = Math.min(
      ...terms.map((term) => Math.min(...words.map((word) => editDistance(term, word)))),
    );
    return { product, distance };
  })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((entry) => entry.product);
}
