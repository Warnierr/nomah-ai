import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePrices() {
  try {
    // Récupérer tous les produits
    const products = await prisma.product.findMany()
    
    // Mettre à jour chaque produit avec un nouveau prix aléatoire entre 1 et 5 euros
    for (const product of products) {
      const newPrice = Math.round((Math.random() * 4 + 1) * 100) / 100
      await prisma.product.update({
        where: { id: product.id },
        data: { price: newPrice }
      })
      console.log(`Prix mis à jour pour ${product.name}: ${newPrice}€`)
    }
    
    console.log('Tous les prix ont été mis à jour avec succès !')
  } catch (error) {
    console.error('Erreur lors de la mise à jour des prix:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePrices() 