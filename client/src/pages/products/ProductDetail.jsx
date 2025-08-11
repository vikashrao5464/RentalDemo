import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Package, 
  CheckCircle, 
  XCircle, 
  ShoppingCart,
  Info,
  Tag,
  Calendar
} from 'lucide-react'
import api from '../../services/api'
import DateRangePicker from '../../components/pricing/DateRangePicker'
import { useAuth } from '../../contexts/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [pricing, setPricing] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      
      if (response.data.success) {
        setProduct(response.data.data)
      } else {
        setError('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError(error.response?.data?.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (newPricing) => {
    setPricing(newPricing)
  }

  const handleAddToCart = () => {
    if (!pricing) {
      alert('Please select rental dates first')
      return
    }
    
    // TODO: Implement add to cart functionality
    alert('Add to cart functionality will be implemented with cart system')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/products" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-8">
        <Link 
          to="/products" 
          className="text-primary-600 hover:text-primary-700 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{product.category.name}</span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImage]?.url || 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={product.images[selectedImage]?.altText || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-primary-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              <span className="text-gray-300">•</span>
              <Link 
                to={`/products?category=${product.category.id}`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {product.category.name}
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Status Badges */}
            <div className="flex items-center gap-3 mb-4">
              {product.isRentable ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Available for Rent
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Not Available
                </span>
              )}
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Package className="w-4 h-4 mr-1" />
                {product.stock.availableQuantity} Available
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Basic Pricing Info */}
            {Object.keys(product.pricing).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Base Rates
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.pricing).map(([unit, price]) => (
                    <div key={unit} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 capitalize">{unit}ly</div>
                      <div className="text-lg font-semibold text-gray-900">₹{price}</div>
                    </div>
                  ))}
                </div>
                {product.dailyDeposit && (
                  <div className="mt-3 text-sm text-gray-600">
                    Security Deposit: ₹{product.dailyDeposit}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Calculator */}
      {product.isRentable && (
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DateRangePicker 
                productId={product.id} 
                onPriceChange={handlePriceChange}
              />
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rental Summary
                </h3>
                
                {pricing ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600 mb-1">
                        ₹{pricing.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total for {pricing.duration.days} day{pricing.duration.days !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    {isAuthenticated ? (
                      <button
                        onClick={handleAddToCart}
                        className="w-full btn-primary flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                          Sign in to rent this item
                        </p>
                        <Link to="/login" className="w-full btn-primary block text-center">
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select rental dates to see pricing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}