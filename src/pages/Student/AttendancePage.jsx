import React, { useState, useEffect } from 'react'
import { QrCode, FileText, CheckCircle2, Activity, Clock, Search, TrendingUp, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import studentService from '../../services/studentService'

export default function AttendancePage({ tokens, user }) {
  const { dark, accentColor } = useTheme()
  const BRAND = accentColor || '#615FFF'
  const showToast = useToast()

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanning, setScanning] = useState(false)

  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    studentService.fetchAttendanceData().then(res => {
      if (cancelled) return
      if (res.success) {
        setAttendanceData(res.data)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const records = attendanceData?.records || []
  const summary = attendanceData?.summary || {}

  // Filter records based on activeFilter pill & search query
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.event.toLowerCase().includes(search.toLowerCase()) ||
      record.id.toLowerCase().includes(search.toLowerCase()) ||
      record.venue.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All' ||
      record.status.toLowerCase() === activeFilter.toLowerCase()

    return matchesSearch && matchesFilter
  })

  // Simulated QR Code Scanner Action
  const handleSimulateScan = async () => {
    setScanning(true)
    const res = await studentService.scanAttendanceQR('EVT-QR-SCAN-2024')
    setScanning(false)

    if (res.success) {
      setAttendanceData(res.data)
      showToast('QR Scan Verified! Attendance updated successfully.', 'success')
      setShowScanModal(false)
    } else {
      showToast(res.message || 'QR Scan Failed.', 'error')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full font-[Manrope,sans-serif]">

      {/* ── 1. Page Header: Title + Scan QR Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white m-0">
            Attendance
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-[#7a98bb] mt-1 m-0">
            Track your event attendance records
          </p>
        </div>

        {/* Scan QR Pill Button */}
        <button
          onClick={() => setShowScanModal(true)}
          className="self-start sm:self-auto flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs font-extrabold text-white border-none cursor-pointer shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}
        >
          <QrCode size={16} />
          <span>Scan QR</span>
        </button>
      </div>

      {/* ── 2. Stat Cards Grid (4 Cards matching Figma layout) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: TOTAL EVENTS */}
        <div
          className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 shadow-sm"
          style={{
            background: dark ? '#0b1322' : '#ffffff',
            borderColor: dark ? '#182438' : '#e2e8f0',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-blue-500" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-[#6a84a6]">
              TOTAL EVENTS
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white m-0 mt-0.5 leading-none">
              {summary.totalEvents ?? 8}
            </h3>
          </div>
        </div>

        {/* Card 2: ATTENDED */}
        <div
          className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 shadow-sm"
          style={{
            background: dark ? '#0b1322' : '#ffffff',
            borderColor: dark ? '#182438' : '#e2e8f0',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-[#6a84a6]">
              ATTENDED
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white m-0 mt-0.5 leading-none">
              {summary.attended ?? 6}
            </h3>
          </div>
        </div>

        {/* Card 3: ATTENDANCE % */}
        <div
          className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 shadow-sm"
          style={{
            background: dark ? '#0b1322' : '#ffffff',
            borderColor: dark ? '#182438' : '#e2e8f0',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
            <Activity size={22} style={{ color: BRAND }} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-[#6a84a6]">
              ATTENDANCE %
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white m-0 mt-0.5 leading-none">
              {summary.percentage ?? '75%'}
            </h3>
          </div>
        </div>

        {/* Card 4: PENDING */}
        <div
          className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 shadow-sm"
          style={{
            background: dark ? '#0b1322' : '#ffffff',
            borderColor: dark ? '#182438' : '#e2e8f0',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
            <Clock size={22} className="text-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-[#6a84a6]">
              PENDING
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white m-0 mt-0.5 leading-none">
              {summary.pending ?? 1}
            </h3>
          </div>
        </div>

      </div>

      {/* ── 3. Attendance Analytics Line Chart Card ── */}
      <div
        className="rounded-3xl p-6 border transition-colors duration-300 shadow-sm"
        style={{
          background: dark ? '#0b1322' : '#ffffff',
          borderColor: dark ? '#182438' : '#e2e8f0',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0">
            Attendance Analytics
          </h3>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <TrendingUp size={13} /> {summary.analyticsChange || '↑ 87.5%'}
          </span>
        </div>

        {/* SVG Continuous Curve Wave Chart */}
        <div className="w-full relative h-48 sm:h-56">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 750 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity="0.25" />
                <stop offset="100%" stopColor={BRAND} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Grid Lines & Labels */}
            {[
              { label: '8', y: 20 },
              { label: '6', y: 55 },
              { label: '4', y: 90 },
              { label: '2', y: 125 },
              { label: '0', y: 160 }
            ].map(tick => (
              <g key={tick.label}>
                <text x="10" y={tick.y + 4} fill={dark ? '#4d6a8f' : '#94a3b8'} fontSize="11" fontWeight="600">
                  {tick.label}
                </text>
                <line
                  x1="35"
                  y1={tick.y}
                  x2="740"
                  y2={tick.y}
                  stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}
                  strokeDasharray="4 4"
                />
              </g>
            ))}

            {/* Filled Area under Curve */}
            <path
              d="M 40 100 Q 110 50, 180 50 T 320 110 T 460 70 T 600 90 T 730 140 L 730 160 L 40 160 Z"
              fill="url(#analyticsAreaGrad)"
            />

            {/* Glowing Smooth Wave Path */}
            <path
              d="M 40 100 Q 110 50, 180 50 T 320 110 T 460 70 T 600 90 T 730 140"
              fill="none"
              stroke={BRAND}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>

          {/* X-Axis Month Labels */}
          <div className="flex justify-between pl-9 pr-2 mt-2 text-xs font-semibold text-slate-400 dark:text-[#4d6a8f]">
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>
      </div>

      {/* ── 4. Search, Filter Pills & Table Section ── */}
      <div
        className="rounded-3xl p-6 border transition-colors duration-300 shadow-sm"
        style={{
          background: dark ? '#0b1322' : '#ffffff',
          borderColor: dark ? '#182438' : '#e2e8f0',
        }}
      >
        {/* Search & Filter Pills Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold border outline-none transition-colors"
              style={{
                background: dark ? '#111b2e' : '#f8fafc',
                borderColor: dark ? '#1b2c47' : '#e2e8f0',
                color: dark ? '#ffffff' : '#0f172a',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Present', 'Absent', 'Pending'].map((filter) => {
              const active = activeFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer border transition-all ${
                    active
                      ? 'text-white border-transparent shadow-md'
                      : dark
                      ? 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                  style={{
                    background: active ? BRAND : 'transparent',
                  }}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#16263e] text-slate-400 dark:text-[#4d6a8f]">
                <th className="py-3.5 px-4 font-extrabold">ID</th>
                <th className="py-3.5 px-4 font-extrabold">EVENT NAME</th>
                <th className="py-3.5 px-4 font-extrabold">SCAN TIME</th>
                <th className="py-3.5 px-4 font-extrabold">STATUS</th>
                <th className="py-3.5 px-4 font-extrabold">VENUE</th>
                <th className="py-3.5 px-4 font-extrabold">EVENT DATE</th>
                <th className="py-3.5 px-4 font-extrabold">REGISTRATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#16263e]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#121e33] transition-colors"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-bold text-slate-400 dark:text-[#4d6a8f]">
                      {item.id}
                    </td>

                    {/* EVENT NAME */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {item.event}
                    </td>

                    {/* SCAN TIME */}
                    <td className="py-4 px-4 font-semibold text-slate-500 dark:text-[#7a98bb]">
                      {item.scanTime}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4">
                      {item.status === 'Present' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                          Present
                        </span>
                      )}
                      {item.status === 'Absent' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                          Absent
                        </span>
                      )}
                      {item.status === 'Pending' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* VENUE */}
                    <td className="py-4 px-4 font-medium text-slate-600 dark:text-[#7a98bb]">
                      {item.venue}
                    </td>

                    {/* EVENT DATE */}
                    <td className="py-4 px-4 font-medium text-slate-500 dark:text-[#4d6a8f]">
                      {item.date}
                    </td>

                    {/* REGISTRATION */}
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                        {item.registration}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Scan QR Interactive Modal ── */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowScanModal(false)} />

          <div
            className="relative z-10 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
            style={{
              background: dark ? '#0c1626' : '#ffffff',
              border: `1px solid ${dark ? '#1b2a42' : '#e2e8f0'}`,
              animation: 'modalScaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b2a42] mb-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                <QrCode size={18} style={{ color: BRAND }} /> Event QR Scanner
              </h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2d48] border-none bg-transparent cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Scanner Display Box with Laser animation */}
            <div className="relative w-48 h-48 mx-auto rounded-2xl bg-slate-900 p-4 border-2 border-indigo-500/40 flex items-center justify-center overflow-hidden shadow-inner mb-6">
              <QrCode size={150} className="text-indigo-400 opacity-90" />
              <div className="absolute inset-x-0 h-1 bg-indigo-400 shadow-[0_0_15px_#6366f1] animate-scanLaser" />
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-[#7a98bb] mb-6">
              Align the event entrance QR code within the frame to verify attendance.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScanModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#14233a] border border-slate-200 dark:border-[#213554] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1a2d48] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateScan}
                disabled={scanning}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white border-none cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
                style={{ background: BRAND }}
              >
                {scanning ? 'Verifying...' : 'Simulate Scan'}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes scanLaser {
              0%   { top: 10%; }
              50%  { top: 85%; }
              100% { top: 10%; }
            }
            .animate-scanLaser {
              animation: scanLaser 2.2s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}

    </div>
  )
}
