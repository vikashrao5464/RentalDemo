import { PrismaClient } from '@prisma/client'
import logger from '../config/logger.js'

const prisma = new PrismaClient()

export const uploadProductImages = async (req, res) => {
  try {
    const { productId } = req.params
    const { isPrimary = false } = req.body

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // If setting as primary, remove primary flag from other images
    if (isPrimary === 'true') {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false }
      })
    }

    // Create image records
    const imagePromises = req.files.map((file, index) => {
      const url = `/api/uploads/${file.filename}`
      const isFirstImage = index === 0 && isPrimary === 'true'
      
      return prisma.productImage.create({
        data: {
          productId,
          url,
          altText: `${product.name} image`,
          isPrimary: isFirstImage
        }
      })
    })

    const images = await Promise.all(imagePromises)

    logger.info(`Uploaded ${images.length} images for product: ${product.name}`)

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: images
    })
  } catch (error) {
    logger.error('Upload product images error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    })
  }
}

export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true }
    })

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      })
    }

    await prisma.productImage.delete({
      where: { id: imageId }
    })

    logger.info(`Deleted image for product: ${image.product.name}`)

    res.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    logger.error('Delete product image error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    })
  }
}

export const setPrimaryImage = async (req, res) => {
  try {
    const { imageId } = req.params

    const image = await prisma.productImage.findUnique({
      where: { id: imageId }
    })

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      })
    }

    // Remove primary flag from all images of this product
    await prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false }
    })

    // Set this image as primary
    await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true }
    })

    logger.info(`Set primary image for product`)

    res.json({
      success: true,
      message: 'Primary image updated successfully'
    })
  } catch (error) {
    logger.error('Set primary image error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update primary image'
    })
  }
}