import prisma from "@/lib/prisma";
import { ProductGrid } from "@/components/products";
import { HeroSection } from "@/components/layout/hero-section";
import { CategoriesSection } from "@/components/products/categories-section";

export const revalidate = 3600; // Revalidate every hour

async function getProducts() {
  try {
    const [newProducts, featuredProducts] = await Promise.all([
      prisma.product.findMany({
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
        },
      }),
      prisma.product.findMany({
        take: 4,
        where: {
          isFeatured: true,
        },
        include: {
          category: true,
        },
      }),
    ]);

    return { newProducts, featuredProducts };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { newProducts: [], featuredProducts: [] };
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      take: 4,
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home() {
  const { newProducts, featuredProducts } = await getProducts();
  const categories = await getCategories();

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      
      <CategoriesSection categories={categories} />

      {featuredProducts.length > 0 && (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Produits en vedette</h2>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Nouveaux produits</h2>
          <ProductGrid products={newProducts} />
        </div>
      </section>
    </main>
  );
} 