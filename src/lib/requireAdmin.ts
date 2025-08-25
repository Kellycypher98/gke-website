import prisma from '@/lib/prisma'
import { supabaseRoute } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

// Use inside Route Handlers to enforce ADMIN access.
export async function requireAdmin() {
  const supabase = supabaseRoute()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    return { ok: false as const, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const authId = session.user.id
  // authExternalId was just added to Prisma schema; ts types will update after `prisma generate`.
  const user = await prisma.user.findFirst({ where: { authExternalId: authId } })

  if (!user || user.role !== 'ADMIN') {
    return { ok: false as const, response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const, user }
}
