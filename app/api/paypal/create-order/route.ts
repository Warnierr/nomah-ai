import { NextRequest, NextResponse } from 'next/server'
import { paypalConfig } from '@/lib/paypal'

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
    const { orderId, items, totalPrice } = body

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken()

    // Créer la commande PayPal
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: 'EUR',
            value: totalPrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: totalPrice.toFixed(2),
              },
            },
          },
          items: items.map((item: any) => ({
            name: item.name,
            unit_amount: {
              currency_code: 'EUR',
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?success=true&payment=paypal`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/place-order`,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: 'Nomah AI',
      },
    }

    const response = await fetch(`https://api-m.${paypalConfig.environment}.paypal.com/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('PayPal order creation failed:', error)
      throw new Error('Failed to create PayPal order')
    }

    const order = await response.json()
    
    return NextResponse.json({
      id: order.id,
      status: order.status,
      links: order.links,
    })
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
} 