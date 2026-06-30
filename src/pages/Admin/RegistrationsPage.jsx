import { useState, useEffect } from 'react'
import {
  Search, Download, Check, X, Eye, FileText,
  Loader2,ClipboardList, ClipboardCheck, ClipboardClock ,ClipboardX
} from 'lucide-react'
import registrationsService from '../../services/registrationsService'
import { BRAND } from '../../data/dashboardData'
import { useToast } from '../../context/ToastContext'

export default function RegistrationsPage({ tokens }) {
  const { dark } = tokens
  const showToast = useToast()

  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)

  // Selection states
  const [selectedIds, setSelectedIds] = useState([])

  const loadRegistrations = async () => {
    setLoading(true)
    const res = await registrationsService.fetchAll()
    if (res.success) {
      setRegistrations(res.registrations)
    } else {
      showToast(res.message || 'Failed to load registrations.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRegistrations()
  }, [])

  // Calculate status counts
  const totalCount = registrations.length
  const approvedCount = registrations.filter(r => r.status === 'Approved').length
  const pendingCount = registrations.filter(r => r.status === 'Pending').length
  const rejectedCount = registrations.filter(r => r.status === 'Rejected').length

  // Filter logic
  const filteredRegs = registrations.filter(reg => {
    const tabMatch = activeTab === 'All' || reg.status === activeTab

    const searchLower = searchQuery.toLowerCase()
    const nameMatch = reg.studentName.toLowerCase().includes(searchLower)
    const rollMatch = reg.rollNo.toLowerCase().includes(searchLower)
    const deptMatch = reg.department.toLowerCase().includes(searchLower)
    const eventMatch = (reg.eventName || '').toLowerCase().includes(searchLower)
    const searchMatch = searchQuery === '' || nameMatch || rollMatch || deptMatch || eventMatch

    return tabMatch && searchMatch
  })

  // Update Status
  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id)
    const res = await registrationsService.updateStatus(id, status)
    if (res.success) {
      showToast(`Registration status updated to ${status}.`, 'success')
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, status: res.registration.status } : r)
      )
    } else {
      showToast(res.message || 'Failed to update status.', 'error')
    }
    setUpdatingId(null)
  }

  // Export CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Student Name', 'Roll No', 'Department', 'Year', 'Event', 'Date', 'Status']
      const rows = filteredRegs.map(r => [
        r.id,
        r.studentName,
        r.rollNo,
        r.department,
        r.year,
        r.eventName || r.eventId,
        r.date,
        r.status
      ])

      const csvContent = [headers, ...rows]
        .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `registrations_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Registrations exported successfully.', 'success')
    } catch (err) {
      showToast('Failed to export registrations.', 'error')
    }
  }

  // Custom status badge style
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return {
          bg: dark ? 'rgba(16, 185, 129, 0.15)' : '#e6fbf2',
          text: '#00BC7D',
        }
      case 'Pending':
        return {
          bg: dark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
          text: '#d97706',
        }
      case 'Rejected':
        return {
          bg: dark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
          text: '#ef4444',
        }
      default:
        return {
          bg: dark ? '#162640' : '#f1f5f9',
          text: dark ? '#7a98bb' : '#64748b',
        }
    }
  }

  const cardStyle = {
    background: tokens.card,
    border: `1px solid ${tokens.border}`,
    boxShadow: tokens.shadow,
  }

  const inputStyle = {
    border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`,
    color: dark ? '#e8f0fe' : '#0f172a',
    background: dark ? '#060e1c' : '#ffffff',
  }

  const stateCard = [
    { title: 'Total', value: totalCount, Icon: ClipboardList, background: '#615FFF' }, 
    { title: 'Approved', value: approvedCount, Icon: ClipboardCheck, background: '#00BC7D' }, 
    { title: 'Pending', value: pendingCount, Icon: ClipboardClock, background: '#FE9A00' }, 
    { title: 'Rejected', value: rejectedCount, Icon: ClipboardX , background: '#FB2C36' }
  ]

  const tableNavs = ['Student Name','Roll No','Department','Year','Event','Date','Status','Actions']

  return (
    <div className="animate-fadeIn" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>

      {/* ── BREADCRUMB & HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>EventHub</span>
            <span>&gt;</span>
            <span style={{ color: BRAND }}>Registrations</span>
          </div>
          <h1 className="text-[28px] font-extrabold m-0 tracking-tight">Registrations</h1>
          <p className="text-[13px] mt-1 mb-0" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
            Manage all student event registrations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredRegs.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#1a2236] cursor-pointer transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#1e2d45] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} className="text-slate-400" /> Export CSV
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

        {/* Total */}
        {stateCard.map(({title, value, Icon, background})=>{
          return(
          <div className="rounded-2xl p-3 flex items-center gap-4 border" style={cardStyle}>
          <div style={{background: background}} className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-white shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <div className="text-[26px] font-black">{value}</div>
            <div className="text-[12.5px] font-semibold text-slate-400 mt-0.5">{title}</div>
          </div>
        </div>
          )
        })}
      </div>

      {/* ── SEARCH & TAB FILTERS ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        {/* Search */}
        <div className="relative w-full max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: dark ? '#4a6a8a' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
            onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Tabs */}
        <div
          className="flex items-center rounded-xl p-1 border h-[42px] box-border"
          style={{
            borderColor: dark ? '#1a3050' : '#e2e8f0',
            background: dark ? '#0f1e30' : '#ffffff',
          }}
        >
          {['All', 'Approved', 'Pending', 'Rejected'].map(tab => {
            const active = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 h-[32px] rounded-xl text-[12px] border-none cursor-pointer flex items-center justify-center transition-all duration-200 font-bold"
                style={{
                  background: active ? BRAND : 'transparent',
                  color: active ? '#ffffff' : (dark ? '#7a98bb' : '#5c6f84'),
                  boxShadow: active ? '0 3px 10px rgba(97,95,255,0.3)' : 'none',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── REGISTRATIONS TABLE ── */}
      <div className="rounded-2xl overflow-hidden border" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr style={{ background: dark ? '#060e1c' : '#f8fafc', borderBottom: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` }}>
                {tableNavs.map((val)=>{
                  return (<th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">{val}</th>)
                })}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: dark ? '#1a3050' : '#e2e8f0' }}>
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td className="p-4 text-center"><div className="w-4 h-4 mx-auto rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-32 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-20 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-16 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-12 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-28 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-16 h-5 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-6 ml-auto rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                  </tr>
                ))
              ) : filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <FileText size={40} className="block mx-auto mb-3 text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-500">No registrations found</span>
                  </td>
                </tr>
              ) : (
                filteredRegs.map((row) => {
                  const badge = getBadgeStyle(row.status)
                  const isChecked = selectedIds.includes(row.id)
                  const isUpdating = updatingId === row.id

                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-850/10"
                      style={{ background: isChecked ? `${BRAND}08` : 'transparent' }}
                    >
                      {/* Student Name */}
                      <td className="p-4 text-[13.5px] font-bold text-slate-900 dark:text-slate-100">{row.studentName}</td>

                      {/* Roll No */}
                      <td className="p-4 text-[13.5px] font-semibold text-slate-500 dark:text-slate-400">{row.rollNo}</td>

                      {/* Department */}
                      <td className="p-4 text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">{row.department}</td>

                      {/* Year */}
                      <td className="p-4 text-[13.5px] font-medium text-slate-600 dark:text-slate-400">{row.year}</td>

                      {/* Event */}
                      <td className="p-4 text-[13.5px] font-bold" style={{ color: BRAND }}>{row.eventName}</td>

                      {/* Date */}
                      <td className="p-4 text-[13.5px] font-medium text-slate-500 dark:text-slate-400">{row.date}</td>

                      {/* Status */}
                      <td className="p-4 text-[13px]">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block text-center"
                          style={{ background: badge.bg, color: badge.text }}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {isUpdating ? (
                          <div className="flex justify-end pr-4">
                            <Loader2 size={16} className="animate-spin text-slate-400" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {row.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(row.id, 'Approved')}
                                  className="w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-500"
                                  title="Approve"
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(row.id, 'Rejected')}
                                  className="w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer transition-all hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500"
                                  title="Reject"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => showToast(`Viewing Registration: ${row.studentName} (${row.rollNo})`, 'info')}
                              className="w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#615fff]"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
