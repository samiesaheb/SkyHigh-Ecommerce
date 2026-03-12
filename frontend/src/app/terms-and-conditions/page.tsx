"use client";

export default function TermsAndConditionsPage() {
  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Terms & Conditions
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Welcome to Sky High International Co., Ltd.'s official website. By accessing or using our services, you agree to the following terms.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {/* 1. Use of Website */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Use of Website
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website and its content are intended solely for lawful, personal, and non-commercial purposes. You may not reproduce, distribute, modify, or exploit any content, including product descriptions, images, or trademarks, without our prior written consent.
            </p>
          </section>

          {/* 2. Product Information */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Product Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to ensure all product details, images, and pricing are accurate and up to date. However, variations in color, packaging, or formulation may occur without notice. We do not guarantee that all information will be free from errors.
            </p>
          </section>

          {/* 3. Orders & Payments */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Orders & Payments
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By placing an order, you confirm that all billing and shipping information provided is accurate. We reserve the right to cancel or refuse any order due to suspected fraud, unauthorized activity, or product unavailability. All payments must be made through our approved payment channels.
            </p>
          </section>

          {/* 4. Shipping & Delivery */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Shipping & Delivery
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Delivery times are estimates and may vary due to external factors. Sky High International is not responsible for delays caused by customs clearance, courier issues, or unforeseen circumstances.
            </p>
          </section>

          {/* 5. Returns & Refunds */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Returns & Refunds
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Due to the nature of cosmetic products, returns are accepted only for defective or incorrect items in their original packaging, subject to inspection. Please contact us within 7 days of receiving your order for assistance.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sky High International Co., Ltd. shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our website or products. All products should be used as directed, and we disclaim liability for misuse.
            </p>
          </section>

          {/* 7. Governing Law */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the Kingdom of Thailand. Any disputes will be subject exclusively to the jurisdiction of Thai courts.
            </p>
          </section>

          {/* 8. Modifications */}
          <section className="mb-20">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Modifications
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms & Conditions at any time without prior notice. Continued use of our website constitutes acceptance of the revised terms.
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
