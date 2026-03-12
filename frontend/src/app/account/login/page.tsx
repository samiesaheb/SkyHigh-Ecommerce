"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useUser } from "@/components/auth/UserContext";
import { API_ENDPOINTS, API_CONFIG } from "@/lib/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
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
        const errorText = await response.text();
        setError(`Login failed: ${errorText}`);
      }
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (tokenResponse: { credential?: string }) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/google-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_token: tokenResponse.credential }),
      });

      if (res.ok) {
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
        setError("Google login failed");
      }
    } catch {
      setError("Google login error.");
    }
  };

  return (
    <main className="w-full bg-background">
      <div className="container max-w-md mx-auto px-6 sm:px-8 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
            Welcome Back
          </h1>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Sign in to your account to continue
          </p>
        </header>

        <div className="space-y-8">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
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
              disabled={isSubmitting}
              className="w-full px-8 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <div className="flex justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground transition-colors underline decoration-1 underline-offset-2"
              >
                Forgot Password?
              </Link>
              <Link
                href="/account/signup"
                className="text-muted-foreground hover:text-foreground transition-colors underline decoration-1 underline-offset-2"
              >
                Create Account
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed")}
                theme="outline"
                size="large"
                text="signin_with"
              />
            </div>
          </div>
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
