import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  main_image: string;
  brand: {
    name: string;
  };
};

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const res = await fetch(`http://127.0.0.1:8000/api/products/?slug=${params.slug}`, {
    cache: "no-store",
  });

  const data = await res.json();
  const product: Product | undefined = data[0];

  if (!product) return notFound();

  return <ProductDetailClient product={product} />;
}
