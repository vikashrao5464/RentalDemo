import express from 'express'
import { 
  getProducts, 
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getProducts)
router.get('/:id', getProductById)

// Admin routes
router.get('/admin/products', requireAuth, requireRole('admin'), getAdminProducts)
router.post('/admin/products', requireAuth, requireRole('admin'), createProduct)
router.put('/admin/products/:id', requireAuth, requireRole('admin'), updateProduct)
router.delete('/admin/products/:id', requireAuth, requireRole('admin'), deleteProduct)

export default router