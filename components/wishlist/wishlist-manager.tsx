'use client'

import { useState } from 'react'
import { ProductWithCategory } from '@/types/product'
import { Wishlist } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ExtendedWishlist extends Wishlist {
  products: ProductWithCategory[]
}

interface WishlistManagerProps {
  wishlist: ExtendedWishlist | null
  products: ProductWithCategory[]
}

export function WishlistManager({ wishlist, products: initialProducts }: WishlistManagerProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts)
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)

  const handleRemoveFromWishlist = async (productId: string) => {
    setLoadingProductId(productId)
    
    try {
      const response = await fetch(`/api/wishlist/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }

      setProducts(products.filter(product => product.id !== productId))
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive',
      })
    } finally {
      setLoadingProductId(null)
    }
  }

  const handleAddToCart = async (productId: string) => {
    setLoadingProductId(productId)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    } finally {
      setLoadingProductId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Your wishlist is empty</h3>
        <p className="mt-2 text-sm text-gray-500">
          Save items you're interested in to buy them later.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const images = JSON.parse(product.images) as string[];
          const mainImage = images[0] || '/placeholder-product.jpg';
          
          return (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleRemoveFromWishlist(product.id)}
                disabled={loadingProductId === product.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2">
                <Link href={`/products/${product.slug}`} className="hover:underline">
                  {product.name}
                </Link>
              </CardTitle>
              <CardDescription>
                {product.category?.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold">
                  ${product.price.toFixed(2)}
                </div>
                <div className="flex items-center space-x-1 text-sm text-yellow-600">
                  <span>⭐</span>
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({product.numReviews})</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={loadingProductId === product.id || product.countInStock === 0}
                >
                  {loadingProductId === product.id ? (
                    <>
                      <Package className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : product.countInStock === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href={`/products/${product.slug}`}>
                    View Details
                  </Link>
                </Button>
              </div>
              
              {product.countInStock <= 5 && product.countInStock > 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  Only {product.countInStock} left in stock
                </p>
              )}
            </CardContent>
          </Card>
        )
        })}
      </div>
    </div>
  )
} 