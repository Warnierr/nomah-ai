import { NextRequest, NextResponse } from 'next/server'
import { paypalConfig } from '@/lib/paypal'
import prisma from '@/lib/prisma'

// Fonction pour obtenir un token d'accès PayPal
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64')
  
  const response = await fetch(`https://api-m.${paypalConfig.environment}.paypal.com/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderID, orderId } = body

    // Log informatif sur la configuration PayPal
    if (paypalConfig.isDemo) {
      console.log('🧪 PayPal Demo Mode: Capturing payment with sandbox credentials')
    }

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken()

    // Capturer le paiement PayPal
    const response = await fetch(`https://api-m.${paypalConfig.environment}.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('PayPal capture failed:', error)
      throw new Error('Failed to capture PayPal payment')
    }

    const captureData = await response.json()
    
    // Vérifier le statut de la capture
    if (captureData.status === 'COMPLETED') {
      // Mettre à jour la commande dans la base de données
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'SUCCEEDED',
          paymentIntentId: captureData.id,
          status: 'PROCESSING',
        },
      })

      // Optionnel : Envoyer un email de confirmation
      // await sendOrderConfirmationEmail(updatedOrder)

      return NextResponse.json({
        success: true,
        captureData,
        order: updatedOrder,
      })
    } else {
      // Mettre à jour avec le statut d'échec
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      })

      return NextResponse.json(
        { error: 'Payment capture failed', status: captureData.status },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment' },
      { status: 500 }
    )
  }
} 