import mongoose from 'mongoose'

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String },
  duration: { type: Number },
  seats: { type: Number, required: true, min: 1, max: 8 },
  availableSeats: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  status: { type: String, enum: ['active', 'full', 'cancelled', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
})

rideSchema.index({ from: 'text', to: 'text' })

export default mongoose.model('Ride', rideSchema)