'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const refundSchema = z.object({
  amount: z.number().min(0.01, 'Refund amount must be positive').optional(),
  reason: z.string().min(1, 'Refund reason is required'),
})

type RefundFormData = z.infer<typeof refundSchema>

interface RefundDialogProps {
  order: {
    id: string
    total: any // Accept Decimal type from Prisma
    status: string
    paymentStatus: string
  }
}

export function RefundDialog({ order }: RefundDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: Number(order.total),
      reason: '',
    },
  })

  const watchedAmount = watch('amount')
  const orderTotal = Number(order.total)

  const onSubmit = async (data: RefundFormData) => {
    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount || orderTotal,
          reason: data.reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process refund')
      }

      const result = await response.json()
      toast.success('Refund processed successfully')
      setIsOpen(false)
      reset()
      router.refresh()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process refund')
    } finally {
      setIsProcessing(false)
    }
  }

  const setFullRefund = () => {
    setValue('amount', orderTotal)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
          <RotateCcw className="h-4 w-4 mr-2" />
          Process Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Process a refund for order #{order.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="amount">Refund Amount (€)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={setFullRefund}
                className="text-xs"
              >
                Full Refund
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={orderTotal}
              {...register('amount', { 
                valueAsNumber: true,
                validate: (value) => {
                  if (value && value > orderTotal) {
                    return 'Refund amount cannot exceed order total'
                  }
                  return true
                }
              })}
              placeholder={`Max: €${orderTotal.toFixed(2)}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Order Total: €{orderTotal.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Refund Reason</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Please provide a reason for the refund..."
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. The refund will be processed 
              immediately and the order status will be updated to cancelled.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                reset()
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? 'Processing...' : `Refund €${(watchedAmount || orderTotal).toFixed(2)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 