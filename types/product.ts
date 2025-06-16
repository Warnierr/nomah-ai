export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured?: boolean;
  createdAt: Date | string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
  };
}

export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
  };
} 