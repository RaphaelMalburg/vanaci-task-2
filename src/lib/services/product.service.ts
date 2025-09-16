import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { Product, DatabaseProduct } from '@/lib/types'
import { databaseProductToProduct } from '@/lib/types'

export interface ProductSearchParams {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

export class ProductService {
  private static instance: ProductService
  private cache: Map<string, { data: Product[], timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }

  private getCacheKey(params: ProductSearchParams): string {
    return JSON.stringify(params)
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL
  }

  async getAllProducts(params: ProductSearchParams = {}): Promise<Product[]> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(params)
      const cached = this.cache.get(cacheKey)
      
      if (cached && this.isValidCache(cached.timestamp)) {
        logger.info('Returning cached products', { params, cacheHit: true })
        return cached.data
      }

      const {
        search,
        category,
        minPrice,
        maxPrice,
        limit = 50,
        offset = 0
      } = params

      const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (category) {
        where.category = { contains: category, mode: 'insensitive' }
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) (where.price as Record<string, number>).gte = minPrice
        if (maxPrice !== undefined) (where.price as Record<string, number>).lte = maxPrice
      }

      const products = await prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' }
      })

      const result = products.map(databaseProductToProduct)
      
      // Store in cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      logger.info('Products fetched and cached', { params, count: result.length })
      return result
    } catch (error) {
      logger.error('Erro ao buscar produtos:', {
        params,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      })
      throw new Error('Falha ao buscar produtos')
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      })
      return product ? databaseProductToProduct(product) : null
    } catch (error) {
      logger.error('Erro ao buscar produto por ID:', {
        id,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      })
      throw new Error('Falha ao buscar produto')
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.getAllProducts({ search: query })
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getAllProducts({ category })
  }

  async getProductsInPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.getAllProducts({ minPrice, maxPrice })
  }
}