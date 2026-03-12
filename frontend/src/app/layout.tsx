import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import ClientLayout from "./client-layout";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import PWAManager from "@/components/pwa/PWAManager";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { generateMetadata } from "@/lib/seo";
import { OrganizationSchema, WebsiteSchema } from "@/components/seo/StructuredData";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export const metadata: Metadata = generateMetadata({
  title: "Premium OEM/Private Label Cosmetics Manufacturer Thailand",
  description: "Sky High International - Leading OEM cosmetics manufacturer in Thailand. Expert in private label beauty products, skincare formulation, and contract manufacturing with premium quality assurance.",
  keywords: [
    "cosmetics manufacturer Thailand",
    "OEM cosmetics",
    "private label beauty",
    "skincare manufacturing",
    "cosmetic formulation Thailand",
    "beauty product development",
    "contract cosmetics manufacturing"
  ],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <WebVitalsReporter />
        <OrganizationSchema
          organization={{
            name: "Sky High International Co., Ltd.",
            description: "Leading OEM/Private Label cosmetics manufacturer in Thailand specializing in premium beauty products, skincare formulation, and contract manufacturing services.",
            address: {
              streetAddress: "123 Industrial Park Road",
              addressLocality: "Bangkok",
              addressRegion: "Bangkok",
              postalCode: "10400",
              addressCountry: "TH"
            },
            contactPoint: {
              telephone: "+66-2-xxx-xxxx",
              contactType: "Customer Service",
              areaServed: "Thailand",
              availableLanguage: ["en", "th"]
            },
            sameAs: [
              "https://linkedin.com/company/skyhigh-international",
              "https://facebook.com/skyhighinternational"
            ]
          }}
        />
        <WebsiteSchema />
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ClientLayout>{children}</ClientLayout>
          <PWAManager />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
