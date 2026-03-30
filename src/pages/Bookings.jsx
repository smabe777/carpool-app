import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ChevronRight, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const statusConfig = {
  confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-500' },
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [myRides, setMyRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bookings')

  useEffect(() => {
    Promise.all([api.get('/bookings'), api.get('/rides/my')])
      .then(([b, r]) => { setBookings(b.data); setMyRides(r.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' })
      setBookings(prev => prev.filter(b => b._id !== id))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  if (loading) return (
    <div className="pt-24 flex justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
    </div>
  )

  const tabs = [
    { key: 'bookings', label: 'My bookings', count: bookings.length },
    { key: 'rides', label: 'My offered rides', count: myRides.length },
  ]

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My trips</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {bookings.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-4xl mb-4">🎫</div>
                <h3 className="font-bold text-slate-900 mb-1">No bookings yet</h3>
                <p className="text-slate-500 text-sm mb-4">Find a ride and book your first trip!</p>
                <Link to="/rides" className="btn-primary inline-flex">Find a ride</Link>
              </div>
            ) : bookings.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link to={`/rides/${b.ride?._id}`} className="font-bold text-slate-900 hover:text-brand-600 flex items-center gap-1">
                      {b.ride?.from} <ChevronRight size={14} /> {b.ride?.to}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {b.ride?.date && format(new Date(b.ride.date), 'dd MMM yyyy', { locale: enUS })} · {b.ride?.departureTime} · {b.seats} seat{b.seats !== 1 ? 's' : ''} · <span className="font-semibold text-brand-600">{b.seats * b.ride?.price}€</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`badge ${statusConfig[b.status]?.cls}`}>{statusConfig[b.status]?.label}</span>
                    {b.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(b._id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Cancel</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {tab === 'rides' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {myRides.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="font-bold text-slate-900 mb-1">No rides offered yet</h3>
                <p className="text-slate-500 text-sm mb-4">Share your journey and save on costs.</p>
                <Link to="/create" className="btn-primary inline-flex"><Plus size={15} /> Offer a ride</Link>
              </div>
            ) : myRides.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card hover:shadow-card-hover transition-all">
                <Link to={`/rides/${r._id}`} className="flex items-center justify-between group">
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-brand-600 flex items-center gap-1">
                      {r.from} <ChevronRight size={14} /> {r.to}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {format(new Date(r.date), 'dd MMM yyyy', { locale: enUS })} · {r.departureTime} · {r.availableSeats}/{r.seats} seats · <span className="font-semibold text-brand-600">{r.price}€/person</span>
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
