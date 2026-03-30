import { Router } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/User.js'
import { auth } from '../middleware/auth.js'
import { sendPasswordResetEmail } from '../services/email.js'

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

router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() })
    // Always respond OK to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })
    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save({ validateBeforeSave: false })
    const resetUrl = `https://vibe-carpool.netlify.app/reset-password?token=${token}`
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl })
    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' })
    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()
    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export { router }
