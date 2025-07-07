"use client";

import { useState } from "react";
import { useCart } from "@/components/HeaderContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function ProductDetailClient({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const priceNum = Number(product.price.replace(/[^0-9.-]+/g, ""));
  const hasPrice = priceNum > 0;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product.id);
      alert("🛒 Product added to cart");
    } catch {
      alert("❌ Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{product.name}</CardTitle>
          <CardDescription className="text-gray-600">
            {product.brand.name}
          </CardDescription>
          {hasPrice && (
            <p className="text-red-600 font-bold text-xl">฿{product.price}</p>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <img
            src={
              product.main_image?.startsWith("http")
                ? product.main_image
                : `http://127.0.0.1:8000/media/${product.main_image}`
            }
            alt={product.name}
            className="w-full h-80 object-cover rounded"
          />

          {hasPrice && (
            <Button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full sm:w-fit"
            >
              {loading ? "Adding..." : "Add to Cart"}
            </Button>
          )}

          <p className="text-base text-gray-700 whitespace-pre-line">
            {product.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
