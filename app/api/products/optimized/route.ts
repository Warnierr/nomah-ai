import { NextRequest, NextResponse } from 'next/server'
import { 
  withPerformanceTracking, 
  OptimizedQueries, 
  validatePagination, 
  validateSortOrder,
  rateLimit,
  handleApiError 
} from '@/lib/api-optimization'

async function handleProductSearch(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = rateLimit(clientIp, 60, 60000) // 60 requests per minute
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '',
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const { page, limit } = validatePagination(request)
    const { sortBy, sortOrder } = validateSortOrder(
      searchParams.get('sortBy') || undefined,
      searchParams.get('sortOrder') || undefined
    )

    // Extract and validate filters
    const filters = {
      query: searchParams.get('q') || undefined,
      categoryId: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? 
        Math.max(0, parseFloat(searchParams.get('minPrice')!)) : undefined,
      maxPrice: searchParams.get('maxPrice') ? 
        Math.max(0, parseFloat(searchParams.get('maxPrice')!)) : undefined,
      brand: searchParams.get('brand') || undefined,
      inStock: searchParams.get('inStock') === 'true',
      featured: searchParams.get('featured') === 'true',
      rating: searchParams.get('rating') ? 
        Math.min(5, Math.max(0, parseFloat(searchParams.get('rating')!))) : undefined,
      sortBy,
      sortOrder,
      page,
      limit
    }

    // Use optimized search
    const result = await OptimizedQueries.searchProducts(filters)
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5min cache
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    return handleApiError(error, 'optimized-product-search')
  }
}

export const GET = withPerformanceTracking(handleProductSearch) 