"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

export default function PlaceOrderPage() {
  const router = useRouter()
  const { items, shippingAddress, paymentMethod, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  
  // Calculate total directly
  const total = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // Rediriger si les informations nécessaires manquent
  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/checkout/place-order")
      return
    }

    if (!shippingAddress) {
      router.push("/checkout/shipping")
      return
    }
    if (!paymentMethod) {
      router.push("/checkout/payment")
      return
    }
    if (items.length === 0) {
      router.push("/cart")
      return
    }
  }, [shippingAddress, paymentMethod, items, router, status])

  const shippingPrice = total > 100 ? 0 : 10
  const taxPrice = Math.round(total * 0.2 * 100) / 100 // TVA 20%
  const totalPrice = total + shippingPrice + taxPrice

  const handlePlaceOrder = async () => {
    if (!session?.user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour passer une commande",
        variant: "destructive",
      })
      router.push("/auth/signin?callbackUrl=/checkout/place-order")
      return
    }

    setIsLoading(true)
    
    try {
      // Créer la commande
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: total,
        shippingPrice,
        taxPrice,
        totalPrice,
        userEmail: session.user.email
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création de la commande')
      }

      const order = await response.json()
      
      // Rediriger vers la page de paiement ou de confirmation
      if (paymentMethod === 'stripe') {
        // Vider le panier seulement pour Stripe car le paiement est immédiat
        clearCart()
        router.push(`/checkout/payment-stripe/${order.id}`)
      } else if (paymentMethod === 'paypal') {
        // Ne pas vider le panier maintenant, il sera vidé après le paiement PayPal réussi
        router.push(`/checkout/payment-paypal/${order.id}`)
      } else {
        clearCart()
        router.push(`/orders/${order.id}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la création de la commande',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || !shippingAddress || !paymentMethod || items.length === 0) {
    return <div>Chargement...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Finaliser la commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Adresse de livraison */}
            <Card>
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Mode de paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Mode de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="capitalize">{paymentMethod}</p>
              </CardContent>
            </Card>

            {/* Articles commandés */}
            <Card>
              <CardHeader>
                <CardTitle>Articles commandés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé de commande */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Résumé de commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{shippingPrice === 0 ? 'Gratuite' : `${shippingPrice.toFixed(2)} €`}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>{taxPrice.toFixed(2)} €</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Traitement...' : 'Passer la commande'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 