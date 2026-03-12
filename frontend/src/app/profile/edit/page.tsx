'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
  return cookieValue ? decodeURIComponent(cookieValue) : "";
}

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.USER, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setFirstName(data.full_name || `${data.first_name} ${data.last_name || ""}`.trim());
        setEmail(data.email || "");
      } catch (err) {
        console.warn("Error fetching user data:", err);
        setMessage("Failed to load user data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ name: firstName, email }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully. Redirecting...");
        setTimeout(() => router.push("/profile"), 1500);
      } else {
        const error = await res.json();
        setMessage(`Error updating profile: ${JSON.stringify(error)}`);
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 min-h-[80vh]">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Skeleton */}
          <div className="lg:w-1/3">
            <div className="animate-pulse">
              <div className="h-6 bg-black/10 rounded w-32 mb-12"></div>
              <nav className="space-y-8">
                {Array.from({ length: 4 }).map((_, index) => (
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
                  <div className="h-8 bg-black/10 rounded w-32"></div>
                </div>
                <div className="h-4 bg-black/10 rounded w-40 ml-6"></div>
              </div>

              <form className="space-y-12 mb-16">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="border-b border-black/5 pb-8">
                    <div className="h-3 bg-black/10 rounded w-20 mb-4"></div>
                    <div className="h-12 bg-black/10 rounded w-full"></div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-6 pt-8">
                  <div className="h-12 bg-black/10 rounded w-32"></div>
                  <div className="h-12 bg-black/10 rounded w-24"></div>
                </div>
              </form>
            </div>
          </div>
        </div>
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
            Edit Profile
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Update your personal information and account details.
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
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Profile Overview
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
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
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Profile Overview
                </Link>
                <Link
                  href="/profile/edit"
                  className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
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
              <section className="mb-16 mt-8">
                {/* Message */}
                {message && (
                  <div className="mb-6 p-4 border border-border/20 bg-muted/30 text-foreground text-sm">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12 mb-16">
                  <div className="border-b border-border/5 pb-8">
                    <label htmlFor="firstName" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                      Full Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-0 py-3 text-base border-0 border-b border-border/10 text-foreground font-light bg-transparent focus:border-foreground focus:outline-none transition-all duration-300 placeholder:text-muted-foreground"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="border-b border-border/5 pb-8">
                    <label htmlFor="email" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-0 py-3 text-base border-0 border-b border-border/10 text-foreground font-light bg-transparent focus:border-foreground focus:outline-none transition-all duration-300 placeholder:text-muted-foreground"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-8">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-12 py-4 bg-foreground text-background font-light text-sm tracking-wider uppercase hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-3" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <Link
                      href="/profile"
                      className="inline-flex items-center justify-center px-12 py-4 border border-foreground text-foreground font-light text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-all duration-300"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>

                {message && (
                  <div className={`mb-8 p-6 border text-sm font-light rounded-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2 ${
                    message.includes('successfully') || message.includes('Redirecting')
                      ? 'bg-green-50/50 text-green-800 border-green-200/50 shadow-sm'
                      : 'bg-red-50/50 text-red-800 border-red-200/50 shadow-sm'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                        message.includes('successfully') || message.includes('Redirecting')
                          ? 'bg-green-600'
                          : 'bg-red-600'
                      }`}></div>
                      <span className="leading-relaxed">{message}</span>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-border/20 text-center">
                  <Link
                    href="/profile/change-password"
                    className="text-muted-foreground hover:text-foreground font-light text-sm transition-all duration-300 border-b border-transparent hover:border-border/30 pb-1 tracking-wide"
                  >
                    Change Password
                  </Link>
                </div>
              </section>

              {/* Last Updated */}
              <div className="text-center pt-8 border-t border-border/20">
                <p className="caption-text text-muted-foreground">
                  Profile settings last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}