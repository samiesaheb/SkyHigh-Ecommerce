"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "DermaBloom Essentials",
    role: "Founder & CEO",
    image: "/testimonials/sarah.jpg", // Replace with actual image
    rating: 5,
    text: "Sky High International transformed our vision into reality. Their formulation expertise and attention to quality helped us launch our organic skincare line successfully across the Middle East. The ISO certification and compliance support were invaluable for our market entry.",
    productLine: "Organic Facial Care Series",
    location: "Dubai, UAE"
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "GlowVera Labs",
    role: "Product Development Director",
    image: "/testimonials/michael.jpg",
    rating: 5,
    text: "Working with Sky High for over 3 years has been exceptional. Their R&D team understood our requirements perfectly and delivered innovative formulations that exceeded our expectations. The MOQ flexibility and timeline adherence make them stand out in the industry.",
    productLine: "Professional Hair Care Range",
    location: "Lagos, Nigeria"
  },
  {
    id: 3,
    name: "Fatima Al-Rashid",
    company: "Essence Beauty Group",
    role: "Chief Brand Officer",
    image: "/testimonials/fatima.jpg",
    rating: 5,
    text: "Sky High's commitment to quality and their deep understanding of regional market preferences has been crucial to our success. From formulation to packaging, they provide comprehensive support. Our whitening and anti-aging products have become bestsellers thanks to their expertise.",
    productLine: "Premium Whitening Collection",
    location: "Riyadh, Saudi Arabia"
  },
  {
    id: 4,
    name: "David Okonkwo",
    company: "Natural Glow Cosmetics",
    role: "Managing Director",
    image: "/testimonials/david.jpg",
    rating: 5,
    text: "The team at Sky High goes beyond manufacturing – they're true partners in product development. Their guidance on ingredient selection, regulatory compliance, and market trends has been instrumental in building our brand. Highly recommend for serious B2B clients.",
    productLine: "Natural Body Care Line",
    location: "Accra, Ghana"
  }
];

interface TestimonialsProps {
  limit?: number;
  showTitle?: boolean;
}

export default function Testimonials({ limit, showTitle = true }: TestimonialsProps) {
  const displayedTestimonials = limit ? testimonials.slice(0, limit) : testimonials;

  return (
    <section className="w-full">
      {showTitle && (
        <div className="text-center mb-16">
          <h2 className="section-heading mb-6">
            Trusted by Global Brands
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our clients say about partnering with Sky High International
            for their cosmetic manufacturing needs.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-card p-8 rounded-xl border border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Quote Icon */}
            <div className="mb-6">
              <Quote className="w-8 h-8 text-primary/30" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-foreground/90 leading-relaxed mb-6 italic">
              &ldquo;{testimonial.text}&rdquo;
            </blockquote>

            {/* Product Line */}
            <div className="mb-6 pb-6 border-b border-border/20">
              <div className="text-sm text-muted-foreground">Product Line:</div>
              <div className="text-sm font-medium text-primary mt-1">
                {testimonial.productLine}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-semibold text-lg">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
                <div className="text-sm text-primary font-medium">
                  {testimonial.company}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {testimonial.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Compact testimonial carousel for homepage
export function TestimonialCarousel() {
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {featuredTestimonials.map((testimonial, index) => (
        <div
          key={testimonial.id}
          className="bg-card p-6 rounded-lg border border-border/20 hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
            ))}
          </div>

          <p className="text-sm text-foreground/80 mb-4 line-clamp-4 italic">
            &ldquo;{testimonial.text}&rdquo;
          </p>

          <div className="text-xs font-medium text-foreground">{testimonial.name}</div>
          <div className="text-xs text-primary">{testimonial.company}</div>
        </div>
      ))}
    </div>
  );
}
