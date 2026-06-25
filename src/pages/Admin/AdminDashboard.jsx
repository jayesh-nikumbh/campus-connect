import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import {
  LayoutDashboard, Calendar, ClipboardList, UserCheck,
  BarChart2, Award, Users, Briefcase, Bell, Database,
  Settings, LogOut, Search, Moon, Sun, MessageSquare,
  ChevronRight, ChevronLeft, TrendingUp, Plus,
  QrCode, Megaphone, Download, ChevronDown, GraduationCap,
  MapPin, Clock, UserPlus, CheckSquare, FileText,
  SendHorizonal, XCircle, ExternalLink
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

/* ── Brand ─────────────────────────────────────────────── */
const BRAND = '#173dd1'

/* ── Sidebar nav items ─────────────────────────────────── */
const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Calendar, label: 'Events' },
  { icon: ClipboardList, label: 'Registrations' },
  { icon: UserCheck, label: 'Attendance' },
  { icon: BarChart2, label: 'Analytics' },
  { icon: Award, label: 'Certificates' },
  { icon: Users, label: 'Students' },
  { icon: Briefcase, label: 'Organizers' },
  { icon: Bell, label: 'Notifications', badge: 2 },
  { icon: Database, label: 'DB Design' },
  { icon: Settings, label: 'Settings' },
]

/* ── Stats cards ───────────────────────────────────────── */
const STATS = [
  { label: 'Total Events', value: '247', delta: '+18', icon: Calendar, iconBg: '#eff3ff', iconBgDark: '#1e2a5e', iconColor: '#4f46e5' },
  { label: 'Total Students', value: '12,483', delta: '+342', icon: Users, iconBg: '#f0fdf4', iconBgDark: '#14452f', iconColor: '#16a34a' },
  { label: 'Registrations', value: '38,291', delta: '+2,140', icon: ClipboardList, iconBg: '#fff7ed', iconBgDark: '#431407', iconColor: '#ea580c' },
  { label: 'Avg Attendance', value: '89%', delta: '+2%', icon: UserCheck, iconBg: '#fdf4ff', iconBgDark: '#3b0764', iconColor: '#a21caf' },
  { label: 'Upcoming Events', value: '32', delta: '+5', icon: Calendar, iconBg: '#f0f9ff', iconBgDark: '#082f49', iconColor: '#0284c7' },
  { label: 'Certificates', value: '8,214', delta: '+631', icon: Award, iconBg: '#fff1f2', iconBgDark: '#4c0519', iconColor: '#e11d48' },
]

/* ── Chart data ────────────────────────────────────────── */
const CHART_DATA = [
  { month: 'Jan', registrations: 280, attendance: 60 },
  { month: 'Feb', registrations: 420, attendance: 65 },
  { month: 'Mar', registrations: 510, attendance: 70 },
  { month: 'Apr', registrations: 390, attendance: 62 },
  { month: 'May', registrations: 640, attendance: 75 },
  { month: 'Jun', registrations: 720, attendance: 80 },
  { month: 'Jul', registrations: 850, attendance: 88 },
  { month: 'Aug', registrations: 780, attendance: 85 },
]

const DEPT_DATA = [
  { name: 'CSE', value: 35, color: '#4f46e5' },
  { name: 'ME', value: 15, color: '#16a34a' },
  { name: 'MBA', value: 10, color: '#e11d48' },
  { name: 'ECE', value: 22, color: '#0284c7' },
  { name: 'EEE', value: 12, color: '#d97706' },
  { name: 'Civil', value: 6, color: '#7c3aed' },
]

/* ── Upcoming Events ───────────────────────────────────── */
const UPCOMING_EVENTS = [
  { id: 1, month: 'AUG', day: '15', title: 'TechFest 2025', venue: 'Main Auditorium', time: '09:00', registered: 425, capacity: 500, color: '#4f46e5' },
  { id: 2, month: 'JUL', day: '22', title: 'Annual Cultural Fest', venue: 'Open Air Theatre', time: '18:00', registered: 876, capacity: 1000, color: '#7c3aed' },
  { id: 3, month: 'SEP', day: '5', title: 'Sports Meet 2025', venue: 'University Grounds', time: '07:00', registered: 612, capacity: 800, color: '#e11d48' },
]

/* ── Recent Activity ───────────────────────────────────── */
const RECENT_ACTIVITY = [
  { id: 1, icon: UserPlus, text: 'Arjun Patel registered for TechFest 2025', time: '2 min ago', iconColor: '#4f46e5' },
  { id: 2, icon: CheckSquare, text: 'Attendance marked for National Hackathon (198/200)', time: '15 min ago', iconColor: '#16a34a' },
  { id: 3, icon: Calendar, text: 'Sports Meet 2025 published by Dr. Kavitha Reddy', time: '1 hr ago', iconColor: '#0284c7' },
  { id: 4, icon: Award, text: '143 certificates generated for Research Symposium', time: '3 hr ago', iconColor: '#d97706' },
  { id: 5, icon: SendHorizonal, text: 'Bulk notification sent to 1,200 students', time: '5 hr ago', iconColor: '#7c3aed' },
  { id: 6, icon: XCircle, text: 'Entrepreneurship Bootcamp cancelled', time: 'Yesterday', iconColor: '#ef4444' },
]

