import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { API_CONFIG, buildImageUrl } from "@/lib/config";
import { ProductDetail } from "@/types";
import { generateProductMetadata } from "@/lib/seo";

// Generate metadata for each product page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}/api/v1/products/${slug}/`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const product: ProductDetail = await res.json();

    return generateProductMetadata({
      name: product.name,
      description: product.description || `${product.name} - Premium cosmetic and beauty product by Sky High International. High-quality skincare and beauty solutions manufactured in Thailand.`,
      price: parseFloat(product.price),
      image: buildImageUrl(product.main_image || ""),
      slug: product.slug,
      brand: product.brand_name,
      category: product.category_name,
      availability: product.inventory_count > 0 ? "in stock" : "out of stock",
    });
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Sky High - Premium Fashion",
      description: "Discover premium fashion and lifestyle products at Sky High.",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Fetch product by slug from the API (e.g. /api/v1/products/geometry-whitening-facial-foam/)
  const res = await fetch(
    `${API_CONFIG.BASE_URL}/api/v1/products/${slug}/`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    console.error("Failed to fetch product:", res.statusText);
    return notFound();
  }

  const product: ProductDetail = await res.json();

  if (!product) return notFound();

  return <ProductDetailClient product={product} />;
}
