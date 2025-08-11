import express from 'express'
import { 
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage
} from '../controllers/upload.controller.js'
import { uploadImages } from '../middleware/upload.middleware.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

const router = express.Router()

// Admin routes for image uploads
router.post('/products/:productId/images', 
  requireAuth, 
  requireRole('admin'), 
  uploadImages, 
  uploadProductImages
)

router.delete('/images/:imageId', 
  requireAuth, 
  requireRole('admin'), 
  deleteProductImage
)

router.put('/images/:imageId/primary', 
  requireAuth, 
  requireRole('admin'), 
  setPrimaryImage
)

export default router