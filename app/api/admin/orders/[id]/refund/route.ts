import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const refundSchema = z.object({
  amount: z.number().optional(), // If not provided, refund full amount
  reason: z.string().min(1, 'Refund reason is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { amount, reason } = refundSchema.parse(body)

    // Check if order exists and can be refunded
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order can be refunded
    if (order.paymentStatus === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Order has already been refunded' },
        { status: 400 }
      )
    }

    if (order.paymentStatus !== 'SUCCEEDED') {
      return NextResponse.json(
        { error: 'Order payment was not successful, cannot refund' },
        { status: 400 }
      )
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot refund a cancelled order' },
        { status: 400 }
      )
    }

    const refundAmount = amount || Number(order.total)

    // Validate refund amount
    if (refundAmount > Number(order.total)) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed order total' },
        { status: 400 }
      )
    }

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be positive' },
        { status: 400 }
      )
    }

    // Process refund with Stripe (simplified version)
    let stripeRefundId = null
    if (order.paymentIntentId) {
      try {
        // In a real implementation, you would call Stripe API here
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        // const refund = await stripe.refunds.create({
        //   payment_intent: order.paymentIntentId,
        //   amount: Math.round(refundAmount * 100), // Convert to cents
        //   reason: 'requested_by_customer',
        // })
        // stripeRefundId = refund.id
        
        // For demo purposes, we'll simulate a successful refund
        stripeRefundId = `re_demo_${Date.now()}`
        console.log(`Simulated Stripe refund for order ${id}: ${stripeRefundId}`)
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to process refund with payment provider' },
          { status: 500 }
        )
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })

    // Log the refund (in a real app, you might want to create a separate refunds table)
    console.log(`Refund processed for order ${id}:`, {
      orderId: id,
      amount: refundAmount,
      reason,
      stripeRefundId,
      processedBy: session.user.id,
      processedAt: new Date().toISOString(),
    })

    // Send refund confirmation email (you can implement this later)
    // TODO: Send email notification to customer about refund

    return NextResponse.json({
      message: 'Refund processed successfully',
      order: updatedOrder,
      refund: {
        amount: refundAmount,
        reason,
        stripeRefundId,
        processedAt: new Date(),
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 