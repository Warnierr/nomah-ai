import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  RotateCcw,
  Edit
} from 'lucide-react'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { OrderStatusUpdate } from '@/components/admin/order-status-update'
import { RefundDialog } from '@/components/admin/refund-dialog'
import { notFound } from 'next/navigation'

async function getOrderDetails(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
                slug: true,
              }
            }
          }
        },
        shippingAddress: true,
      },
    })

    return order
  } catch (error) {
    console.error('Error fetching order details:', error)
    return null
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Pending</Badge>
    case 'PROCESSING':
      return <Badge variant="secondary">Processing</Badge>
    case 'SHIPPED':
      return <Badge className="bg-blue-500">Shipped</Badge>
    case 'DELIVERED':
      return <Badge className="bg-green-500">Delivered</Badge>
    case 'CANCELLED':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="outline">Pending</Badge>
    case 'PROCESSING':
      return <Badge variant="secondary">Processing</Badge>
    case 'SUCCEEDED':
      return <Badge className="bg-green-500">Paid</Badge>
    case 'FAILED':
      return <Badge variant="destructive">Failed</Badge>
    case 'REFUNDED':
      return <Badge className="bg-purple-500">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const order = await getOrderDetails(params.id)

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-muted-foreground">
            Order placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <OrderStatusUpdate order={order} />
          {order.paymentStatus === 'SUCCEEDED' && order.status !== 'CANCELLED' && (
            <RefundDialog order={order} />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Order Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getStatusBadge(order.status)}
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(order.updatedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Payment Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getPaymentStatusBadge(order.paymentStatus)}
            <p className="text-sm text-muted-foreground mt-2">
              Total: €{Number(order.total).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Order Date */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Order Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{order.user?.name}</p>
              <p className="text-sm text-muted-foreground">{order.user?.email}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h4>
              <div className="text-sm space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name || 'Product'}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {item.product?.name || 'Product not found'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      €{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>€{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span>{getPaymentStatusBadge(order.paymentStatus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">€{Number(order.total).toFixed(2)}</span>
                </div>
                {order.paymentIntentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-xs">{order.paymentIntentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 