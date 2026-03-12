import Link from "next/link";
import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Page Not Found - 404",
  description: "The page you are looking for could not be found. Browse our cosmetic collections or return to our homepage.",
  noIndex: true, // Don't index 404 pages
});

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We couldn&apos;t find the page you were looking for.
            The product or page may have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-border bg-background text-foreground font-medium rounded-md hover:bg-accent transition-colors"
            >
              Browse Products
            </Link>
          </div>

          <div className="pt-6 text-sm text-muted-foreground">
            <p>Popular sections:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link href="/brands" className="text-primary hover:underline">
                Brands
              </Link>
              <Link href="/about" className="text-primary hover:underline">
                About Us
              </Link>
              <Link href="/services" className="text-primary hover:underline">
                Services
              </Link>
              <Link href="/contact" className="text-primary hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}