/* ── Custom Tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: dark ? '#1e293b' : '#fff',
      border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 11,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <p style={{ fontWeight: 700, color: dark ? '#e2e8f0' : '#334155', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const showToast = useToast()
  const { dark, toggleDark } = useTheme()
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully.', 'info')
  }

  /* ── Dark mode tokens ──────────────────────────────────── */
  const bg = dark ? '#0f172a' : '#f5f6fa'
  const sidebar = dark ? '#1e293b' : '#ffffff'
  const header = dark ? '#1e293b' : '#ffffff'
  const card = dark ? '#1e293b' : '#ffffff'
  const border = dark ? '#334155' : '#e2e8f0'
  const txtPri = dark ? '#f1f5f9' : '#0f172a'
  const txtSec = dark ? '#94a3b8' : '#64748b'
  const txtMuted = dark ? '#475569' : '#94a3b8'
  const inputBg = dark ? '#0f172a' : '#ffffff'
  const hoverBg = dark ? '#334155' : '#f1f5f5'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: bg, fontFamily: "'Inter', sans-serif", transition: 'background 0.3s' }}>

      {/* SIDEBAR */}
      <aside
        style={{
          width: collapsed ? 64 : 168,
          background: sidebar,
          borderRight: `1px solid ${border}`,
          position: 'fixed',
          height: '100%',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s',
        }}
      >
        {/* Logo + collapse */}
        <div style={{ display: 'flex', alignItems: 'center', flexDirection:"row", justifyContent: 'space-between', padding: '16px 12px', borderBottom: `1px solid ${border}` }}>
          {!collapsed && (
            <div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BRAND}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={18} color={BRAND} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 900, color: txtPri, lineHeight: 1.2, marginTop: 4 }}>EventHub</p>
              <p style={{ fontSize: 10, color: txtMuted }}>Admin Portal</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: `1px solid ${border}`,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: txtSec, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map(({ icon: Icon, label, badge }) => {
            const active = activeNav === label
            return (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                title={collapsed ? label : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'left', position: 'relative',
                  background: active ? `${BRAND}18` : 'transparent',
                  color: active ? BRAND : txtSec,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
                {badge && !collapsed && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 999,
                    background: BRAND, color: '#fff',
                  }}>{badge}</span>
                )}
                {badge && collapsed && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 8, height: 8, borderRadius: '50%', background: BRAND,
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '8px', borderTop: `1px solid ${border}` }}>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', background: 'transparent',
              color: txtSec, width: '100%', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = dark ? '#2d1b1b' : '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = txtSec; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: collapsed ? 64 : 168, transition: 'margin-left 0.3s' }}>

        {/* ── TOP BAR ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: header, borderBottom: `1px solid ${border}`,
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 14,
          transition: 'all 0.3s',
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: txtSec, fontWeight: 500 }}>
            <span style={{ color: txtPri, fontWeight: 700 }}>EventHub</span>
            <ChevronRight size={12} />
            <span style={{ color: BRAND }}>{activeNav}</span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: txtMuted }} />
            <input
              type="text"
              placeholder="Search everything..."
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 14,
                paddingTop: 6, paddingBottom: 6,
                borderRadius: 8, border: `1px solid ${border}`,
                fontSize: 12, color: txtPri,
                background: inputBg,
                outline: 'none', transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}25` }}
              onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 🌙 / ☀️ Theme Toggle */}
            <button
              onClick={toggleDark}
              title={dark ? 'Switch to Light' : 'Switch to Dark'}
              style={{
                width: 34, height: 34,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: dark ? '#334155' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: dark ? '#fbbf24' : '#64748b',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? '#475569' : '#e2e8f0' }}
              onMouseLeave={e => { e.currentTarget.style.background = dark ? '#334155' : '#f1f5f9' }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Bell */}
            <button style={{ position: 'relative', width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: txtSec, transition: 'all 0.2s' }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            </button>

            {/* Messages */}
            <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: txtSec, transition: 'all 0.2s' }}>
              <MessageSquare size={16} />
            </button>

            {/* User pill */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px 6px 6px',
              borderRadius: 12, border: `1px solid ${border}`,
              background: 'transparent', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                {user?.avatar || 'AD'}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: txtPri, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>
              <ChevronDown size={12} style={{ color: txtMuted }} />
            </button>
          </div>
        </header>

        {/* ── PAGE BODY ── */}
        <div style={{ flex: 1, padding: '24px' }}>

          {/* Page title row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: txtPri, margin: 0 }}>Admin Dashboard</h1>
              <p style={{ fontSize: 12, color: txtMuted, marginTop: 4 }}>{today}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: BRAND, color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}>
                <Plus size={13} /> Create Event
              </button>
              {[{ icon: QrCode, label: 'Generate QR' }, { icon: Megaphone, label: 'Notify' }, { icon: Download, label: 'Report' }].map(({ icon: Icon, label }) => (
                <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: card, color: txtSec, border: `1px solid ${border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── STATS CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
            {STATS.map(({ label, value, delta, icon: Icon, iconBg, iconBgDark, iconColor }) => (
              <div key={label} style={{ background: card, borderRadius: 16, padding: 16, border: `1px solid ${border}`, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: dark ? iconBgDark : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color: iconColor }} />
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: '#10b981' }}>
                    <TrendingUp size={10} /> {delta}
                  </span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, color: txtPri, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: txtMuted, marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

            {/* Line Chart */}
            <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: txtPri, margin: 0 }}>Event &amp; Registration Growth</h2>
                  <p style={{ fontSize: 11, color: txtMuted, marginTop: 2 }}>January — August 2025</p>
                </div>
                <select style={{ fontSize: 12, border: `1px solid ${border}`, borderRadius: 8, padding: '4px 8px', color: txtSec, background: inputBg, outline: 'none', cursor: 'pointer' }}>
                  <option>2025</option>
                  <option>2024</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: txtMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: txtMuted }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                  <Line type="monotone" dataKey="registrations" name="Registrations" stroke="#4f46e5" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#16a34a" strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 20, marginTop: 8, paddingLeft: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, color: txtSec }}>
                  <span style={{ width: 20, height: 2, background: '#4f46e5', borderRadius: 2, display: 'inline-block' }} /> Registrations
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, color: txtSec }}>
                  <span style={{ width: 20, borderTop: '2px dashed #16a34a', display: 'inline-block' }} /> Attendance %
                </span>
              </div>
            </div>

            {/* Donut Chart */}
            <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
              <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: txtPri, margin: 0 }}>Dept. Participation</h2>
                <p style={{ fontSize: 11, color: txtMuted, marginTop: 2 }}>By department share</p>
              </div>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="value">
                    {DEPT_DATA.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v}%`, n]}
                    contentStyle={{ fontSize: 11, borderRadius: 10, border: `1px solid ${border}`, background: card, color: txtPri }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 4 }}>
                {DEPT_DATA.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: txtSec, fontWeight: 500 }}>{d.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: txtPri, marginLeft: 'auto' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── BOTTOM ROW: Upcoming Events + Recent Activity ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginTop: 20 }}>

            {/* Upcoming Events */}
            <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: txtPri, margin: 0 }}>Upcoming Events</h2>
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: BRAND, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  View all <ExternalLink size={11} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {UPCOMING_EVENTS.map(ev => {
                  const pct = Math.round((ev.registered / ev.capacity) * 100)
                  return (
                    <div
                      key={ev.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 14px', borderRadius: 12,
                        border: `1px solid ${border}`,
                        background: dark ? '#0f172a' : '#f8fafc',
                        transition: 'all 0.2s', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = ev.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${ev.color}18` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      {/* Date badge */}
                      <div style={{
                        minWidth: 44, height: 50, borderRadius: 10,
                        background: ev.color, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: '#fff',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, opacity: 0.85 }}>{ev.month}</span>
                        <span style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{ev.day}</span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: txtPri, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: txtSec }}>
                            <MapPin size={10} /> {ev.venue}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: txtSec }}>
                            <Clock size={10} /> {ev.time}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ marginTop: 6 }}>
                          <div style={{ height: 4, borderRadius: 99, background: dark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: ev.color, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      </div>

                      {/* Count */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: txtPri, margin: 0 }}>
                          {ev.registered.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: txtMuted }}>/{ev.capacity.toLocaleString()}</span>
                        </p>
                        <p style={{ fontSize: 10, color: txtMuted, margin: '2px 0 0' }}>registered</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: txtPri, margin: '0 0 16px 0' }}>Recent Activity</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {RECENT_ACTIVITY.map((act, idx) => {
                  const Icon = act.icon
                  const isLast = idx === RECENT_ACTIVITY.length - 1
                  return (
                    <div key={act.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                      {/* Icon + vertical line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: `${act.iconColor}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, zIndex: 1,
                        }}>
                          <Icon size={13} style={{ color: act.iconColor }} />
                        </div>
                        {!isLast && (
                          <div style={{ width: 1, flex: 1, minHeight: 12, background: dark ? '#334155' : '#e2e8f0', margin: '4px 0' }} />
                        )}
                      </div>

                      {/* Text */}
                      <div style={{ paddingBottom: isLast ? 0 : 14, flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: txtPri, fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{act.text}</p>
                        <p style={{ fontSize: 10, color: txtMuted, margin: '3px 0 0' }}>{act.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
