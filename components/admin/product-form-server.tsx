'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import { createProductAction, updateProductAction } from '@/lib/actions'

interface ProductFormServerProps {
  categories: { id: string; name: string }[]
  initialData?: {
    id?: string
    name?: string
    slug?: string
    description?: string
    price?: number
    brand?: string
    categoryId?: string
    countInStock?: number
    rating?: number
    numReviews?: number
    isFeatured?: boolean
    images?: string[] | string // Can be array or JSON string
  }
}

export function ProductFormServer({ categories, initialData }: ProductFormServerProps) {
  // Parse images if they come as JSON string from database
  const parseImages = (images: any): string[] => {
    if (!images) return []
    if (Array.isArray(images)) return images
    if (typeof images === 'string') {
      try {
        return JSON.parse(images) as string[]
      } catch {
        return []
      }
    }
    return []
  }
  
  const [images, setImages] = useState<string[]>(parseImages(initialData?.images))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId || '')
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false)
  const router = useRouter()

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slugInput = document.getElementById('slug') as HTMLInputElement
    if (!initialData?.id && slugInput) {
      slugInput.value = generateSlug(name)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  const addImageUrl = () => {
    const url = prompt('Entrez l\'URL de l\'image:')
    if (url && url.trim()) {
      setImages([...images, url.trim()])
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      // Add images to form data
      images.forEach(image => {
        formData.append('images', image)
      })

      // Add category and featured status
      formData.set('categoryId', selectedCategory)
      formData.set('isFeatured', isFeatured.toString())

      let result
      if (initialData?.id) {
        result = await updateProductAction(initialData.id, formData)
      } else {
        result = await createProductAction(formData)
      }

      if (result.error) {
        toast({
          title: 'Erreur',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Succès',
        description: initialData?.id 
          ? 'Produit mis à jour avec succès' 
          : 'Produit créé avec succès',
      })
      
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Détails principaux du produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nom du produit"
                  defaultValue={initialData?.name}
                  onChange={handleNameChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="slug-du-produit"
                  defaultValue={initialData?.slug}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description du produit"
                  defaultValue={initialData?.description}
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Marque du produit"
                  defaultValue={initialData?.brand}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing and Inventory */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prix et inventaire</CardTitle>
              <CardDescription>
                Informations commerciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  defaultValue={initialData?.price}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Catégorie</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="countInStock">Stock disponible</Label>
                <Input
                  id="countInStock"
                  name="countInStock"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={initialData?.countInStock}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isFeatured">Produit mis en avant</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images du produit</CardTitle>
          <CardDescription>
            Ajoutez des images pour présenter votre produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 text-xs">
                        Image principale
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Image Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addImageUrl}
              className="w-full"
              disabled={isSubmitting}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Ajouter une image (URL)
            </Button>

            {images.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune image ajoutée. Cliquez sur le bouton ci-dessus pour ajouter des images.
              </p>
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
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || images.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData?.id ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            initialData?.id ? 'Mettre à jour le produit' : 'Créer le produit'
          )}
        </Button>
      </div>
    </form>
  )
} 