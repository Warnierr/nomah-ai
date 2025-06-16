import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// Cache system
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key)
    return null
  }
  
  return cached.data as T
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  })
}

// Performance middleware
export function withPerformanceTracking(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]) => {
    const start = performance.now()
    
    try {
      const response = await handler(req, ...args)
      const duration = performance.now() - start
      
      // Log slow requests (>500ms)
      if (duration > 500) {
        console.warn(`Slow API request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`)
      }
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
      
      return response
    } catch (error) {
      const duration = performance.now() - start
      console.error(`API Error: ${req.method} ${req.url} failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }
}

// Authentication middleware
export async function withAuth(req: NextRequest, adminOnly = false) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (adminOnly && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  
  return { session, user: session.user }
}

// Optimized database queries
export class OptimizedQueries {
  // Optimized product search with indices
  static async searchProducts(filters: {
    query?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    brand?: string
    inStock?: boolean
    featured?: boolean
    rating?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  } = {}) {
    const {
      query,
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
      limit = 12
    } = filters

    const where: any = {}
    
    // Full-text search optimization
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
      ]
    }
    
    // Filter optimizations
    if (categoryId) where.categoryId = categoryId
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }
    if (brand) where.brand = { contains: brand, mode: 'insensitive' }
    if (inStock) where.countInStock = { gt: 0 }
    if (featured !== undefined) where.isFeatured = featured
    if (rating !== undefined) where.rating = { gte: rating }

    // Use Promise.all for parallel queries
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      }
    }
  }

  // Optimized analytics with aggregations
  static async getAnalytics(days: number = 30) {
    const cacheKey = `analytics:${days}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Use Promise.all for parallel analytics queries
    const [
      totalRevenue,
      totalOrders,
      recentOrders,
      topProducts,
      categoryStats,
      dailyStats
    ] = await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true },
        _count: { id: true }
      }),

      // Total orders count
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      }),

      // Recent orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          }
        },
        _sum: { quantity: true, price: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
      }),

      // Category performance
      prisma.category.findMany({
        include: {
          products: {
            include: {
              orderItems: {
                where: {
                  order: {
                    createdAt: { gte: startDate },
                    status: { not: 'CANCELLED' }
                  }
                }
              }
            }
          }
        }
      }),

      // Daily statistics
      prisma.$queryRaw<Array<{
        date: string
        revenue: number
        orders: number
      }>>`
        SELECT 
          DATE("createdAt") as date,
          SUM("total") as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE "createdAt" >= ${startDate}
          AND "status" != 'CANCELLED'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `
    ])

    const analytics = {
      summary: {
        totalRevenue: Number(totalRevenue._sum.total || 0),
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Number(totalRevenue._sum.total || 0) / totalOrders : 0,
      },
      recentOrders,
      topProducts,
      categoryStats: categoryStats.map(cat => ({
        name: cat.name,
        revenue: cat.products.reduce((sum, prod) => 
          sum + prod.orderItems.reduce((itemSum, item) => 
            itemSum + (item.quantity * Number(item.price)), 0
          ), 0
        ),
        orders: cat.products.reduce((sum, prod) => sum + prod.orderItems.length, 0)
      })),
      dailyStats: dailyStats.map(stat => ({
        date: stat.date,
        revenue: Number(stat.revenue),
        orders: Number(stat.orders)
      }))
    }

    // Cache for 10 minutes
    setCachedData(cacheKey, analytics, 10 * 60 * 1000)
    return analytics
  }

  // Optimized user orders with pagination
  static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const cacheKey = `user-orders:${userId}:${page}:${limit}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          shippingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ])

    const result = {
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    }

    // Cache for 5 minutes
    setCachedData(cacheKey, result, 5 * 60 * 1000)
    return result
  }

  // Optimized product details with related products
  static async getProductDetails(slug: string) {
    const cacheKey = `product:${slug}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const [product, relatedProducts] = await Promise.all([
      prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: { name: true, image: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      }),
      // Get related products in the same category
      prisma.product.findMany({
        where: {
          category: {
            products: {
              some: { slug }
            }
          },
          slug: { not: slug }
        },
        include: {
          category: {
            select: { name: true, slug: true }
          }
        },
        take: 8,
        orderBy: { rating: 'desc' }
      })
    ])

    if (!product) return null

    const result = {
      product,
      relatedProducts
    }

    // Cache for 15 minutes
    setCachedData(cacheKey, result, 15 * 60 * 1000)
    return result
  }
}

// Request validation helpers
export function validatePagination(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  
  return { page, limit }
}

export function validateSortOrder(sortBy?: string, sortOrder?: string) {
  const allowedSortFields = ['createdAt', 'name', 'price', 'rating', 'countInStock']
  const allowedSortOrders = ['asc', 'desc']
  
  return {
    sortBy: allowedSortFields.includes(sortBy || '') ? sortBy : 'createdAt',
    sortOrder: allowedSortOrders.includes(sortOrder || '') ? sortOrder as 'asc' | 'desc' : 'desc'
  }
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean up old entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (data.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(identifier)
  
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  current.count++
  return { allowed: true, remaining: maxRequests - current.count }
}

// Error handling
export function handleApiError(error: any, context: string) {
  console.error(`API Error in ${context}:`, error)
  
  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: 'Duplicate entry', field: error.meta?.target },
      { status: 409 }
    )
  }
  
  if (error.code === 'P2025') {
    return NextResponse.json(
      { error: 'Record not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
} 