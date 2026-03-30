import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { router as authRoutes } from './routes/auth.js'
import { router as rideRoutes } from './routes/rides.js'
import { router as bookingRoutes } from './routes/bookings.js'
import { router as adminRoutes } from './routes/admin.js'

dotenv.config()

let isConnected = false

async function connectDB() {
  if (isConnected) return
  await mongoose.connect(process.env.MONGODB_URI)
  isConnected = true
}

const app = express()

app.use(cors())
app.use(express.json())

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ message: 'Database connection error' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/rides', rideRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Erreur serveur' })
})

export { app }
export default app