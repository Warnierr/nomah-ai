"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: {
    orderId: string
  }
}

export default function StripePaymentPage({ params }: PageProps) {
  const router = useRouter()
  const { items, shippingAddress } = useCart()
  
  // Calculate total directly
  const total = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Créer la session de paiement Stripe
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: params.orderId,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalPrice: total,
          shippingAddress
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement')
      }

      const { url } = await response.json()
      
      // Rediriger vers Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL de paiement non reçue')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de l\'initialisation du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-démarrer le processus de paiement
  useEffect(() => {
    if (items.length > 0 && shippingAddress) {
      handlePayment()
    } else {
      router.push('/cart')
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Paiement en cours</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isLoading && (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p>Redirection vers le paiement sécurisé...</p>
              </>
            )}
            
            {error && (
              <>
                <p className="text-red-600">{error}</p>
                <Button onClick={handlePayment} disabled={isLoading}>
                  Réessayer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/checkout/place-order')}
                >
                  Retour
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 