import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Car, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''

  const [form, setForm] = useState({ email: emailFromUrl, password: '' })
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState(emailFromUrl)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(location.state?.from || '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-white max-w-md"
        >
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
            <Car size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">Welcome back to VibeCarpool</h2>
          <p className="text-white/60 text-lg">Your next ride is just a few clicks away.</p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">

          {/* Forgot password form */}
          {showForgot ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false) }}
                className="btn-ghost mb-6 -ml-2"
              >
                <ArrowLeft size={15} /> Back to login
              </button>
              {forgotSent ? (
                <div className="card text-center py-10">
                  <div className="text-4xl mb-4">📬</div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
                  <p className="text-slate-500 text-sm">
                    If <strong>{forgotEmail}</strong> is registered, you'll receive a reset link shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Forgot password?</h1>
                  <p className="text-slate-500 mb-8">Enter your email and we'll send you a reset link.</p>
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          className="input pl-10"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={forgotLoading} className="btn-primary w-full py-3 text-base">
                      {forgotLoading ? 'Sending...' : 'Send reset link'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          ) : (

          /* Login form */
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl font-black text-slate-900 mb-2">Log in</h1>
            <p className="text-slate-500 mb-8">Enter your credentials to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input pl-10" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(form.email); setShowForgot(true) }}
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input pl-10" placeholder="••••••••" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500">
              No account yet?{' '}
              <Link to="/register" className="text-brand-600 font-semibold hover:underline">Sign up</Link>
            </p>
          </motion.div>

          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
