import { getProductById, getCatalogProducts } from "@/lib/products";
import { notFound, redirect } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";

export function generateStaticParams() {
  // Only generate pages for parent products + standalones (not child variants)
  return getCatalogProducts().map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(decodeURIComponent(id));

  if (!product) notFound();

  // If this is a child variant, redirect to the parent product page
  if (product.parentId) {
    redirect(`/products/${product.parentId}?variant=${product.id}`);
  }

  return <ProductDetail product={product} />;
}
