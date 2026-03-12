"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/components/auth/UserContext";
import { API_ENDPOINTS } from "@/lib/config";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: email, email, password, name }),
      });

      if (response.ok) {
        const userRes = await fetch(API_ENDPOINTS.AUTH.USER, {
          credentials: "include",
        });
        const userData = await userRes.json();

        setUser({
          username: userData.email,
          full_name: `${userData.first_name}${userData.last_name ? " " + userData.last_name : ""}`,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_admin: userData.is_admin,
        });

        router.push("/");
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <div className="container max-w-md mx-auto px-6 sm:px-8 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
            Create Account
          </h1>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Join us to start your journey
          </p>
        </header>

        <div className="space-y-8">
          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
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
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-4 rounded-md border bg-destructive/10 text-destructive border-destructive/20 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/account/login"
                className="text-muted-foreground hover:text-foreground transition-colors underline decoration-1 underline-offset-2"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center pt-16 border-t border-border/20 mt-16">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-1 underline-offset-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
