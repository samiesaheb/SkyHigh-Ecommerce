'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue ? decodeURIComponent(cookieValue) : '';
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password updated successfully. Redirecting...');
        setTimeout(() => router.push('/profile'), 1500);
      } else {
        setMessage(data.error || 'Failed to change password.');
      }
    } catch {
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <div className="container max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Change Password
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Update your password to keep your account secure.
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
                      className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
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
                  className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
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
                    <label htmlFor="currentPassword" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full px-4 py-3 text-base border border-border/50 text-foreground font-light bg-background rounded-md focus:border-border/70 focus:outline-none focus:ring-1 focus:ring-border/30 transition-all duration-300 placeholder:text-muted-foreground hover:border-border/60"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="border-b border-border/5 pb-8">
                    <label htmlFor="newPassword" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      className="w-full px-4 py-3 text-base border border-border/50 text-foreground font-light bg-background rounded-md focus:border-border/70 focus:outline-none focus:ring-1 focus:ring-border/30 transition-all duration-300 placeholder:text-muted-foreground hover:border-border/60"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="border-b border-border/5 pb-8">
                    <label htmlFor="confirmPassword" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-3 text-base border border-border/50 text-foreground font-light bg-background rounded-md focus:border-border/70 focus:outline-none focus:ring-1 focus:ring-border/30 transition-all duration-300 placeholder:text-muted-foreground hover:border-border/60"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                          Updating...
                        </>
                      ) : (
                        "Update Password"
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
              </section>

              {/* Last Updated */}
              <div className="text-center pt-8 border-t border-border/20">
                <p className="caption-text text-muted-foreground">
                  Password settings last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}