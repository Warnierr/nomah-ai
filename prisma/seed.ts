import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nomah-ai.com' },
    update: {},
    create: {
      email: 'admin@nomah-ai.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@nomah-ai.com' },
    update: {},
    create: {
      email: 'user@nomah-ai.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  })

  // Create categories
  const categories = [
    {
      name: 'Électronique',
      slug: 'electronique',
      description: 'Smartphones, ordinateurs, accessoires tech',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    },
    {
      name: 'Mode',
      slug: 'mode',
      description: 'Vêtements, chaussures, accessoires',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
    },
    {
      name: 'Maison & Jardin',
      slug: 'maison-jardin',
      description: 'Décoration, meubles, jardinage',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    },
    {
      name: 'Sport & Loisirs',
      slug: 'sport-loisirs',
      description: 'Équipements sportifs, jeux, loisirs',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories.push(created)
  }

  // Create products
  const products = [
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Le dernier iPhone avec puce A17 Pro et appareil photo révolutionnaire',
      price: 1199.99,
      images: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      categoryId: createdCategories[0].id,
      brand: 'Apple',
      countInStock: 50,
      rating: 4.8,
      numReviews: 124,
      isFeatured: true,
    },
    {
      name: 'MacBook Air M3',
      slug: 'macbook-air-m3',
      description: 'Ordinateur portable ultra-fin avec puce M3 et autonomie exceptionnelle',
      price: 1299.99,
      images: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
      categoryId: createdCategories[0].id,
      brand: 'Apple',
      countInStock: 30,
      rating: 4.9,
      numReviews: 89,
      isFeatured: true,
    },
    {
      name: 'T-shirt Premium Coton Bio',
      slug: 't-shirt-premium-coton-bio',
      description: 'T-shirt en coton biologique, coupe moderne et confortable',
      price: 29.99,
      images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      categoryId: createdCategories[1].id,
      brand: 'EcoWear',
      countInStock: 100,
      rating: 4.5,
      numReviews: 67,
      isFeatured: false,
    },
    {
      name: 'Sneakers Running Pro',
      slug: 'sneakers-running-pro',
      description: 'Chaussures de running haute performance avec amorti révolutionnaire',
      price: 149.99,
      images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      categoryId: createdCategories[1].id,
      brand: 'SportTech',
      countInStock: 75,
      rating: 4.7,
      numReviews: 156,
      isFeatured: true,
    },
    {
      name: 'Canapé Scandinave 3 Places',
      slug: 'canape-scandinave-3-places',
      description: 'Canapé design scandinave en tissu gris, confort optimal',
      price: 899.99,
      images: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      categoryId: createdCategories[2].id,
      brand: 'Nordic Home',
      countInStock: 15,
      rating: 4.6,
      numReviews: 43,
      isFeatured: false,
    },
    {
      name: 'Vélo Électrique Urbain',
      slug: 'velo-electrique-urbain',
      description: 'Vélo électrique pour la ville, autonomie 80km, design moderne',
      price: 1599.99,
      images: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
      categoryId: createdCategories[3].id,
      brand: 'UrbanBike',
      countInStock: 25,
      rating: 4.4,
      numReviews: 78,
      isFeatured: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  // Create some reviews
  const iphone = await prisma.product.findUnique({ where: { slug: 'iphone-15-pro' } })
  const macbook = await prisma.product.findUnique({ where: { slug: 'macbook-air-m3' } })
  const velo = await prisma.product.findUnique({ where: { slug: 'velo-electrique-urbain' } })

  if (iphone && macbook && velo) {
    const reviews = [
      {
        rating: 5,
        comment: 'Excellent produit, je le recommande vivement !',
        userId: user.id,
        productId: iphone.id,
      },
      {
        rating: 4,
        comment: 'Très bon rapport qualité-prix, livraison rapide.',
        userId: user.id,
        productId: macbook.id,
      },
      {
        rating: 5,
        comment: 'Parfait pour mes sorties en ville, très confortable.',
        userId: user.id,
        productId: velo.id,
      },
    ]

    for (const review of reviews) {
      await prisma.review.create({
        data: review,
      })
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin user: admin@nomah-ai.com / admin123`)
  console.log(`👤 Test user: user@nomah-ai.com / user123`)
  console.log(`📦 Created ${categories.length} categories`)
  console.log(`🛍️ Created ${products.length} products`)
  console.log(`⭐ Created 3 reviews`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 