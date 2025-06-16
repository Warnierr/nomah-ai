import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { toast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  countInStock: number;
}

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
      image: product.images[0],
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
            src={product.images[0]}
            alt={product.name}
            fill
            className="aspect-square object-cover rounded-lg"
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-col space-y-1.5 p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg hover:underline">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
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