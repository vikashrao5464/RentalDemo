import express from 'express'
import { 
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getCategories)

// Admin routes
router.get('/admin/categories', requireAuth, requireRole('admin'), getAdminCategories)
router.post('/admin/categories', requireAuth, requireRole('admin'), createCategory)
router.put('/admin/categories/:id', requireAuth, requireRole('admin'), updateCategory)
router.delete('/admin/categories/:id', requireAuth, requireRole('admin'), deleteCategory)

export default router