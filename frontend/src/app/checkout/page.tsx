"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/components/cart/HeaderContext";
import { API_ENDPOINTS, buildImageUrl } from "@/lib/config";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import Breadcrumb, { generateBreadcrumbs } from "@/components/common/Breadcrumb";
import { CheckoutSecurityNotice } from "@/components/common/TrustBadges";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// InputField component defined outside to prevent re-rendering issues
const InputField = ({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  error
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-muted-foreground mb-2">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
        error ? "border-destructive" : "border-input"
      }`}
    />
    {error && (
      <p className="mt-1 text-sm text-destructive">{error}</p>
    )}
  </div>
);

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      const result = part.split(";").shift();
      return result || '';
    }
  }
  return '';
}

function StripeForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { refreshQuantity } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check if this is a mock payment (development mode)
  const isMockPayment = clientSecret.includes("pi_mock_");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setMessage(null);

    if (isMockPayment) {
      // Development mode - simulate successful payment
      console.log("🔧 Development mode: Simulating successful payment");

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const csrfToken = getCookie("csrftoken");
        await fetch(API_ENDPOINTS.ORDERS.CONFIRM_PAYMENT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        });
        console.log("✅ Mock payment confirmed with backend");
      } catch (err) {
        console.warn("⚠️ Failed to confirm payment with backend:", err);
      }

      refreshQuantity();
      router.push("/thank-you");
    } else {
      // Production mode - use real Stripe
      if (!stripe || !elements) {
        setMessage("Payment system not loaded. Please try again.");
        setSubmitting(false);
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setMessage(result.error.message || "Payment failed.");
      } else if (result.paymentIntent?.status === "succeeded") {
        // Call backend to confirm payment and send email
        try {
          const csrfToken = getCookie("csrftoken");
          await fetch(API_ENDPOINTS.ORDERS.CONFIRM_PAYMENT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          });
          console.log("✅ Payment confirmed with backend");
        } catch (err) {
          console.warn("⚠️ Failed to confirm payment with backend:", err);
          // Continue anyway since payment succeeded
        }

        refreshQuantity();
        router.push("/thank-you");
      }
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isMockPayment ? (
        <div className="p-4 bg-muted/20 border border-border/20 rounded-lg">
          <PaymentElement />
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="text-yellow-600 text-sm font-medium">🔧 Development Mode</div>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            This is a mock payment for development. No real transaction will occur.
          </p>
          <div className="bg-white p-4 rounded border border-yellow-300">
            <div className="text-sm font-medium text-gray-700 mb-2">Mock Payment Details:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• No credit card required</div>
              <div>• Order will be created normally</div>
              <div>• Email confirmation will be sent</div>
              <div>• Payment status: Mock Success</div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-md border bg-destructive/10 text-destructive border-destructive/20 text-sm">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={(!stripe && !isMockPayment) || submitting}
        className="w-full px-8 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            {isMockPayment ? "Processing Mock Payment..." : "Processing Payment..."}
          </div>
        ) : (
          isMockPayment ? "Complete Mock Payment" : "Complete Payment"
        )}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    country: "Thailand",
    zip: "",
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Please enter a valid email";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleGenerateClientSecret = async () => {
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }
    
    setError("");
    setSubmitting(true);
    
    const csrfToken = getCookie("csrftoken");
    if (!csrfToken) {
      setError("Session expired. Please refresh the page.");
      setSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      items: cartItems,
    };

    try {
      console.log("📦 Sending checkout request to:", API_ENDPOINTS.ORDERS.CREATE);
      console.log("📝 Payload:", payload);
      
      const res = await fetch(API_ENDPOINTS.ORDERS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", res.status);
      const data = await res.json();
      console.log("📡 Response data:", data);
      
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        const errorMessage = data.error || data.message || "Unknown error";
        setError(`❌ Checkout failed: ${errorMessage}`);
        console.error("❌ Checkout failed:", data);
      }
    } catch (err) {
      console.error("❌ Error during checkout:", err);
      setError("❌ Network error. Please try again.");
    }

    setSubmitting(false);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price.toString()) * item.quantity,
    0
  );


  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={generateBreadcrumbs.checkout()} />
        </div>

        {/* Header */}
        <header className="mb-16 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
            Checkout
          </h1>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Complete your order securely
          </p>
        </header>

        {/* Progress Indicator */}
        <div className="mb-12">
          <CheckoutProgress currentStep={clientSecret ? 'payment' : 'shipping'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {!clientSecret ? (
              <>
                {/* Shipping Information */}
                <section>
                  <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
                    Shipping Information
                  </h2>
                  <div className="space-y-6">
                    <InputField
                      name="fullName"
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      error={formErrors.fullName}
                    />
                    <InputField
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      error={formErrors.email}
                    />
                    <InputField
                      name="address"
                      label="Street Address"
                      placeholder="Enter your street address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      error={formErrors.address}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        name="city"
                        label="City"
                        placeholder="Enter city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        error={formErrors.city}
                      />
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-muted-foreground mb-2">
                          Country <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-2 border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                            formErrors.country ? "border-destructive" : "border-input"
                          }`}
                        >
                          <option value="Thailand">Thailand</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Other">Other</option>
                        </select>
                        {formErrors.country && (
                          <p className="mt-1 text-sm text-destructive">{formErrors.country}</p>
                        )}
                      </div>
                    </div>
                    <InputField
                      name="zip"
                      label="ZIP / Postal Code"
                      placeholder="Enter ZIP code"
                      value={formData.zip}
                      onChange={handleChange}
                      error={formErrors.zip}
                    />
                  </div>
                </section>
              </>
            ) : (
              <section>
                <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
                  Payment Details
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeForm clientSecret={clientSecret} />
                </Elements>
              </section>
            )}
          </div>

          {/* Order Summary */}
          <div className="sticky top-24">
            <section>
              <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 border border-border/20 rounded-lg">
                    <Image
                      src={buildImageUrl(item.main_image || "")}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover rounded border border-border/20"
                      sizes="64px"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      ฿{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border/20 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-foreground">Total:</span>
                  <span className="text-xl font-medium text-foreground">
                    ฿{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {!clientSecret && (
                <>
                  <button
                    onClick={handleGenerateClientSecret}
                    disabled={submitting}
                    className="w-full px-8 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>

                  {error && (
                    <div className="p-4 rounded-md border bg-destructive/10 text-destructive border-destructive/20 text-sm">
                      {error}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
        
        {/* Security Notice */}
        <div className="pt-16 border-t border-border/20 mt-16">
          <CheckoutSecurityNotice />
        </div>
      </div>
    </main>
  );
}
