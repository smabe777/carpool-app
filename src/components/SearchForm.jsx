import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SearchForm({ initialValues = {}, compact = false }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    from: initialValues.from || '',
    to: initialValues.to || '',
    date: initialValues.date || '',
    seats: initialValues.seats || 1,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(form)
    navigate(`/rides?${params}`)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" name="from" value={form.from} onChange={handleChange} placeholder="From" className="input pl-9" required />
          </div>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" name="to" value={form.to} onChange={handleChange} placeholder="To" className="input pl-9" required />
          </div>
          <div className="relative">
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="input pl-9" required />
          </div>
          <button type="submit" className="btn-primary w-full">
            <Search size={15} /> Search
          </button>
        </div>
      </form>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">From</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
            <input type="text" name="from" value={form.from} onChange={handleChange} placeholder="Departure city" className="input pl-10 text-base py-3" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">To</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500" />
            <input type="text" name="to" value={form.to} onChange={handleChange} placeholder="Arrival city" className="input pl-10 text-base py-3" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
            <input type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="input pl-10 text-base py-3" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Seats</label>
          <div className="relative">
            <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
            <select name="seats" value={form.seats} onChange={handleChange} className="input pl-10 text-base py-3">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
      </div>
      <button type="submit" onClick={handleSubmit} className="btn-primary w-full py-3.5 text-base">
        <Search size={18} /> Search rides
      </button>
    </motion.div>
  )
}
