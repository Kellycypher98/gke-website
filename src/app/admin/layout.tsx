import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import { UserRole } from '@prisma/client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not authenticated, redirect to login
  if (!user) {
    return redirect('/login?redirect=/admin')
  }

  // Check if user has admin role (you'll need to implement this)
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'ADMIN') {
    return redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action="/auth/logout" method="post">
                <button 
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
