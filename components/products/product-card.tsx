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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const isNew = () => {
    const createdDate = typeof product.createdAt === 'string' 
      ? new Date(product.createdAt) 
      : product.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // Considéré comme nouveau pendant 30 jours
  };

  const handleAddToCart = () => {
    if (product.countInStock === 0) {
      toast({
        title: "Produit indisponible",
        description: "Ce produit est actuellement en rupture de stock.",
        variant: "destructive",
      });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images,
      countInStock: product.countInStock,
    });

    toast({
      title: "Produit ajouté",
      description: "Le produit a été ajouté à votre panier.",
    });
  };

  return (
    <Card className="rounded-lg border">
      <CardContent className="pt-4">
        <div className="aspect-square relative bg-foreground/5 dark:bg-background rounded-lg">
          <Image
            src={product.images}
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
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          <span className="text-sm text-muted-foreground">
            {product.countInStock > 0 ? "En stock" : "Rupture de stock"}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
        >
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
} 