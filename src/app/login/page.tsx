"use client"

import { useState, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import supabaseClient from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const search = useSearchParams()
  const router = useRouter()

  const redirect = search.get('redirect') || '/admin'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-heading mb-2">Check your email</h1>
          <p className="text-gray-300">We sent a magic sign-in link to {email}.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-heading mb-4">Admin Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">You must be added as an admin to access the dashboard.</p>
      </div>
    </main>
  )
}
