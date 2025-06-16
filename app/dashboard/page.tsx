import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, User, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Simulation des données utilisateur et commandes
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  totalOrders: 3,
  totalSpent: 1247.97
}

const recentOrders = [
  {
    id: "order-1",
    date: "2024-01-15",
    status: "DELIVERED",
    total: 299.99,
    items: [
      {
        name: "iPhone 15 Pro",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        quantity: 1
      }
    ]
  },
  {
    id: "order-2", 
    date: "2024-01-10",
    status: "SHIPPED",
    total: 599.99,
    items: [
      {
        name: "MacBook Air M2",
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
        quantity: 1
      }
    ]
  },
  {
    id: "order-3",
    date: "2024-01-05", 
    status: "PROCESSING",
    total: 347.99,
    items: [
      {
        name: "Vélo de route Carbon",
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
        quantity: 1
      }
    ]
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="default" className="bg-green-500">Livré</Badge>
    case "SHIPPED":
      return <Badge variant="default" className="bg-blue-500">Expédié</Badge>
    case "PROCESSING":
      return <Badge variant="secondary">En traitement</Badge>
    case "PENDING":
      return <Badge variant="outline">En attente</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mon Dashboard</h1>

        {/* Statistiques utilisateur */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Profil</p>
                  <p className="font-semibold">{userData.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Commandes</p>
                  <p className="font-semibold">{userData.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Total dépensé</p>
                  <p className="font-semibold">{userData.totalSpent.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Adresses</p>
                  <p className="font-semibold">2 enregistrées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commandes récentes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Commande #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="font-semibold mt-1">{order.total.toFixed(2)} €</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="relative w-12 h-12">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-600">Qté: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            Voir les détails
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/products">
                    <Package className="h-4 w-4 mr-2" />
                    Parcourir les produits
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4 mr-2" />
                    Modifier le profil
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/addresses">
                    <MapPin className="h-4 w-4 mr-2" />
                    Gérer les adresses
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/orders">
                    <Package className="h-4 w-4 mr-2" />
                    Toutes les commandes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 