import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleImages = [
  [
    '/images/p11-1.jpg',
    '/images/p11-2.jpg'
  ],
  [
    '/images/p12-1.jpg',
    '/images/p12-2.jpg'
  ],
  [
    '/images/p21-1.jpg',
    '/images/p21-2.jpg'
  ],
  [
    '/images/p22-1.jpg',
    '/images/p22-2.jpg'
  ],
  [
    '/images/p31-1.jpg',
    '/images/p31-2.jpg'
  ],
  [
    '/images/p32-1.jpg',
    '/images/p32-2.jpg'
  ]
]

async function updateProductImages() {
  try {
    const products = await prisma.product.findMany()
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const images = sampleImages[i % sampleImages.length]
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify(images)
        }
      })
      
      console.log(`Images mises à jour pour ${product.name}`)
    }
    
    console.log('Toutes les images ont été mises à jour avec succès !')
  } catch (error) {
    console.error('Erreur lors de la mise à jour des images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductImages() 