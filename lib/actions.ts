'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sendOrderConfirmationEmail } from '@/lib/email'

// ============================================================================
// AUTHENTICATION ACTIONS
// ============================================================================

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function signUpAction(formData: FormData) {
  try {
    const validatedFields = signUpSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!validatedFields.success) {
      return {
        error: 'Champs invalides',
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validatedFields.data

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'Un compte existe déjà avec cette adresse email' }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { success: true, message: 'Compte créé avec succès' }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return { error: 'Une erreur est survenue. Veuillez réessayer.' }
  }
}

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  countInStock: z.coerce.number().min(0, 'Stock must be positive'),
  rating: z.coerce.number().min(0).max(5).default(0),
  numReviews: z.coerce.number().min(0).default(0),
  isFeatured: z.boolean().default(false),
  images: z.string().min(1, 'At least one image is required'),
})

export async function createProductAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    const validatedFields = productSchema.safeParse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      price: formData.get('price'),
      brand: formData.get('brand'),
      categoryId: formData.get('categoryId'),
      countInStock: formData.get('countInStock'),
      rating: formData.get('rating') || 0,
      numReviews: formData.get('numReviews') || 0,
      isFeatured: formData.get('isFeatured') === 'true',
      images: formData.get('images') as string,
    })

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields',
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    })

    if (existingProduct) {
      return { error: 'Product with this slug already exists' }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        brand: data.brand,
        categoryId: data.categoryId,
        countInStock: data.countInStock,
        rating: data.rating,
        numReviews: data.numReviews,
        isFeatured: data.isFeatured,
        images: data.images,
      },
      include: {
        category: true,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')

    return { success: true, product }
  } catch (error) {
    console.error('Create product error:', error)
    return { error: 'Failed to create product' }
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    const validatedFields = productSchema.safeParse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      price: formData.get('price'),
      brand: formData.get('brand'),
      categoryId: formData.get('categoryId'),
      countInStock: formData.get('countInStock'),
      rating: formData.get('rating') || 0,
      numReviews: formData.get('numReviews') || 0,
      isFeatured: formData.get('isFeatured') === 'true',
      images: formData.get('images') as string,
    })

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields',
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return { error: 'Product not found' }
    }

    // Check if slug is taken by another product
    const slugExists = await prisma.product.findFirst({
      where: { 
        slug: data.slug,
        id: { not: id }
      },
    })

    if (slugExists) {
      return { error: 'Product with this slug already exists' }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        brand: data.brand,
        categoryId: data.categoryId,
        countInStock: data.countInStock,
        rating: data.rating,
        numReviews: data.numReviews,
        isFeatured: data.isFeatured,
        images: data.images,
      },
      include: {
        category: true,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${product.slug}`)
    revalidatePath('/')

    return { success: true, product }
  } catch (error) {
    console.error('Update product error:', error)
    return { error: 'Failed to update product' }
  }
}

export async function deleteProductAction(id: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return { error: 'Product not found' }
    }

    await prisma.product.delete({
      where: { id },
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')

    return { success: true, message: 'Product deleted successfully' }
  } catch (error) {
    console.error('Delete product error:', error)
    return { error: 'Failed to delete product' }
  }
}

// ============================================================================
// ORDER ACTIONS
// ============================================================================

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.enum(['stripe', 'paypal']),
})

export async function createOrderAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user?.email) {
      return { error: 'Please sign in to place an order' }
    }

    const itemsData = JSON.parse(formData.get('items') as string)
    const shippingData = JSON.parse(formData.get('shippingAddress') as string)
    
    const validatedFields = orderSchema.safeParse({
      items: itemsData,
      shippingAddress: shippingData,
      paymentMethod: formData.get('paymentMethod'),
    })

    if (!validatedFields.success) {
      return {
        error: 'Invalid order data',
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { items, shippingAddress, paymentMethod } = validatedFields.data

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Create shipping address first
    const address = await prisma.address.create({
      data: {
        userId: session.user.id!,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id!,
        shippingAddressId: address.id,
        total,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    })

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        orderId: order.id,
        customerName: session.user.name || 'Customer',
        customerEmail: session.user.email,
        items: order.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0] || '',
        })),
        total: Number(order.total),
        shippingAddress: {
          fullName: session.user.name || 'Customer',
          address: order.shippingAddress.street,
          city: order.shippingAddress.city,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
        orderDate: order.createdAt.toISOString(),
      })
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    revalidatePath('/orders')
    revalidatePath('/admin/orders')

    return { success: true, order }
  } catch (error) {
    console.error('Create order error:', error)
    return { error: 'Failed to create order' }
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return { error: 'Invalid status' }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    })

    revalidatePath('/admin/orders')
    revalidatePath('/orders')

    return { success: true, order }
  } catch (error) {
    console.error('Update order status error:', error)
    return { error: 'Failed to update order status' }
  }
}

// ============================================================================
// REVIEW ACTIONS
// ============================================================================

const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.coerce.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(1, 'Comment is required'),
})

export async function createReviewAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user?.email) {
      return { error: 'Please sign in to leave a review' }
    }

    const validatedFields = reviewSchema.safeParse({
      productId: formData.get('productId'),
      rating: formData.get('rating'),
      comment: formData.get('comment'),
    })

    if (!validatedFields.success) {
      return {
        error: 'Invalid review data',
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { productId, rating, comment } = validatedFields.data

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.user.id!,
      },
    })

    if (existingReview) {
      return { error: 'You have already reviewed this product' }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id!,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: reviews.length,
      },
    })

    revalidatePath(`/products/${productId}`)
    revalidatePath('/products')

    return { success: true, review }
  } catch (error) {
    console.error('Create review error:', error)
    return { error: 'Failed to create review' }
  }
}

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

export async function updateProfileAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user?.email) {
      return { error: 'Unauthorized' }
    }

    const validatedFields = profileSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
    })

    if (!validatedFields.success) {
      return {
        error: 'Invalid profile data',
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, currentPassword, newPassword } = validatedFields.data

    // Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return { error: 'User not found' }
    }

    // Check if email is already taken
    if (email !== currentUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return { error: 'Email already in use' }
      }
    }

    // Prepare update data
    const updateData: any = { name, email }

    // Handle password update
    if (newPassword && currentPassword) {
      if (!currentUser.password) {
        return { error: 'Cannot update password for OAuth accounts' }
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isCurrentPasswordValid) {
        return { error: 'Current password is incorrect' }
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    revalidatePath('/profile')

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile' }
  }
} 