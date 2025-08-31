'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function Unauthorized() {
  const router = useRouter()

  useEffect(() => {
    // Sign out the user and redirect to home after 3 seconds
    const timer = setTimeout(() => {
      supabase.auth.signOut().then(() => {
        router.push('/')
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Unauthorized Access</h1>
        <p className="text-gray-600">
          You don't have permission to access this page. You will be redirected to the home page shortly.
        </p>
      </div>
    </div>
  )
}
