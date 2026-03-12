"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState, useMemo } from "react";
import { Loader2, ArrowRight, Star, ChevronRight, Heart, Building2, ShoppingBag, Award } from "lucide-react";
import { ServiceHighlights, B2BCertifications } from "@/components/common/TrustBadges";
import { TestimonialCarousel } from "@/components/common/Testimonials";
import { buildImageUrl } from "@/lib/config";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCollection, setActiveCollection] = useState(0);

  const heroData = {
    image: "/hero-bg.jpg",
    title: "Effortless Beauty",
    subtitle: "Discover clean, luxurious formulas crafted for the modern minimalist",
    cta: "Explore Collection",
    ctaLink: "/products?sort=new"
  };

  const collections = [
    {
      title: "Body",
      image: "products/bodyandskincare/d-white-whitening-soap.jpg",
      description: "Luxurious care for your entire body",
      link: "/products?brand=body-and-skin-care",
      category: "bodycare"
    },
    {
      title: "Hair",
      image: "products/haircare/myco-hair-long-hair-anti-hair-loss-serum.jpg",
      description: "Nourishing treatments for healthy hair",
      link: "/products?brand=hair-care",
      category: "haircare"
    },
    {
      title: "Geometry",
      image: "products/geometry/geometry-extra-hair-serum.jpg",
      description: "Gentle, effective formulas for radiant skin",
      link: "/products?brand=geometry",
      category: "skincare"
    },
  ];


  const principles = [
    { title: "Clean Formulas", description: "No harsh chemicals, only pure ingredients" },
    { title: "Sustainable Beauty", description: "Environmentally conscious packaging and practices" },
    { title: "Cruelty-Free", description: "Never tested on animals, always ethical" },
    { title: "Clinically Proven", description: "Science-backed results you can trust" }
  ];

  // Enhanced loading and interaction effects
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate collections highlight
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCollection((prev) => (prev + 1) % collections.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [collections.length]);

  // Memoized optimized collections for performance
  const optimizedCollections = useMemo(() => collections, [collections]);

  return (
    <>
      {/* Hero Section - Enhanced with animations and effects */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="animate-spin w-8 h-8 text-muted-foreground mx-auto" />
              </div>
              <span className="caption-text animate-pulse">Loading Beauty</span>
            </div>
          </div>
        }
      >
        <section className={`relative min-h-screen flex items-center overflow-hidden pt-20 w-screen -ml-[50vw] left-1/2 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {/* Enhanced Background Image with parallax effect */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={heroData.image}
              alt="Beauty essentials"
              fill
              priority
              className="object-cover scale-110 transition-transform duration-[20s] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            {/* Floating elements for visual interest - responsive */}
            <div className="hidden md:block absolute top-1/4 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
            <div className="hidden lg:block absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000" />
            <div className="hidden xl:block absolute bottom-1/3 right-1/5 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-2000" />
          </div>

          {/* Enhanced Content */}
          <div className="relative z-10 w-full">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className={`max-w-2xl transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>


                {/* Enhanced Main Heading */}
                <h1 className="hero-text text-white mb-10 relative">
                  {heroData.title}
                </h1>

                {/* Enhanced Subtitle */}
                <p className={`text-lg lg:text-xl font-extralight text-white/90 mb-16 max-w-lg leading-relaxed transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  {heroData.subtitle}
                </p>

                {/* Enhanced CTA Button */}
                <div className={`transition-all duration-700 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <Link
                    href={heroData.ctaLink}
                    className="btn-primary group inline-flex items-center relative overflow-hidden bg-white text-black hover:bg-white/95 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">{heroData.cta}</span>
                    <ArrowRight className="ml-3 w-4 h-4 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-rose/10 via-accent-gold/10 to-accent-sage/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator - hidden on mobile for cleaner look */}
          <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </section>
      </Suspense>

      {/* Enhanced Principles Strip with animations */}
      <section className="bg-secondary/20 border-y border-border/10 w-screen -ml-[50vw] left-1/2 relative overflow-hidden">
        <div className="py-20 px-6 sm:px-8 lg:px-12 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-foreground to-transparent" />
            <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-foreground to-transparent" />
            <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-foreground to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            {principles.map((principle, index) => (
              <div 
                key={index} 
                className={`text-center group transition-all duration-700 delay-${index * 200} ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <div className="relative mb-6">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-accent-rose/30 group-hover:to-accent-gold/20 transition-all duration-500">
                    <div className="w-6 h-6 bg-primary/10 rounded-full animate-pulse group-hover:bg-accent-sage/20 transition-colors duration-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/20 rounded-full animate-ping group-hover:bg-accent-rose/40" style={{ animationDelay: `${index * 500}ms` }} />
                </div>
                <h3 className="caption-text mb-4 font-extralight group-hover:text-primary transition-colors duration-300">
                  {principle.title}
                </h3>
                <p className="text-sm font-extralight text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="w-full bg-background">

      {/* Enhanced Featured Collections */}
      <section className="section-container relative">
        <div className="container">
          <div className="text-center mb-24 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary text-sm mb-8">
              <Star className="w-4 h-4" />
              Featured
            </div>
            <h2 className="section-heading relative">
              Essentials
            </h2>
            <p className="text-lg lg:text-xl font-extralight text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Three pillars of modern beauty
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {optimizedCollections.map((collection, index) => (
              <Link
                key={index}
                href={collection.link}
                className={`group relative overflow-hidden bg-card transition-all duration-700 hover:shadow-2xl hover:shadow-black/10 rounded-xl border border-border/20 hover:border-primary/30 transform hover:-translate-y-3 hover:bg-card/90 backdrop-blur-sm ${
                  activeCollection === index ? 'ring-2 ring-primary/40 shadow-xl shadow-primary/20' : 'shadow-md shadow-black/5'
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl">
                  <Image
                    src={buildImageUrl(collection.image)}
                    alt={collection.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                  />
                  
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-50 transition-all duration-700" />
                  
                  {/* Active collection indicator */}
                  {activeCollection === index && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse" />
                  )}
                  
                  {/* Enhanced hover content */}
                  <div className="absolute bottom-8 left-8 right-8 text-white transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <p className="body-text text-white/95 mb-4 font-light">{collection.description}</p>
                    <div className="flex items-center caption-text text-white font-medium">
                      Shop {collection.title}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>

                <div className="p-8 elegant-hover relative overflow-hidden">
                  <h3 className="text-2xl lg:text-3xl font-extralight text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                    {collection.title}
                  </h3>
                  
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Enhanced Brand Story */}
      <section className="section-container relative overflow-hidden">
        <div className="container max-w-5xl text-center relative">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="mb-24 relative z-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full text-primary text-sm mb-12">
              <Heart className="w-4 h-4" />
              Our Philosophy
            </div>
            
            <h2 className="section-heading mb-16 relative">
              Sky High Beauty
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
            </h2>
            
            <div className="space-y-12">
              <p className="text-2xl lg:text-3xl font-extralight text-foreground/90 leading-relaxed max-w-4xl mx-auto">
                We believe in the power of simplicity. Each product is thoughtfully formulated with clean, 
                effective ingredients that enhance your natural beauty.
              </p>
              
              <div className="flex justify-center">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              </div>
              
              <p className="text-lg lg:text-xl font-extralight text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Our minimalist approach celebrates authenticity over trends, quality over quantity, 
                and the confidence that comes from feeling genuinely beautiful in your own skin.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <Link
              href="/about"
              className="btn-outline group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
              aria-label="Learn more about Sky High Beauty's story and philosophy"
            >
              <span className="relative z-10">Our Story</span>
              <ArrowRight className="ml-3 w-4 h-4 transition-all duration-300 group-hover:translate-x-2 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dual Audience Section - B2B vs B2C */}
      <section className="section-container bg-gradient-to-br from-muted/20 via-background to-muted/10">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-6">Choose Your Path</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're building a brand or shopping for yourself, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* B2B Path */}
            <div className="group relative p-8 lg:p-10 rounded-2xl bg-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  For Businesses
                </div>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-light text-foreground mb-4">
                  OEM/Private Label Manufacturing
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Partner with us to create your own cosmetics brand. 24+ years of expertise in
                  custom formulation, manufacturing, and global compliance.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">MOQ from 500 units</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">ISO 9001:2015 & GMP Certified</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">Custom Formulation & R&D Support</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">Export to 15+ Countries</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/b2b"
                  className="btn-primary w-full group/btn inline-flex items-center justify-center"
                >
                  Explore B2B Solutions
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
                <Link
                  href="/quote-request"
                  className="btn-outline w-full group/btn inline-flex items-center justify-center"
                >
                  Request a Quote
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* B2C Path */}
            <div className="group relative p-8 lg:p-10 rounded-2xl bg-card border-2 border-border/20 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full">
                  For Individuals
                </div>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-light text-foreground mb-4">
                  Premium Beauty Products
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Discover our curated collection of skincare, body care, and hair care products.
                  Shop quality cosmetics crafted with care and expertise.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">1000+ Premium Products</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">Facial, Body & Hair Care</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">Fast & Reliable Shipping</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground/80">Quality Guaranteed</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/products"
                  className="btn-primary w-full group/btn inline-flex items-center justify-center"
                >
                  Shop Products
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
                <Link
                  href="/brands"
                  className="btn-outline w-full group/btn inline-flex items-center justify-center"
                >
                  Browse by Brand
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Testimonials Section */}
      <section className="section-container">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-6">
              <Award className="w-4 h-4" />
              Client Success Stories
            </div>
            <h2 className="section-heading mb-6">Trusted by Global Brands</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our B2B clients say about partnering with Sky High International
            </p>
          </div>
          <TestimonialCarousel />
          <div className="text-center mt-10">
            <Link
              href="/b2b"
              className="btn-outline group inline-flex items-center"
            >
              View All Testimonials
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Certifications & Trust Badges */}
      <section className="section-container bg-muted/20 border-y border-border/20">
        <div className="container">
          <B2BCertifications variant="compact" />
        </div>
      </section>

      {/* Service Highlights Section */}
      <section className="section-container">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-6">
              Why Choose Sky High
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're committed to providing exceptional experiences for both businesses and individual customers
            </p>
          </div>
          <ServiceHighlights />
        </div>
      </section>
      </main>
    </>
  );
}