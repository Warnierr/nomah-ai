'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface PayPalButtonProps {
  orderId: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  totalPrice: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PayPalButton({ 
  orderId, 
  items, 
  totalPrice, 
  onSuccess, 
  onError 
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // PayPal Sandbox Client ID pour les tests (publique, donc sécurisé)
  const DEMO_PAYPAL_CLIENT_ID = "AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R"
  
  // Utiliser le client ID de l'environnement ou le client de demo
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && 
                         process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'VOTRE_CLIENT_ID_ICI' 
                         ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID 
                         : DEMO_PAYPAL_CLIENT_ID

  console.log('PayPal Configuration:', {
    configured: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    usingDemo: paypalClientId === DEMO_PAYPAL_CLIENT_ID,
    clientId: paypalClientId.substring(0, 10) + '...'
  })

  const initialOptions = {
    clientId: paypalClientId,
    currency: 'EUR',
    intent: 'capture',
  }

  const createOrder = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items,
          totalPrice,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create PayPal order')
      }

      const data = await response.json()
      
      // Si c'est un ordre simulé, rediriger directement
      if (data.id && data.id.startsWith('PAYPAL_MOCK_')) {
        console.log('🎯 PayPal Mock: Simulating successful payment')
        
        // Simuler un délai de paiement
        setTimeout(() => {
          onSuccess?.()
          router.push(`/orders/${orderId}?success=true&payment=paypal&mock=true`)
        }, 2000)
        
        return 'MOCK_ORDER_ID'
      }
      
      return data.id
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      const errorMessage = 'Failed to create PayPal order'
      setError(errorMessage)
      onError?.(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const onApprove = async (data: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          orderId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to capture PayPal payment')
      }

      const result = await response.json()
      
      if (result.success) {
        onSuccess?.()
        router.push(`/orders/${orderId}?success=true&payment=paypal`)
      } else {
        throw new Error(result.error || 'Payment capture failed')
      }
    } catch (error) {
      console.error('Error capturing PayPal payment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const onErrorHandler = (error: any) => {
    console.error('PayPal error:', error)
    const errorMessage = 'PayPal payment error occurred'
    setError(errorMessage)
    onError?.(errorMessage)
  }

  const onCancel = () => {
    console.log('PayPal payment cancelled')
    router.push('/checkout/place-order')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">PayPal Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paypalClientId === DEMO_PAYPAL_CLIENT_ID && (
          <Alert>
            <AlertDescription>
              🧪 Mode démo activé - Utilisez les identifiants de test PayPal pour tester le paiement
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Processing payment...</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span className="font-medium">€{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancel}
            disabled={isLoading}
          />
        </PayPalScriptProvider>
      </CardContent>
    </Card>
  )
} 