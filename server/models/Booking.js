import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seats: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'confirmed' },
  removedByDriver: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const _model = mongoose.model('Booking', bookingSchema)
export { _model as Booking }
export default _model