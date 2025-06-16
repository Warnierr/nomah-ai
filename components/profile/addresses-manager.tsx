'use client'

import { useState } from 'react'
import { Address } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
import { AddressDialog } from './address-dialog'

interface AddressesManagerProps {
  addresses: Address[]
}

export function AddressesManager({ addresses: initialAddresses }: AddressesManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleAddAddress = () => {
    setEditingAddress(null)
    setIsDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      setAddresses(addresses.filter(addr => addr.id !== addressId))
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive',
      })
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to set default address')
      }

      // Update addresses state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })))

      toast({
        title: 'Success',
        description: 'Default address updated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default address',
        variant: 'destructive',
      })
    }
  }

  const handleAddressUpdated = (updatedAddress: Address) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === updatedAddress.id ? updatedAddress : addr
      ))
    } else {
      // Add new address
      setAddresses([...addresses, updatedAddress])
    }
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-10">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No addresses</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first address.
        </p>
        <div className="mt-6">
          <Button onClick={handleAddAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
        <AddressDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAddressUpdated={handleAddressUpdated}
          address={editingAddress}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <Button onClick={handleAddAddress}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Address {address.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{address.street}</p>
                <p>
                  {address.city}
                  {address.state && `, ${address.state}`} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AddressDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingAddress(null)
        }}
        onAddressUpdated={handleAddressUpdated}
        address={editingAddress}
      />
    </div>
  )
} 