"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// import { fetchWithSession } from "@/lib/fetchWithSession";
import { API_ENDPOINTS } from "@/lib/config";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

function normalizeBrands(data: { results?: Brand[]; brands?: Brand[] } | Brand[]): Brand[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;    // DRF pagination
  if (data && Array.isArray(data.brands)) return data.brands;      // custom wrapper
  return [];
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("🚀 Starting brands fetch...", API_ENDPOINTS.PRODUCTS.BRANDS);
        const startTime = Date.now();
        
        // Try direct fetch first to test
        const res = await fetch(API_ENDPOINTS.PRODUCTS.BRANDS);
        // const res = await fetchWithSession(API_ENDPOINTS.PRODUCTS.BRANDS);
        const fetchTime = Date.now() - startTime;
        console.log(`⏱️ Fetch completed in ${fetchTime}ms, status: ${res.status}`);
        
        const ct = res.headers.get("content-type") || "";
        let data: { results?: Brand[]; brands?: Brand[]; detail?: string; error?: string; message?: string } | Brand[] | null = null;

        if (!ct.includes("application/json")) {
          const text = await res.text();
          console.error("❌ Non-JSON response:", { status: res.status, text });
          setErrorMsg(`Unexpected content-type: ${ct || "unknown"}`);
          setBrands([]);
          return;
        }

        data = await res.json();
        console.log("✅ Raw brands payload:", data);

        if (!res.ok) {
          // Typical DRF error: {detail: "..."}
          const detail = (data && (data.detail || data.error || data.message)) ?? `HTTP ${res.status}`;
          setErrorMsg(String(detail));
          setBrands([]);
          return;
        }

        const list = normalizeBrands(data);
        console.log(`📊 Normalized to ${list.length} brands:`, list);
        
        if (list.length === 0) {
          // Keep a helpful message for common pitfalls
          const hint =
            Array.isArray(data) || data?.results || data?.brands
              ? "No brands found in payload."
              : "Unexpected response shape (expected array, results[], or brands[]).";
          setErrorMsg(hint);
          setBrands([]);
          return;
        }

        setBrands(list);
        setErrorMsg(null);
        console.log("🎉 Brands loaded successfully");
      } catch (err) {
        console.error("❌ Network error fetching brands:", err);
        setErrorMsg(`Network error while fetching brands: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <main className="w-full bg-background">
        <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
          {/* Header Skeleton */}
          <header className="mb-20 text-center">
            <div className="divider mx-auto max-w-16 mb-8 bg-muted animate-pulse" />
            <div className="h-12 bg-muted rounded w-80 mx-auto mb-6 animate-pulse" />
            <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse" />
          </header>

          {/* Content Skeleton */}
          <div className="space-y-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted/30 border border-border/20 rounded-lg p-6 text-center animate-pulse"
                >
                  <div className="h-6 bg-muted rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="w-full bg-background">
        <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
          <header className="mb-20 text-center">
            <div className="divider mx-auto max-w-16 mb-8" />
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
              Error Loading Brands
            </h1>
          </header>
          <div className="text-center">
            <div className="p-6 rounded-lg border bg-destructive/10 text-destructive border-destructive/20">
              <p className="font-medium mb-2">{errorMsg}</p>
              <p className="text-sm text-muted-foreground">
                Check the browser console for the raw payload (and status/content-type).
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Treat any slug that starts with "geometry" as our brand
  const isGeometry = (slug?: string) =>
    typeof slug === "string" && slug.toLowerCase().startsWith("geometry");

  const ourBrands = brands.filter((b) => isGeometry(b.slug));
  const otherBrands = brands.filter((b) => !isGeometry(b.slug));

  const partnerList = otherBrands.length > 0 ? otherBrands : brands;

  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Our Brands
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Discover our signature collection and trusted partner brands crafted with precision and care.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {/* Geometry Brand Section */}
          {ourBrands.length > 0 && (
            <section className="mb-20">
              <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
                Geometry - Our Signature Brand
              </h2>
              <div className="bg-muted/30 border border-border/20 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-light text-foreground mb-4">Geometry</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-xl mx-auto">
                  Bold. Modern. Innovative. Geometry reflects our spirit of formulation artistry — where design meets performance in personal care.
                </p>
                <Link
                  href={`/products?brand=${ourBrands[0].slug}`}
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Explore Geometry Products
                </Link>
              </div>
            </section>
          )}

          {/* Partner Brands Section */}
          <section className="mb-20">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              OEM Brands
            </h2>

            {otherBrands.length === 0 && brands.length > 0 && (
              <div className="p-4 rounded-md border bg-muted/20 text-muted-foreground border-border/20 text-sm mb-6">
                <p>
                  Showing all brands (no non-Geometry brands found). If this isn't expected, confirm the slug naming
                  or switch to a backend flag (e.g., <code className="bg-muted/50 px-1 rounded">is_partner</code>).
                </p>
              </div>
            )}

            {partnerList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                {partnerList.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/products?brand=${brand.slug}`}
                    className="flex items-center justify-center bg-muted/30 border border-border/20 hover:border-border/40 rounded-lg p-6 text-center transition-all duration-300 hover:bg-muted/40"
                  >
                    <p className="text-base font-medium text-foreground">{brand.name}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No partner brands available at the moment.</p>
              </div>
            )}
          </section>
        </div>

        {/* Last Updated */}
        <div className="text-center pt-8 border-t border-border/20">
          <p className="caption-text text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
