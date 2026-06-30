import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import { Plus, QrCode, Megaphone, Download } from 'lucide-react'

import { BRAND } from '../../data/dashboardData'
import notificationsService, { enrichNotification } from '../../services/notificationsService'
import dashboardService, { enrichStats } from '../../services/dashboardService'

import DashboardSidebar from '../../components/admin/adminDashboard/DashboardSidebar'
import DashboardTopBar from '../../components/admin/adminDashboard/DashboardTopBar'
import StatsCards from '../../components/admin/adminDashboard/StatsCards'
import ChartsRow from '../../components/admin/adminDashboard/ChartsRow'
import BottomRow from '../../components/admin/adminDashboard/BottomRow'
import NotificationsPage from '../Admin/NotificationsPage'
import EventsPage from '../Admin/EventsPage'
import AttendancePage from '../Admin/AttendancePage'
import RegistrationsPage from '../Admin/RegistrationsPage'
import AnalyticsPage from '../Admin/AnalyticsPage'
import CertificatesPage from '../Admin/CertificatesPage'
import NotificationPanel from '../../components/admin/adminDashboard/NotificationPanel'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const showToast = useToast()
  const { dark, toggleDark } = useTheme()
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)

  // ── Shared notifications state — raw from API, enriched before render
  const [rawNotifications, setRawNotifications] = useState([])
  const [notifStats, setNotifStats] = useState({})
  const [notifLoading, setNotifLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)

  // ── Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  // Enriched = raw data + icon/color added by frontend (type mapping)
  const notifications = rawNotifications.map(enrichNotification)
  const unreadCount = notifications.filter(n => n.unread).length

  // ── Load notifications from service (mock or real API)
  useEffect(() => {
    let cancelled = false
    setNotifLoading(true)
    notificationsService.fetchAll().then(res => {
      if (cancelled) return
      if (res.success) {
        setRawNotifications(res.notifications)
        setNotifStats(res.stats)
      }
      setNotifLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // ── Load dashboard stats from service
  useEffect(() => {
    let cancelled = false
    setStatsLoading(true)
    dashboardService.fetchStats().then(res => {
      if (cancelled) return
      if (res.success) {
        setDashboardStats(enrichStats(res.stats))
      }
      setStatsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // ── Optimistic mark-read (updates UI instantly, syncs to API)
  const handleMarkRead = (ids) => {
    setRawNotifications(prev =>
      prev.map(n => ids.includes(n.id) ? { ...n, unread: false } : n)
    )
    notificationsService.markRead(ids)
  }

  // ── Optimistic delete
  const handleDelete = (id) => {
    setRawNotifications(prev => prev.filter(n => n.id !== id))
    notificationsService.delete(id)
  }

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
    bg: dark ? '#060e1c' : '#f4f6fa',        // deepest dark base
    sidebar: dark ? '#0c1829' : '#ffffff',          // sidebar — distinct from bg
    header: dark ? '#0c1829' : '#ffffff',
    card: dark ? '#0f1e30' : '#ffffff',          // cards — pop above bg
    border: dark ? '#1a3050' : '#e2e8f0',          // blue-tinted border
    shadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.04)',  // unified card shadow
    txtPri: dark ? '#e8f0fe' : '#0f172a',
    txtSec: dark ? '#7a98bb' : '#64748b',
    txtMuted: dark ? '#3d5470' : '#94a3b8',
    inputBg: dark ? '#060e1c' : '#ffffff',
    hoverBg: dark ? '#162640' : '#f1f5f9',
  }

  const isNotificationsPage = activeNav === 'Notifications'

  return (
    <div className="min-h-screen flex bg-[#f4f6fa] dark:bg-[#060e1c] font-[Manrope,sans-serif] transition-colors duration-300">

      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        dark={dark}
        onLogout={handleLogout}
      />

      <main
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300"
        style={{ marginLeft: collapsed ? 70 : 240 }}
      >

        <DashboardTopBar
          activeNav={activeNav}
          dark={dark}
          toggleDark={toggleDark}
          user={user}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          unreadCount={unreadCount}
        />

        {/* ── Notification Slide-in Panel ── */}
        <NotificationPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          onNavigate={(page) => { setActiveNav(page); setPanelOpen(false) }}
          tokens={tokens}
        />

        {/* ── PAGE BODY ── */}
        <div className={`flex-1 ${(isNotificationsPage || activeNav === 'Events' || activeNav === 'Analytics' || activeNav === 'Certificates') ? '' : 'p-6'}`}>

          {activeNav === 'Events' ? (
            /* ─── Events Page ─── */
            <EventsPage tokens={tokens} />
          ) : activeNav === 'Registrations' ? (
            /* ─── Registrations Page ─── */
            <RegistrationsPage tokens={tokens} />
          )  : activeNav === 'Attendance' ? (
            /* ─── Attendance Page ─── */
            <AttendancePage tokens={tokens} />
          ) : activeNav === 'Analytics' ? (
            /* ─── Analytics Page ─── */
            <AnalyticsPage tokens={tokens} />
          ) : activeNav === 'Certificates' ? (
            /* ─── Certificates Page ─── */
            <CertificatesPage tokens={tokens} />
          ) : isNotificationsPage ? (
            /* ─── Notifications Page ─── */
            <NotificationsPage
              tokens={tokens}
              notifications={notifications}
              stats={notifStats}
              loading={notifLoading}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ) : (
            /* ─── Default Dashboard ─── */
            <>
              {/* Page title + action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-[28px] font-extrabold text-slate-900 dark:text-slate-100 m-0 tracking-tight">Admin Dashboard</h1>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{today}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-bold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-px"
                    style={{ background: BRAND, boxShadow: '0 4px 12px rgba(97,95,255,0.25)' }}
                  >
                    <Plus size={15} /> Create Event
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold bg-white dark:bg-[#1a2236] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#1e2d45] cursor-pointer transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#1e2d45]">
                    <QrCode size={15} className="text-slate-400 dark:text-slate-500" /> Generate QR
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold bg-white dark:bg-[#1a2236] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#1e2d45] cursor-pointer transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#1e2d45]">
                    <Megaphone size={15} className="text-slate-400 dark:text-slate-500" /> Notify
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold bg-white dark:bg-[#1a2236] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#1e2d45] cursor-pointer transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#1e2d45]">
                    <Download size={15} className="text-slate-400 dark:text-slate-500" /> Report
                  </button>
                </div>
              </div>

              <StatsCards tokens={tokens} stats={dashboardStats} loading={statsLoading} />
              <ChartsRow dark={dark} tokens={tokens} />
              <BottomRow dark={dark} tokens={tokens} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}