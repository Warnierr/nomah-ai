import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { WishlistManager } from '@/components/wishlist/wishlist-manager'

export default async function WishlistPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch user's wishlist with products
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            Items you've saved for later
          </p>
        </div>
        <WishlistManager 
          wishlist={wishlist} 
          products={wishlist?.products || []} 
        />
      </div>
    </div>
  )
} 