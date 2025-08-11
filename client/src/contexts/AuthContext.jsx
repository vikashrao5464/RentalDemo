import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Try to refresh token on app start
      const response = await api.post('/auth/refresh')
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data
        })
      }
    } catch (error) {
      console.log('No valid refresh token found')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data
        })
        return { success: true }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data
        })
        return { success: true }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      const errors = error.response?.data?.errors
      return { success: false, message, errors }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data
        })
        return response.data.data.accessToken
      }
      
      throw new Error('Token refresh failed')
    } catch (error) {
      dispatch({ type: 'LOGOUT' })
      throw error
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}