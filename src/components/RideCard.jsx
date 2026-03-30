import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

export default function RideCard({ ride, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/rides/${ride._id}`} className="block group">
        <div className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            {/* Route */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">{ride.departureTime}</span>
                  <span className="font-medium text-slate-800 truncate">{ride.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{ride.arrivalTime || '—'}</span>
                  <span className="font-medium text-slate-800 truncate">{ride.to}</span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-6 ml-4">
              <div className="hidden sm:flex flex-col gap-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{format(new Date(ride.date), 'dd MMM', { locale: enUS })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={12} />
                  <span>{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                  {ride.driver?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="hidden sm:block text-xs text-slate-500">{ride.driver?.name?.split(' ')[0]}</span>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-brand-600">{ride.price}€</div>
                <div className="text-xs text-slate-400">per person</div>
              </div>

              <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
