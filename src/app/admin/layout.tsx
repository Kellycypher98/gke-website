'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          throw new Error('No active session')
        }

        // Verify if user is admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        if (userError || !userData || userData.role !== 'ADMIN') {
          throw new Error('Not authorized')
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Authentication error:', error)
        toast.error('Please log in to access the admin panel')
        window.location.href = `/login?redirectedFrom=${encodeURIComponent(pathname)}`
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
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
              <Link
                href="/"
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                View Site
              </Link>
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
