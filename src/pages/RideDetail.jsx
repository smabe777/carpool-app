import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ArrowLeft, MapPin, Clock, Users, Phone, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
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
      toast.success('Booking confirmed! 🎉')
      const res = await api.get(`/rides/${id}`)
      setRide(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div className="pt-24 flex justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
    </div>
  )

  if (!ride) return null
  const isDriver = user?._id === ride.driver?._id

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 text-2xl font-black text-slate-900 mb-1">
                <span>{ride.from}</span>
                <ChevronRight size={20} className="text-slate-300" />
                <span>{ride.to}</span>
              </div>
              <p className="text-slate-500 flex items-center gap-1.5">
                <Clock size={14} />
                {format(new Date(ride.date), 'EEEE, MMMM dd yyyy', { locale: enUS })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-brand-600">{ride.price}€</div>
              <div className="text-xs text-slate-400">per person</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 py-5 border-y border-slate-100 mb-5">
            <div className="text-center">
              <div className="text-lg font-bold">{ride.departureTime}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={11} />{ride.from}</div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-slate-400">{ride.duration ? `${ride.duration}h` : 'direct'}</div>
              <div className="w-full h-px bg-gradient-to-r from-brand-200 via-purple-200 to-brand-200"></div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{ride.arrivalTime || '—'}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={11} />{ride.to}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Users size={16} className="text-brand-500" />
            <span className="text-sm font-medium">{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} available</span>
          </div>

          {ride.description && (
            <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-xl p-4 leading-relaxed">{ride.description}</p>
          )}
        </motion.div>

        {/* Driver */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Your driver</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-xl font-black">
              {ride.driver?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900">{ride.driver?.name}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Phone size={12} />{ride.driver?.phone}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Booking */}
        {!isDriver && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Book this ride</h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-slate-700">Seats:</label>
              <select
                value={seats}
                onChange={e => setSeats(Number(e.target.value))}
                className="input w-28"
                disabled={ride.availableSeats === 0}
              >
                {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <span className="text-slate-500 text-sm">= <span className="text-lg font-bold text-brand-600">{seats * ride.price}€</span></span>
            </div>
            <button
              onClick={handleBook}
              disabled={booking || ride.availableSeats === 0}
              className="btn-primary w-full py-3 text-base"
            >
              {booking ? 'Booking...' : ride.availableSeats === 0 ? 'Fully booked' : 'Book now'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
