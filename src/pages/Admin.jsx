import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [places, setPlaces] = useState([])
  const [newPlace, setNewPlace] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/dashboard'); return }
    api.get('/admin/starting-places')
      .then(res => setPlaces(res.data))
      .catch(() => toast.error('Failed to load starting places'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newPlace.trim()) return
    setAdding(true)
    try {
      const res = await api.post('/admin/starting-places', { name: newPlace.trim() })
      setPlaces(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewPlace('')
      toast.success('Starting place added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/admin/starting-places/${id}`)
      setPlaces(prev => prev.filter(p => p._id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return (
    <div className="pt-24 flex justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
    </div>
  )

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Admin</h1>
              <p className="text-slate-500 text-sm">Manage starting places</p>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">Add a starting place</h2>
            <form onSubmit={handleAdd} className="flex gap-3">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
                <input
                  type="text"
                  value={newPlace}
                  onChange={e => setNewPlace(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="e.g. Central Station, North Parking"
                  required
                />
              </div>
              <button type="submit" disabled={adding} className="btn-primary gap-1.5 flex-shrink-0">
                <Plus size={15} /> Add
              </button>
            </form>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Starting places</h2>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{places.length}</span>
            </div>
            {places.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MapPin size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No starting places yet. Add one above.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {places.map(place => (
                  <li key={place._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={13} className="text-brand-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-800">{place.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(place._id, place.name)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
