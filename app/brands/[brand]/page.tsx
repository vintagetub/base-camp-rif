import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { BrandCatalog } from "@/components/BrandCatalog";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return Object.values(BRANDS).map((b) => ({ brand: b.slug }));
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = Object.values(BRANDS).find((b) => b.slug === slug);
  if (!brand) notFound();
  return <BrandCatalog brandSlug={slug} />;
}
