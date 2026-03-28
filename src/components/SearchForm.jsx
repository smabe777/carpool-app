import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-lg p-6 ${compact ? '' : 'max-w-2xl mx-auto'}`}>
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="text"
            name="from"
            value={form.from}
            onChange={handleChange}
            placeholder="Departure city"
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="text"
            name="to"
            value={form.to}
            onChange={handleChange}
            placeholder="Arrival city"
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
          <select name="seats" value={form.seats} onChange={handleChange} className="input">
            {[1,2,3,4,5,6].map(n => (
              <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className={`btn-primary w-full mt-4 ${compact ? '' : 'py-3 text-base'}`}>
        🔍 Search
      </button>
    </form>
  )
}
