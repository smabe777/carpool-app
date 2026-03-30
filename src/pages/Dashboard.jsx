import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Users, MapPin, Phone, Mail, RefreshCw, ArrowLeft, ChevronDown, UserX, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [myRide, setMyRide] = useState(null)
  const [myBooking, setMyBooking] = useState(null)
  const [wasRemoved, setWasRemoved] = useState(false)
  const [allRides, setAllRides] = useState([])
  const [startingPlaces, setStartingPlaces] = useState([])
  const [view, setView] = useState('loading')
  const [form, setForm] = useState({ startingPlace: '', seats: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showFullList, setShowFullList] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const [rideRes, bookingRes, placesRes] = await Promise.all([
        api.get('/rides/my'),
        api.get('/bookings'),
        api.get('/admin/starting-places'),
      ])
      setMyRide(rideRes.data)
      const { booking, removedByDriver } = bookingRes.data
      setMyBooking(booking)
      setWasRemoved(removedByDriver)
      setStartingPlaces(placesRes.data)
      if (rideRes.data) setView('driver')
      else if (booking) setView('booked')
      else setView('select')
    } catch {
      setView('select')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const fetchAllRides = async () => {
    try {
      const res = await api.get('/rides')
      setAllRides(res.data)
      setView('pick-place')
    } catch {
      toast.error('Failed to load rides')
    }
  }

  const refreshRides = async () => {
    setRefreshing(true)
    try {
      const res = await api.get('/rides')
      setAllRides(res.data)
    } finally {
      setRefreshing(false)
    }
  }

  // All admin-defined starting places (show all, even if full)
  const availablePlaces = startingPlaces.map(p => p.name).sort()

  const refreshDriverView = async () => {
    setRefreshing(true)
    try {
      const res = await api.get('/rides/my')
      setMyRide(res.data)
    } finally {
      setRefreshing(false)
    }
  }

  const handleOffer = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/rides', form)
      const res = await api.get('/rides/my')
      setMyRide(res.data)
      setView('driver')
      toast.success('Ride published!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish ride')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async (rideId) => {
    try {
      await api.post(`/rides/${rideId}/book`)
      const res = await api.get('/bookings')
      setMyBooking(res.data.booking)
      setWasRemoved(false)
      setView('booked')
      toast.success('You joined the ride!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join ride')
    }
  }

  const handleCancelRide = async () => {
    if (!window.confirm('Cancel your ride? All passengers will lose their seat.')) return
    try {
      await api.delete(`/rides/${myRide.ride._id}`)
      setMyRide(null)
      setView('select')
      toast.success('Ride cancelled')
    } catch {
      toast.error('Failed to cancel ride')
    }
  }

  const handleCancelBooking = async () => {
    if (!window.confirm('Cancel your booking?')) return
    try {
      await api.delete(`/bookings/${myBooking._id}`)
      setMyBooking(null)
      setView('select')
      toast.success('Booking cancelled')
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  const handleRemovePassenger = async (rideId, bookingId, passengerName) => {
    if (!window.confirm(`Remove ${passengerName} from your ride?`)) return
    setRemovingId(bookingId)
    try {
      await api.delete(`/rides/${rideId}/passengers/${bookingId}`)
      const res = await api.get('/rides/my')
      setMyRide(res.data)
      toast.success(`${passengerName} has been removed and notified by email`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove passenger')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) return (
    <div className="pt-24 flex justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
    </div>
  )

  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Hello, {firstName}!</h1>
          <p className="text-slate-500 mt-1">VibeCarpool — your ride coordinator</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── ROLE SELECTOR ── */}
          {view === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {wasRemoved && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-5">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-sm">You were removed from a ride</p>
                    <p className="text-sm mt-0.5">The driver removed you from their carpool. Please select a new ride below.</p>
                  </div>
                </div>
              )}
              <p className="text-slate-600 mb-6 font-medium">What are you doing today?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setView('offer')}
                  className="card hover:shadow-card-hover transition-all text-left group cursor-pointer border-2 border-transparent hover:border-brand-200"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Car size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Offer a ride</h3>
                  <p className="text-sm text-slate-500">I'm driving and have extra seats</p>
                </button>
                <button
                  onClick={fetchAllRides}
                  className="card hover:shadow-card-hover transition-all text-left group cursor-pointer border-2 border-transparent hover:border-purple-200"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users size={22} className="text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Take a ride</h3>
                  <p className="text-sm text-slate-500">I'm looking for a seat</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── OFFER FORM ── */}
          {view === 'offer' && (
            <motion.div key="offer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setView('select')} className="btn-ghost mb-6 -ml-2">
                <ArrowLeft size={15} /> Back
              </button>
              <div className="card">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Offer your ride</h2>
                <form onSubmit={handleOffer} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your starting place</label>
                    {startingPlaces.length > 0 ? (
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                          value={form.startingPlace}
                          onChange={e => setForm(p => ({ ...p, startingPlace: e.target.value }))}
                          className="input pl-10 pr-8 appearance-none w-full"
                          required
                        >
                          <option value="">Select a starting place...</option>
                          {startingPlaces.map(p => (
                            <option key={p._id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
                        <input
                          type="text"
                          value={form.startingPlace}
                          onChange={e => setForm(p => ({ ...p, startingPlace: e.target.value }))}
                          className="input pl-10"
                          placeholder="e.g. Central Station"
                          required
                        />
                      </div>
                    )}
                    {startingPlaces.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1">No preset locations yet — ask an admin to add them.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Extra seats available</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, seats: n }))}
                          className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${
                            form.seats === n
                              ? 'bg-brand-600 text-white shadow-glow scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base mt-2">
                    {submitting ? 'Publishing...' : 'Publish my ride'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── DRIVER VIEW ── */}
          {view === 'driver' && myRide && (
            <motion.div key="driver" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Your ride</h2>
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-lg">
                      <MapPin size={16} className="text-brand-500 flex-shrink-0" />
                      {myRide.ride.startingPlace}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-black text-brand-600">{myRide.ride.availableSeats}</div>
                    <div className="text-xs text-slate-400">seats left</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Users size={13} />
                  <span>{myRide.ride.seats - myRide.ride.availableSeats} / {myRide.ride.seats} seats filled</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full ml-1 overflow-hidden">
                    <div
                      className="h-full bg-brand-gradient rounded-full transition-all"
                      style={{ width: `${((myRide.ride.seats - myRide.ride.availableSeats) / myRide.ride.seats) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">
                    Passengers
                    <span className="ml-2 text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-medium">
                      {myRide.passengers.length}
                    </span>
                  </h3>
                  <button onClick={refreshDriverView} disabled={refreshing} className="btn-ghost text-xs gap-1.5">
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
                {myRide.passengers.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No passengers yet — share your ride!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myRide.passengers.map(p => (
                      <div key={p._id} className="py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {p.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-900 truncate block">{p.name}</span>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <a href={`mailto:${p.email}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                              <Mail size={11} />{p.email}
                            </a>
                            <a href={`tel:${p.phone}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                              <Phone size={11} />{p.phone}
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePassenger(myRide.ride._id, p.bookingId, p.name)}
                          disabled={removingId === p.bookingId}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40 px-2 py-1 rounded-lg hover:bg-red-50"
                          title="Remove passenger"
                        >
                          <UserX size={14} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleCancelRide} className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
                Cancel my ride
              </button>
            </motion.div>
          )}

          {/* ── PASSENGER: BOOKED VIEW ── */}
          {view === 'booked' && myBooking && (
            <motion.div key="booked" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="card">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Your ride</h2>
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-black shadow-glow">
                    {myBooking.ride.driver.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{myBooking.ride.driver.name}</div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                      <MapPin size={12} />
                      <span>{myBooking.ride.startingPlace}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href={`mailto:${myBooking.ride.driver.email}`}
                    className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-brand-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={13} />
                    </div>
                    {myBooking.ride.driver.email}
                  </a>
                  <a
                    href={`tel:${myBooking.ride.driver.phone}`}
                    className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-brand-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Phone size={13} />
                    </div>
                    {myBooking.ride.driver.phone}
                  </a>
                </div>
              </div>
              <button onClick={handleCancelBooking} className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
                Cancel my booking
              </button>
            </motion.div>
          )}

          {/* ── PICK STARTING PLACE ── */}
          {view === 'pick-place' && (
            <motion.div key="pick-place" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setView('select')} className="btn-ghost mb-6 -ml-2">
                <ArrowLeft size={15} /> Back
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Where are you departing from?</h2>
              <p className="text-slate-500 text-sm mb-6">Choose your starting point to see available cars.</p>
              {availablePlaces.length === 0 ? (
                <div className="card text-center py-14">
                  <MapPin size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-600 mb-1">No starting places defined yet</p>
                  <p className="text-sm text-slate-400">Ask an admin to add starting locations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availablePlaces.map(place => {
                    const ridesHere = allRides.filter(r => r.startingPlace === place)
                    const available = ridesHere.filter(r => r.availableSeats > 0).length
                    const total = ridesHere.length
                    const isFull = total > 0 && available === 0
                    const hasNone = total === 0
                    return (
                      <button
                        key={place}
                        onClick={() => { setSelectedPlace(place); setShowFullList(false); setView('browse') }}
                        className="card hover:shadow-card-hover transition-all text-left group cursor-pointer border-2 border-transparent hover:border-brand-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${isFull ? 'bg-red-100' : 'bg-brand-100'}`}>
                            <MapPin size={18} className={isFull ? 'text-red-500' : 'text-brand-600'} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{place}</div>
                            <div className={`text-xs mt-0.5 ${isFull ? 'text-red-500' : hasNone ? 'text-slate-400' : 'text-emerald-600'}`}>
                              {hasNone
                                ? 'No cars registered yet'
                                : isFull
                                ? `All ${total} car${total !== 1 ? 's' : ''} full`
                                : `${available} of ${total} car${total !== 1 ? 's' : ''} with seats`}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── BROWSE RIDES (PASSENGER VIEW) ── */}
          {view === 'browse' && (
            <motion.div key="browse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('pick-place')} className="btn-ghost -ml-2">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <span className="text-slate-400">|</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <MapPin size={13} className="text-brand-500" />
                    {selectedPlace}
                  </div>
                </div>
                <button onClick={refreshRides} disabled={refreshing} className="btn-ghost text-xs gap-1.5">
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {(() => {
                const filtered = allRides.filter(r => r.startingPlace === selectedPlace)
                const anyAvailable = filtered.some(r => r.availableSeats > 0)
                if (filtered.length === 0) return (
                  <div className="card text-center py-14">
                    <Car size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600 mb-1">No cars registered from here yet</p>
                    <p className="text-sm text-slate-400">Check back soon — drivers are still signing up.</p>
                  </div>
                )
                if (!anyAvailable && !showFullList) return (
                  <div className="card text-center py-14">
                    <Car size={32} className="mx-auto mb-3 text-red-300" />
                    <p className="font-medium text-slate-600 mb-1">All {filtered.length} car{filtered.length !== 1 ? 's' : ''} from {selectedPlace} {filtered.length !== 1 ? 'are' : 'is'} full</p>
                    <p className="text-sm text-slate-400 mb-4">No seats available at the moment. Check back later.</p>
                    <button
                      onClick={() => setShowFullList(true)}
                      className="text-sm text-brand-600 font-semibold hover:underline"
                    >
                      See cars composition
                    </button>
                  </div>
                )
                return (
                  <div className="space-y-3">
                  {!anyAvailable && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
                      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-sm">All cars are currently full</p>
                        <p className="text-sm mt-0.5">No seats available from {selectedPlace} at the moment. Check back later.</p>
                      </div>
                    </div>
                  )}
                  <div className="card p-0 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                          <th className="text-left px-4 py-3 font-semibold">Driver</th>
                          <th className="text-center px-4 py-3 font-semibold">Seats</th>
                          <th className="px-4 py-3 w-20" />
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((ride) => {
                          const filled = ride.seats - ride.availableSeats
                          const isFull = ride.availableSeats === 0
                          return (
                            <tr
                              key={ride._id}
                              className={`border-b border-slate-50 last:border-0 transition-colors ${isFull ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}
                            >
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {ride.driver.name[0].toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-900">{ride.driver.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <div className="inline-flex flex-col items-center gap-1">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {filled}/{ride.seats}
                                  </span>
                                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-emerald-400'}`}
                                      style={{ width: `${(filled / ride.seats) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                {!isFull && (
                                  <button
                                    onClick={() => handleJoin(ride._id)}
                                    className="btn-primary text-xs py-1.5 px-3"
                                  >
                                    Join
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  </div>
                )
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
