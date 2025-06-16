import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { type, email, ...data } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'test':
        result = await sendTestEmail(email)
        break
      
      case 'order-confirmation':
        // Données de test pour la confirmation de commande
        const orderData = {
          orderId: data.orderId || 'TEST-001',
          customerName: data.customerName || 'John Doe',
          customerEmail: email,
          items: data.items || [
            {
              id: '1',
              name: 'iPhone 15 Pro',
              price: 1199.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'
            }
          ],
          total: data.total || 1199.99,
          shippingAddress: data.shippingAddress || {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'Paris',
            postalCode: '75001',
            country: 'France'
          },
          orderDate: data.orderDate || new Date().toISOString()
        }
        
        result = await sendOrderConfirmationEmail(orderData)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      result
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 