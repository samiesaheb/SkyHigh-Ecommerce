"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Instagram, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

  const footerLinks = {
    shop: [
      { name: "Geometry", href: "/products?brand=geometry" },
    ],
    oem: [
      { name: "Face", href: "/products?brand=facial-care" },
      { name: "Hair", href: "/products?brand=hair-care" },
      { name: "Body", href: "/products?brand=body-and-skin-care" },
    ],
    company: [
      { name: "About", href: "/about" },
    ],
    support: [
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy-policy" },
      { name: "Terms", href: "/terms-and-conditions" },
    ]
  };

  return (
    <footer className="relative bg-gradient-to-b from-black via-black/98 to-black border-t border-white/20 mt-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent" />
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-16">

          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-10 lg:space-y-12">
            <div className="relative">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-8 tracking-[0.25em] uppercase relative">
                SKY HIGH
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-white/60 to-transparent"></div>
              </h3>
              <p className="text-base lg:text-lg font-extralight text-white/85 max-w-sm leading-relaxed">
                Clean beauty essentials crafted for the modern minimalist.
                Discover pure formulations that enhance your natural radiance.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="group flex items-center gap-4 transition-all duration-300 hover:translate-x-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
                </div>
                <span className="text-sm font-light text-white/90 group-hover:text-white transition-colors duration-300">samie@skyhigh.co.th</span>
              </div>
              <div className="group flex items-center gap-4 transition-all duration-300 hover:translate-x-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                  <Phone className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
                </div>
                <span className="text-sm font-light text-white/90 group-hover:text-white transition-colors duration-300">(+66) 23233517 - 20</span>
              </div>
              <div className="group flex items-center gap-4 transition-all duration-300 hover:translate-x-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
                </div>
                <span className="text-sm font-light text-white/90 group-hover:text-white transition-colors duration-300">Bangkok, Thailand</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <div className="text-xs font-light text-white/70 tracking-wider uppercase mb-6 relative">
                Follow Us
                <div className="absolute -bottom-1 left-0 w-8 h-px bg-gradient-to-r from-white/40 to-transparent"></div>
              </div>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/skyhigh.inter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="group/section">
            <h4 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-8 relative">
              Shop
              <div className="absolute -bottom-2 left-0 w-6 h-px bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-300"></div>
            </h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block relative group/link"
                  >
                    {link.name}
                    <div className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover/link:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* OEM Links */}
          <div className="group/section">
            <h4 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-8 relative">
              OEM
              <div className="absolute -bottom-2 left-0 w-6 h-px bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-300"></div>
            </h4>
            <ul className="space-y-4">
              {footerLinks.oem.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block relative group/link"
                  >
                    {link.name}
                    <div className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover/link:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="group/section">
            <h4 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-8 relative">
              Company
              <div className="absolute -bottom-2 left-0 w-6 h-px bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-300"></div>
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block relative group/link"
                  >
                    {link.name}
                    <div className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover/link:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="group/section">
            <h4 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-8 relative">
              Support
              <div className="absolute -bottom-2 left-0 w-6 h-px bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-300"></div>
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/85 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block relative group/link"
                  >
                    {link.name}
                    <div className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover/link:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t border-white/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
            <div className="text-center lg:text-left">
              <p className="text-sm font-light text-white/85">
                © {new Date().getFullYear()} Sky High International. All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 lg:gap-10 text-sm">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-light text-white/85 hover:text-white transition-all duration-300 relative group/legal"
                >
                  {link.name}
                  <div className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover/legal:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className={cn(
            "fixed bottom-8 right-8 bg-white/10 text-white border border-white/20",
            "p-4 shadow-xl hover:shadow-2xl backdrop-blur-md hover:backdrop-blur-lg",
            "hover:bg-white/15 hover:border-white/30 hover:scale-110 active:scale-95",
            "transition-all duration-300 group",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            "animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
          )}
          style={{ borderRadius: "var(--radius)" }}
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-[var(--radius)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      )}
    </footer>
  );
}