import { Router } from 'express'
import { Booking } from '../models/Booking.js'
import { Ride } from '../models/Ride.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// Get my booking status: { booking, removedByDriver }
router.get('/', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ passenger: req.user._id, status: 'confirmed' })
      .populate({ path: 'ride', populate: { path: 'driver', select: 'name email phone' } })

    if (booking) return res.json({ booking, removedByDriver: false })

    // Check if most recent booking was cancelled by driver
    const last = await Booking.findOne({ passenger: req.user._id, status: 'cancelled', removedByDriver: true })
      .sort({ createdAt: -1 })
    res.json({ booking: null, removedByDriver: !!last })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Cancel my booking (self)
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    booking.status = 'cancelled'
    await booking.save()
    const ride = await Ride.findById(booking.ride)
    if (ride && ride.status !== 'cancelled') {
      ride.availableSeats += 1
      if (ride.status === 'full') ride.status = 'active'
      await ride.save()
    }
    res.json({ message: 'Booking cancelled' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export { router }
