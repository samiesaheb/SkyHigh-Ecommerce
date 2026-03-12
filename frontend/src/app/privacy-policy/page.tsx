"use client";

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            At Sky High International Co., Ltd., your trust is our priority. This policy explains how we collect, use, and protect your personal information.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {/* 1. Information We Collect */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may collect personal details such as your name, email address, phone number, billing and shipping addresses, and order history. Information is gathered when you create an account, make a purchase, subscribe to our newsletters, or communicate with us directly.
            </p>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your personal information is used to process and fulfill orders, send transactional and promotional communications, enhance customer experience, comply with legal obligations, and improve our services. We do not sell or rent your personal data to third parties.
            </p>
          </section>

          {/* 3. Cookies & Tracking */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Cookies & Tracking
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to analyze website traffic, understand browsing behavior, and personalize your shopping experience. You may adjust your browser settings to refuse cookies, but this may limit certain functionalities of our site.
            </p>
          </section>

          {/* 4. Data Security */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to safeguard your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          {/* 5. Your Rights */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to request access to, correction of, or deletion of your personal information at any time. You may also request to opt out of marketing communications. To exercise your rights, please contact us using the details below.
            </p>
          </section>

          {/* 6. Third-Party Services */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites or use third-party services (e.g., payment processors, analytics tools). We are not responsible for the privacy practices of these third parties and encourage you to review their privacy policies.
            </p>
          </section>

          {/* 7. Changes to This Policy */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be reflected on this page with an updated "Last Updated" date. Continued use of our website after such changes constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-20">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For any privacy-related inquiries, please contact us at:{" "}
              <a
                href="mailto:samie@skyhigh.co.th"
                className="text-foreground hover:text-muted-foreground transition-colors underline decoration-1 underline-offset-2"
              >
                samie@skyhigh.co.th
              </a>
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
