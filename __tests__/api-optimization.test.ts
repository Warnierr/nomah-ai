import {
  getCachedData,
  setCachedData,
  validatePagination,
  validateSortOrder,
  rateLimit,
  OptimizedQueries,
} from '@/lib/api-optimization'
import { NextRequest } from 'next/server'

// Mock Prisma for tests
jest.mock('@/lib/prisma')

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

describe('API Optimization', () => {
  describe('Cache System', () => {
    beforeEach(() => {
      // Clear cache between tests
      const cache = (global as any).cache
      if (cache) cache.clear()
    })

    it('should cache and retrieve data correctly', () => {
      const testData = { message: 'test data' }
      const cacheKey = 'test-key'

      // Initially should return null
      expect(getCachedData(cacheKey)).toBe(null)

      // Set cache data
      setCachedData(cacheKey, testData, 1000)

      // Should retrieve cached data
      expect(getCachedData(cacheKey)).toEqual(testData)
    })

    it('should expire cached data after TTL', async () => {
      const testData = { message: 'test data' }
      const cacheKey = 'test-key-expire'

      // Set cache with very short TTL
      setCachedData(cacheKey, testData, 1)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 2))

      // Should return null after expiration
      expect(getCachedData(cacheKey)).toBe(null)
    })
  })

  describe('Request Validation', () => {
    it('should validate pagination parameters correctly', () => {
      const url = 'http://localhost:3000/api/test?page=2&limit=20'
      const request = new NextRequest(url)

      const { page, limit } = validatePagination(request)

      expect(page).toBe(2)
      expect(limit).toBe(20)
    })

    it('should handle invalid pagination parameters', () => {
      const url = 'http://localhost:3000/api/test?page=-1&limit=200'
      const request = new NextRequest(url)

      const { page, limit } = validatePagination(request)

      expect(page).toBe(1) // Should be at least 1
      expect(limit).toBe(100) // Should be capped at 100
    })

    it('should validate sort order correctly', () => {
      const { sortBy, sortOrder } = validateSortOrder('name', 'asc')

      expect(sortBy).toBe('name')
      expect(sortOrder).toBe('asc')
    })

    it('should handle invalid sort parameters', () => {
      const { sortBy, sortOrder } = validateSortOrder('invalid', 'invalid')

      expect(sortBy).toBe('createdAt') // Default
      expect(sortOrder).toBe('desc') // Default
    })
  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limit map between tests
      const rateLimitMap = (global as any).rateLimitMap
      if (rateLimitMap) rateLimitMap.clear()
    })

    it('should allow requests within limit', () => {
      const identifier = 'test-client'
      const result = rateLimit(identifier, 10, 60000)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('should reject requests when limit exceeded', () => {
      const identifier = 'test-client-limit'

      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        rateLimit(identifier, 5, 60000)
      }

      // Next request should be rejected
      const result = rateLimit(identifier, 5, 60000)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
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