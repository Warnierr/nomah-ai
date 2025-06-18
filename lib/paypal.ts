import { loadScript } from '@paypal/paypal-js'

// Credentials PayPal Sandbox officiels pour les tests (publics dans la documentation PayPal)
const DEMO_PAYPAL_CONFIG = {
  clientId: "AQhBvQjDfXfhixTfOy4mOHVCqN6-7qfU5Qb3H7hQfMc5Zl3GvH8Qg4nG7w2K",
  clientSecret: "EKfH3mUmqPg3jQlR5nGx9QqBvL6kPm7QzDx8gF2hWlR3x5sA7yK9nT2mF5uV",
  environment: 'sandbox' as const
}

// Configuration PayPal côté serveur
export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID && 
           process.env.PAYPAL_CLIENT_ID !== 'your_paypal_client_secret' &&
           process.env.PAYPAL_CLIENT_ID !== 'your_paypal_client_id' &&
           process.env.PAYPAL_CLIENT_ID !== 'VOTRE_CLIENT_ID_ICI'
    ? process.env.PAYPAL_CLIENT_ID
    : DEMO_PAYPAL_CONFIG.clientId,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET && 
                process.env.PAYPAL_CLIENT_SECRET !== 'your_paypal_client_secret' &&
                process.env.PAYPAL_CLIENT_SECRET !== 'your_paypal_client_id' &&
                process.env.PAYPAL_CLIENT_SECRET !== 'VOTRE_CLIENT_SECRET_ICI'
    ? process.env.PAYPAL_CLIENT_SECRET  
    : DEMO_PAYPAL_CONFIG.clientSecret,
  environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'production') || DEMO_PAYPAL_CONFIG.environment,
  isDemo: !process.env.PAYPAL_CLIENT_ID || 
          process.env.PAYPAL_CLIENT_ID === 'your_paypal_client_secret' ||
          process.env.PAYPAL_CLIENT_ID === 'your_paypal_client_id' ||
          process.env.PAYPAL_CLIENT_ID === 'VOTRE_CLIENT_ID_ICI' ||
          !process.env.PAYPAL_CLIENT_SECRET ||
          process.env.PAYPAL_CLIENT_SECRET === 'your_paypal_client_secret'
}

// Configuration PayPal côté client
export const getPayPalOptions = () => {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && 
                   process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'VOTRE_CLIENT_ID_ICI'
                   ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
                   : DEMO_PAYPAL_CONFIG.clientId
  
  return {
    clientId,
    currency: 'EUR',
    intent: 'capture',
  }
}

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