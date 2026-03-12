import type { Metadata } from "next";
import { generateMetadata } from "@/lib/seo";

export const metadata: Metadata = generateMetadata({
  title: "Premium Products Collection",
  description: "Browse our extensive collection of premium fashion and lifestyle products. Discover high-quality clothing, accessories, and essentials with fast shipping across Thailand.",
  keywords: ["fashion products", "premium clothing", "lifestyle accessories", "online shopping", "Thailand fashion store"],
  url: "/products",
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}