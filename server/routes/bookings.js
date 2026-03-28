import { Router } from 'express'
import Booking from '../models/Booking.js'
import auth from '../middleware/auth.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({ path: 'ride', populate: { path: 'driver', select: 'name' } })
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    if (req.body.status === 'cancelled' && booking.status !== 'cancelled') {
      const Ride = (await import('../models/Ride.js')).default
      await Ride.findByIdAndUpdate(booking.ride, {
        $inc: { availableSeats: booking.seats },
        status: 'active'
      })
    }
    booking.status = req.body.status
    await booking.save()
    res.json(booking)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

export default router
