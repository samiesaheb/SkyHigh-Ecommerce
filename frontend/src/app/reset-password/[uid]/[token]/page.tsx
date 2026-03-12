'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/config'

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const uid = params.uid as string
  const token = params.token as string

  const [newPassword1, setNewPassword1] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword1 !== newPassword2) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword1.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password1: newPassword1, new_password2: newPassword2 }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password reset successfully. Redirecting to login...' })
        setTimeout(() => router.push('/account/login'), 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Something went wrong. Please try again.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
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
            Choose a New Password
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Enter a new password for your Sky High account.
          </p>
        </header>

        <div className="max-w-md mx-auto">
          {message && (
            <div className={`mb-8 p-6 border text-sm font-light rounded-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2 ${
              message.type === 'success'
                ? 'bg-green-50/50 text-green-800 border-green-200/50 shadow-sm'
                : 'bg-red-50/50 text-red-800 border-red-200/50 shadow-sm'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`} />
                <span className="leading-relaxed">{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="border-b border-border/5 pb-8">
              <label htmlFor="newPassword1" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                New Password
              </label>
              <input
                id="newPassword1"
                type="password"
                placeholder="Enter your new password"
                className="w-full px-4 py-3 text-base border border-border/50 text-foreground font-light bg-background rounded-md focus:border-border/70 focus:outline-none focus:ring-1 focus:ring-border/30 transition-all duration-300 placeholder:text-muted-foreground hover:border-border/60"
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="border-b border-border/5 pb-8">
              <label htmlFor="newPassword2" className="text-xs font-light text-muted-foreground tracking-[0.1em] uppercase mb-4 block">
                Confirm New Password
              </label>
              <input
                id="newPassword2"
                type="password"
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 text-base border border-border/50 text-foreground font-light bg-background rounded-md focus:border-border/70 focus:outline-none focus:ring-1 focus:ring-border/30 transition-all duration-300 placeholder:text-muted-foreground hover:border-border/60"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                required
                minLength={8}
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
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
