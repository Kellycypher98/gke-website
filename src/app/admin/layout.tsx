'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/admin', current: true },
  { name: 'Users', href: '/admin/users', current: false },
  { name: 'Events', href: '/admin/events', current: false },
  { name: 'Orders', href: '/admin/orders', current: false },
  { name: 'Newsletter', href: '/admin/newsletter', current: false },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Skip auth check for login page
  if (pathname === '/admin/login' || pathname === '/admin/auth/login') {
    return children
  }

  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      if (!mounted) return
      
      try {
        console.log('🔒 Checking authentication...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.log('🔐 No active session, redirecting to login')
          window.location.href = '/admin/login?redirectedFrom=' + encodeURIComponent(pathname)
          return
        }

        console.log('✅ Session found, checking admin status...')
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData || userData.role !== 'ADMIN') {
          console.log('⛔ User is not an admin, redirecting to unauthorized')
          await supabase.auth.signOut()
          window.location.href = '/unauthorized'
          return
        }

        console.log('👤 Admin access granted')
        setIsAdmin(true)
      } catch (error) {
        console.error('❌ Authentication error:', error)
        window.location.href = '/admin/login'
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkAuth()
    
    return () => {
      mounted = false
    }
  }, [pathname])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will be handled by the redirects in the effect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${pathname === item.href 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} 
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
