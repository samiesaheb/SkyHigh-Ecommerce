"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/HeaderContext";
import { buildImageUrl, API_CONFIG } from "@/lib/config";
import { ProductDetail } from "@/types";
import WishlistButton from "@/components/wishlist/WishlistButton";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import StarRating from "@/components/reviews/StarRating";
import { ShoppingBag } from "lucide-react";
import Breadcrumb, { generateBreadcrumbs } from "@/components/common/Breadcrumb";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  // Handle both string and number price formats
  const priceNum = typeof product.price === 'string' 
    ? Number(product.price.replace(/[^0-9.-]+/g, ""))
    : Number(product.price);
  const hasPrice = !isNaN(priceNum) && priceNum > 0;

  const [productData, setProductData] = useState<ProductDetail>(product);
  
  const isGeometryProduct = product.brand.slug === 'geometry';

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product.id);
      // Could show a toast notification instead of alert
      alert("Added to cart");
    } catch {
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewsUpdate = async () => {
    // Refetch product data to get updated reviews
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/products/${product.slug}/`);
      if (response.ok) {
        const updatedProduct = await response.json();
        setProductData(updatedProduct);
      }
    } catch (error) {
      console.error('Failed to refresh product data:', error);
    }
  };

  const breadcrumbItems = generateBreadcrumbs.productDetail(
    product.brand.name,
    product.brand.slug,
    product.name
  );

  return (
    <>
      {/* SEO Structured Data */}
      <ProductSchema
        product={{
          id: product.slug,
          name: product.name,
          description: product.description || `Shop ${product.name} at Sky High. Premium fashion and lifestyle products.`,
          image: buildImageUrl(product.main_image || ""),
          price: priceNum,
          currency: "THB",
          brand: product.brand_name,
          category: product.category_name,
          availability: product.inventory_count > 0 ? "in stock" : "out of stock",
          condition: "new",
          sku: product.id.toString(),
          rating: product.average_rating ? {
            value: product.average_rating,
            count: product.review_count || 0,
          } : undefined,
        }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="container section-container">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-[4/5] relative overflow-hidden">
            <Image
              src={buildImageUrl(product.main_image || "")}
              alt={product.name}
              fill
              className="w-full h-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8 lg:pt-12">
          <div>
            <p className="caption-text text-muted-foreground mb-4">
              {product.brand.name}
            </p>
            <h1 className="text-4xl lg:text-5xl font-light text-foreground mb-6 leading-tight tracking-tight">
              {product.name}
            </h1>
            
            {/* Rating Display for Geometry Products */}
            {isGeometryProduct && productData.review_count > 0 && productData.average_rating != null && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={productData.average_rating} size="md" />
                <span className="text-lg font-medium">
                  {productData.average_rating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({productData.review_count} review{productData.review_count !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>

          {hasPrice && (
            <div className="mb-8">
              <span className="text-2xl font-light text-foreground">฿{product.price}</span>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <p className="body-text leading-relaxed mb-8">
              {product.description}
            </p>
          </div>

          {hasPrice && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>
              <WishlistButton
                productId={product.id}
                productPrice={product.price}
                showLabel={true}
                className="flex-1 justify-center"
                size="lg"
              />
            </div>
          )}

          <div className="divider my-12" />
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-light text-foreground mb-3 tracking-wide">Ingredients</h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                Clean, effective formulas with carefully selected ingredients for optimal results.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-light text-foreground mb-3 tracking-wide">How to Use</h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                Apply as directed. For best results, use consistently as part of your daily routine.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Only for Geometry Products */}
      {isGeometryProduct && (
        <ReviewsSection
          product={productData}
          onReviewsUpdate={handleReviewsUpdate}
        />
      )}
      </div>
    </>
  );
}
