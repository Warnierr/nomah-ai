import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateImages() {
  try {
    // Récupérer tous les produits
    const products = await prisma.product.findMany()
    
    // Mettre à jour chaque produit pour convertir l'image en tableau JSON
    for (const product of products) {
      const imageArray = [product.images] // Convertir l'image unique en tableau
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          images: JSON.stringify(imageArray)
        }
      })
      console.log(`Images mises à jour pour ${product.name}`)
    }
    
    console.log('Toutes les images ont été converties avec succès !')
  } catch (error) {
    console.error('Erreur lors de la mise à jour des images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateImages() 