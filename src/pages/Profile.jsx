import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Edit3, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Profile() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', form)
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 mb-8">My profile</h1>

          <div className="card">
            {/* Avatar */}
            <div className="flex items-center gap-5 pb-6 mb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-3xl font-black shadow-glow">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-slate-500 text-sm">{user?.email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input pl-10" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="btn-primary gap-1.5"><Check size={15} /> Save</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary gap-1.5"><X size={15} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {[
                    { icon: <Mail size={15} />, label: 'Email', value: user?.email },
                    { icon: <Phone size={15} />, label: 'Phone', value: user?.phone || 'Not provided' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        {row.icon} {row.label}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{row.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setEditing(true)} className="btn-secondary gap-1.5">
                  <Edit3 size={15} /> Edit profile
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
