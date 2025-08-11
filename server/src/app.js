import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'
import logger from './config/logger.js'
import env from './config/env.js'
import { errorHandler } from './middleware/error.middleware.js'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'

const app = express()
const prisma = new PrismaClient()
const PORT = env.PORT

// Middleware
app.use(helmet())
app.use(cors({
  origin: env.CORS_ORIGINS.split(','),
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
app.use('/api/auth', authRoutes)

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