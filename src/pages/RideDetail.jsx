import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RideDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [seats, setSeats] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/rides/${id}`)
      .then(res => setRide(res.data))
      .catch(() => navigate('/rides'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async () => {
    if (!user) { navigate('/login'); return }
    setBooking(true)
    try {
      await api.post(`/rides/${id}/book`, { seats })
      setMessage('Booking confirmed! Check your bookings.')
      const res = await api.get(`/rides/${id}`)
      setRide(res.data)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )

  if (!ride) return null

  const isDriver = user?._id === ride.driver?._id

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center">
        ← Back
      </button>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-4 text-2xl font-bold">
              <span>{ride.from}</span>
              <span className="text-gray-400">→</span>
              <span>{ride.to}</span>
            </div>
            <p className="text-gray-500 mt-1">
              {format(new Date(ride.date), 'EEEE, MMMM dd yyyy', { locale: enUS })} · {ride.departureTime}
            </p>
          </div>
          <div className="text-3xl font-bold text-primary-600">{ride.price}€</div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold">{ride.departureTime}</div>
            <div className="text-sm text-gray-500">{ride.from}</div>
          </div>
          <div className="text-center text-gray-400 text-sm flex items-center justify-center">
            ── {ride.duration || '?'}h ──
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{ride.arrivalTime || '?'}</div>
            <div className="text-sm text-gray-500">{ride.to}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2 text-gray-600">
          <span>💺</span>
          <span>{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} available</span>
        </div>

        {ride.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-600">
            {ride.description}
          </div>
        )}
      </div>

      {/* Driver card */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold mb-4">The driver</h2>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold">
            {ride.driver?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{ride.driver?.name}</div>
            <div className="text-sm text-gray-500">{ride.driver?.phone}</div>
          </div>
        </div>
      </div>

      {/* Booking */}
      {!isDriver && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Book this ride</h2>
          {message && (
            <div className={`px-4 py-3 rounded-lg mb-4 ${message.includes('confirmed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Number of seats:</label>
            <select
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              className="input w-24"
            >
              {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-gray-500">= <strong>{seats * ride.price}€</strong></span>
          </div>
          <button
            onClick={handleBook}
            disabled={booking || ride.availableSeats === 0}
            className="btn-primary w-full py-3"
          >
            {booking ? 'Booking...' : ride.availableSeats === 0 ? 'Full' : 'Book now'}
          </button>
        </div>
      )}
    </div>
  )
}
