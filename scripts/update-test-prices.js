const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateTestPrices() {
  try {
    console.log('🔄 Mise à jour des prix pour les tests...')
    
    // Récupérer tous les produits
    const products = await prisma.product.findMany()
    console.log(`📦 ${products.length} produits trouvés`)
    
    // Mettre à jour chaque produit avec un prix entre 1 et 5 euros
    for (const product of products) {
      const newPrice = Math.floor(Math.random() * 5) + 1 // Prix entre 1 et 5 euros
      
      await prisma.product.update({
        where: { id: product.id },
        data: { price: newPrice }
      })
      
      console.log(`✅ ${product.name}: ${product.price}€ → ${newPrice}€`)
    }
    
    console.log('🎉 Tous les prix ont été mis à jour !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des prix:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTestPrices() 