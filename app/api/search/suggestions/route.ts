import { NextRequest, NextResponse } from 'next/server'
import { getSearchSuggestions, getPopularSearches } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      // Return popular searches if no query
      const popularSearches = await getPopularSearches(limit)
      return NextResponse.json({ 
        suggestions: popularSearches,
        type: 'popular'
      })
    }

    const suggestions = await getSearchSuggestions(query, limit)
    
    return NextResponse.json({ 
      suggestions,
      type: 'suggestions'
    })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
} 