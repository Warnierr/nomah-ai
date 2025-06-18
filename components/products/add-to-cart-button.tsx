"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/store/cart"
import { toast } from "@/components/ui/use-toast"
import { Product } from "@/types/product"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    const images = JSON.parse(product.images) as string[];
    const mainImage = images[0] || '/placeholder.jpg';

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
      countInStock: product.countInStock,
    })

    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    })
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={product.countInStock === 0}
      className="w-full"
    >
      {product.countInStock === 0 ? "Rupture de stock" : "Ajouter au panier"}
    </Button>
  )
} 