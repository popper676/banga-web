import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, productBySlug } from "@/lib/mock-data";
import { ProductDetail } from "./product-detail";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Item not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const sameCategory = PRODUCTS.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId,
  );
  const crowdPleasers = PRODUCTS.filter(
    (p) => p.id !== product.id && p.categoryId !== product.categoryId && p.popular,
  );
  const related = [...sameCategory, ...crowdPleasers].slice(0, 3);

  return <ProductDetail product={product} related={related} />;
}
