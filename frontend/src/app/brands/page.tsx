"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/brands/")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading brands...</p>;
  }

  const ourBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes("geometry")
  );
  const otherBrands = brands.filter((brand) =>
    !brand.name.toLowerCase().includes("geometry")
  );

  return (
    <div className="w-full">
      {/* Hero Section for Our Brand */}
      {ourBrands.length > 0 && (
        <section className="relative bg-black text-white py-20 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Brand: Geometry</h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Bold. Modern. Innovative. Geometry represents the spirit of design and function in personal care.
          </p>
          <Link
            href={`/products?brand=${ourBrands[0].slug}`}
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 transition rounded text-white font-medium"
          >
            Explore Geometry Products
          </Link>
        </section>
      )}

      {/* Other Brands */}
      <section className="max-w-5xl mx-auto p-6 bg-black text-white">
        <h2 className="text-2xl font-bold mb-6">Other Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {otherBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="block border border-white rounded p-4 hover:shadow hover:border-red-600 transition"
            >
              <p className="text-lg font-semibold text-center">{brand.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
