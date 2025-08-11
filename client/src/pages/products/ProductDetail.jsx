import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Clock, Shield, Star } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDuration, setSelectedDuration] = useState('day')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      // Mock data for now
      setProduct({
        id: parseInt(id),
        name: 'Professional Camera',
        description: 'High-quality DSLR camera perfect for professional photography, events, and creative projects. Includes lens kit and accessories.',
        images: [
          'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Electronics',
        pricing: {
          hour: 10,
          day: 50,
          week: 300,
          month: 1000
        },
        features: [
          '24MP Full Frame Sensor',
          '4K Video Recording',
          'Weather Sealed Body',
          'Dual Memory Card Slots'
        ],
        specifications: {
          'Brand': 'Canon',
          'Model': 'EOS R5',
          'Weight': '650g',
          'Battery Life': '320 shots'
        }
      })
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Adding to cart:', { product, selectedDuration, quantity })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Product not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg mb-4"
          />
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-primary-600 font-medium">{product.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-gray-600">(4.8) 24 reviews</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Pricing */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Rental Duration</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.pricing).map(([duration, price]) => (
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