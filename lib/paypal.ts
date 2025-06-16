import { loadScript } from '@paypal/paypal-js'

// Configuration PayPal côté serveur
export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  environment: process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox',
}

// Configuration PayPal côté client
export const getPayPalOptions = () => ({
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'EUR',
  intent: 'capture',
})

// Charger le SDK PayPal côté client
export const getPayPal = async () => {
  try {
    const paypal = await loadScript(getPayPalOptions())
    return paypal
  } catch (error) {
    console.error('Failed to load PayPal SDK:', error)
    return null
  }
}

// Types PayPal
export interface PayPalOrderData {
  id: string
  status: string
  purchase_units: Array<{
    amount: {
      currency_code: string
      value: string
    }
    reference_id?: string
  }>
  payer?: {
    email_address?: string
    name?: {
      given_name?: string
      surname?: string
    }
  }
}

export interface PayPalCaptureData {
  id: string
  status: string
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string
        status: string
        amount: {
          currency_code: string
          value: string
        }
      }>
    }
  }>
} 