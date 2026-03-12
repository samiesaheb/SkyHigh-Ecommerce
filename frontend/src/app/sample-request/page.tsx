"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

const productCategories = [
  "Facial Care",
  "Body & Skin Care",
  "Hair Care",
  "Anti-Aging Products",
  "Whitening Products",
  "Natural/Organic Products"
];

const intendedUseOptions = [
  { value: "testing", label: "Product Testing" },
  { value: "market_research", label: "Market Research" },
  { value: "evaluation", label: "Manufacturing Evaluation" },
  { value: "other", label: "Other" }
];

export default function SampleRequestPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    shippingAddress: "",
    specificProducts: "",
    intendedUse: "",
    businessType: "",
    additionalInfo: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      setError("Please select at least one product category");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.SAMPLE_REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          product_categories: selectedCategories.join(", "),
          company_name: formData.companyName,
          contact_name: formData.contactName,
          shipping_address: formData.shippingAddress,
          specific_products: formData.specificProducts,
          intended_use: formData.intendedUse,
          business_type: formData.businessType,
          additional_info: formData.additionalInfo
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit sample request");
      }

      setSubmitted(true);
      setSelectedCategories([]);
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        country: "",
        shippingAddress: "",
        specificProducts: "",
        intendedUse: "",
        businessType: "",
        additionalInfo: ""
      });
    } catch (err) {
      setError("Failed to submit your request. Please try again or contact us directly.");
      console.error("Sample request error:", err);
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
              Sample Request Received!
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Thank you for your interest in our products. Our team will review your sample
              request and contact you within 24 hours to confirm availability and shipping details.
            </p>

            <div className="bg-muted/30 p-6 rounded-lg border border-border/20 mb-8">
              <h2 className="font-medium text-foreground mb-3">What Happens Next?</h2>
              <div className="space-y-3 text-sm text-muted-foreground text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    1
                  </div>
                  <p>Our team reviews your request and checks sample availability</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    2
                  </div>
                  <p>We'll contact you to confirm shipping address and details</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    3
                  </div>
                  <p>Samples are shipped with tracking number (typically 3-5 business days)</p>
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
              <a href="/b2b" className="btn-primary group inline-flex items-center">
                Explore B2B Solutions
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Request Product Samples
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Experience our quality firsthand. Request samples of our cosmetic products to evaluate
            for your business needs.
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

              <div>
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

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-foreground mb-2">
                  Business Type
                </label>
                <input
                  id="businessType"
                  name="businessType"
                  type="text"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Retailer, Distributor, Brand Owner"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-foreground mb-2">
                  Shipping Address *
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  required
                  rows={3}
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Complete shipping address including postal code"
                />
              </div>
            </div>
          </section>

          {/* Sample Request Details */}
          <section className="bg-card p-6 lg:p-8 rounded-xl border border-border/20">
            <h2 className="text-xl font-medium text-foreground mb-6 pb-3 border-b border-border/20">
              Sample Request Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Product Categories * <span className="text-muted-foreground font-normal">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productCategories.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all ${
                        selectedCategories.includes(category)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="specificProducts" className="block text-sm font-medium text-foreground mb-2">
                  Specific Products of Interest
                </label>
                <textarea
                  id="specificProducts"
                  name="specificProducts"
                  rows={3}
                  value={formData.specificProducts}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="List any specific products or formulations you'd like to try"
                />
              </div>

              <div>
                <label htmlFor="intendedUse" className="block text-sm font-medium text-foreground mb-2">
                  Intended Use *
                </label>
                <select
                  id="intendedUse"
                  name="intendedUse"
                  required
                  value={formData.intendedUse}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select intended use</option>
                  {intendedUseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  placeholder="Any other details about your sample needs, timeline, or questions"
                />
              </div>
            </div>
          </section>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              * Required fields. Samples typically ship within 3-5 business days after approval.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary group inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Request Samples"}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
