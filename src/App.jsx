import React from 'react'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import StudentDashboard from './pages/Student/StudentDashboard'

/**
 * Router — simple role-based conditional render.
 * Replace with react-router-dom when routes grow.
 */
function AppRouter() {
  const { isLoggedIn, user } = useAuth()

  if (!isLoggedIn) return <LoginPage />

  // Role-based dashboard routing
  if (user?.role === 'admin')     return <AdminDashboard />
  if (user?.role === 'student')   return <StudentDashboard />
  // if (user?.role === 'organizer') return <OrganizerDashboard />

  // Fallback
  return <LoginPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}