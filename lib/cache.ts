// Simple in-memory cache for development
// In production, you would use Redis or similar

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let validItems = 0
    let expiredItems = 0

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredItems++
      } else {
        validItems++
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
    }
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

export const cache = new SimpleCache()

// Auto cleanup every 10 minutes
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000)

// Cache keys constants
export const CACHE_KEYS = {
  FEATURED_PRODUCTS: 'featured_products',
  CATEGORIES: 'categories',
  PRODUCT_BY_SLUG: (slug: string) => `product_${slug}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string, page: number) => `products_category_${categoryId}_page_${page}`,
  ADMIN_STATS: 'admin_stats',
  ANALYTICS_DATA: (period: string) => `analytics_${period}`,
  USER_ORDERS: (userId: string) => `user_orders_${userId}`,
} as const

// Helper function to get or set cache with a fallback function
export async function getOrSetCache<T>(
  key: string,
  fallback: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // If not in cache, execute fallback and cache the result
  const data = await fallback()
  cache.set(key, data, ttl)
  return data
} 