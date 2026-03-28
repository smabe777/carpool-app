import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import api from '../services/api'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [myRides, setMyRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bookings')

  useEffect(() => {
    Promise.all([
      api.get('/bookings'),
      api.get('/rides/my')
    ]).then(([b, r]) => {
      setBookings(b.data)
      setMyRides(r.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleCancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' })
      setBookings(prev => prev.filter(b => b._id !== id))
    } catch {}
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  )

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const statusLabels = { confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My trips</h1>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'bookings' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          My bookings ({bookings.length})
        </button>
        <button onClick={() => setTab('rides')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'rides' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          My offered rides ({myRides.length})
        </button>
      </div>

      {tab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">No bookings yet.</div>
          ) : bookings.map(b => (
            <div key={b._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/rides/${b.ride?._id}`} className="font-bold text-lg hover:text-primary-600">
                    {b.ride?.from} → {b.ride?.to}
                  </Link>
                  <p className="text-gray-500 text-sm">
                    {b.ride?.date && format(new Date(b.ride.date), 'dd MMM yyyy', { locale: enUS })} · {b.ride?.departureTime}
                  </p>
                  <p className="text-gray-500 text-sm">{b.seats} seat{b.seats !== 1 ? 's' : ''} · {b.seats * b.ride?.price}€</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                    {statusLabels[b.status]}
                  </span>
                  {b.status !== 'cancelled' && (
                    <button onClick={() => handleCancelBooking(b._id)} className="text-xs text-red-500 hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rides' && (
        <div className="space-y-4">
          {myRides.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">
              You haven't offered any rides yet.
              <Link to="/create" className="block mt-3 text-primary-600 font-medium">Offer a ride</Link>
            </div>
          ) : myRides.map(r => (
            <div key={r._id} className="card">
              <Link to={`/rides/${r._id}`} className="font-bold text-lg hover:text-primary-600">
                {r.from} → {r.to}
              </Link>
              <p className="text-gray-500 text-sm">
                {format(new Date(r.date), 'dd MMM yyyy', { locale: enUS })} · {r.departureTime}
              </p>
              <p className="text-gray-500 text-sm">{r.availableSeats}/{r.seats} seats · {r.price}€/person</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
