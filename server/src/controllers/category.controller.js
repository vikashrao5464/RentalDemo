import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import logger from '../config/logger.js'

const prisma = new PrismaClient()

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional()
})

const updateCategorySchema = createCategorySchema.partial()

// Public endpoints
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
                isRentable: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      productCount: category._count.products,
      createdAt: category.createdAt
    }))

    res.json({
      success: true,
      data: formattedCategories
    })
  } catch (error) {
    logger.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    })
  }
}

// Admin endpoints
export const getAdminCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = {
      ...(active !== undefined && { isActive: active === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.count({ where })
    ])

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    res.json({
      success: true,
      data: {
        categories: formattedCategories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get admin categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    })
  }
}

export const createCategory = async (req, res) => {
  try {
    const validatedData = createCategorySchema.parse(req.body)

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name }
    })

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      })
    }

    const category = await prisma.category.create({
      data: validatedData
    })

    logger.info(`Category created: ${category.name}`)

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    })
  } catch (error) {
    logger.error('Create category error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateCategorySchema.parse(req.body)

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // Check name uniqueness if being updated
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: validatedData.name }
      })

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData
    })

    logger.info(`Category updated: ${category.name}`)

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    })
  } catch (error) {
    logger.error('Update category error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products'
      })
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    })

    logger.info(`Category deleted: ${category.name}`)

    res.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    logger.error('Delete category error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    })
  }
}