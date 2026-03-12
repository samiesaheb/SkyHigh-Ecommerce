import type { Metadata } from "next";

// Base site configuration
export const siteConfig = {
  name: "Sky High International",
  description: "Premium OEM/Private Label Cosmetics Manufacturer in Thailand. Discover high-quality beauty products, skincare solutions, and cosmetic formulations crafted with excellence.",
  url: "https://skyhigh-inter.com",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/skyhighinter",
    linkedin: "https://linkedin.com/company/skyhigh-international",
  },
  keywords: [
    "cosmetics manufacturer Thailand",
    "OEM cosmetics",
    "private label beauty products",
    "skincare manufacturing",
    "beauty product formulation",
    "cosmetic laboratory Thailand",
    "premium beauty products",
    "cosmetic contract manufacturing",
    "skincare products Thailand",
    "beauty brand development",
    "cosmetic ingredient sourcing",
    "quality cosmetics"
  ],
  author: "Sky High International Team",
  creator: "Sky High International Co., Ltd.",
  publisher: "Sky High International",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
  canonical?: string;
}

export function generateMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  url,
  keywords = [],
  type = "website",
  noIndex = false,
  canonical,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const fullUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const fullImage = image.startsWith('http') ? image : `${siteConfig.url}${image}`;

  const allKeywords = [...siteConfig.keywords, ...keywords].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    formatDetection: siteConfig.formatDetection,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonical || fullUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type,
      locale: "en_US",
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: "@skyhigh", // Update with your Twitter handle
      site: "@skyhigh",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

// Product-specific metadata
export function generateProductMetadata({
  name,
  description,
  price,
  image,
  slug,
  brand,
  category,
  availability = "in stock",
}: {
  name: string;
  description: string;
  price: number;
  image: string;
  slug: string;
  brand?: string;
  category?: string;
  availability?: string;
}): Metadata {
  const title = `${name}${brand ? ` by ${brand}` : ""}`;
  const fullDescription = `${description} Shop now at Sky High for premium fashion and lifestyle products.`;

  const keywords = [
    name.toLowerCase(),
    brand?.toLowerCase(),
    category?.toLowerCase(),
    "buy online",
    "premium quality",
    "Thailand shopping"
  ].filter(Boolean);

  return generateMetadata({
    title,
    description: fullDescription,
    image,
    url: `/products/${slug}`,
    keywords,
    type: "website",
  });
}

// Category-specific metadata
export function generateCategoryMetadata({
  name,
  description,
  slug,
  image,
  productCount,
}: {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  productCount?: number;
}): Metadata {
  const title = `${name} Collection`;
  const defaultDescription = `Discover our ${name.toLowerCase()} collection${productCount ? ` featuring ${productCount} premium products` : ""}. Shop high-quality ${name.toLowerCase()} at Sky High.`;

  const keywords = [
    name.toLowerCase(),
    `${name.toLowerCase()} collection`,
    `buy ${name.toLowerCase()}`,
    "premium fashion",
    "online shopping"
  ];

  return generateMetadata({
    title,
    description: description || defaultDescription,
    image,
    url: `/categories/${slug}`,
    keywords,
  });
}

// Article/Blog metadata
export function generateArticleMetadata({
  title,
  description,
  image,
  slug,
  publishedTime,
  modifiedTime,
  author,
  tags = [],
}: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}): Metadata {
  const keywords = [...tags, "fashion blog", "style tips", "lifestyle"];

  const metadata = generateMetadata({
    title,
    description,
    image,
    url: `/blog/${slug}`,
    keywords,
    type: "article",
  });

  // Add article-specific OpenGraph properties
  if (metadata.openGraph && publishedTime) {
    metadata.openGraph.publishedTime = publishedTime;
    metadata.openGraph.modifiedTime = modifiedTime;
    metadata.openGraph.authors = author ? [author] : undefined;
    metadata.openGraph.tags = tags;
  }

  return metadata;
}