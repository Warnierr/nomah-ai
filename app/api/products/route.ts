import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortParam = searchParams.get('sort')
    const featuredParam = searchParams.get('featured')
    
    // Validate and set defaults
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '10', 10) || 10))
    const featured = featuredParam === 'true' ? true : featuredParam === 'false' ? false : undefined
    
    // Sort validation
    const validFields = ['name', 'price', 'createdAt', 'rating']
    const [sortField = 'createdAt', sortDir = 'desc'] = (sortParam || '').split(':')
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc'
    const sortBy = validFields.includes(sortField) ? sortField : 'createdAt'
    
    // Build where clause
    const where: any = {}
    
    if (category) {
      where.category = { slug: category }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (featured !== undefined) {
      where.isFeatured = featured
    }
    
    const skip = (page - 1) * limit
    const orderBy: any = {}
    orderBy[sortBy] = sortDirection
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])
    
    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 