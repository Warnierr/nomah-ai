import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/products"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

async function getCategory(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            category: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    return category
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-muted-foreground">
              {category.description}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {category.products.length} produit{category.products.length > 1 ? "s" : ""} trouvé{category.products.length > 1 ? "s" : ""}
          </p>
        </div>

        <ProductGrid products={category.products} />
      </div>
    </div>
  )
} 