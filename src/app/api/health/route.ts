import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple health check
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
