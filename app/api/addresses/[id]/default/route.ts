import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the address belongs to the current user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction([
      // First, unset all default addresses for this user
      prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      // Then set the specified address as default
      prisma.address.update({
        where: {
          id: params.id,
        },
        data: {
          isDefault: true,
        },
      }),
    ])

    return NextResponse.json({
      message: 'Default address updated successfully',
    })
  } catch (error) {
    console.error('Error updating default address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 