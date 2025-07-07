"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
      const res = await fetch("http://127.0.0.1:8000/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      setStatus(data.message);

      // Optional: clear form after submission
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("❌ Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Contact Form */}
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-red-600 mb-6">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending..." : "Send Message"}
          </Button>

          {status && (
            <p className="text-sm text-center text-white">{status}</p>
          )}
        </form>
      </div>

      {/* Company Info + Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Company Info */}
        <div className="space-y-4 text-white-800 text-sm leading-relaxed">
          <h3 className="text-2xl font-semibold text-black mb-4">Our Contact Details</h3>
          <p><strong>Phone:</strong> (+66) 23233517 - 20</p>
          <p><strong>Fax:</strong> (+66) 23233516</p>
          <p><strong>Email:</strong> <a href="mailto:info@skyhigh.co.th" className="text-red-600 hover:underline">info@skyhigh.co.th</a></p>
          <p><strong>Email:</strong> <a href="mailto:samie@skyhigh.co.th" className="text-red-600 hover:underline">samie@skyhigh.co.th</a></p>
          <p className="pt-2">
            <strong>Address:</strong><br />
            524 Moo 7, Bang Pu Mai,<br />
            Mueang Samut Prakan,<br />
            Samut Prakan 10280,<br />
            Thailand
          </p>
        </div>

        {/* Map */}
        <div className="w-full h-[450px] rounded shadow-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.0032492159744!2d100.62949107525492!3d13.535391886834283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d59ceaaaaaaab%3A0xf32601aaee792057!2sSky%20High%20International%20Co.%2CLtd.!5e0!3m2!1sen!2sth!4v1751007875333!5m2!1sen!2sth"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
