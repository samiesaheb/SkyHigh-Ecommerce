// frontend/src/components/Footer.tsx
"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left: Branding & Social */}
        <div className="text-center md:text-left space-y-3">
          <p className="text-lg font-semibold tracking-wide">Sky High International Co., Ltd.</p>
          <p className="text-sm text-gray-400 select-none">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <p className="text-sm">
            Follow us:{" "}
            <a
              href="https://www.instagram.com/skyhigh.inter/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            >
              Instagram
            </a>
          </p>
        </div>

        {/* Right: Links */}
        <nav className="text-sm text-gray-400 flex flex-wrap justify-center md:justify-end gap-6">
          <a
            href="/privacy-policy"
            className="hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-and-conditions"
            className="hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Terms & Conditions
          </a>
        </nav>
      </div>

      {/* Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}
