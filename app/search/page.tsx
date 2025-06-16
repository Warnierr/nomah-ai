'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/ui/optimized-image'
import { Search, Filter, X, Star, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { SearchResult, SearchFilters } from '@/lib/search'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    categoryId: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    brand: searchParams.get('brand') || undefined,
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: 12,
  })

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) {
          params.set(key, value.toString())
        }
      })

      const response = await fetch(`/api/search?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setSearchResult(result)
        
        // Update price range based on results
        if (result.filters.priceRange) {
          setPriceRange([result.filters.priceRange.min, result.filters.priceRange.max])
        }
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
    })
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher des produits..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </Button>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.categoryId && searchResult?.filters.categories.find(c => c.id === filters.categoryId) && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{searchResult.filters.categories.find(c => c.id === filters.categoryId)?.name}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ categoryId: undefined })}
              />
            </Badge>
          )}
          {filters.brand && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.brand}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ brand: undefined })}
              />
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>En stock</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ inStock: false })}
              />
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Mis en avant</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ featured: false })}
              />
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Filtres
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Effacer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                {searchResult?.filters.categories && searchResult.filters.categories.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Catégories</h4>
                    <div className="space-y-2">
                      {searchResult.filters.categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filters.categoryId === category.id}
                            onCheckedChange={(checked) => 
                              updateFilters({ categoryId: checked ? category.id : undefined })
                            }
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            {category.name} ({category.count})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {searchResult?.filters.brands && searchResult.filters.brands.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Marques</h4>
                    <Select value={filters.brand || ''} onValueChange={(value) => updateFilters({ brand: value || undefined })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les marques" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les marques</SelectItem>
                        {searchResult.filters.brands.map(brand => (
                          <SelectItem key={brand.name} value={brand.name}>
                            {brand.name} ({brand.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range */}
                {searchResult?.filters.priceRange && (
                  <div>
                    <h4 className="font-medium mb-3">Prix</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ''}
                          onChange={(e) => updateFilters({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-20"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-20"
                        />
                        <span>€</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Prix: {searchResult.filters.priceRange.min}€ - {searchResult.filters.priceRange.max}€
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Filters */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
                    />
                    <label htmlFor="inStock" className="text-sm cursor-pointer">
                      En stock uniquement
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={filters.featured}
                      onCheckedChange={(checked) => updateFilters({ featured: !!checked })}
                    />
                    <label htmlFor="featured" className="text-sm cursor-pointer">
                      Produits mis en avant
                    </label>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium mb-3">Note minimum</h4>
                  <Select value={filters.rating?.toString() || ''} onValueChange={(value) => updateFilters({ rating: value ? parseFloat(value) : undefined })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les notes</SelectItem>
                      <SelectItem value="4">4+ étoiles</SelectItem>
                      <SelectItem value="3">3+ étoiles</SelectItem>
                      <SelectItem value="2">2+ étoiles</SelectItem>
                      <SelectItem value="1">1+ étoile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {searchResult && (
                <p className="text-gray-600">
                  {searchResult.pagination.total} résultat{searchResult.pagination.total > 1 ? 's' : ''}
                  {filters.query && ` pour "${filters.query}"`}
                </p>
              )}
            </div>
            <Select 
              value={`${filters.sortBy}-${filters.sortOrder}`} 
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-')
                updateFilters({ sortBy: sortBy as any, sortOrder: sortOrder as any })
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Plus récents</SelectItem>
                <SelectItem value="createdAt-asc">Plus anciens</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="name-desc">Nom Z-A</SelectItem>
                <SelectItem value="rating-desc">Mieux notés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Products Grid */}
          {searchResult && !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResult.products.map(product => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                          <ProductImage
                            src={product.images[0] || '/placeholder.jpg'}
                            alt={product.name}
                            variant="card"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{product.category.name}</p>
                        <div className="flex items-center space-x-1 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({product.numReviews})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">{product.price}€</span>
                          {product.countInStock > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              En stock
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Rupture
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {searchResult.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={!searchResult.pagination.hasPrev}
                    onClick={() => handlePageChange(searchResult.pagination.page - 1)}
                  >
                    Précédent
                  </Button>
                  
                  {[...Array(Math.min(5, searchResult.pagination.totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={page === searchResult.pagination.page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    disabled={!searchResult.pagination.hasNext}
                    onClick={() => handlePageChange(searchResult.pagination.page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {searchResult && !loading && searchResult.products.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche ou supprimez certains filtres.
              </p>
              <Button onClick={clearFilters}>Effacer les filtres</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 