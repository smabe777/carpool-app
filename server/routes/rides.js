import { Router } from 'express'
import Ride from '../models/Ride.js'
import auth from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { from, to, date, seats } = req.query
    const query = { status: 'active', date: { $gte: new Date() } }

    if (from) query.from = new RegExp(from, 'i')
    if (to) query.to = new RegExp(to, 'i')
    if (date) {
      const d = new Date(date)
      const next = new Date(date)
      next.setDate(next.getDate() + 1)
      query.date = { $gte: d, $lt: next }
    }
    if (seats) query.availableSeats = { $gte: Number(seats) }

    const rides = await Ride.find(query).populate('driver', 'name phone').sort({ date: 1, departureTime: 1 })
    res.json(rides)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/my', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id }).sort({ date: -1 })
    res.json(rides)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver', 'name phone email')
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    res.json(ride)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { from, to, date, departureTime, arrivalTime, seats, price, description, duration } = req.body
    const ride = await Ride.create({
      driver: req.user._id, from, to, date, departureTime, arrivalTime,
      seats: Number(seats), availableSeats: Number(seats),
      price: Number(price), description,
      duration: duration ? Number(duration) : undefined
    })
    res.status(201).json(ride)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.post('/:id/book', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own ride' })
    }
    const requestedSeats = Number(req.body.seats) || 1
    if (ride.availableSeats < requestedSeats) {
      return res.status(400).json({ message: 'Not enough seats available' })
    }
    const Booking = (await import('../models/Booking.js')).default
    const booking = await Booking.create({ ride: ride._id, passenger: req.user._id, seats: requestedSeats })
    ride.availableSeats -= requestedSeats
    if (ride.availableSeats === 0) ride.status = 'full'
    await ride.save()
    res.status(201).json(booking)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    ride.status = 'cancelled'
    await ride.save()
    res.json({ message: 'Ride cancelled' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
