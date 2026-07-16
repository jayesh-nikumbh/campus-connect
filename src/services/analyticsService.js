const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE = import.meta.env.VITE_API_BASE_URL

import {
  ANALYTICS_STATS,
  MONTHLY_TREND_DATA,
  RADAR_DATA,
  CATEGORIES_TREND_DATA,
  DEPT_PIE_DATA
} from '../data/analyticsData'
import { fetchWithAuth } from '../utils/apiClient'

function authHeaders() {
  const token = sessionStorage.getItem('cc_token') || sessionStorage.getItem('token') || ''
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  }
}

function parseJSON(res) {
  if (typeof res.json === 'function') {
    return res.json().catch(() => ({}))
  }
  return Promise.resolve(res)
}

/* ── MOCK HANDLERS ───────────────────────────────────────── */
async function mockFetchStats() {
  await new Promise(r => setTimeout(r, 200))
  return { success: true, stats: ANALYTICS_STATS }
}

async function mockFetchMonthlyTrend(tab) {
  await new Promise(r => setTimeout(r, 200))
  // Variations based on tab if needed, otherwise return base trend
  let data = [...MONTHLY_TREND_DATA]
  if (tab === 'registration') {
    data = data.map(d => ({ ...d, value: Math.round(d.value * 1.2 * 10) / 10 }))
  } else if (tab === 'attendance') {
    data = data.map(d => ({ ...d, value: Math.round(d.value * 0.95 * 10) / 10 }))
  } else if (tab === 'student') {
    data = data.map(d => ({ ...d, value: Math.round(d.value * 1.5 * 10) / 10 }))
  }
  return { success: true, trend: data }
}

async function mockFetchRadarData() {
  await new Promise(r => setTimeout(r, 200))
  return { success: true, radar: RADAR_DATA }
}

async function mockFetchCategories() {
  await new Promise(r => setTimeout(r, 200))
  return { success: true, categories: CATEGORIES_TREND_DATA }
}

async function mockFetchDeptDistribution() {
  await new Promise(r => setTimeout(r, 200))
  return { success: true, depts: DEPT_PIE_DATA }
}

async function mockFetchEventAnalytics(eventId) {
  await new Promise(r => setTimeout(r, 200))
  return {
    success: true,
    data: {
      registrations: {
        total: 120,
        confirmed: 95,
        cancelled: 25
      },
      attendance: {
        present: 80,
        absent: 15,
        percentage: 84.21
      },
      certificates: {
        generated: 78
      }
    }
  }
}

/* ── REAL API HANDLERS ───────────────────────────────────── */
async function apiFetchStats() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/stats`)
    const data = await parseJSON(res)
    if (!res.ok) return { success: false, message: data.message || 'Failed to fetch stats.' }
    return { success: true, stats: data.stats || [] }
  } catch (err) {
    console.error('[analyticsService] fetchStats error:', err)
    return { success: false, message: 'Server unreachable.' }
  }
}

async function apiFetchMonthlyTrend(tab) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/trend?tab=${tab}`)
    const data = await parseJSON(res)
    if (!res.ok) return { success: false, message: data.message || 'Failed to fetch trend.' }
    return { success: true, trend: data.trend || [] }
  } catch (err) {
    console.error('[analyticsService] fetchMonthlyTrend error:', err)
    return { success: false, message: 'Server unreachable.' }
  }
}

async function apiFetchRadarData() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/engagement-radar`)
    const data = await parseJSON(res)
    if (!res.ok) {
      console.warn('[analyticsService] fetchRadarData failed, falling back to mock data.')
      return mockFetchRadarData()
    }
    const raw = Array.isArray(data) ? data : (data.radar || data.data || data.metrics || [])
    const formatted = raw.map(item => ({
      axis: item.axis || item.name || item.metric || '',
      value: Number(item.value !== undefined ? item.value : (item.score || 0))
    }))
    return { success: true, radar: formatted }
  } catch (err) {
    console.error('[analyticsService] fetchRadarData error, falling back to mock data:', err)
    return mockFetchRadarData()
  }
}

async function apiFetchCategories() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/categories`)
    const data = await parseJSON(res)
    if (!res.ok) return { success: false, message: data.message || 'Failed to fetch categories.' }
    return { success: true, categories: data.categories || [] }
  } catch (err) {
    console.error('[analyticsService] fetchCategories error:', err)
    return { success: false, message: 'Server unreachable.' }
  }
}

