import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const removeFromWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = removeFromWishlistSchema.parse(body)

    // Find user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: { products: true },
    })

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }

    // Check if product is in wishlist
    const isProductInWishlist = wishlist.products.some(p => p.id === productId)
    
    if (!isProductInWishlist) {
      return NextResponse.json(
        { error: 'Product not found in wishlist' },
        { status: 404 }
      )
    }

    // Remove product from wishlist
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
    })

    return NextResponse.json({
      message: 'Product removed from wishlist successfully',
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 