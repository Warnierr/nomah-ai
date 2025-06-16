import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { AddressesManager } from '@/components/profile/addresses-manager'

export default async function AddressesPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch user addresses
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
  })

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <AddressesManager addresses={addresses} />
      </div>
    </div>
  )
} 