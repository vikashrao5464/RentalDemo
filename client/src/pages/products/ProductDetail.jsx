import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Clock, Shield, Star, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState('day')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data.data)
      
      // Set default duration to the first available pricing option
      const availableDurations = Object.keys(response.data.data.pricing || {})
      if (availableDurations.length > 0) {
        setSelectedDuration(availableDurations[0])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product.isRentable) {
      alert('This product is not available for rent')
      return
    }
    
    if (quantity > product.stock.availableQuantity) {
      alert('Not enough stock available')
      return
    }
    
    // TODO: Implement cart functionality
    console.log('Adding to cart:', { 
      productId: product.id,
      selectedDuration, 
      quantity,
      unitPrice: product.pricing[selectedDuration]
    })
    alert('Product added to cart! (Cart functionality will be implemented later)')
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

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-full h-20 object-cover rounded cursor-pointer transition-opacity ${
                      selectedImage === index ? 'ring-2 ring-primary-500' : 'hover:opacity-75'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-primary-600 font-medium">{product.category.name}</span>
              {product.isRentable ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Available for Rent
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Available
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-600">SKU: {product.sku}</span>
              <span className="inline-flex items-center text-sm text-gray-600">
                <Package className="w-4 h-4 mr-1" />
                {product.stock.availableQuantity} available
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Daily Deposit */}
          {product.dailyDeposit && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Security Deposit: ₹{product.dailyDeposit} per day
                </span>
              </div>
            </div>
          )}

          {/* Pricing */}
          {product.pricing && Object.keys(product.pricing).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Rental Duration</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.pricing).map(([duration, price]) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedDuration === duration
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">₹{price}</div>
                    <div className="text-sm text-gray-500">per {duration}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={product.stock.availableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock.availableQuantity, parseInt(e.target.value) || 1)))}
                className="input-field w-20"
              />
              <span className="text-sm text-gray-500">
                (Max: {product.stock.availableQuantity})
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          {product.pricing && Object.keys(product.pricing).length > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={!product.isRentable || product.stock.availableQuantity === 0}
              className={`w-full mb-6 py-3 px-4 rounded-lg font-semibold transition-colors ${
                product.isRentable && product.stock.availableQuantity > 0
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!product.isRentable 
                ? 'Not Available for Rent'
                : product.stock.availableQuantity === 0
                ? 'Out of Stock'
                : `Add to Cart - ₹${(product.pricing[selectedDuration] * quantity).toFixed(2)}`
              }
            </button>
          )}

          {/* Stock Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Stock Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Stock:</span>
                <span className="ml-2 font-medium">{product.stock.totalQuantity}</span>
              </div>
              <div>
                <span className="text-gray-600">Available:</span>
                <span className="ml-2 font-medium text-green-600">{product.stock.availableQuantity}</span>
              </div>
              <div>
                <span className="text-gray-600">Reserved:</span>
                <span className="ml-2 font-medium text-orange-600">{product.stock.reservedQuantity}</span>
              </div>
            </div>
          </div>

          {/* Features - Mock data for now */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2" />
                High-quality construction
              </li>
              <li className="flex items-center text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2" />
                Professional grade equipment
              </li>
              <li className="flex items-center text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2" />
                Regular maintenance and cleaning
              </li>
            </ul>
          </div>

          {/* Specifications - Mock data for now */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Specifications</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">SKU</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              {product.dailyDeposit && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Daily Deposit</span>
                  <span className="font-medium">₹{product.dailyDeposit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`p-3 border rounded-lg text-center ${
                    selectedDuration === duration
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">₹{price}</div>
                  <div className="text-sm text-gray-500">per {duration}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="input-field w-20"
            />
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary mb-6"
          >
            Add to Cart - ₹{product.pricing[selectedDuration] * quantity}
          </button>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Specifications</h3>
            <div className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}