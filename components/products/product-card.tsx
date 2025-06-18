"use client"

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { useCart } from "@/store/cart";
import { toast } from "@/components/ui/use-toast";

import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Parse the images string into an array
  const images = JSON.parse(product.images) as string[];
  const mainImage = images[0] || '/placeholder.jpg';

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
      countInStock: product.countInStock,
    });
    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const isNew = () => {
    const productDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - productDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Card className="rounded-lg border">
      <CardContent className="pt-4">
        <div className="aspect-square relative bg-foreground/5 dark:bg-background rounded-lg">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="aspect-square object-cover rounded-lg"
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge variant="warning">En vedette</Badge>
            )}
            {isNew() && (
              <Badge variant="success">Nouveau</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1.5 p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg hover:underline">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2">
            <Rating rating={product.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({product.numReviews} avis)
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
          >
            {product.countInStock === 0 ? "Rupture de stock" : "Ajouter au panier"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 