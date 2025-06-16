import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      itemsPrice, 
      shippingPrice, 
      taxPrice, 
      totalPrice 
    } = body

    // Pour l'instant, créons une commande simple sans authentification
    // Dans un vrai projet, on récupérerait l'utilisateur depuis la session
    
    // Créer d'abord l'adresse de livraison
    const address = await prisma.address.create({
      data: {
        userId: 'temp-user', // À remplacer par l'ID utilisateur réel
        street: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      }
    })

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: 'temp-user', // À remplacer par l'ID utilisateur réel
        total: totalPrice,
        shippingAddressId: address.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
} 