import mongoose from 'mongoose'

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingPlace: { type: String, required: true, trim: true },
  seats: { type: Number, required: true, min: 1, max: 8 },
  availableSeats: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['active', 'full', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
})

const _model = mongoose.model('Ride', rideSchema)
export { _model as Ride }
export default _model
