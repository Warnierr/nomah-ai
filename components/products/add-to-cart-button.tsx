"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/store/cart"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Minus, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  countInStock: number
}

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (product.countInStock === 0) {
      toast({
        title: "Produit indisponible",
        description: "Ce produit est actuellement en rupture de stock.",
        variant: "destructive",
      })
      return
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images,
        countInStock: product.countInStock,
      })
    }

    toast({
      title: "Produit ajouté",
      description: `${quantity} ${product.name} ajouté${quantity > 1 ? "s" : ""} à votre panier.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Quantité:</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
            disabled={quantity >= product.countInStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleAddToCart}
        disabled={product.countInStock === 0}
        size="lg"
      >
        {product.countInStock === 0 ? "Rupture de stock" : "Ajouter au panier"}
      </Button>
    </div>
  )
} 