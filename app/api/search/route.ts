import { NextRequest, NextResponse } from 'next/server'
import { searchProducts, SearchFilters } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      categoryId: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      brand: searchParams.get('brand') || undefined,
      inStock: searchParams.get('inStock') === 'true',
      featured: searchParams.get('featured') === 'true',
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    }

    const result = await searchProducts(filters)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
} 