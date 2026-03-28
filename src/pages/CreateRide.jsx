import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function CreateRide() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    from: '', to: '', date: '', departureTime: '', arrivalTime: '',
    seats: 1, price: '', description: '', duration: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/rides', form)
      navigate(`/rides/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ride. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Offer a ride</h1>
      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure city *</label>
              <input type="text" name="from" value={form.from} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival city *</label>
              <input type="text" name="to" value={form.to} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure time *</label>
              <input type="time" name="departureTime" value={form.departureTime} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated arrival time</label>
              <input type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input type="number" name="duration" value={form.duration} onChange={handleChange}
                min="0" step="0.5" placeholder="e.g. 2.5" className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available seats *</label>
              <select name="seats" value={form.seats} onChange={handleChange} className="input">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per person (€) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                min="0" step="0.5" className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Additional info, meeting point..." className="input resize-none" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Publishing...' : 'Publish ride'}
          </button>
        </form>
      </div>
    </div>
  )
}
