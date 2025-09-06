'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Ticket, FileText, Mail } from 'lucide-react'
import { supabase, createAdminClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/supabase/types'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      if (!mounted) return
      
      try {
        console.log('🔒 Checking authentication...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          throw sessionError
        }
        
        if (!session) {
          console.log('🔐 No active session, redirecting to login')
          // Use window.location to force a full page reload and clear any stale state
          window.location.href = '/login?redirectedFrom=' + encodeURIComponent(window.location.pathname)
          return
        }

        console.log('✅ Session found, checking admin status...')
        // Use admin client to bypass RLS
        const adminClient = createAdminClient()
        const { data: userData, error: userError } = await adminClient
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        if (userError || !userData) {
          console.error('❌ Error fetching user data:', userError)
          // Clear any potentially invalid session
          await supabase.auth.signOut()
          window.location.href = '/login?error=auth_error'
          return
        }

        console.log('👤 User role:', userData.role)
        
        if (userData.role !== UserRole.ADMIN) {
          console.log('⛔ User is not an admin, signing out and redirecting')
          await supabase.auth.signOut()
          router.replace('/')
          return
        }

        console.log('✅ User is admin, granting access')
        setIsAdmin(true)
        // Force a refresh to ensure all components get the updated auth state
        router.refresh()
      } catch (error) {
        console.error('❌ Authentication check failed:', error)
        toast.error('Failed to verify admin access')
        router.replace('/admin/login?error=auth_check_failed')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Initial check
    checkAuth()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, redirecting to login')
        router.replace('/login')
      } else if (event === 'SIGNED_IN' && session) {
        console.log('🔄 Auth state changed: User signed in, revalidating...')
        await checkAuth()
      }
    })
    
    // Cleanup function
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    // Show a more informative message while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const adminLinks = [
    {
      title: 'Events',
      description: 'Manage all events, create new ones, and update existing ones',
      icon: <Calendar className="w-8 h-8 text-primary-500" />,
      href: '/admin/events',
    },
    {
      title: 'Users',
      description: 'View and manage user accounts and permissions',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      href: '/admin/users',
    },
    {
      title: 'Ticket Tiers',
      description: 'Manage ticket pricing and availability',
      icon: <Ticket className="w-8 h-8 text-green-500" />,
      href: '/admin/ticket-tiers',
    },
    {
      title: 'Orders',
      description: 'View and manage all ticket orders',
      icon: <FileText className="w-8 h-8 text-yellow-500" />,
      href: '/admin/orders',
    },
    {
      title: 'Newsletter',
      description: 'Manage newsletter subscriptions',
      icon: <Mail className="w-8 h-8 text-purple-500" />,
      href: '/admin/newsletter',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage your events, users, and content
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="p-6 hover:shadow-md transition-shadow h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {link.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{link.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{link.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
