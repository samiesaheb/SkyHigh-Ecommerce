'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/account/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({})) // 🛡️ safe fallback

      if (res.ok) {
        setStatus('✅ Password reset link sent. Check your email.')
      } else {
        setStatus(`❌ ${data?.error || 'Something went wrong.'}`)
      }
    } catch (err) {
      console.error('❌ Network error:', err)
      setStatus('❌ Network error. Please try again.')
    } finally {
      setLoading(false) // ✅ ensures button resets no matter what
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  )
}
