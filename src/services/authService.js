/**
 * authService.js
 * ─────────────────────────────────────────────────────────
 * Toggle between Mock (JSON) and Real API via .env:
 *
 *   VITE_USE_MOCK=true   →  reads from src/data/users.json
 *   VITE_USE_MOCK=false  →  calls VITE_API_BASE_URL/auth/login
 *
 * Usage:
 *   const result = await authService.login(email, password, role)
 *   // result: { success, user, token, message }
 */

import users from '../data/users.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/* ── MOCK LOGIN ─────────────────────────────────────────── */
async function mockLogin(email, password, role) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 900))

  const user = users.find(
    u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.role === role
  )

  if (!user) {
    return { success: false, message: 'Invalid email, password, or role.' }
  }

  // Strip password before storing
  const { password: _pwd, ...safeUser } = user

  // Fake JWT-like token
  const token = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }))

  return { success: true, user: safeUser, token }
}

/* ── REAL API LOGIN ─────────────────────────────────────── */
async function apiLogin(email, password, role) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, message: data.message || 'Login failed.' }
    }

    return { success: true, user: data.user, token: data.token }
  } catch {
    return { success: false, message: 'Unable to reach server. Check your connection.' }
  }
}

/* ── PUBLIC API ─────────────────────────────────────────── */
const authService = {
  /**
   * @param {string} email
   * @param {string} password
   * @param {string} role  'admin' | 'organizer' | 'student'
   * @returns {Promise<{ success: boolean, user?: object, token?: string, message?: string }>}
   */
  login: (email, password, role) =>
    USE_MOCK ? mockLogin(email, password, role) : apiLogin(email, password, role),
}

export default authService
