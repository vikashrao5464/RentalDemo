import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import logger from '../config/logger.js'

const prisma = new PrismaClient()

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  dailyDeposit: z.number().positive().optional(),
  isRentable: z.boolean().default(true),
  categoryId: z.string().min(1, 'Category is required'),
  totalQuantity: z.number().int().min(0).default(0)
})

const updateProductSchema = createProductSchema.partial()

// Public endpoints
export const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      rentable 
    } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = {
      isActive: true,
      ...(category && { categoryId: category }),
      ...(rentable !== undefined && { isRentable: rentable === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          },
          stock: true,
          pricelistItems: {
            include: {
              pricelist: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      dailyDeposit: product.dailyDeposit,
      isRentable: product.isRentable,
      category: product.category,
      image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
      images: product.images,
      stock: product.stock?.[0] || { availableQuantity: 0, totalQuantity: 0 },
      pricing: product.pricelistItems.reduce((acc, item) => {
        if (item.pricelist.length > 0) {
          acc[item.unit] = parseFloat(item.price)
        }
        return acc
      }, {}),
      createdAt: product.createdAt
    }))

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get products error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    })
  }
}

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        category: true,
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        stock: true,
        pricelistItems: {
          include: {
            pricelist: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      dailyDeposit: product.dailyDeposit,
      isRentable: product.isRentable,
      category: product.category,
      images: product.images,
      stock: product.stock?.[0] || { availableQuantity: 0, totalQuantity: 0 },
      pricing: product.pricelistItems.reduce((acc, item) => {
        if (item.pricelist.length > 0) {
          acc[item.unit] = parseFloat(item.price)
        }
        return acc
      }, {}),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    res.json({
      success: true,
      data: formattedProduct
    })
  } catch (error) {
    logger.error('Get product by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    })
  }
}

// Admin endpoints
export const getAdminProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      rentable,
      active
    } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = {
      ...(category && { categoryId: category }),
      ...(rentable !== undefined && { isRentable: rentable === 'true' }),
      ...(active !== undefined && { isActive: active === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          },
          stock: true,
          _count: {
            select: {
              pricelistItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      dailyDeposit: product.dailyDeposit,
      isRentable: product.isRentable,
      isActive: product.isActive,
      category: product.category,
      image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
      imagesCount: product.images.length,
      stock: product.stock?.[0] || { availableQuantity: 0, totalQuantity: 0 },
      pricelistItemsCount: product._count.pricelistItems,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get admin products error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    })
  }
}

export const createProduct = async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body)
    const { totalQuantity, ...productData } = validatedData

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: productData.sku }
    })

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      })
    }

    // Create product with stock in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: productData,
        include: {
          category: true,
          images: true
        }
      })

      // Create stock record
      await tx.stock.create({
        data: {
          productId: newProduct.id,
          totalQuantity,
          availableQuantity: totalQuantity,
          reservedQuantity: 0
        }
      })

      return newProduct
    })

    logger.info(`Product created: ${product.name} (${product.sku})`)

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    })
  } catch (error) {
    logger.error('Create product error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateProductSchema.parse(req.body)
    const { totalQuantity, ...productData } = validatedData

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { stock: true }
    })

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Check SKU uniqueness if being updated
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: productData.sku }
      })

      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        })
      }
    }

    // Update product and stock in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: productData,
        include: {
          category: true,
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          },
          stock: true
        }
      })

      // Update stock if totalQuantity is provided
      if (totalQuantity !== undefined) {
        const currentStock = existingProduct.stock[0]
        const reservedQuantity = currentStock?.reservedQuantity || 0
        
        await tx.stock.update({
          where: { productId: id },
          data: {
            totalQuantity,
            availableQuantity: Math.max(0, totalQuantity - reservedQuantity)
          }
        })
      }

      return updatedProduct
    })

    logger.info(`Product updated: ${product.name} (${product.sku})`)

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    })
  } catch (error) {
    logger.error('Update product error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    })

    logger.info(`Product deleted: ${product.name} (${product.sku})`)

    res.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    logger.error('Delete product error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    })
  }
}