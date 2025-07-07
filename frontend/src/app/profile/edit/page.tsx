'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // ✅ import router

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
  return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : ''
}

export default function EditProfilePage() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter() // ✅ create router instance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('http://localhost:8000/api/account/update-profile/', {
      method: 'PATCH', // ✅ correct method
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      credentials: 'include',
      body: JSON.stringify({ name: firstName, email }), // ✅ match backend field name
    })

    if (res.ok) {
      router.push('/profile') // ✅ redirect after success
    } else {
      const error = await res.json()
      setMessage(`❌ Error updating profile: ${JSON.stringify(error)}`)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}

      <div className="mt-6 text-center">
        <a
          href="/profile/change-password"
          className="text-red-600 hover:underline text-sm"
        >
          Change Password
        </a>
      </div>
    </div>
  )
}
