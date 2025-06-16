import { Category } from "@prisma/client"
import Link from "next/link"

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Nos catégories</h2>
          <Link
            href="/categories"
            className="hidden text-sm font-semibold text-primary hover:text-primary/80 sm:block"
          >
            Voir toutes les catégories
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative h-64 overflow-hidden rounded-lg bg-accent sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1"
            >
              <div className="h-full w-full p-6">
                <div className="flex h-full flex-col justify-end">
                  <div className="font-semibold text-white">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-xl">{category.name}</p>
                    <p className="mt-1 text-sm text-white/75">{category.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/categories"
            className="block text-sm font-semibold text-primary hover:text-primary/80"
          >
            Voir toutes les catégories
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 