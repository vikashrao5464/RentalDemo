import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import logger from '../config/logger.js'

const prisma = new PrismaClient()

const quoteSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  start: z.string().datetime('Invalid start date'),
  end: z.string().datetime('Invalid end date')
})

// Time unit priorities (higher number = higher priority)
const UNIT_PRIORITIES = {
  hour: 1,
  day: 2,
  week: 3,
  month: 4
}

// Convert duration to different units
const convertDuration = (totalHours) => {
  const totalMinutes = totalHours * 60
  const totalDays = totalHours / 24
  const totalWeeks = totalDays / 7
  const totalMonths = totalDays / 30 // Approximate

  return {
    minutes: Math.ceil(totalMinutes),
    hours: Math.ceil(totalHours),
    days: Math.ceil(totalDays),
    weeks: Math.ceil(totalWeeks),
    months: Math.ceil(totalMonths)
  }
}

// Calculate optimal pricing breakdown
const calculateOptimalPricing = (durationInHours, availableRules) => {
  const durations = convertDuration(durationInHours)
  const breakdown = []
  let totalCost = 0

  // Sort rules by unit priority (descending) to prefer larger units
  const sortedRules = availableRules.sort((a, b) => 
    (UNIT_PRIORITIES[b.unit] || 0) - (UNIT_PRIORITIES[a.unit] || 0)
  )

  let remainingHours = durationInHours

  for (const rule of sortedRules) {
    if (remainingHours <= 0) break

    let unitsToUse = 0
    let unitHours = 0

    switch (rule.unit) {
      case 'month':
        unitHours = 30 * 24 // 720 hours
        unitsToUse = Math.floor(remainingHours / unitHours)
        break
      case 'week':
        unitHours = 7 * 24 // 168 hours
        unitsToUse = Math.floor(remainingHours / unitHours)
        break
      case 'day':
        unitHours = 24
        unitsToUse = Math.floor(remainingHours / unitHours)
        break
      case 'hour':
        unitHours = 1
        unitsToUse = Math.ceil(remainingHours) // Use remaining hours
        break
    }

    // Apply min/max duration constraints
    if (rule.minDuration && unitsToUse < rule.minDuration) {
      unitsToUse = 0
    }
    if (rule.maxDuration && unitsToUse > rule.maxDuration) {
      unitsToUse = rule.maxDuration
    }

    if (unitsToUse > 0) {
      const cost = unitsToUse * parseFloat(rule.rate)
      breakdown.push({
        unit: rule.unit,
        quantity: unitsToUse,
        rate: parseFloat(rule.rate),
        cost,
        rule: {
          id: rule.id,
          specificity: rule.specificity
        }
      })
      totalCost += cost
      remainingHours -= unitsToUse * unitHours
    }
  }

  return { breakdown, totalCost }
}

export const getPricingQuote = async (req, res) => {
  try {
    const { productId, start, end } = quoteSchema.parse(req.query)

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      })
    }

    // Get product with category
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    })

    if (!product || !product.isActive || !product.isRentable) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available for rental'
      })
    }

    // Calculate duration in hours
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)

    // Get all applicable pricing rules
    const now = new Date()
    const pricelistItems = await prisma.pricelistItem.findMany({
      where: {
        pricelist: { isActive: true },
        OR: [
          { productId: productId }, // Product-specific rules
          { categoryId: product.categoryId }, // Category rules
          { AND: [{ productId: null }, { categoryId: null }] } // Default rules
        ],
        // Check validity period
        OR: [
          { validFrom: null, validTo: null }, // Always valid
          { validFrom: { lte: now }, validTo: null }, // Valid from date, no end
          { validFrom: null, validTo: { gte: now } }, // Valid until date, no start
          { validFrom: { lte: now }, validTo: { gte: now } } // Valid within period
        ]
      },
      include: {
        pricelist: true,
        product: true,
        category: true
      },
      orderBy: [
        { productId: 'desc' }, // Product-specific first
        { categoryId: 'desc' }, // Then category
        { unit: 'desc' } // Then by unit
      ]
    })

    if (pricelistItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pricing rules found for this product'
      })
    }

    // Add specificity to rules for better selection
    const rulesWithSpecificity = pricelistItems.map(item => ({
      ...item,
      specificity: item.productId ? 3 : item.categoryId ? 2 : 1
    }))

    // Group rules by unit and select best (highest specificity) for each unit
    const bestRulesByUnit = {}
    rulesWithSpecificity.forEach(rule => {
      const key = rule.unit
      if (!bestRulesByUnit[key] || rule.specificity > bestRulesByUnit[key].specificity) {
        bestRulesByUnit[key] = rule
      }
    })

    const availableRules = Object.values(bestRulesByUnit)

    // Calculate optimal pricing
    const { breakdown, totalCost } = calculateOptimalPricing(durationHours, availableRules)

    // Get deposit amount
    const deposit = product.dailyDeposit ? parseFloat(product.dailyDeposit) : 0

    const response = {
      success: true,
      data: {
        productId,
        productName: product.name,
        duration: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          hours: Math.ceil(durationHours),
          days: Math.ceil(durationHours / 24)
        },
        unitsBreakdown: breakdown,
        subtotal: totalCost,
        deposit,
        total: totalCost + deposit,
        bestRules: availableRules.map(rule => ({
          id: rule.id,
          unit: rule.unit,
          rate: parseFloat(rule.rate),
          specificity: rule.specificity,
          source: rule.productId ? 'product' : rule.categoryId ? 'category' : 'default',
          pricelist: rule.pricelist.name
        }))
      }
    }

    res.json(response)
  } catch (error) {
    logger.error('Get pricing quote error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to calculate pricing'
    })
  }
}

export const getProductPricingRules = async (req, res) => {
  try {
    const { productId } = req.params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const pricelistItems = await prisma.pricelistItem.findMany({
      where: {
        pricelist: { isActive: true },
        OR: [
          { productId: productId },
          { categoryId: product.categoryId },
          { AND: [{ productId: null }, { categoryId: null }] }
        ]
      },
      include: {
        pricelist: true,
        product: true,
        category: true
      },
      orderBy: [
        { productId: 'desc' },
        { categoryId: 'desc' },
        { unit: 'asc' }
      ]
    })

    const formattedRules = pricelistItems.map(item => ({
      id: item.id,
      unit: item.unit,
      rate: parseFloat(item.rate),
      minDuration: item.minDuration,
      maxDuration: item.maxDuration,
      validFrom: item.validFrom,
      validTo: item.validTo,
      source: item.productId ? 'product' : item.categoryId ? 'category' : 'default',
      pricelist: item.pricelist.name,
      specificity: item.productId ? 3 : item.categoryId ? 2 : 1
    }))

    res.json({
      success: true,
      data: {
        productId,
        productName: product.name,
        categoryName: product.category.name,
        rules: formattedRules
      }
    })
  } catch (error) {
    logger.error('Get product pricing rules error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing rules'
    })
  }
}