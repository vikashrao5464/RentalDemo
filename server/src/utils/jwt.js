import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import env from '../config/env.js'

export const generateTokens = (payload) => {
  const jti = crypto.randomUUID()
  
  const accessToken = jwt.sign(
    { ...payload, jti },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  )

  const refreshToken = jwt.sign(
    { userId: payload.userId, jti },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  )

  return { accessToken, refreshToken, jti }
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET)
}

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}