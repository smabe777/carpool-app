import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already in use' })
    const user = await User.create({ name, email, password, phone })
    const token = signToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' })
    }
    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/me', auth, (req, res) => {
  res.json(req.user)
})

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

export default router
