import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchForm initialValues={{ from, to, date, seats }} compact />
      </div>

      <h2 className="text-xl font-bold mb-4">
        {rides.length} ride{rides.length !== 1 ? 's' : ''} available
        {from && to && ` · ${from} → ${to}`}
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : rides.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No rides found for this search.</p>
          <p className="text-gray-400 mt-2">Try different dates or destinations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map(ride => <RideCard key={ride._id} ride={ride} />)}
        </div>
      )}
    </div>
  )
}
