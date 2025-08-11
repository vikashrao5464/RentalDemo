import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from '../utils/jwt.js'
import logger from '../config/logger.js'

const prisma = new PrismaClient()

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      })
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      jti: decoded.jti
    }

    next()
  } catch (error) {
    logger.error('Auth middleware error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    })
  }
}

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}