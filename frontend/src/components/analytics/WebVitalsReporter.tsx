"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import setupWebVitals from "@/lib/vitals";

export default function WebVitalsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Web Vitals monitoring
    setupWebVitals();
  }, []);

  // Re-initialize vitals on route changes for SPA navigation
  useEffect(() => {
    // Small delay to ensure the page has rendered
    const timer = setTimeout(() => {
      setupWebVitals();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // This component doesn't render anything
}