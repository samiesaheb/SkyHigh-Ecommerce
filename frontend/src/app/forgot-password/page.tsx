'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/config'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'If this email is registered, a reset link has been sent.' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full bg-background">
      <div className="container max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Reset Password
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </header>

        <div className="max-w-md mx-auto">
          {status && (
            <div className={`mb-8 p-6 border text-sm font-light rounded-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2 ${
              status.type === 'success'
                ? 'bg-green-50/50 text-green-800 border-green-200/50 shadow-sm'
                : 'bg-red-50/50 text-red-800 border-red-200/50 shadow-sm'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  status.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`} />
                <span className="leading-relaxed">{status.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="border-b border-border/5 pb-8">
              <label htmlFor="email" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 text-base border border-border/50 text-foreground font-light bg-background rounded-md focus:border-border/70 focus:outline-none focus:ring-1 focus:ring-border/30 transition-all duration-300 placeholder:text-muted-foreground hover:border-border/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-12 py-4 bg-foreground text-background font-light text-sm tracking-wider uppercase hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-3" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              <Link
                href="/account/login"
                className="inline-flex items-center justify-center px-12 py-4 border border-foreground text-foreground font-light text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
