"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithSession } from "@/lib/fetchWithSession";
import { useCart } from "@/components/HeaderContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  main_image: string;
  brand: Brand;
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandSlugFromURL = searchParams.get("brand");
  const searchQuery = searchParams.get("search");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandSlugFromURL ?? null
  );

  const { addToCart } = useCart();

  useEffect(() => {
    fetchWithSession("/api/products/brands/")
      .then((res) => res.json())
      .then(setBrands);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBrand) params.append("brand", selectedBrand);
    if (searchQuery) params.append("search", searchQuery);

    const url = `/api/products/?${params.toString()}`;

    fetchWithSession(url)
      .then((res) => res.json())
      .then(setProducts);
  }, [selectedBrand, searchQuery]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    const params = new URLSearchParams();
    if (slug) params.set("brand", slug);
    if (searchQuery) params.set("search", searchQuery);

    setSelectedBrand(slug || null);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">All Products</h2>

      <div className="mb-6">
        <label className="mr-2 font-medium">Filter by Brand:</label>
        <select
          className="border rounded px-3 py-1"
          value={selectedBrand ?? ""}
          onChange={handleBrandChange}
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const priceNum = Number(product.price.replace(/[^0-9.-]+/g, ""));
          const hasPrice = priceNum > 0;

          return (
            <Card key={product.id} className="flex flex-col">
              <CardHeader className="p-0">
                <img
                  src={
                    product.main_image?.startsWith("http")
                      ? product.main_image
                      : `http://localhost:8000/media/${product.main_image}`
                  }
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-t"
                />
              </CardHeader>
              <CardContent className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <CardTitle className="text-lg font-semibold text-black hover:text-red-600 transition">
                    {product.name}
                  </CardTitle>
                </Link>
                <CardDescription className="text-sm text-gray-500 mb-1">
                  {product.brand.name}
                </CardDescription>
                {hasPrice && (
                  <p className="text-red-600 font-bold mb-2">฿{product.price}</p>
                )}
              </CardContent>
              {hasPrice && (
                <CardFooter className="mt-auto p-4 pt-0">
                  <Button
                    onClick={() => addToCart(product.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
