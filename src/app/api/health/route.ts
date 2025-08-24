import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Simple DB check: run a lightweight query
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: 'up',
      env: process.env.NODE_ENV,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, database: 'down' }, { status: 500 })
  }
}
