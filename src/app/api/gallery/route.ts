import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Fetch gallery items from your database
    const { data: galleryItems, error } = await supabase
      .from('gallery_items') // Make sure this table exists in your Supabase
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery items' },
        { status: 500 }
      )
    }

    return NextResponse.json(galleryItems || [])
  } catch (error) {
    console.error('Error in gallery API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
