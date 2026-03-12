import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/profile/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/test-api/",
          "/order-status/",
          "/forgot-password/",
          "/thank-you/",
          "/*?*", // Disallow URLs with query parameters to prevent duplicate content
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/profile/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/test-api/",
          "/order-status/",
          "/forgot-password/",
          "/thank-you/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/profile/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/test-api/",
          "/order-status/",
          "/forgot-password/",
          "/thank-you/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}