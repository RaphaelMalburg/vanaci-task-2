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

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }

  async getAllProducts(params: ProductSearchParams = {}): Promise<Product[]> {
    try {
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

      return products.map(databaseProductToProduct)
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