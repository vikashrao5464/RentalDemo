import { useState, useEffect } from 'react'
+import { Link } from 'react-router-dom'
+import { 
+  Plus, 
+  Search, 
+  Filter, 
+  Edit, 
+  Trash2, 
+  Package, 
+  CheckCircle, 
+  XCircle,
+  Eye,
+  Upload
+} from 'lucide-react'
+import api from '../../services/api'
+
+export default function ProductManagement() {
+  const [products, setProducts] = useState([])
+  const [categories, setCategories] = useState([])
+  const [loading, setLoading] = useState(true)
+  const [searchTerm, setSearchTerm] = useState('')
+  const [selectedCategory, setSelectedCategory] = useState('')
+  const [showActiveOnly, setShowActiveOnly] = useState(true)
+  const [showRentableOnly, setShowRentableOnly] = useState(false)
+
+  useEffect(() => {
+    fetchProducts()
+    fetchCategories()
+  }, [])
+
+  useEffect(() => {
+    fetchProducts()
+  }, [searchTerm, selectedCategory, showActiveOnly, showRentableOnly])
+
+  const fetchProducts = async () => {
+    try {
+      const params = new URLSearchParams()
+      if (searchTerm) params.append('search', searchTerm)
+      if (selectedCategory) params.append('category', selectedCategory)
+      if (showActiveOnly) params.append('active', 'true')
+      if (showRentableOnly) params.append('rentable', 'true')
+      
+      const response = await api.get(`/products/admin/products?${params.toString()}`)
+      setProducts(response.data.data.products)
+    } catch (error) {
+      console.error('Error fetching products:', error)
+    } finally {
+      setLoading(false)
+    }
+  }
+
+  const fetchCategories = async () => {
+    try {
+      const response = await api.get('/categories/admin/categories')
+      setCategories(response.data.data.categories)
+    } catch (error) {
+      console.error('Error fetching categories:', error)
+    }
+  }
+
+  const handleDeleteProduct = async (productId, productName) => {
+    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
+      return
+    }
+
+    try {
+      await api.delete(`/products/admin/products/${productId}`)
+      fetchProducts()
+      alert('Product deleted successfully')
+    } catch (error) {
+      console.error('Error deleting product:', error)
+      alert('Failed to delete product')
+    }
+  }
+
+  if (loading) {
+    return (
+      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
+        <div className="text-center">
+          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
+          <p className="text-gray-600">Loading products...</p>
+        </div>
+      </div>
+    )
+  }
+
+  return (
+    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
+      {/* Header */}
+      <div className="mb-8 flex justify-between items-center">
+        <div>
+          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
+          <p className="text-gray-600 mt-2">Manage your rental product catalog</p>
+        </div>
+        <Link
+          to="/admin/products/new"
+          className="btn-primary inline-flex items-center"
+        >
+          <Plus className="w-5 h-5 mr-2" />
+          Add Product
+        </Link>
+      </div>
+
+      {/* Filters */}
+      <div className="mb-8 space-y-4">
+        <div className="flex flex-col sm:flex-row gap-4">
+          <div className="relative flex-1">
+            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
+            <input
+              type="text"
+              placeholder="Search products..."
+              value={searchTerm}
+              onChange={(e) => setSearchTerm(e.target.value)}
+              className="input-field pl-10"
+            />
+          </div>
+          <div className="relative">
+            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
+            <select
+              value={selectedCategory}
+              onChange={(e) => setSelectedCategory(e.target.value)}
+              className="input-field pl-10 pr-8"
+            >
+              <option value="">All Categories</option>
+              {categories.map((category) => (
+                <option key={category.id} value={category.id}>
+                  {category.name}
+                </option>
+              ))}
+            </select>
+          </div>
+        </div>
+        
+        <div className="flex items-center gap-6">
+          <div className="flex items-center">
+            <input
+              type="checkbox"
+              id="active-only"
+              checked={showActiveOnly}
+              onChange={(e) => setShowActiveOnly(e.target.checked)}
+              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
+            />
+            <label htmlFor="active-only" className="ml-2 text-sm text-gray-700">
+              Show active products only
+            </label>
+          </div>
+          
+          <div className="flex items-center">
+            <input
+              type="checkbox"
+              id="rentable-only"
+              checked={showRentableOnly}
+              onChange={(e) => setShowRentableOnly(e.target.checked)}
+              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
+            />
+            <label htmlFor="rentable-only" className="ml-2 text-sm text-gray-700">
+              Show rentable products only
+            </label>
+          </div>
+        </div>
+      </div>
+
+      {/* Products Table */}
+      <div className="bg-white shadow-md rounded-lg overflow-hidden">
+        <div className="overflow-x-auto">
+          <table className="min-w-full divide-y divide-gray-200">
+            <thead className="bg-gray-50">
+              <tr>
+                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                  Product
+                </th>
+                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                  Category
+                </th>
+                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                  Stock
+                </th>
+                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                  Status
+                </th>
+                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                  Deposit
+                </th>
+                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                  Actions
+                </th>
+              </tr>
+            </thead>
+            <tbody className="bg-white divide-y divide-gray-200">
+              {products.map((product) => (
+                <tr key={product.id} className="hover:bg-gray-50">
+                  <td className="px-6 py-4 whitespace-nowrap">
+                    <div className="flex items-center">
+                      <div className="flex-shrink-0 h-12 w-12">
+                        {product.image ? (
+                          <img
+                            className="h-12 w-12 rounded-lg object-cover"
+                            src={product.image}
+                            alt={product.name}
+                          />
+                        ) : (
+                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
+                            <Package className="h-6 w-6 text-gray-400" />
+                          </div>
+                        )}
+                      </div>
+                      <div className="ml-4">
+                        <div className="text-sm font-medium text-gray-900">
+                          {product.name}
+                        </div>
+                        <div className="text-sm text-gray-500">
+                          SKU: {product.sku}
+                        </div>
+                        <div className="text-xs text-gray-400">
+                          {product.imagesCount} image(s)
+                        </div>
+                      </div>
+                    </div>
+                  </td>
+                  <td className="px-6 py-4 whitespace-nowrap">
+                    <span className="text-sm text-gray-900">
+                      {product.category.name}
+                    </span>
+                  </td>
+                  <td className="px-6 py-4 whitespace-nowrap">
+                    <div className="text-sm text-gray-900">
+                      {product.stock.availableQuantity} / {product.stock.totalQuantity}
+                    </div>
+                    <div className="text-xs text-gray-500">
+                      {product.stock.reservedQuantity} reserved
+                    </div>
+                  </td>
+                  <td className="px-6 py-4 whitespace-nowrap">
+                    <div className="flex flex-col gap-1">
+                      {product.isActive ? (
+                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
+                          <CheckCircle className="w-3 h-3 mr-1" />
+                          Active
+                        </span>
+                      ) : (
+                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
+                          <XCircle className="w-3 h-3 mr-1" />
+                          Inactive
+                        </span>
+                      )}
+                      {product.isRentable ? (
+                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
+                          Rentable
+                        </span>
+                      ) : (
+                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
+                          Not Rentable
+                        </span>
+                      )}
+                    </div>
+                  </td>
+                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
+                    {product.dailyDeposit ? `₹${product.dailyDeposit}` : '-'}
+                  </td>
+                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
+                    <div className="flex items-center gap-2">
+                      <Link
+                        to={`/products/${product.id}`}
+                        className="text-blue-600 hover:text-blue-900"
+                        title="View Product"
+                      >
+                        <Eye className="h-4 w-4" />
+                      </Link>
+                      <Link
+                        to={`/admin/products/${product.id}/edit`}
+                        className="text-indigo-600 hover:text-indigo-900"
+                        title="Edit Product"
+                      >
+                        <Edit className="h-4 w-4" />
+                      </Link>
+                      <Link
+                        to={`/admin/products/${product.id}/images`}
+                        className="text-green-600 hover:text-green-900"
+                        title="Manage Images"
+                      >
+                        <Upload className="h-4 w-4" />
+                      </Link>
+                      <button
+                        onClick={() => handleDeleteProduct(product.id, product.name)}
+                        className="text-red-600 hover:text-red-900"
+                        title="Delete Product"
+                      >
+                        <Trash2 className="h-4 w-4" />
+                      </button>
+                    </div>
+                  </td>
+                </tr>
+              ))}
+            </tbody>
+          </table>
+        </div>
+      </div>
+
+      {products.length === 0 && (
+        <div className="text-center py-12">
+          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
+          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
+          <p className="text-gray-500 mb-4">Get started by creating your first product.</p>
+          <Link
+            to="/admin/products/new"
+            className="btn-primary inline-flex items-center"
+          >
+            <Plus className="w-5 h-5 mr-2" />
+            Add Product
+          </Link>
+        </div>
+      )}
+    </div>
+  )
+}
+