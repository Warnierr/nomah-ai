import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { AddToCartButton } from "@/components/products/add-to-cart-button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Rating } from "@/components/ui/rating"

interface ProductPageProps {
  params: {
    slug: string
  }
}

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!product) return null

    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const breadcrumbItems = [
    { label: "Produits", href: "/products" },
    { label: product.category.name, href: `/categories/${product.category.slug}` },
    { label: product.name },
  ]

  // Parse the images string into an array
  const images = JSON.parse(product.images) as string[];
  const mainImage = images[0] || '/placeholder.jpg';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square relative bg-foreground/5 dark:bg-background rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Additional Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square relative bg-foreground/5 dark:bg-background rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Catégorie: {product.category.name}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            </div>
            <div className="flex items-center space-4">
              <Rating rating={product.rating} showValue />
              <span className="text-sm text-muted-foreground">
                ({product.numReviews} avis)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {product.countInStock > 0 ? (
                  <span className="text-green-600">En stock</span>
                ) : (
                  <span className="text-red-600">Rupture de stock</span>
                )}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Avis clients</h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">{review.user.name}</p>
                    <Rating rating={review.rating} size="sm" className="mt-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 