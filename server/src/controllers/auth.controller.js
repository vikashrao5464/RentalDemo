import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateTokens, verifyRefreshToken, hashToken } from '../utils/jwt.js'
import logger from '../config/logger.js'
import env from '../config/env.js'

const prisma = new PrismaClient()

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Get customer role
    const customerRole = await prisma.role.findUnique({
      where: { name: 'customer' }
    })

    if (!customerRole) {
      throw new Error('Customer role not found')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        roleId: customerRole.id
      },
      include: { role: true }
    })

    // Generate tokens
    const { accessToken, refreshToken, jti } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name
    })

    // Store refresh token in database
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7) // 7 days

    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshTokenExpiry
      }
    })

    // Set httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    logger.info(`User registered: ${user.email}`)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name
        }
      }
    })
  } catch (error) {
    logger.error('Registration error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    })
  }
}

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)

    // Find user with role
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { role: true }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generate tokens
    const { accessToken, refreshToken, jti } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name
    })

    // Store refresh token in database
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7) // 7 days

    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshTokenExpiry
      }
    })

    // Set httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    logger.info(`User logged in: ${user.email}`)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name
        }
      }
    })
  } catch (error) {
    logger.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
}

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    const tokenHash = hashToken(refreshToken)

    // Find token in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: tokenHash,
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: { include: { role: true } }
      }
    })

    if (!storedToken || !storedToken.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, jti } = generateTokens({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role.name
    })

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    })

    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7) // 7 days

    await prisma.refreshToken.create({
      data: {
        token: hashToken(newRefreshToken),
        userId: storedToken.user.id,
        expiresAt: refreshTokenExpiry
      }
    })

    // Set new httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          firstName: storedToken.user.firstName,
          lastName: storedToken.user.lastName,
          role: storedToken.user.role.name
        }
      }
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    })
  }
}

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken)
      
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: tokenHash }
      })
    }

    // Clear cookie
    res.clearCookie('refreshToken')

    logger.info('User logged out')

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    logger.error('Logout error:', error)
    
    // Still clear cookie even if database operation fails
    res.clearCookie('refreshToken')
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    })
  }
}

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    })

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role.name,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    logger.error('Get user profile error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    })
  }
}