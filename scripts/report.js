import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

const userSchema = new mongoose.Schema({
  name: String, email: String, phone: String, isAdmin: Boolean,
  password: { type: String, select: false },
})
const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startingPlace: String, seats: Number, availableSeats: Number, status: String,
})
const bookingSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  status: String,
})

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Ride = mongoose.models.Ride || mongoose.model('Ride', rideSchema)
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

await mongoose.connect(process.env.MONGODB_URI)

const rides = await Ride.find({ 'driver.email': { $regex: /testcarpool/ } }).lean()
// Get all test users
const testUsers = await User.find({ email: { $regex: /testcarpool/ } }).lean()
const testUserIds = new Set(testUsers.map(u => u._id.toString()))

const testDrivers = await User.find({ email: { $regex: /d\d+@testcarpool/ } }).lean()
const testPassengers = await User.find({ email: { $regex: /p\d+@testcarpool/ } }).lean()

// Get rides for test drivers
const driverIds = testDrivers.map(d => d._id)
const testRides = await Ride.find({ driver: { $in: driverIds } }).lean()
const rideMap = {}
for (const r of testRides) rideMap[r._id.toString()] = r

// Get bookings involving test passengers
const passengerIds = testPassengers.map(p => p._id)
const testBookings = await Booking.find({
  passenger: { $in: passengerIds },
  status: 'confirmed',
}).lean()

// Build passenger -> ride mapping
const passengerRide = {}
for (const b of testBookings) {
  passengerRide[b.passenger.toString()] = b.ride.toString()
}

// Build ride -> passengers mapping
const ridePassengers = {}
for (const b of testBookings) {
  const rId = b.ride.toString()
  if (!ridePassengers[rId]) ridePassengers[rId] = []
  ridePassengers[rId].push(b.passenger.toString())
}

const userById = {}
for (const u of testUsers) userById[u._id.toString()] = u

const lines = []
const pw = 'Pass1234'

lines.push('='.repeat(80))
lines.push('SIMULATION REPORT — CARPOOL APP')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push(`Password for all accounts: ${pw}`)
lines.push('='.repeat(80))
lines.push('')

lines.push('─'.repeat(80))
lines.push(`DRIVERS (${testRides.length} rides)`)
lines.push('─'.repeat(80))

for (const ride of testRides.sort((a, b) => a.startingPlace.localeCompare(b.startingPlace))) {
  const driver = userById[ride.driver.toString()]
  const pIds = ridePassengers[ride._id.toString()] || []
  const filled = ride.seats - ride.availableSeats
  lines.push(``)
  lines.push(`Driver : ${driver.name}`)
  lines.push(`Email  : ${driver.email}`)
  lines.push(`Phone  : ${driver.phone}`)
  lines.push(`From   : ${ride.startingPlace}`)
  lines.push(`Seats  : ${filled}/${ride.seats} filled  [${ride.status}]`)
  if (pIds.length > 0) {
    lines.push(`Passengers:`)
    for (const pid of pIds) {
      const p = userById[pid]
      lines.push(`  • ${p?.name} | ${p?.email} | ${p?.phone}`)
    }
  } else {
    lines.push(`Passengers: (none)`)
  }
}

lines.push('')
lines.push('─'.repeat(80))
lines.push(`PASSENGERS (${testPassengers.length} people)`)
lines.push('─'.repeat(80))

let stranded = 0
for (const p of testPassengers.sort((a, b) => a.name.localeCompare(b.name))) {
  const rideId = passengerRide[p._id.toString()]
  const ride = rideId ? rideMap[rideId] : null
  const driver = ride ? userById[ride.driver.toString()] : null
  const status = ride ? `In car of ${driver?.name} | From: ${ride.startingPlace}` : 'STRANDED — no ride'
  if (!ride) stranded++
  lines.push(`${p.name.padEnd(30)} ${p.email.padEnd(35)} ${p.phone}  →  ${status}`)
}

lines.push('')
lines.push('='.repeat(80))
lines.push('SUMMARY')
lines.push('='.repeat(80))
const totalSeats = testRides.reduce((s, r) => s + r.seats, 0)
const bookedSeats = testBookings.length
lines.push(`Drivers   : ${testDrivers.length}`)
lines.push(`Passengers: ${testPassengers.length}`)
lines.push(`Total seats offered: ${totalSeats}`)
lines.push(`Seats booked: ${bookedSeats}`)
lines.push(`Stranded: ${stranded}`)
lines.push('='.repeat(80))

const report = lines.join('\n')
console.log(report)

const outPath = join(__dirname, '../simulation-report.txt')
fs.writeFileSync(outPath, report, 'utf8')
console.log(`\nReport saved to: ${outPath}`)

await mongoose.disconnect()
