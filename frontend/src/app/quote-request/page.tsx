"use client";

import { useState } from "react";
import { ArrowRight, Upload, CheckCircle2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

const productTypes = [
  "Facial Cleanser",
  "Facial Serum",
  "Facial Moisturizer",
  "Anti-Aging Cream",
  "Body Lotion",
  "Body Soap",
  "Whitening Product",
  "Shampoo",
  "Conditioner",
  "Hair Serum",
  "Hair Mask",
  "Custom Formulation"
];

const volumeRanges = [
  "500 - 1,000 units",
  "1,000 - 5,000 units",
  "5,000 - 10,000 units",
  "10,000 - 50,000 units",
  "50,000+ units"
];

const timelineOptions = [
  "Urgent (1-2 months)",
  "Standard (2-4 months)",
  "Flexible (4+ months)"
];

export default function QuoteRequestPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    productType: "",
    customProductType: "",
    volumeRange: "",
    timeline: "",
    hasFormulation: "",
    brandingRequirements: "",
    additionalInfo: "",
    hearAboutUs: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.QUOTE_REQUEST || "/api/quote-requests/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quote request");
      }

      setSubmitted(true);
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        country: "",
        productType: "",
        customProductType: "",
        volumeRange: "",
        timeline: "",
        hasFormulation: "",
        brandingRequirements: "",
        additionalInfo: "",
        hearAboutUs: ""
      });
    } catch (err) {
      setError("Failed to submit your request. Please try again or contact us directly.");
      console.error("Quote request error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="w-full bg-background">
        <div className="container max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
              Quote Request Received!
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Thank you for your interest in Sky High International. Our business development team
              will review your requirements and contact you within 24 hours.
            </p>

            <div className="bg-muted/30 p-6 rounded-lg border border-border/20 mb-8">
              <h2 className="font-medium text-foreground mb-3">What Happens Next?</h2>
              <div className="space-y-3 text-sm text-muted-foreground text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    1
                  </div>
                  <p>Our team reviews your requirements and prepares a preliminary assessment</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    2
                  </div>
                  <p>We'll contact you to discuss your project in detail</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    3
                  </div>
                  <p>You'll receive a detailed quote with pricing, timeline, and next steps</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline"
              >
                Submit Another Request
              </button>
              <a href="/" className="btn-primary group inline-flex items-center">
                Return to Homepage
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Request a Custom Quote
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Tell us about your cosmetic manufacturing needs. Our team will prepare a detailed quote
            tailored to your specific requirements.
          </p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <section className="bg-card p-6 lg:p-8 rounded-xl border border-border/20">
            <h2 className="text-xl font-medium text-foreground mb-6 pb-3 border-b border-border/20">
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-foreground mb-2">
                  Contact Person *
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="email@company.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="+66 XX XXX XXXX"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                  Country *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your country"
                />
              </div>
            </div>
          </section>

          {/* Project Details */}
          <section className="bg-card p-6 lg:p-8 rounded-xl border border-border/20">
            <h2 className="text-xl font-medium text-foreground mb-6 pb-3 border-b border-border/20">
              Project Details
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="productType" className="block text-sm font-medium text-foreground mb-2">
                  Product Type *
                </label>
                <select
                  id="productType"
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a product type</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {formData.productType === "Custom Formulation" && (
                <div>
                  <label htmlFor="customProductType" className="block text-sm font-medium text-foreground mb-2">
                    Please specify your custom product
                  </label>
                  <input
                    id="customProductType"
                    name="customProductType"
                    type="text"
                    value={formData.customProductType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Describe your custom product"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="volumeRange" className="block text-sm font-medium text-foreground mb-2">
                    Estimated Volume *
                  </label>
                  <select
                    id="volumeRange"
                    name="volumeRange"
                    required
                    value={formData.volumeRange}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select volume range</option>
                    {volumeRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-foreground mb-2">
                    Project Timeline *
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    required
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select timeline</option>
                    {timelineOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="hasFormulation" className="block text-sm font-medium text-foreground mb-2">
                  Do you have an existing formulation? *
                </label>
                <select
                  id="hasFormulation"
                  name="hasFormulation"
                  required
                  value={formData.hasFormulation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Please select</option>
                  <option value="yes">Yes, I have a formulation</option>
                  <option value="no">No, I need formulation development</option>
                  <option value="modification">I need modifications to existing formulation</option>
                </select>
              </div>

              <div>
                <label htmlFor="brandingRequirements" className="block text-sm font-medium text-foreground mb-2">
                  Branding & Packaging Requirements
                </label>
                <textarea
                  id="brandingRequirements"
                  name="brandingRequirements"
                  rows={4}
                  value={formData.brandingRequirements}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your branding vision, packaging preferences, label requirements, etc."
                />
              </div>

              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-foreground mb-2">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Any other details about your project, target market, regulatory requirements, etc."
                />
              </div>

              <div>
                <label htmlFor="hearAboutUs" className="block text-sm font-medium text-foreground mb-2">
                  How did you hear about us?
                </label>
                <input
                  id="hearAboutUs"
                  name="hearAboutUs"
                  type="text"
                  value={formData.hearAboutUs}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Google search, referral, trade show, etc."
                />
              </div>
            </div>
          </section>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              * Required fields. We'll respond within 24 business hours.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary group inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Quote Request"}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
