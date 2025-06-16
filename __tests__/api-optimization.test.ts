import {
  getCachedData,
  setCachedData,
  validatePagination,
  validateSortOrder,
  rateLimit,
  OptimizedQueries,
} from '@/lib/api-optimization'

// Mock Prisma for tests
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    order: {
      aggregate: jest.fn(),
    },
  },
}))

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

describe('API Optimization', () => {
  describe('Cache System', () => {
    beforeEach(() => {
      // Clear cache between tests by creating new instances
      jest.clearAllMocks()
    })

    it('should return null for non-existent cache key', () => {
      const result = getCachedData('non-existent-key')
      expect(result).toBe(null)
    })

    it('should cache and retrieve data correctly', () => {
      const testData = { message: 'test data' }
      const cacheKey = 'test-key'

      // Set cache data
      setCachedData(cacheKey, testData, 10000) // 10 seconds TTL

      // Retrieve cache data
      const retrieved = getCachedData(cacheKey)
      expect(retrieved).toEqual(testData)
    })

    it('should expire cached data after TTL', async () => {
      const testData = { message: 'test data' }
      const cacheKey = 'test-key-expire'

      // Set cache data with very short TTL
      setCachedData(cacheKey, testData, 1) // 1ms TTL

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should return null after expiry
      const retrieved = getCachedData(cacheKey)
      expect(retrieved).toBe(null)
    })
  })

  describe('Validation Helpers', () => {
    describe('validatePagination', () => {
      it('should return default values for empty input', () => {
        const result = validatePagination()
        expect(result).toEqual({ page: 1, limit: 10 })
      })

      it('should parse valid page and limit', () => {
        const result = validatePagination('2', '20')
        expect(result).toEqual({ page: 2, limit: 20 })
      })

      it('should enforce minimum values', () => {
        const result = validatePagination('0', '0')
        expect(result).toEqual({ page: 1, limit: 1 })
      })

      it('should enforce maximum limit', () => {
        const result = validatePagination('1', '200')
        expect(result).toEqual({ page: 1, limit: 100 })
      })

      it('should handle invalid input', () => {
        const result = validatePagination('invalid', 'also-invalid')
        expect(result).toEqual({ page: 1, limit: 10 })
      })
    })

    describe('validateSortOrder', () => {
      it('should return default sort order for empty input', () => {
        const result = validateSortOrder()
        expect(result).toEqual({ field: 'createdAt', direction: 'desc' })
      })

      it('should parse valid sort string', () => {
        const result = validateSortOrder('name:asc')
        expect(result).toEqual({ field: 'name', direction: 'asc' })
      })

      it('should default to desc for invalid direction', () => {
        const result = validateSortOrder('price:invalid')
        expect(result).toEqual({ field: 'price', direction: 'desc' })
      })

      it('should default field for invalid field name', () => {
        const result = validateSortOrder('invalid:asc')
        expect(result).toEqual({ field: 'createdAt', direction: 'asc' })
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const result = rateLimit('test-user', 5, 60000)
      expect(result.allowed).toBe(true)
    })

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-limit'
      const limit = 2
      const windowMs = 60000

      // First request - should be allowed
      let result = rateLimit(identifier, limit, windowMs)
      expect(result.allowed).toBe(true)

      // Second request - should be allowed
      result = rateLimit(identifier, limit, windowMs)
      expect(result.allowed).toBe(true)

      // Third request - should be blocked
      result = rateLimit(identifier, limit, windowMs)
      expect(result.allowed).toBe(false)
      expect(result.resetTime).toBeDefined()
    })

    it('should reset after time window', async () => {
      const identifier = 'test-user-reset'
      const limit = 1
      const windowMs = 50 // 50ms window

      // First request - should be allowed
      let result = rateLimit(identifier, limit, windowMs)
      expect(result.allowed).toBe(true)

      // Second request immediately - should be blocked
      result = rateLimit(identifier, limit, windowMs)
      expect(result.allowed).toBe(false)

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 60))

      // Request after reset - should be allowed
      result = rateLimit(identifier, limit, windowMs)
      expect(result.allowed).toBe(true)
    })
  })

  describe('OptimizedQueries', () => {
    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks()
    })

    it('should search products with filters', async () => {
      const mockPrisma = require('@/lib/prisma').default
      
      // Mock Prisma responses
      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Test Product',
          price: 99.99,
          category: { id: '1', name: 'Test Category', slug: 'test' }
        }
      ])
      mockPrisma.product.count.mockResolvedValue(1)

      const filters = {
        query: 'test',
        page: 1,
        limit: 10
      }

      const result = await OptimizedQueries.searchProducts(filters)

      expect(result.products).toBeDefined()
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.total).toBe(1)
    })

    it('should handle empty search results', async () => {
      const mockPrisma = require('@/lib/prisma').default
      
      mockPrisma.product.findMany.mockResolvedValue([])
      mockPrisma.product.count.mockResolvedValue(0)

      const result = await OptimizedQueries.searchProducts({})

      expect(result.products).toEqual([])
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const mockPrisma = require('@/lib/prisma').default
      
      // Mock database error
      mockPrisma.product.findMany.mockRejectedValue(new Error('Database connection failed'))

      try {
        await OptimizedQueries.searchProducts({})
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBe('Database connection failed')
      }
    })
  })
}) 