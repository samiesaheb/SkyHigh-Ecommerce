"use client";

import { useEffect, useState } from "react";
import { UserCircle, Menu, X, Edit3, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { API_ENDPOINTS } from "@/lib/config";

type User = {
  username?: string;
  full_name: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.USER, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        setUser({
          username: data.email,
          full_name:
            data.full_name || `${data.first_name} ${data.last_name || ""}`.trim(),
          email: data.email,
        });
      } catch (err) {
        console.warn("User fetch error:", err);
        setError("Failed to load profile. Please try again.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 min-h-[80vh]">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Skeleton */}
          <div className="lg:w-1/3">
            <div className="animate-pulse">
              <div className="h-6 bg-black/10 rounded w-32 mb-12"></div>
              <nav className="space-y-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-4 bg-black/10 rounded w-28"></div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:w-2/3">
            <div className="border-t border-black/10 pt-12 animate-pulse">
              <div className="mb-16">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-black/20 rounded mr-4"></div>
                  <div className="h-8 bg-black/10 rounded w-48"></div>
                </div>
                <div className="h-4 bg-black/10 rounded w-32 ml-6"></div>
              </div>

              <div className="space-y-12 mb-16">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border-b border-black/5 pb-8">
                    <div className="h-3 bg-black/10 rounded w-20 mb-4"></div>
                    <div className="h-5 bg-black/10 rounded w-40"></div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="h-12 bg-black/10 rounded w-32"></div>
                <div className="h-12 bg-black/10 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <p className="text-base font-light text-black mb-8 max-w-md text-center">
          {error || "You are not logged in."}
        </p>
        <Link
          href="/account/login"
          className="inline-block px-12 py-4 border border-black text-black font-light text-sm tracking-wider uppercase hover:bg-black hover:text-white transition-all duration-300"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full bg-background">
      <div className="container max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Profile Overview
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Welcome back, {user.full_name}. Manage your account settings and view your information below.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            {/* Mobile Sidebar */}
            <div className="lg:hidden mb-8">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-3 border border-border/20 hover:border-border/40 transition-all duration-300 w-full justify-start"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Account Navigation
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-12 bg-background border-l-0">
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-lg font-light tracking-tight uppercase text-muted-foreground">Account</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-muted transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <nav className="space-y-6">
                    <Link
                      href="/profile"
                      className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Profile Overview
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Order History
                    </Link>
                    <Link
                      href="/profile/change-password"
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Change Password
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-light tracking-tight uppercase text-muted-foreground mb-12">Account</h2>
              <nav className="space-y-6">
                <Link
                  href="/profile"
                  className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
                >
                  Profile Overview
                </Link>
                <Link
                  href="/profile/edit"
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/profile/orders"
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Order History
                </Link>
                <Link
                  href="/profile/change-password"
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Change Password
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="prose prose-lg max-w-none">
              {/* Account Information */}
              <section className="mb-16 mt-8">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Name</h3>
                <p className="text-foreground leading-relaxed">{user.full_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email Address</h3>
                <p className="text-foreground leading-relaxed">{user.email || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Username</h3>
                <p className="text-foreground leading-relaxed">{user.username || "Not set"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Member Since</h3>
                <p className="text-foreground leading-relaxed">{new Date().getFullYear()}</p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-16">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/profile/edit"
                className="group p-6 border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Edit3 className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Edit Profile</h3>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/profile/orders"
                className="group p-6 border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Order History</h3>
                    <p className="text-sm text-muted-foreground">View your past orders and tracking</p>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Security Settings */}
          <section className="mb-20">
            <h2 className="text-xl font-light tracking-tight text-foreground mb-6 pb-2 border-b border-border/20">
              Security Settings
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Keep your account secure by regularly updating your password and reviewing your security settings.
            </p>
            <Link
              href="/profile/change-password"
              className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors underline decoration-1 underline-offset-2"
            >
              <UserCircle className="w-4 h-4" />
              Change Password
            </Link>
          </section>
        </div>

          {/* Last Updated */}
          <div className="text-center pt-8 border-t border-border/20">
            <p className="caption-text text-muted-foreground">
              Profile last viewed: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}