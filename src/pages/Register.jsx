import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Car } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Smith', icon: <User size={16} className="text-slate-400" /> },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: <Mail size={16} className="text-slate-400" /> },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 000 0000', icon: <Phone size={16} className="text-slate-400" /> },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', icon: <Lock size={16} className="text-slate-400" /> },
  ]

  return (
    <div className="min-h-screen pt-16 flex">
      <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-white max-w-md">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
            <Car size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">Join VibeCarpool today</h2>
          <p className="text-white/60 text-lg">Start saving money and meeting new people on every trip.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create an account</h1>
          <p className="text-slate-500 mb-8">It's free and takes less than a minute.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{f.icon}</span>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="input pl-10"
                    required
                    minLength={f.key === 'password' ? 6 : undefined}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
