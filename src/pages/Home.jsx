import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm w-full"
      >
        <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Car size={32} className="text-white" />
        </div>
        <h1 className="text-5xl font-black text-white mb-3">VibeCarpool</h1>
        <p className="text-white/60 text-lg mb-10">
          Coordinate your carpool rides, simply.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="bg-white text-brand-700 font-bold px-8 py-3 rounded-2xl hover:shadow-glow transition-all duration-200 hover:scale-105"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-white/10 backdrop-blur border border-white/20 text-white font-bold px-8 py-3 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
