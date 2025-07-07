"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/HeaderContext";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AnimatePresence, motion } from "framer-motion";

// ✅ Stripe public key from environment variable
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function Spinner() {
  return (
    <svg
      className="animate-spin h-10 w-10 text-red-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="img"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [csrfReady, setCsrfReady] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/csrf/", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CSRF");
        return res.json();
      })
      .then((data) => {
        console.log("✅ CSRF success:", data);
        setCsrfReady(true);
      })
      .catch((err) => console.error("❌ CSRF fetch failed:", err));
  }, []);

  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <Header />
        <main className="flex-1 w-full">
          <div className="bg-black text-white w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
              <AnimatePresence mode="wait" initial={false}>
                {csrfReady ? (
                  <motion.div
                    key="page"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                ) : (
                  <div className="flex justify-center items-center h-48">
                    <Spinner />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        <Footer />
      </Elements>
    </CartProvider>
  );
}
