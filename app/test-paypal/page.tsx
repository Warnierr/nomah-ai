"use client"

import { PayPalButton } from '@/components/payment/paypal-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function TestPayPalPage() {
  const [testOrderId] = useState('test-order-' + Date.now())
  
  const testItems = [
    {
      id: '1',
      name: 'Test Product',
      price: 29.99,
      quantity: 1,
    },
    {
      id: '2', 
      name: 'Another Test Product',
      price: 19.99,
      quantity: 2,
    }
  ]

  const totalPrice = testItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSuccess = () => {
    alert('PayPal payment successful!')
  }

  const handleError = (error: string) => {
    alert(`PayPal payment error: ${error}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test PayPal Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Test Order Details</h3>
                <p className="text-sm text-muted-foreground">Order ID: {testOrderId}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {testItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <PayPalButton
          orderId={testOrderId}
          items={testItems}
          totalPrice={totalPrice}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>🧪 This is a test page for PayPal integration</p>
              <p>Use PayPal sandbox credentials to test payments</p>
              <p>
                <strong>Test Account:</strong><br />
                Email: sb-buyer@personal.example.com<br />
                Password: password123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 