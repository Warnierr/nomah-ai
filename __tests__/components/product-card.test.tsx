import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/products/product-card'
import { Product } from '@/types/product'

// Mock useCart hook
const mockAddItem = jest.fn()
jest.mock('@/store/cart', () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}))

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'This is a test product description',
  price: 99.99,
  images: 'https://example.com/image.jpg',
  countInStock: 10,
  rating: 4.5,
  numReviews: 25,
  isFeatured: true,
  createdAt: '2024-01-01T00:00:00Z',
  category: {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test category description',
    image: 'https://example.com/category.jpg',
  },
}

describe('ProductCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(25)')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('shows featured badge when product is featured', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('does not show featured badge when product is not featured', () => {
    const nonFeaturedProduct = { ...mockProduct, isFeatured: false }
    render(<ProductCard product={nonFeaturedProduct} />)
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('shows out of stock when countInStock is 0', () => {
    const outOfStockProduct = { ...mockProduct, countInStock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('shows low stock warning when stock is low', () => {
    const lowStockProduct = { ...mockProduct, countInStock: 3 }
    render(<ProductCard product={lowStockProduct} />)
    expect(screen.getByText('Only 3 left!')).toBeInTheDocument()
  })

  it('handles add to cart click', () => {
    const { toast } = require('@/components/ui/use-toast')
    render(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartButton)

    expect(mockAddItem).toHaveBeenCalledWith({
      id: '1',
      name: 'Test Product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      countInStock: 10,
    })

    expect(toast).toHaveBeenCalledWith({
      title: 'Added to cart',
      description: 'Test Product has been added to your cart.',
    })
  })

  it('disables add to cart when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, countInStock: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /out of stock/i })
    expect(addToCartButton).toBeDisabled()
  })

  it('renders product image with correct alt text', () => {
    render(<ProductCard product={mockProduct} />)
    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('renders product link with correct href', () => {
    render(<ProductCard product={mockProduct} />)
    const productLink = screen.getByRole('link', { name: /test product/i })
    expect(productLink).toHaveAttribute('href', '/products/test-product')
  })

  it('displays correct rating stars', () => {
    render(<ProductCard product={mockProduct} />)
    const ratingElement = screen.getByText('4.5')
    expect(ratingElement).toBeInTheDocument()
  })

  it('handles missing category gracefully', () => {
    const productWithoutCategory = { ...mockProduct, category: undefined }
    render(<ProductCard product={productWithoutCategory} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    // Should not crash when category is undefined
  })

  it('handles long product names correctly', () => {
    const longNameProduct = {
      ...mockProduct,
      name: 'This is a very long product name that should be truncated properly to fit in the card layout',
    }
    render(<ProductCard product={longNameProduct} />)
    
    expect(screen.getByText(longNameProduct.name)).toBeInTheDocument()
  })
}) 