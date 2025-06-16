'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { UploadDropzone } from '@/lib/uploadthing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  countInStock: z.number().min(0, 'Stock must be positive'),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().min(0).default(0),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string()).min(1, 'At least one image is required'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  categories: { id: string; name: string }[]
  initialData?: Partial<ProductFormData> & { id?: string }
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      brand: initialData?.brand || '',
      categoryId: initialData?.categoryId || '',
      countInStock: initialData?.countInStock || 0,
      rating: initialData?.rating || 0,
      numReviews: initialData?.numReviews || 0,
      isFeatured: initialData?.isFeatured || false,
      images: initialData?.images || [],
    },
  })

  // Generate slug from name
  const watchedName = watch('name')
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    if (!initialData?.id) {
      setValue('slug', generateSlug(name))
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setValue('images', newImages)
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true)
      
      const productData = {
        ...data,
        images,
      }

      const url = initialData?.id 
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products'
      
      const method = initialData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      toast.success(
        initialData?.id 
          ? 'Product updated successfully' 
          : 'Product created successfully'
      )
      
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              {...register('name')}
              onChange={handleNameChange}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="product-slug"
            />
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Enter brand name"
              />
              {errors.brand && (
                <p className="text-sm text-red-500 mt-1">{errors.brand.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select onValueChange={(value: string) => setValue('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="countInStock">Stock Quantity</Label>
            <Input
              id="countInStock"
              type="number"
              {...register('countInStock', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.countInStock && (
              <p className="text-sm text-red-500 mt-1">{errors.countInStock.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('rating', { valueAsNumber: true })}
                placeholder="0.0"
              />
              {errors.rating && (
                <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="numReviews">Number of Reviews</Label>
              <Input
                id="numReviews"
                type="number"
                {...register('numReviews', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.numReviews && (
                <p className="text-sm text-red-500 mt-1">{errors.numReviews.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              onCheckedChange={(checked) => setValue('isFeatured', !!checked)}
              defaultChecked={initialData?.isFeatured}
            />
            <Label htmlFor="isFeatured">Featured Product</Label>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Images
          </CardTitle>
          <CardDescription>
            Upload product images. The first image will be used as the main image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2">Main</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            <UploadDropzone
              endpoint="productImage"
              onClientUploadComplete={(res) => {
                const newImages = res.map((file) => file.url)
                const allImages = [...images, ...newImages]
                setImages(allImages)
                setValue('images', allImages)
                toast.success('Images uploaded successfully!')
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`)
              }}
            />
            
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (initialData?.id ? 'Updating...' : 'Creating...') 
            : (initialData?.id ? 'Update Product' : 'Create Product')
          }
        </Button>
      </div>
    </form>
  )
} 