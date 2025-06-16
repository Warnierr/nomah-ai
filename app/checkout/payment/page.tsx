"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentPage() {
  const router = useRouter()
  const { paymentMethod, setPaymentMethod, shippingAddress } = useCart()
  
  const [selectedMethod, setSelectedMethod] = useState(paymentMethod || "stripe")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier que l'adresse de livraison est définie
    if (!shippingAddress) {
      router.push("/checkout/shipping")
      return
    }

    // Sauvegarder le mode de paiement
    setPaymentMethod(selectedMethod)
    
    // Rediriger vers la page de finalisation de commande
    router.push("/checkout/place-order")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mode de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <RadioGroup
                value={selectedMethod}
                onValueChange={setSelectedMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex items-center space-x-2">
                    <span>Carte bancaire (Stripe)</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center space-x-2">
                    <span>PayPal</span>
                  </Label>
                </div>
              </RadioGroup>

              <Button type="submit" className="w-full">
                Continuer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 