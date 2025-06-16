import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Sales data for the last N days
    const salesData = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Format sales data for charts
    const formattedSalesData = salesData.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      sales: Number(item._sum.total || 0),
      orders: item._count.id,
    }))

    // Monthly revenue for the last 12 months
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        SUM("total")::float as revenue,
        COUNT(*)::int as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        AND "status" != 'CANCELLED'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    ` as Array<{ month: string; revenue: number; orders: number }>

    // Category distribution
    const categoryData = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: {
                orderItems: {
                  some: {
                    order: {
                      status: {
                        not: 'CANCELLED',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const formattedCategoryData = categoryData.map((category, index) => ({
      name: category.name,
      value: category._count.products,
      color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5],
    }))

    // Top products
    const topProducts = await prisma.product.findMany({
      include: {
        orderItems: {
          where: {
            order: {
              status: {
                not: 'CANCELLED',
              },
            },
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    const formattedTopProducts = topProducts.map((product) => ({
      name: product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
      sales: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      revenue: product.orderItems.reduce((sum, item) => sum + (item.quantity * Number(item.price)), 0),
    }))

    // Additional analytics
    const totalRevenue = await prisma.order.aggregate({
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
    })

    const totalOrders = await prisma.order.count({
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
    })

    const averageOrderValue = totalRevenue._sum.total && totalOrders > 0 
      ? Number(totalRevenue._sum.total) / totalOrders 
      : 0

    // Growth metrics (comparing with previous period)
    const previousPeriodStart = new Date()
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2))
    previousPeriodStart.setDate(previousPeriodStart.getDate() + days)

    const currentPeriodRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
    })

    const previousPeriodRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
    })

    const revenueGrowth = previousPeriodRevenue._sum.total && Number(previousPeriodRevenue._sum.total) > 0
      ? ((Number(currentPeriodRevenue._sum.total || 0) - Number(previousPeriodRevenue._sum.total)) / Number(previousPeriodRevenue._sum.total)) * 100
      : 0

    return NextResponse.json({
      salesData: formattedSalesData,
      categoryData: formattedCategoryData,
      monthlyRevenue,
      topProducts: formattedTopProducts,
      summary: {
        totalRevenue: Number(totalRevenue._sum.total || 0),
        totalOrders,
        averageOrderValue,
        revenueGrowth,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
} 