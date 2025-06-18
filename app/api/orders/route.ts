import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

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
      totalPrice,
      userEmail 
    } = body
    
    // Pour l'instant, on utilise l'email fourni ou un fallback
    // TODO: Implémenter l'authentification correcte avec NextAuth v5
    const email = userEmail || 'test@example.com'

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    // Créer d'abord l'adresse de livraison
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        street: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      }
    })

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: user.id,
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

    // Envoyer l'email de confirmation
    try {
      const emailResult = await sendOrderConfirmationEmail({
        email: user.email,
        orderId: order.id,
        total: Number(order.total)
      })
      
      if (emailResult && typeof emailResult === 'object' && 'success' in emailResult && emailResult.success === false) {
        console.log('Email service not configured, skipping email notification')
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError)
      // On ne fait pas échouer la commande si l'email ne peut pas être envoyé
      // L'email sera envoyé plus tard ou l'utilisateur sera notifié autrement
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}