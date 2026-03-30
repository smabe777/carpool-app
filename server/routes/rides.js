import { Router } from 'express'
import { Ride } from '../models/Ride.js'
import { Booking } from '../models/Booking.js'
import { User } from '../models/User.js'
import { auth } from '../middleware/auth.js'
import { sendNewPassengerEmail, sendRemovedFromRideEmail } from '../services/email.js'

const router = Router()

// All active rides (for passengers browsing)
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find({ status: { $in: ['active', 'full'] } })
      .populate('driver', 'name email phone')
      .sort({ createdAt: 1 })
    res.json(rides)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// My ride + passengers list (for driver dashboard)
router.get('/my', auth, async (req, res) => {
  try {
    const ride = await Ride.findOne({ driver: req.user._id, status: { $ne: 'cancelled' } })
    if (!ride) return res.json(null)
    const bookings = await Booking.find({ ride: ride._id, status: 'confirmed' })
      .populate('passenger', 'name email phone')
    res.json({ ride, passengers: bookings.map(b => ({ ...b.passenger.toObject(), bookingId: b._id })) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a ride
router.post('/', auth, async (req, res) => {
  try {
    const existing = await Ride.findOne({ driver: req.user._id, status: { $ne: 'cancelled' } })
    if (existing) return res.status(400).json({ message: 'You already have an active ride' })
    const { startingPlace, seats } = req.body
    const ride = await Ride.create({
      driver: req.user._id,
      startingPlace,
      seats: Number(seats),
      availableSeats: Number(seats),
    })
    res.status(201).json(ride)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Book a seat
router.post('/:id/book', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver', 'name email phone')
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    if (ride.driver._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot join your own ride' })
    }
    if (ride.availableSeats < 1) {
      return res.status(400).json({ message: 'No seats available' })
    }
    const existing = await Booking.findOne({ ride: ride._id, passenger: req.user._id, status: 'confirmed' })
    if (existing) return res.status(400).json({ message: 'You already have a seat in this ride' })

    const otherBooking = await Booking.findOne({ passenger: req.user._id, status: 'confirmed' })
    if (otherBooking) return res.status(400).json({ message: 'You already have a booking. Cancel it first.' })

    await Booking.create({ ride: ride._id, passenger: req.user._id, seats: 1, status: 'confirmed' })
    ride.availableSeats -= 1
    if (ride.availableSeats === 0) ride.status = 'full'
    await ride.save()

    // Email driver (awaited so it completes before Lambda freezes)
    const filledSeats = ride.seats - ride.availableSeats
    await sendNewPassengerEmail({
      to: ride.driver.email,
      driverName: ride.driver.name,
      passengerName: req.user.name,
      passengerEmail: req.user.email,
      passengerPhone: req.user.phone,
      startingPlace: ride.startingPlace,
      filledSeats,
      totalSeats: ride.seats,
    }).catch(err => console.error('Email error:', err.message))

    res.status(201).json({ message: 'Seat booked successfully' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Driver removes a passenger
router.delete('/:id/passengers/:bookingId', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const booking = await Booking.findById(req.params.bookingId)
      .populate('passenger', 'name email')
    if (!booking || booking.status !== 'confirmed') {
      return res.status(404).json({ message: 'Booking not found' })
    }

    booking.status = 'cancelled'
    booking.removedByDriver = true
    await booking.save()

    ride.availableSeats += 1
    if (ride.status === 'full') ride.status = 'active'
    await ride.save()

    // Email removed passenger
    await sendRemovedFromRideEmail({
      to: booking.passenger.email,
      passengerName: booking.passenger.name,
      driverName: req.user.name,
      startingPlace: ride.startingPlace,
    }).catch(err => console.error('Email error:', err.message))

    res.json({ message: 'Passenger removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Cancel my ride
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    ride.status = 'cancelled'
    await ride.save()
    await Booking.updateMany({ ride: ride._id }, { status: 'cancelled' })
    res.json({ message: 'Ride cancelled' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export { router }
