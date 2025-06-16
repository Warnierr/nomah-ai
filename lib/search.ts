import prisma from '@/lib/prisma'
import { cache, CACHE_KEYS, getOrSetCache } from '@/lib/cache'

export interface SearchFilters {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  inStock?: boolean
  featured?: boolean
  rating?: number
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResult {
  products: Array<{
    id: string
    name: string
    slug: string
    description: string
    price: number
    images: string[]
    brand: string
    rating: number
    numReviews: number
    countInStock: number
    isFeatured: boolean
    category: {
      id: string
      name: string
      slug: string
    }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    priceRange: { min: number; max: number }
    avgRating: number
  }
}

export async function searchProducts(filters: SearchFilters = {}): Promise<SearchResult> {
  const {
    query = '',
    categoryId,
    minPrice,
    maxPrice,
    brand,
    inStock,
    featured,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = filters

  // Build where clause
  const where: any = {}

  // Text search
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { brand: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  // Brand filter
  if (brand) {
    where.brand = brand
  }

  // Stock filter
  if (inStock) {
    where.countInStock = { gt: 0 }
  }

  // Featured filter
  if (featured) {
    where.isFeatured = true
  }

  // Rating filter
  if (rating) {
    where.rating = { gte: rating }
  }

  // Build order by
  const orderBy: any = {}
  orderBy[sortBy] = sortOrder

  // Calculate offset
  const offset = (page - 1) * limit

  // Execute search with caching for common queries
  const cacheKey = `search_${JSON.stringify(filters)}`
  
  const result = await getOrSetCache(
    cacheKey,
    async () => {
      // Get products
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.product.count({ where }),
      ])

      // Get filter data
      const [categories, brands, priceStats] = await Promise.all([
        // Categories with product counts
        prisma.category.findMany({
          include: {
            _count: {
              select: {
                products: {
                  where: query ? {
                    OR: [
                      { name: { contains: query, mode: 'insensitive' } },
                      { description: { contains: query, mode: 'insensitive' } },
                      { brand: { contains: query, mode: 'insensitive' } },
                    ]
                  } : undefined,
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        }),

        // Brands with product counts
        prisma.product.groupBy({
          by: ['brand'],
          where: query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
            ]
          } : undefined,
          _count: {
            brand: true,
          },
          orderBy: {
            brand: 'asc',
          },
        }),

        // Price range and average rating
        prisma.product.aggregate({
          where: query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
            ]
          } : undefined,
          _min: { price: true },
          _max: { price: true },
          _avg: { rating: true },
        }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: cat._count.products,
          })),
          brands: brands.map(brand => ({
            name: brand.brand,
            count: brand._count.brand,
          })),
          priceRange: {
            min: Number(priceStats._min.price || 0),
            max: Number(priceStats._max.price || 0),
          },
          avgRating: Number(priceStats._avg.rating || 0),
        },
      }
    },
    2 * 60 * 1000 // Cache for 2 minutes
  )

  return result
}

// Search suggestions
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query || query.length < 2) return []

  const cacheKey = `suggestions_${query}_${limit}`
  
  return getOrSetCache(
    cacheKey,
    async () => {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          name: true,
          brand: true,
        },
        take: limit * 2, // Get more to filter unique suggestions
      })

      const suggestions = new Set<string>()
      
      products.forEach(product => {
        // Add product names that match
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(product.name)
        }
        // Add brands that match
        if (product.brand.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(product.brand)
        }
      })

      return Array.from(suggestions).slice(0, limit)
    },
    5 * 60 * 1000 // Cache for 5 minutes
  )
}

// Popular searches
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  const cacheKey = `popular_searches_${limit}`
  
  return getOrSetCache(
    cacheKey,
    async () => {
      // In a real app, you'd track search queries and return the most popular ones
      // For now, return some common search terms based on product data
      const brands = await prisma.product.groupBy({
        by: ['brand'],
        _count: {
          brand: true,
        },
        orderBy: {
          _count: {
            brand: 'desc',
          },
        },
        take: limit,
      })

      return brands.map(brand => brand.brand)
    },
    30 * 60 * 1000 // Cache for 30 minutes
  )
}

// Clear search cache when products are updated
export function clearSearchCache() {
  // Clear all search-related cache entries
  const keys = [
    'popular_searches',
    'suggestions',
    'search_',
  ]
  
  keys.forEach(keyPrefix => {
    // In a real implementation, you'd have a way to clear by prefix
    // For now, clear the entire cache
    cache.clear()
  })
} 