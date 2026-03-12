"use client";

export default function AboutPage() {
  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            About Us
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Crafting premium cosmetics with science, elegance, and sustainability since 2000.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {/* Company Overview */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Our Company
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <span className="font-medium text-foreground">Sky High International Co., Ltd.</span>, established in 2000, is a premier OEM/private label cosmetic manufacturer headquartered in Samut Prakan, Thailand. With over two decades of trusted excellence, we specialize in developing high-quality skin care, body care, and hair care solutions for discerning clients across the GCC and African Union markets.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Backed by our <span className="font-medium text-foreground">ISO 9001:2015 certification</span>, we uphold rigorous standards of safety, innovation, and product quality. Our dedicated in-house R&D team partners with each client to deliver bespoke formulations using <span className="font-medium text-foreground">non-toxic, globally compliant ingredients</span>.
            </p>
          </section>

          {/* Philosophy */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Our Philosophy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At Sky High, we believe in going beyond manufacturing — we empower brands with cutting-edge cosmetic science, precise craftsmanship, and seamless service. Our motto reflects our ethos:
            </p>
            <div className="border-l-4 border-border/50 pl-6 my-6">
              <p className="text-lg font-light text-foreground italic">
                &ldquo;You need it? We make it!&rdquo;
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To bring the best to everything we touch — from ingredient selection to customer experience — while maintaining uncompromising quality in a competitive market. We handpick raw materials that meet international benchmarks and craft products rooted in safety, efficacy, and trust.
            </p>
          </section>

          {/* Vision */}
          <section className="mb-20">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Our Vision
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To be a global leader in innovative, sustainable, and people-friendly cosmetics. We aim to expand our market reach while preserving the values of integrity, excellence, and responsiveness that define our legacy.
            </p>
          </section>
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
