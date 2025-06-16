'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'

interface OrderStatusUpdateProps {
  order: {
    id: string
    status: string
    paymentStatus: string
  }
}

const orderStatuses = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function OrderStatusUpdate({ order }: OrderStatusUpdateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      setIsOpen(false)
      return
    }

    try {
      setIsUpdating(true)

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order status')
      }

      toast.success('Order status updated successfully')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getValidTransitions = (currentStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [], // No transitions from delivered
      'CANCELLED': [], // No transitions from cancelled
    }

    return validTransitions[currentStatus] || []
  }

  const validTransitions = getValidTransitions(order.status)
  const canUpdateStatus = validTransitions.length > 0

  if (!canUpdateStatus) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of order #{order.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Status</label>
            <p className="text-sm text-muted-foreground">{order.status}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">New Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={order.status} disabled>
                  {order.status} (Current)
                </SelectItem>
                {validTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {orderStatuses.find(s => s.value === status)?.label || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || newStatus === order.status}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 