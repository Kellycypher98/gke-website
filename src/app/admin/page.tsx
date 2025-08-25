import { supabaseServer } from '@/lib/supabaseServer'

export default async function AdminPage() {
  const supabase = supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Signed in as {user?.email}</p>
          </div>
          <form action="/auth/logout" method="post">
            <button type="submit" className="btn-secondary">Logout</button>
          </form>
        </header>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold mb-2">Welcome</h2>
          <p className="text-gray-300 text-sm">
            This is a placeholder admin page. Replace with your real dashboard.
          </p>
        </section>
      </div>
    </main>
  )
}
