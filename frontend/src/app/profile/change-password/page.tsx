'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (newPassword !== confirmPassword) {
      setMessage('❌ New passwords do not match.')
      return
    }

    setLoading(true)
    const res = await fetch('http://localhost:8000/api/account/change-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage('✅ Password updated successfully. Redirecting...')
      setTimeout(() => router.push('/profile'), 1500)
    } else {
      setMessage(`❌ ${data.error || 'Failed to change password.'}`)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-red-600">Change Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Current Password"
          className="w-full p-2 border rounded"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 border rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full p-2 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Change Password'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}
