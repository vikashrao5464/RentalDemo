import express from 'express'
import { getPricingQuote, getProductPricingRules } from '../controllers/pricing.controller.js'

const router = express.Router()

// Public routes
router.get('/quote', getPricingQuote)
router.get('/products/:productId/rules', getProductPricingRules)

export default router