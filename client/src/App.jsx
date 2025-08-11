import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Products from './pages/products/Products'
import ProductDetail from './pages/products/ProductDetail'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Cart from './pages/orders/Cart'
import Checkout from './pages/orders/Checkout'
import Orders from './pages/orders/Orders'
import AdminDashboard from './pages/admin/Dashboard'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Layout>
  )
}

export default App