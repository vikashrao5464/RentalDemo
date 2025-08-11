import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Shield, Truck } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Clock,
      title: 'Flexible Rentals',
      description: 'Hourly, daily, weekly, or monthly rental options to fit your needs.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options.'
    },
    {
      icon: Truck,
      title: 'Easy Pickup & Return',
      description: 'Convenient pickup and return scheduling with automated reminders.'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rent Anything, Anytime
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your one-stop platform for all rental needs. From equipment to vehicles, 
              find what you need when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartRent?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make renting simple, secure, and convenient with our comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Renting?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who trust SmartRent for their rental needs.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 font-semibold rounded-lg transition-colors"
          >
            Explore Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}