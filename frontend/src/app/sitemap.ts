import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

// You can fetch dynamic data here from your API
async function getProducts() {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

async function getCategories() {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  try {
    // Dynamic product pages
    const products = await getProducts();
    const productPages = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at || product.created_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic category pages
    const categories = await getCategories();
    const categoryPages = categories.map((category: any) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updated_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages if dynamic content fails
    return staticPages;
  }
}