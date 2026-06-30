import React, { useState } from 'react'
import {
  Calendar, Users, Award, Mail, Lock, Eye, EyeOff,
  ShieldCheck, Briefcase, GraduationCap, Wifi,
  X, KeyRound, CalendarDays
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import SignUpForm from './SignUpForm'

const ROLES = [
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: '#173dd1' },
  { id: 'organizer', label: 'Organizer', icon: Briefcase, color: '#ec4899' },
  { id: 'student', label: 'Student', icon: GraduationCap, color: '#14b8a6' },
]

const STATS = [
  { icon: CalendarDays, value: '247', label: 'Events' },
  { icon: Users, value: '12.4K', label: 'Students' },
  { icon: Award, value: '8.2K', label: 'Certificates' },
]

const TAGS = ['TechFest 2025', 'Cultural Fest', 'Hackathon 2025']

export default function LoginPage() {
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sign Up state
  const [isSignUp, setIsSignUp] = useState(false)

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Global auth & toast
  const { login } = useAuth()
  const showToast = useToast()

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      const res = await authService.forgotPassword(forgotEmail)
      if (res.success) {
        showToast(res.message || `Password reset link sent to ${forgotEmail}`, 'success')
        setForgotOpen(false)
        setForgotEmail('')
      } else {
        showToast(res.message || 'Failed to send password reset link.', 'error')
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await authService.login(email, password, role)
      if (result.success) {
        login(result.user, result.token)
        showToast(`Welcome back, ${result.user.name}!`, 'success')
      } else {
        showToast(result.message || 'Login failed. Please try again.', 'error')
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex font-['Inter',sans-serif]">

        {/* ── LEFT PANEL ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[680px] shrink-0 p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 45%, #7c3aed 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <div className="absolute bottom-10 -right-16 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">EventHub</p>
                <p className="text-white/60 text-[11px] font-medium">University Platform</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="relative z-10 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label}
                  className="rounded-2xl p-4 flex flex-col items-center gap-1 text-center"
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
                >
                  <Icon size={20} className="text-white/70 mb-1" />
                  <p className="text-white font-black text-xl leading-none">{value}</p>
                  <p className="text-white/60 text-[11px] font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-white font-black text-3xl leading-tight mb-3">
                Manage Campus Events<br />Like Never Before
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">
                A complete event management platform for registrations, QR attendance,
                analytics, and certificate generation — all in one place.
              </p>
            </div>
          </div>

          {/* Bottom tags + wifi */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <span key={tag}
                  className="text-[11px] font-semibold text-white/80 px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Wifi size={16} className="text-white/40" />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-[420px]">
            {isSignUp ? (
              <SignUpForm
                onSwitchToSignIn={() => setIsSignUp(false)}
                onSignUpSuccess={(newEmail) => {
                  setEmail(newEmail)
                  setPassword('')
                  setIsSignUp(false)
                }}
              />
            ) : (
              <>
                {/* Heading */}
                <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
                <p className="text-sm text-slate-500 mb-8">Sign in to your account to continue</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {/* Role tabs */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
                      Select Role
                    </label>
                    <div className="flex gap-2">
                      {ROLES.map(({ id, label, icon: Icon, color }) => {
                        const active = role === id
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setRole(id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border"
                            style={active
                              ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 4px 14px ${color}40` }
                              : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
                            }
                          >
                            <Icon size={13} />
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="admin@university.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400
                        focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400
                        focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={e => setRemember(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600"
                      />
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-sm text-indigo-600 font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: loading
                        ? '#a5b4fc'
                        : 'linear-gradient(90deg, #4f46e5, #6d28d9)',
                      boxShadow: loading ? 'none' : '0 4px 18px rgba(99,102,241,0.35)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Signing in…
                      </span>
                    ) : 'Sign In'}
                  </button>

                  {/* Sign up link */}
                  <p className="text-sm text-slate-500 text-center">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-indigo-600 font-semibold bg-transparent border-none hover:underline cursor-pointer p-0 align-baseline"
                    >
                      Sign up
                    </button>
                  </p>

                </form>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setForgotOpen(false)}
          />

          {/* Modal card */}
          <div
            className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8"
            style={{ animation: 'modalIn .25s ease' }}
          >
            {/* Close */}
            <button
              onClick={() => setForgotOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
              <KeyRound size={22} className="text-indigo-600" />
            </div>

            <h2 className="text-xl font-black text-slate-900 mb-1">Forgot Password?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700
                  placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200"
                style={{
                  background: forgotLoading ? '#a5b4fc' : 'linear-gradient(90deg,#4f46e5,#6d28d9)',
                  boxShadow: forgotLoading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                }}
              >
                {forgotLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending…
                  </span>
                ) : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-700 text-center transition-colors"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Keyframe styles */}
      <style>{`
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.92) translateY(16px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
      }
    `}</style>

    </>
  )
}
