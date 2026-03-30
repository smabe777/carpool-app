import { Router } from 'express'
import { StartingPlace } from '../models/StartingPlace.js'
import { User } from '../models/User.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// One-time setup: makes the authenticated user admin if no admin exists yet
router.post('/setup', auth, async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ isAdmin: true })
    if (existingAdmin) return res.status(400).json({ message: 'An admin already exists' })
    await User.findByIdAndUpdate(req.user._id, { isAdmin: true })
    res.json({ message: 'You are now an admin' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// All routes require authentication + admin flag
const adminAuth = [auth, (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' })
  next()
}]

// List all starting places
router.get('/starting-places', async (req, res) => {
  try {
    const places = await StartingPlace.find().sort({ name: 1 })
    res.json(places)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add a starting place
router.post('/starting-places', adminAuth, async (req, res) => {
  try {
    const place = await StartingPlace.create({ name: req.body.name })
    res.status(201).json(place)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'This place already exists' })
    res.status(400).json({ message: err.message })
  }
})

// Delete a starting place
router.delete('/starting-places/:id', adminAuth, async (req, res) => {
  try {
    await StartingPlace.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export { router }