async function apiFetchDeptDistribution() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/department-participation`)
    const data = await parseJSON(res)
    if (!res.ok) return { success: false, message: data.message || 'Failed to fetch departments.' }
    
    const rawDepts = Array.isArray(data) ? data : (data.data || data.depts || [])
    const COLORS = ['#615FFF', '#0284c7', '#00BC7D', '#FE9A00', '#ef4444', '#a855f7', '#ec4899', '#f43f5e']
    const formatted = rawDepts.map((item, idx) => {
      const name = item.name || item.department || item.dept || 'Other'
      const value = Number(item.value || item.count || item.percentage || item.share || 0)
      return {
        name,
        value,
        color: item.color || COLORS[idx % COLORS.length]
      }
    })
    
    return { success: true, depts: formatted }
  } catch (err) {
    console.error('[analyticsService] fetchDeptDistribution error:', err)
    return { success: false, message: 'Server unreachable.' }
  }
}

async function apiFetchEventAnalytics(eventId) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/events/${eventId}`)
    const data = await parseJSON(res)
    if (!res.ok) return { success: false, message: data.message || 'Failed to fetch event analytics.' }
    return { success: true, data: data.data || data }
  } catch (err) {
    console.error('[analyticsService] fetchEventAnalytics error:', err)
    return { success: false, message: 'Server unreachable.' }
  }
}

async function mockFetchRecentActivity() {
  await new Promise(r => setTimeout(r, 200))
  const serializable = [
    { id: 1, type: 'registration', text: 'Arjun Patel registered for TechFest 2025', time: '2 min ago' },
    { id: 2, type: 'attendance', text: 'Attendance marked for National Hackathon (198/200)', time: '15 min ago' },
    { id: 3, type: 'publish', text: 'Sports Meet 2025 published by Dr. Kavitha Reddy', time: '1 hr ago' },
    { id: 4, type: 'certificate', text: '143 certificates generated for Research Symposium', time: '3 hr ago' },
    { id: 5, type: 'notification', text: 'Bulk notification sent to 1,200 students', time: '5 hr ago' },
    { id: 6, type: 'cancel', text: 'Entrepreneurship Bootcamp cancelled', time: 'Yesterday' }
  ]
  return { success: true, activities: serializable }
}

async function apiFetchRecentActivity() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/recent-activity`)
    const data = await parseJSON(res)
    if (!res.ok) return { success: false, message: data.message || 'Failed to fetch recent activity.' }
    const activities = Array.isArray(data) ? data : (data.activities || data.data || [])
    return { success: true, activities }
  } catch (err) {
    console.error('[analyticsService] fetchRecentActivity error:', err)
    return { success: false, message: 'Server unreachable.' }
  }
}

async function mockFetchGrowth() {
  await new Promise(r => setTimeout(r, 200))
  const mockData = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    mockData.push({
      date: d.toISOString().split('T')[0],
      events_count: Math.floor(Math.random() * 2),
      registrations_count: Math.floor(Math.random() * 15) + 5,
      month: dateStr,
      registrations: Math.floor(Math.random() * 15) + 5,
      attendance: Math.floor(Math.random() * 20) + 70
    })
  }
  return { success: true, data: mockData }
}

async function apiFetchGrowth() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/analytics/growth`)
    const data = await parseJSON(res)
    if (!res.ok) {
      return mockFetchGrowth()
    }
    const raw = Array.isArray(data) ? data : (data.data || data.growth || [])
    return { success: true, data: raw }
  } catch (err) {
    return mockFetchGrowth()
  }
}

const analyticsService = {
  fetchStats: () =>
    USE_MOCK ? mockFetchStats() : apiFetchStats(),

  fetchMonthlyTrend: (tab) =>
    USE_MOCK ? mockFetchMonthlyTrend(tab) : apiFetchMonthlyTrend(tab),

  fetchRadarData: () =>
    USE_MOCK ? mockFetchRadarData() : apiFetchRadarData(),

  fetchCategories: () =>
    USE_MOCK ? mockFetchCategories() : apiFetchCategories(),

  fetchDeptDistribution: () =>
    USE_MOCK ? mockFetchDeptDistribution() : apiFetchDeptDistribution(),

  fetchRecentActivity: () =>
    USE_MOCK ? mockFetchRecentActivity() : apiFetchRecentActivity(),

  fetchEventAnalytics: (eventId) =>
    USE_MOCK ? mockFetchEventAnalytics(eventId) : apiFetchEventAnalytics(eventId),

  fetchGrowth: () =>
    USE_MOCK ? mockFetchGrowth() : apiFetchGrowth(),
}

export default analyticsService
