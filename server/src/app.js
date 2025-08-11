import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'
import logger from './config/logger.js'
import { errorHandler } from './middleware/error.middleware.js'
import healthRoutes from './routes/health.routes.js'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/health', healthRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})

// Error handling middleware
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export default app