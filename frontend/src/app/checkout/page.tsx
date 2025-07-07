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
import { useCart } from "@/components/HeaderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
console.log("🧪 Stripe public key:", process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);


function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()!.split(";").shift() : "";
}

function StripeForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { refreshQuantity } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/thank-you",
      },
      redirect: "if_required", // 👈 prevents Stripe from auto-redirecting unless needed
    });

    if (result.error) {
      setMessage(result.error.message || "Payment failed.");
    } else if (result.paymentIntent?.status === "succeeded") {
      refreshQuantity();
      router.push("/thank-you");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-lg">Payment</h3>
      <PaymentElement />
      {message && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          ❌ {message}
        </p>
      )}
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? "Processing..." : "Pay Now"}
      </Button>
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
    zip: "",
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateClientSecret = async () => {
    setSubmitting(true);
    const csrfToken = getCookie("csrftoken");

    const payload = {
      ...formData,
      items: cartItems,
    };

    try {
      const res = await fetch("http://localhost:8000/api/orders/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        alert(`❌ Checkout failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Error during checkout:", err);
      alert("❌ Network error. Please try again.");
    }

    setSubmitting(false);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!clientSecret ? (
            <>
              <Input
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
              />
              <Input
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
              <Input
                name="address"
                placeholder="Address"
                onChange={handleChange}
              />
              <Input name="city" placeholder="City" onChange={handleChange} />
              <Input name="zip" placeholder="ZIP" onChange={handleChange} />

              <div className="border rounded p-4 space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={
                        item.main_image.startsWith("http")
                          ? item.main_image
                          : `http://localhost:8000${item.main_image}`
                      }
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-red-600">
                      ฿{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                <p className="text-sm text-gray-600">
                  Total:{" "}
                  <span className="text-red-600 font-bold">
                    ฿{total.toFixed(2)}
                  </span>
                </p>
              </div>

              <Button
                onClick={handleGenerateClientSecret}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Loading Stripe..." : "Continue to Payment"}
              </Button>
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeForm clientSecret={clientSecret} />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
