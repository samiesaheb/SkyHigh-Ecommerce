"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/lib/config";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch(API_ENDPOINTS.CONTACT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      setStatus(data.message);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("❌ Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We&apos;d love to hear from you. Our team will respond promptly to your inquiry.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {/* Contact Form Section */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="Write your message here..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>

                {status && (
                  <div className={`mt-4 p-4 rounded-md border text-sm ${
                    status.includes('❌') 
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  }`}>
                    {status}
                  </div>
                )}
              </div>
            </form>
          </section>

          {/* Contact Information */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground">(+66) 23233517 - 20</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Email</h3>
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    <a href="mailto:info@skyhigh.co.th" className="hover:text-foreground transition-colors underline decoration-1 underline-offset-2">
                      info@skyhigh.co.th
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <a href="mailto:samie@skyhigh.co.th" className="hover:text-foreground transition-colors underline decoration-1 underline-offset-2">
                      samie@skyhigh.co.th
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Address & Map */}
          <section className="mb-20">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Visit Our Office
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-foreground mb-2">Address</h3>
                <div className="text-muted-foreground leading-relaxed">
                  524 Moo 7, Bang Pu Mai,<br />
                  Mueang Samut Prakan,<br />
                  Samut Prakan 10280,<br />
                  Thailand
                </div>
              </div>
              <div className="w-full h-[300px] rounded-lg overflow-hidden border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.0032492159744!2d100.62949107525492!3d13.535391886834283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d59ceaaaaaaab%3A0xf32601aaee792057!2sSky%20High%20International%20Co.%2CLtd.!5e0!3m2!1sen!2sth!4v1688980000000!5m2!1sen!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
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
