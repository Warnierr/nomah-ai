"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { PayPalButton } from "@/components/payment/paypal-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: {
    orderId: string
  }
}

export default function PayPalPaymentPage({ params }: PageProps) {
  const router = useRouter()
  const { items, shippingAddress, total, clearCart } = useCart()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Vérifier que nous avons toutes les données nécessaires
    if (items.length > 0 && shippingAddress && total > 0) {
      setIsReady(true)
    } else {
      // Rediriger vers le panier si les données manquent
      router.push('/cart')
    }
  }, [items, shippingAddress, total, router])

  const handleSuccess = () => {
    // Vider le panier après un paiement réussi
    clearCart()
  }

  const handleError = (error: string) => {
    console.error('PayPal payment error:', error)
    // Optionnel : Afficher une notification d'erreur
  }

  const handleGoBack = () => {
    router.push('/checkout/place-order')
  }

  if (!isReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p>Loading payment information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">PayPal Payment</h1>
            <p className="text-muted-foreground">
              Complete your payment securely with PayPal
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {shippingAddress && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PayPal Payment */}
        <PayPalButton
          orderId={params.orderId}
          items={items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))}
          totalPrice={total}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Security Notice */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>🔒 Your payment is secured by PayPal</p>
              <p>You will be redirected to PayPal to complete your payment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 