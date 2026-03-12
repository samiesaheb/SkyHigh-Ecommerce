"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, Award, Beaker, Package, Clock, Globe } from "lucide-react";
import { useState } from "react";

const processSteps = [
  {
    number: "01",
    title: "Consultation & Concept",
    description: "Share your vision with our expert team. We&apos;ll discuss your target market, product goals, and brand identity to create a tailored formulation strategy.",
    icon: Users,
    timeline: "1-2 weeks"
  },
  {
    number: "02",
    title: "Formulation & Sampling",
    description: "Our R&D team develops custom formulas using premium ingredients. You&apos;ll receive samples for testing and approval before production begins.",
    icon: Beaker,
    timeline: "2-4 weeks"
  },
  {
    number: "03",
    title: "Manufacturing & Quality Control",
    description: "Production in our ISO 9001:2015 certified facility with rigorous quality testing at every stage. Full compliance with international standards.",
    icon: Award,
    timeline: "4-8 weeks"
  },
  {
    number: "04",
    title: "Packaging & Delivery",
    description: "Professional packaging with your branding, followed by efficient logistics to your destination. Full documentation and export support included.",
    icon: Package,
    timeline: "2-3 weeks"
  }
];

const capabilities = [
  "ISO 9001:2015 Certified Manufacturing",
  "GMP Compliant Facility",
  "In-House R&D Laboratory",
  "MOQ from 500-1,000 units",
  "Custom Formulation Development",
  "Private Label & White Label",
  "Regulatory Compliance Support",
  "International Export Documentation"
];

const productCategories = [
  {
    name: "Facial Care",
    items: ["Cleansers", "Serums", "Moisturizers", "Anti-Aging", "Masks", "Toners"]
  },
  {
    name: "Body & Skin Care",
    items: ["Body Lotions", "Soaps", "Whitening Products", "Exfoliants", "Body Scrubs"]
  },
  {
    name: "Hair Care",
    items: ["Shampoos", "Conditioners", "Hair Serums", "Hair Masks", "Treatments"]
  }
];

const stats = [
  { value: "24+", label: "Years Experience", icon: Award },
  { value: "1000+", label: "Products Developed", icon: Beaker },
  { value: "50+", label: "Active Clients", icon: Users },
  { value: "15+", label: "Export Markets", icon: Globe }
];

export default function B2BPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="w-full bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden pt-20 w-screen -ml-[50vw] left-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-8">
              <Award className="w-4 h-4" />
              OEM/Private Label Manufacturing
            </div>

            <h1 className="text-4xl lg:text-6xl font-light tracking-tight text-foreground mb-8">
              Your Trusted Partner in <br />
              <span className="text-primary font-normal">Cosmetics Manufacturing</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              24+ years of excellence crafting premium skincare, body care, and hair care products.
              From concept to shelf, we bring your brand vision to life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#quote-request"
                className="btn-primary group inline-flex items-center"
              >
                Request a Quote
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#capabilities"
                className="btn-outline group inline-flex items-center"
              >
                Our Capabilities
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-container bg-muted/20 border-y border-border/20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-light text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="section-container" id="process">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-6">Our Manufacturing Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A proven 4-step process refined over 24 years to deliver excellence at every stage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`group p-8 rounded-xl border transition-all duration-300 cursor-pointer ${
                    activeStep === index
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
                      : "bg-card border-border/20 hover:border-primary/20"
                  }`}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        activeStep === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-light text-primary/40">
                          {step.number}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {step.timeline}
                        </div>
                      </div>

                      <h3 className="text-xl font-medium text-foreground mb-3">
                        {step.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-container bg-muted/20" id="capabilities">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading mb-6">Manufacturing Capabilities</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our state-of-the-art facility in Samut Prakan, Thailand combines traditional expertise
                with modern technology to deliver world-class cosmetic products.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{capability}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-background rounded-lg border border-border/20">
                <h3 className="font-medium text-foreground mb-2">Looking to explore our products?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our retail catalog featuring hundreds of formulations you can customize for your brand.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View Product Catalog
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            <div>
              <div className="bg-card p-8 rounded-xl border border-border/20">
                <h3 className="text-xl font-medium text-foreground mb-6">Product Categories</h3>
                <div className="space-y-6">
                  {productCategories.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-foreground mb-3">{category.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container" id="quote-request">
        <div className="container max-w-4xl">
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 lg:p-12 rounded-2xl border border-border/20 text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-6" />

            <h2 className="text-3xl lg:text-4xl font-light text-foreground mb-6">
              Ready to Start Your Project?
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get a custom quote for your cosmetic manufacturing needs. Our team will respond within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quote-request"
                className="btn-primary group inline-flex items-center"
              >
                Request Custom Quote
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sample-request"
                className="btn-outline group inline-flex items-center"
              >
                Request Samples
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="text-center mt-4">
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                Or contact our team directly
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-container bg-muted/20 border-t border-border/20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-light text-foreground mb-6">
              Why Global Brands Trust Sky High
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              With over two decades of experience serving clients across the GCC and African Union markets,
              we&apos;ve built a reputation for quality, reliability, and innovation in cosmetic manufacturing.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium">ISO 9001:2015</div>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium">GMP Certified</div>
              </div>
              <div className="text-center">
                <Globe className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium">Global Export</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
