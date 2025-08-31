'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Ticket, FileText, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { UserRole } from '@/lib/supabase/types'

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/admin/login')
        return
      }

      // Check if user has admin role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!userData || userData.role !== UserRole.ADMIN) {
        router.push('/')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
