import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import { Plus, QrCode, Megaphone, Download } from 'lucide-react'

import { BRAND } from '../../data/dashboardData'
import DashboardSidebar from '../../components/adminDashboard/DashboardSidebar'
import DashboardTopBar  from '../../components/adminDashboard/DashboardTopBar'
import StatsCards       from '../../components/adminDashboard/StatsCards'
import ChartsRow        from '../../components/adminDashboard/ChartsRow'
import BottomRow        from '../../components/adminDashboard/BottomRow'

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

  /* ── Theme tokens (shared via prop) ── */
  const tokens = {
    dark,
    bg:      dark ? '#0f172a' : '#f5f6fa',
    sidebar: dark ? '#1e293b' : '#ffffff',
    header:  dark ? '#1e293b' : '#ffffff',
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#e2e8f0',
    txtPri:  dark ? '#f1f5f9' : '#0f172a',
    txtSec:  dark ? '#94a3b8' : '#64748b',
    txtMuted:dark ? '#475569' : '#94a3b8',
    inputBg: dark ? '#0f172a' : '#ffffff',
    hoverBg: dark ? '#334155' : '#f1f5f5',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: tokens.bg, fontFamily: "'Manrope', sans-serif", transition: 'background 0.3s' }}>

      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        dark={dark}
        tokens={tokens}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: collapsed ? 70 : 240, transition: 'margin-left 0.3s' }}>

        <DashboardTopBar
          activeNav={activeNav}
          dark={dark}
          toggleDark={toggleDark}
          user={user}
          tokens={tokens}
        />

        {/* ── PAGE BODY ── */}
        <div style={{ flex: 1, padding: '24px' }}>

          {/* Page title + action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: tokens.txtPri, margin: 0, letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
              <p style={{ fontSize: 13, color: tokens.txtSec, marginTop: 4 }}>{today}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: BRAND, color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(97,95,255,0.25)' }}>
                <Plus size={15} /> Create Event
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: tokens.card, color: tokens.txtPri, border: `1px solid ${tokens.border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                <QrCode size={15} style={{ color: tokens.txtSec }} /> Generate QR
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: tokens.card, color: tokens.txtPri, border: `1px solid ${tokens.border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                <Megaphone size={15} style={{ color: tokens.txtSec }} /> Notify
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: tokens.card, color: tokens.txtPri, border: `1px solid ${tokens.border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                <Download size={15} style={{ color: tokens.txtSec }} /> Report
              </button>
            </div>
          </div>

          <StatsCards tokens={tokens} />
          <ChartsRow  dark={dark} tokens={tokens} />
          <BottomRow  dark={dark} tokens={tokens} />

        </div>
      </main>
    </div>
  )
}