import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

export default function RideCard({ ride }) {
  const date = new Date(ride.date)

  return (
    <Link to={`/rides/${ride._id}`} className="card hover:shadow-md transition-shadow block">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{ride.departureTime}</div>
              <div className="text-sm text-gray-500">{ride.from}</div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="mx-2 text-gray-400 text-sm">
                {ride.duration || '~'}h
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{ride.arrivalTime || '?'}</div>
              <div className="text-sm text-gray-500">{ride.to}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📅 {format(date, 'dd MMM yyyy', { locale: enUS })}</span>
            <span>💺 {ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''}</span>
            <span className="flex items-center space-x-1">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                {ride.driver?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span>{ride.driver?.name || 'Driver'}</span>
            </span>
          </div>
        </div>

        <div className="ml-6 text-right">
          <div className="text-2xl font-bold text-primary-600">{ride.price}€</div>
          <div className="text-xs text-gray-400">per person</div>
        </div>
      </div>
    </Link>
  )
}
