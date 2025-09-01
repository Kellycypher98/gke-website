'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, createAdminClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          return
        }
        
        if (session) {
          const redirectTo = searchParams.get('redirectedFrom') || '/admin'
          console.log('Session found, redirecting to:', redirectTo)
          // Use replace to prevent back button issues
          window.location.href = redirectTo
        }
      } catch (err) {
        console.error('Error checking session:', err)
      }
    }
    
    checkSession()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const redirectTo = searchParams.get('redirectedFrom') || '/admin'
        console.log('Auth state changed: User signed in, redirecting to:', redirectTo)
        // Force a hard redirect to ensure all state is properly reset
        window.location.href = redirectTo
      }
    })
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [router, searchParams])
  
  // Function to verify admin status directly with service role
  const verifyAdminStatus = async (userId: string) => {
    try {
      const supabaseAdmin = createAdminClient()
      
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return user?.role === 'ADMIN';
    } catch (error) {
      console.error('Error in verifyAdminStatus:', error);
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    console.log('Attempting to sign in...', { email })

    try {
      // First sign in the user
      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        throw signInError
      }
      
      if (!user || !session) {
        console.error('No user or session returned from sign in')
        throw new Error('Authentication failed. Please try again.')
      }

      console.log('Auth successful, checking user role...')
      console.log('User ID:', user.id, 'Session:', !!session)
      
      try {
        console.log('Verifying admin status...')
        const isAdmin = await verifyAdminStatus(user.id)
        console.log('Admin verification result:', isAdmin)
        
        if (!isAdmin) {
          console.log('Access denied - User is not an admin')
          // Sign out the user if they're not an admin
          await supabase.auth.signOut()
          throw new Error('Access denied. Admins only.')
        }

        console.log('Admin access granted')
        // Use redirectedFrom if available, otherwise default to /admin
        const redirectTo = searchParams.get('redirectedFrom') || '/admin'
        console.log('Redirecting to:', redirectTo)
        
        // Ensure the session is properly set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Force a hard redirect to the admin dashboard
        // This ensures all state is properly reset
        window.location.href = redirectTo
        
        return // Prevent further execution
        
      } catch (verifyError) {
        console.error('Error during admin verification:', verifyError)
        throw new Error('Error verifying admin status. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
