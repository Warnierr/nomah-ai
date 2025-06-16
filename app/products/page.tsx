import prisma from "@/lib/prisma"
import { ProductGrid } from "@/components/products"
import { SortSelect } from "@/components/products/sort-select"
import { Suspense } from "react"

export const revalidate = 3600 // Revalidate every hour

interface SearchParams {
  category?: string
  search?: string
  sort?: string
}

async function getProducts(searchParams: SearchParams) {
  try {
    const { category, search, sort } = searchParams
    
    const where: any = {}
    
    if (category) {
      where.category = {
        slug: category
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    let orderBy: any = { createdAt: 'desc' }
    
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' }
    } else if (sort === 'name') {
      orderBy = { name: 'asc' }
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    })
    
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    })
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Nos produits</h1>
          <p className="mt-2 text-muted-foreground">
            Découvrez notre sélection de produits de qualité
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Catégories</h3>
                <div className="space-y-2">
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded-md text-sm ${
                      !searchParams.category
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Toutes les catégories
                  </a>
                  {categories.map((category: any) => (
                    <a
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        searchParams.category === category.slug
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                {products.length} produit{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""}
              </p>
              
              <SortSelect currentSort={searchParams.sort} />
            </div>

            <Suspense fallback={<div>Chargement...</div>}>
              <ProductGrid products={products} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
} 