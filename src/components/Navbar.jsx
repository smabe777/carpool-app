import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false) }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isHome = location.pathname === '/'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isHome
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Car size={16} className="text-white" />
            </div>
            <span className={`text-lg font-bold transition-colors ${scrolled || !isHome ? 'text-slate-900' : 'text-white'}`}>
              VibeCarpoo<span className="text-brand-400">l</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    scrolled || !isHome ? 'text-slate-600 hover:text-brand-600 hover:bg-brand-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(p => !p)}
                    className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
                  >
                    {user.name[0].toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">
                            <User size={15} /> My profile
                          </Link>
                          {user.isAdmin && (
                            <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">
                              <Shield size={15} /> Admin
                            </Link>
                          )}
                          <hr className="my-1 border-slate-100" />
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl">
                            <LogOut size={15} /> Log out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled || !isHome ? 'text-slate-600 hover:text-brand-600 hover:bg-brand-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}>Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled || !isHome ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
            onClick={() => setMenuOpen(p => !p)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">Dashboard</Link>
                  <Link to="/profile" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">My profile</Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">Log in</Link>
                  <Link to="/register" className="block px-3 py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-xl">Sign up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
