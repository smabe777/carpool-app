import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import api from '../services/api'
import RideCard from '../components/RideCard'
import SearchForm from '../components/SearchForm'

export default function Rides() {
  const [searchParams] = useSearchParams()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const date = searchParams.get('date') || ''
  const seats = searchParams.get('seats') || 1

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (from) params.append('from', from)
        if (to) params.append('to', to)
        if (date) params.append('date', date)
        if (seats) params.append('seats', seats)
        const res = await api.get(`/rides?${params}`)
        setRides(res.data)
      } catch {
        setError('Failed to load rides. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchRides()
  }, [from, to, date, seats])

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <SearchForm initialValues={{ from, to, date, seats }} compact />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            {loading ? 'Searching...' : `${rides.length} ride${rides.length !== 1 ? 's' : ''} found${from && to ? ` · ${from} → ${to}` : ''}`}
          </h2>
          <button className="btn-ghost">
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-14 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card text-center py-12 text-red-500">{error}</div>
        ) : rides.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No rides found</h3>
            <p className="text-slate-500">Try different dates or destinations.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride, i) => <RideCard key={ride._id} ride={ride} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
