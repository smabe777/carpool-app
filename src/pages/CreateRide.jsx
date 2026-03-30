import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Clock, Users, DollarSign, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function CreateRide() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    from: '', to: '', date: '', departureTime: '', arrivalTime: '',
    seats: 1, price: '', description: '', duration: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/rides', form)
      toast.success('Ride published successfully!')
      navigate(`/rides/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ride. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Offer a ride</h1>
          <p className="text-slate-500 mb-8">Fill in the details below to publish your ride.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route */}
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Route</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departure city *</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input type="text" name="from" value={form.from} onChange={handleChange} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Arrival city *</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500" />
                    <input type="text" name="to" value={form.to} onChange={handleChange} className="input pl-10" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Schedule</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departure time *</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="time" name="departureTime" value={form.departureTime} onChange={handleChange} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estimated arrival time</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration (hours)</label>
                  <input type="number" name="duration" value={form.duration} onChange={handleChange} min="0" step="0.5" placeholder="e.g. 2.5" className="input" />
                </div>
              </div>
            </div>

            {/* Capacity & Price */}
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Capacity & Price</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Available seats *</label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select name="seats" value={form.seats} onChange={handleChange} className="input pl-10">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price per person (€) *</label>
                  <div className="relative">
                    <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.5" className="input pl-10" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Additional info</h2>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Meeting point, luggage, pet-friendly..." className="input pl-10 resize-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? 'Publishing...' : 'Publish ride'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
