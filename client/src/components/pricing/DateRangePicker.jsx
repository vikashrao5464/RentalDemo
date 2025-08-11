import { useState, useEffect } from 'react'
import { DateRange } from 'react-date-range'
import { addDays, format, differenceInHours, differenceInDays } from 'date-fns'
import { Calendar, Clock, Calculator } from 'lucide-react'
import api from '../../services/api'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export default function DateRangePicker({ productId, onPriceChange }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: 'selection'
    }
  ])
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (productId && dateRange[0].startDate && dateRange[0].endDate) {
      fetchPricing()
    }
  }, [productId, dateRange])

  const fetchPricing = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        productId,
        start: dateRange[0].startDate.toISOString(),
        end: dateRange[0].endDate.toISOString()
      })

      const response = await api.get(`/pricing/quote?${params.toString()}`)
      
      if (response.data.success) {
        setPricing(response.data.data)
        onPriceChange?.(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      console.error('Pricing fetch error:', error)
      setError(error.response?.data?.message || 'Failed to calculate pricing')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (ranges) => {
    setDateRange([ranges.selection])
  }

  const formatDuration = () => {
    const { startDate, endDate } = dateRange[0]
    const hours = differenceInHours(endDate, startDate)
    const days = differenceInDays(endDate, startDate)
    
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      return `${days} day${days !== 1 ? 's' : ''}`
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Select Rental Period
        </h3>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        </button>
      </div>

      {/* Date Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="text-lg font-semibold text-gray-900">
            {format(dateRange[0].startDate, 'MMM dd, yyyy')}
          </div>
          <div className="text-sm text-gray-500">
            {format(dateRange[0].startDate, 'EEEE')}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="text-lg font-semibold text-gray-900">
            {format(dateRange[0].endDate, 'MMM dd, yyyy')}
          </div>
          <div className="text-sm text-gray-500">
            {format(dateRange[0].endDate, 'EEEE')}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Clock className="w-4 h-4 mr-1" />
        Duration: {formatDuration()}
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="mb-6 flex justify-center">
          <DateRange
            ranges={dateRange}
            onChange={handleDateChange}
            minDate={new Date()}
            maxDate={addDays(new Date(), 365)}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={window.innerWidth >= 768 ? 2 : 1}
            direction="horizontal"
            className="border rounded-lg"
          />
        </div>
      )}

      {/* Pricing Display */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-3">
          <Calculator className="w-5 h-5 mr-2 text-primary-600" />
          <h4 className="font-semibold text-gray-900">Pricing Breakdown</h4>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Calculating pricing...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {pricing && !loading && (
          <div className="space-y-3">
            {/* Units Breakdown */}
            {pricing.unitsBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {item.quantity} {item.unit}{item.quantity !== 1 ? 's' : ''} × ₹{item.rate}
                </span>
                <span className="font-medium">₹{item.cost.toFixed(2)}</span>
              </div>
            ))}

            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm border-t pt-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{pricing.subtotal.toFixed(2)}</span>
            </div>

            {/* Deposit */}
            {pricing.deposit > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Security Deposit</span>
                <span className="font-medium">₹{pricing.deposit.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-primary-600">₹{pricing.total.toFixed(2)}</span>
            </div>

            {/* Duration Info */}
            <div className="text-xs text-gray-500 mt-2">
              Duration: {pricing.duration.hours} hours ({pricing.duration.days} days)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}