import express from 'express'
import { PrismaClient } from '@prisma/client'
import logger from '../config/logger.js'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const healthStatus = {
      success: true,
      message: 'SmartRent API is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }

    logger.info('Health check passed')
    res.json(healthStatus)
  } catch (error) {
    logger.error('Health check failed:', error)
    
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router