import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Truck } from "lucide-react"
import Image from "next/image"

interface PageProps {
  params: {
    orderId: string
  }
  searchParams: {
    success?: string
  }
}

// Simulation d'une commande - dans un vrai projet, on récupérerait depuis la DB
const getOrder = async (orderId: string) => {
  // Simulation d'une commande
  return {
    id: orderId,
    status: 'PENDING',
    total: 299.99,
    createdAt: new Date(),
    items: [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        price: 299.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    }
  }
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const order = await getOrder(params.orderId)
  
  if (!order) {
    notFound()
  }

  const isSuccess = searchParams.success === 'true'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête de confirmation */}
        {isSuccess && (
          <div className="mb-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Paiement réussi !
            </h1>
            <p className="text-gray-600">
              Votre commande a été confirmée et sera traitée sous peu.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Commande #{order.id}</span>
                  <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                    {order.status === 'PENDING' ? 'En attente' : order.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>Commandé le {order.createdAt.toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="h-4 w-4" />
                    <span>Livraison estimée: 3-5 jours ouvrés</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Articles commandés */}
            <Card>
              <CardHeader>
                <CardTitle>Articles commandés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
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

            {/* Adresse de livraison */}
            <Card>
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
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
                  <span>{order.total.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>{(order.total * 0.2).toFixed(2)} €</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{(order.total * 1.2).toFixed(2)} €</span>
                </div>

                {isSuccess && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Paiement confirmé
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Vous recevrez un email de confirmation sous peu.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 