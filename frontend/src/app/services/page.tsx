"use client";

const services = [
  {
    title: "After Sales Support",
    description:
      "Dedicated support to drive your brand's continued success, including logistics, documentation, and market coordination.",
  },
  {
    title: "Regulatory & Legal Services",
    description:
      "Ensuring compliance and confidence for your brand through international documentation, testing, and certifications.",
  },
  {
    title: "Packaging Solutions",
    description:
      "Innovative and customized packaging designed to align with your brand identity and market needs.",
  },
  {
    title: "Custom Formulation",
    description:
      "Expertly crafted formulations designed to match your market goals using safe, high-quality ingredients.",
  },
  {
    title: "Personal Care",
    description:
      "Innovative, customizable solutions for every skin and body care need — from concept to shelf.",
  },
  {
    title: "Baby & Sensitive Skin",
    description:
      "Gentle and effective solutions for babies and sensitive skin, tailored to meet regulatory and safety standards.",
  },
  {
    title: "Body Care",
    description:
      "Custom body care solutions crafted for your target demographic with high-performance ingredients.",
  },
  {
    title: "Hair Care",
    description:
      "Expertly formulated hair care products to strengthen, nourish, and revitalize all hair types.",
  },
  {
    title: "Skincare Solutions",
    description:
      "Your trusted OEM partner for high-quality skincare — scientifically backed and trend-aware.",
  },
];

export default function ServicesPage() {
  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Our Services
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Complete OEM/ODM solutions from concept to creation, ensuring your brand achieves excellence in every market.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {services.map((service, index) => (
            <section key={service.title} className="mb-16">
              <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
                {service.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </section>
          ))}
        </div>

        {/* Last Updated */}
        <div className="text-center pt-8 border-t border-border/20">
          <p className="caption-text text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
