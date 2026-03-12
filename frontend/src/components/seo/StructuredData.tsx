"use client";

import Script from "next/script";
import { siteConfig } from "@/lib/seo";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  brand?: string;
  category?: string;
  availability?: "in stock" | "out of stock" | "preorder";
  condition?: "new" | "used" | "refurbished";
  sku?: string;
  gtin?: string;
  mpn?: string;
  rating?: {
    value: number;
    count: number;
    best?: number;
    worst?: number;
  };
}

interface Organization {
  name: string;
  url: string;
  logo: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
}

interface Article {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: Organization;
  mainEntityOfPage: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Organization Schema
export function OrganizationSchema({ organization }: { organization?: Partial<Organization> }) {
  const orgData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization?.name || siteConfig.name,
    url: organization?.url || siteConfig.url,
    logo: organization?.logo || `${siteConfig.url}/logo.png`,
    description: organization?.description || siteConfig.description,
    sameAs: organization?.sameAs || [
      siteConfig.links.twitter,
      siteConfig.links.github,
    ].filter(Boolean),
  };

  if (organization?.address) {
    orgData["address"] = {
      "@type": "PostalAddress",
      ...organization.address,
    };
  }

  if (organization?.contactPoint) {
    orgData["contactPoint"] = {
      "@type": "ContactPoint",
      ...organization.contactPoint,
    };
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(orgData),
      }}
    />
  );
}

// Product Schema
export function ProductSchema({ product }: { product: Product }) {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image.startsWith('http') ? product.image : `${siteConfig.url}${product.image}`,
    sku: product.sku || product.id,
    brand: product.brand ? {
      "@type": "Brand",
      name: product.brand,
    } : undefined,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "THB",
      availability: `https://schema.org/${product.availability?.replace(" ", "") || "InStock"}`,
      condition: `https://schema.org/${product.condition ? product.condition.charAt(0).toUpperCase() + product.condition.slice(1) : "New"}Condition`,
      url: `${siteConfig.url}/products/${product.id}`,
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
  };

  // Add additional identifiers if available
  if (product.gtin) {
    productData["gtin"] = product.gtin;
  }
  if (product.mpn) {
    productData["mpn"] = product.mpn;
  }

  // Add aggregateRating if available
  if (product.rating) {
    productData["aggregateRating"] = {
      "@type": "AggregateRating",
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
      bestRating: product.rating.best || 5,
      worstRating: product.rating.worst || 1,
    };
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productData),
      }}
    />
  );
}

// Article Schema
export function ArticleSchema({ article }: { article: Article }) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: article.publisher.name,
      logo: {
        "@type": "ImageObject",
        url: article.publisher.logo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.mainEntityOfPage,
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleData),
      }}
    />
  );
}

// Breadcrumb Schema
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  // Handle empty or invalid items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.filter(item => item && item.name).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name || '',
      item: (item.url && typeof item.url === 'string')
        ? (item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`)
        : `${siteConfig.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData),
      }}
    />
  );
}

// Website Schema
export function WebsiteSchema() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteData),
      }}
    />
  );
}

// Local Business Schema (if you have physical locations)
export function LocalBusinessSchema({
  name,
  address,
  telephone,
  openingHours,
  image,
}: {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  openingHours: string[];
  image?: string;
}) {
  const businessData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore", // or "Store" for general retail
    name,
    image: image || `${siteConfig.url}/store-image.jpg`,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    telephone,
    url: siteConfig.url,
    openingHoursSpecification: openingHours.map(hours => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2],
    })),
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(businessData),
      }}
    />
  );
}

// FAQ Schema
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData),
      }}
    />
  );
}