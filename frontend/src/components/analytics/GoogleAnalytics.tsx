"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Enhanced E-commerce events
export const trackEvent = (
  action: string,
  parameters: Record<string, any> = {}
) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("event", action, {
      ...parameters,
      send_to: GA_TRACKING_ID,
    });
  }
};

// E-commerce specific events
export const trackPurchase = (transactionData: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackEvent("purchase", {
    ...transactionData,
    currency: transactionData.currency || "THB",
  });
};

export const trackViewItem = (itemData: {
  currency?: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    price: number;
  }>;
}) => {
  trackEvent("view_item", {
    ...itemData,
    currency: itemData.currency || "THB",
  });
};

export const trackAddToCart = (itemData: {
  currency?: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackEvent("add_to_cart", {
    ...itemData,
    currency: itemData.currency || "THB",
  });
};

export const trackRemoveFromCart = (itemData: {
  currency?: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackEvent("remove_from_cart", {
    ...itemData,
    currency: itemData.currency || "THB",
  });
};

export const trackBeginCheckout = (checkoutData: {
  currency?: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackEvent("begin_checkout", {
    ...checkoutData,
    currency: checkoutData.currency || "THB",
  });
};

export const trackSearch = (searchTerm: string) => {
  trackEvent("search", {
    search_term: searchTerm,
  });
};

interface GoogleAnalyticsProps {
  trackingId?: string;
}

export default function GoogleAnalytics({ trackingId = GA_TRACKING_ID }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!trackingId) {
      console.warn("Google Analytics tracking ID not found");
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [trackingId]);

  useEffect(() => {
    if (trackingId && typeof window !== "undefined" && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

      // Track page views
      window.gtag("config", trackingId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [pathname, searchParams, trackingId]);

  return null;
}