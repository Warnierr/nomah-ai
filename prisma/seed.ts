import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Nettoyer la base de données
  await prisma.review.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Seeding database...')

  // Créer un utilisateur de test
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: await bcrypt.hash('DevTest2024!Nomah', 12),
      role: 'USER',
    },
  })

  // Créer un administrateur de test
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash('AdminDev2024!Nomah', 12),
      role: 'ADMIN',
    },
  })

  // Créer les catégories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'T-shirts',
        slug: 't-shirts',
        description: 'T-shirts confortables et stylés',
        image: '/images/c-tshirts.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jeans',
        slug: 'jeans',
        description: 'Jeans de qualité supérieure',
        image: '/images/c-jeans.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Chaussures',
        slug: 'chaussures',
        description: 'Chaussures pour tous les styles',
        image: '/images/c-shoes.jpg',
      },
    }),
  ])

  console.log('📦 Created', categories.length, 'categories')

  // Créer les produits
  const products = await Promise.all(
    categories.map(async (category) => {
      const product = await prisma.product.create({
        data: {
          name: `${category.name} Premium`,
          slug: `${category.slug}-premium`,
          description: `${category.name} de haute qualité`,
          price: Math.floor(Math.random() * 100) + 50,
          images: JSON.stringify(['/images/p11-1.jpg', '/images/p11-2.jpg']),
          categoryId: category.id,
          brand: 'Nomah',
          countInStock: 10,
          rating: 4.5,
          numReviews: 0,
          isFeatured: true,
        },
      })

      // Ajouter un avis pour chaque produit
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Excellent produit, je recommande !',
          userId: testUser.id,
          productId: product.id,
        },
      })

      return product
    })
  )

  console.log('📦 Created', products.length, 'products')
  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user:', adminUser.email, '/', 'AdminDev2024!Nomah')
  console.log('👤 Test user:', testUser.email, '/', 'DevTest2024!Nomah')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 