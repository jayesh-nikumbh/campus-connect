import React, { useState, useEffect } from 'react'
import { 
  Search, Plus, Upload, Download, Eye, Pencil, Trash2, X, Check, XCircle,
  Calendar, MapPin, Users, Loader2,
  TrendingUp, AlertTriangle, FileSpreadsheet, ChevronLeft, ChevronRight,
  CheckCircle2, Award, BarChart2, Image, FileText, Clock
} from 'lucide-react'
import { BRAND as DEFAULT_BRAND } from '../../data/dashboardData'
import eventsService from '../../services/eventsService'
import { useToast } from '../../context/ToastContext'

export default function EventsPage({ tokens }) {
  const { dark } = tokens
  const BRAND = tokens?.brand || DEFAULT_BRAND
  const showToast = useToast()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modals state
  const [createEditOpen, setCreateEditOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null) // For editing or viewing
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [viewingDetailEvent, setViewingDetailEvent] = useState(null)
  const [approvalConfirmModal, setApprovalConfirmModal] = useState({
    open: false,
    event: null,
    targetStatus: 'Approved'
  })

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    organizer: '',
    category: 'Technical',
    eventType: 'Individual', // Individual, Team, Group, Both
    approvalStatus: 'Approved', // Approved, Rejected
    venue: '',
    date: '',
    time: '09:00',
    capacity: 500,
    registrationsCount: 0,
    status: 'Upcoming',
    qrAttendance: 'Disabled',
    description: '',
    registrationDeadline: '',
    banner: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  // Fetch events
  const loadEvents = async () => {
    setLoading(true)
    const res = await eventsService.fetchAll()
    if (res.success) {
      setEvents(res.events)
    } else {
      showToast(res.message || 'Failed to load events.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // Quick Admin Approval Toggle
  const handleToggleApproval = async (event, newStatus, e) => {
    if (e) e.stopPropagation()
    const res = await eventsService.update(event.id, { approvalStatus: newStatus })
    if (res.success) {
      showToast(`Event ${event.id} marked as ${newStatus}.`, 'success')
      setEvents(prev => prev.map(evt => evt.id === event.id ? { ...evt, approvalStatus: newStatus } : evt))
      if (viewingDetailEvent && viewingDetailEvent.id === event.id) {
        setViewingDetailEvent(prev => ({ ...prev, approvalStatus: newStatus }))
      }
    } else {
      showToast('Failed to update approval status.', 'error')
    }
  }

  // Categories & Event Types
  const categories = ['All', 'Technical', 'Cultural', 'Seminar', 'Sports', 'Academic', 'Workshop']
  const eventTypes = ['Individual', 'Team', 'Group', 'Both']
  const statuses = ['All', 'Upcoming', 'Draft', 'Ongoing', 'Completed', 'Cancelled']

  // Filter events
  const filteredEvents = events.filter(event => {
    const statusMatch = activeStatus === 'All' || event.status === activeStatus
    const categoryMatch = activeCategory === 'All' || event.category === activeCategory
    
    const searchLower = searchQuery.toLowerCase()
    const nameMatch = event.name.toLowerCase().includes(searchLower)
    const idMatch = event.id.toLowerCase().includes(searchLower)
    const organizerMatch = event.organizer.toLowerCase().includes(searchLower)
    const venueMatch = event.venue.toLowerCase().includes(searchLower)
    const typeMatch = (event.eventType || '').toLowerCase().includes(searchLower)
    const searchMatch = searchQuery === '' || nameMatch || idMatch || organizerMatch || venueMatch || typeMatch

    return statusMatch && categoryMatch && searchMatch
  })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeStatus, activeCategory])

  // Pagination Calculations
  const totalItems = filteredEvents.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedEvent(null)
    setFormState({
      name: '',
      organizer: '',
      category: 'Technical',
      eventType: 'Individual',
      approvalStatus: 'Approved',
      venue: '',
      date: '',
      time: '',
      capacity: 500,
      registrationsCount: 0,
      status: 'Upcoming',
      qrAttendance: 'Disabled',
      description: '',
      registrationDeadline: '',
      banner: null,
    })
    setFormErrors({})
    setCreateEditOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setFormState({
      name: event.name,
      organizer: event.organizer,
      category: event.category,
      eventType: event.eventType || 'Individual',
      approvalStatus: event.approvalStatus || 'Approved',
      venue: event.venue,
      date: event.date,
      time: event.time || '09:00',
      capacity: event.capacity,
      registrationsCount: event.registrationsCount,
      status: event.status,
      qrAttendance: event.qrAttendance || 'Disabled',
      description: event.description || '',
      registrationDeadline: event.registrationDeadline || '',
      banner: event.banner || null,
    })
    setFormErrors({})
    setCreateEditOpen(true)
  }

  // Open View sub-page
  const handleOpenView = (event, e) => {
    e.stopPropagation()
    setViewingDetailEvent(event)
  }

  // Open Delete Confirmation Modal
  const handleOpenDelete = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setDeleteConfirmOpen(true)
  }

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return
    const res = await eventsService.delete(selectedEvent.id)
    if (res.success) {
      showToast(`Event ${selectedEvent.id} deleted successfully.`, 'success')
      setDeleteConfirmOpen(false)
      loadEvents()
    } else {
      showToast('Failed to delete event.', 'error')
    }
  }

  // Admin Approval Modal Trigger
  const handleOpenApprovalConfirm = (event, targetStatus, e) => {
    if (e) e.stopPropagation()
    // If event is already approved and user tries to reject it, disallow
    if ((event.approvalStatus || 'Approved') === 'Approved' && targetStatus === 'Rejected') {
      showToast('Approved events cannot be rejected.', 'error')
      return
    }
    setApprovalConfirmModal({ open: true, event, targetStatus })
  }

  // Admin Approval Confirmation Action
  const handleConfirmApprovalStatus = async () => {
    const { event, targetStatus } = approvalConfirmModal
    if (!event) return
    const payload = {
      ...event,
      approvalStatus: targetStatus,
    }
    const res = await eventsService.update(event.id, payload)
    if (res.success) {
      showToast(`Event "${event.name}" ${targetStatus === 'Approved' ? 'approved' : 'rejected'} successfully.`, 'success')
      setApprovalConfirmModal({ open: false, event: null, targetStatus: 'Approved' })
      loadEvents()
    } else {
      showToast(res.message || 'Failed to update approval status.', 'error')
    }
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    if (!formState.name.trim()) errors.name = 'Event name is required'
    if (!formState.organizer.trim()) errors.organizer = 'Organizer is required'
    if (!formState.venue.trim()) errors.venue = 'Venue is required'
    if (!formState.date) errors.date = 'Date is required'
    if (formState.capacity <= 0) errors.capacity = 'Capacity must be greater than 0'
    if (formState.registrationsCount < 0) errors.registrationsCount = 'Registrations cannot be negative'
    if (parseInt(formState.registrationsCount, 10) > parseInt(formState.capacity, 10)) {
      errors.registrationsCount = 'Registrations cannot exceed capacity'
    }
    if (formState.registrationDeadline && formState.date) {
      if (new Date(formState.registrationDeadline) > new Date(formState.date)) {
        errors.registrationDeadline = 'Deadline must be on or before the event date'
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save Event (Create or Update)
  const handleSaveEvent = async (isDraft = false) => {
    if (!validateForm()) return
    setSubmitting(true)
    
    const payload = {
      ...formState,
      status: isDraft ? 'Draft' : (formState.status === 'Draft' ? 'Upcoming' : formState.status),
    }

    let res
    if (selectedEvent) {
      res = await eventsService.update(selectedEvent.id, payload)
    } else {
      res = await eventsService.create(payload)
    }

    setSubmitting(false)
    if (res.success) {
      showToast(
        selectedEvent 
          ? `Event ${selectedEvent.id} updated successfully.` 
          : (isDraft ? 'Draft saved successfully.' : 'New event published successfully.'), 
        'success'
      )
      setCreateEditOpen(false)
      if (selectedEvent && viewingDetailEvent && viewingDetailEvent.id === selectedEvent.id) {
        setViewingDetailEvent(res.event)
      }
      loadEvents()
    } else {
      showToast(res.message || 'Failed to save event.', 'error')
    }
  }

  // Export Events (Download JSON)
  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `events_export_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      showToast('Events exported successfully.', 'success')
    } catch (err) {
      showToast('Failed to export events.', 'error')
    }
  }

  // Import Action
  const handleImportDemo = async () => {
    setImporting(true)
    const demoData = [
      { name: 'National Seminar on AI', organizer: 'Dr. Priya Sharma', category: 'Academic', venue: 'Seminar Hall A', date: '2025-11-12', capacity: 200, registrationsCount: 150, status: 'Upcoming' },
      { name: 'Alumni Meet 2025', organizer: 'Prof. Raj Kumar', category: 'Seminar', venue: 'Open Air Theatre', date: '2025-12-05', capacity: 600, registrationsCount: 412, status: 'Upcoming' },
      { name: 'Innovate Hackathon', organizer: 'Dr. Anita Nair', category: 'Technical', venue: 'CS Lab Block', date: '2025-08-20', capacity: 150, registrationsCount: 0, status: 'Upcoming' }
    ]
    const res = await eventsService.import(demoData)
    setImporting(false)
    if (res.success) {
      showToast(`Imported ${res.count} demo events successfully.`, 'success')
      setImportOpen(false)
      loadEvents()
    } else {
      showToast('Failed to import events.', 'error')
    }
  }

  // Handle Custom JSON Import
  const handleImportCustom = async () => {
    if (!importText.trim()) return
    setImporting(true)
    try {
      const parsed = JSON.parse(importText)
      const list = Array.isArray(parsed) ? parsed : [parsed]
      const res = await eventsService.import(list)
      if (res.success) {
        showToast(`Imported ${res.count} events successfully.`, 'success')
        setImportText('')
        setImportOpen(false)
        loadEvents()
      } else {
        showToast(res.message || 'Import failed.', 'error')
      }
    } catch (e) {
      showToast('Invalid JSON format. Please check the structure.', 'error')
    } finally {
      setImporting(false)
    }
  }

  // Style helper based on status badge
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Upcoming':
        return {
          bg: dark ? 'rgba(97, 95, 255, 0.15)' : 'rgba(97, 95, 255, 0.1)',
          text: BRAND,
        }
      case 'Draft':
        return {
          bg: dark ? 'rgba(100, 116, 139, 0.15)' : 'rgba(100, 116, 139, 0.1)',
          text: dark ? '#94a3b8' : '#475569',
        }
      case 'Ongoing':
        return {
          bg: dark ? 'rgba(0, 188, 125, 0.15)' : 'rgba(0, 188, 125, 0.1)',
          text: '#00BC7D',
        }
      case 'Completed':
        return {
          bg: dark ? 'rgba(122, 152, 187, 0.15)' : 'rgba(100, 116, 139, 0.1)',
          text: dark ? '#7a98bb' : '#64748b',
        }
      case 'Cancelled':
        return {
          bg: dark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          text: '#ef4444',
        }
      default:
        return {
          bg: dark ? '#162640' : '#f1f5f9',
          text: dark ? '#7a98bb' : '#64748b',
        }
    }
  }

  // card layout themes
  const cardStyle = {
    background: tokens.card,
    border: `1px solid ${tokens.border}`,
    boxShadow: tokens.shadow,
  }

  const inputStyle = {
    border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`,
    color: dark ? '#e8f0fe' : '#0f172a',
    background: dark ? '#060e1c' : '#f8fafc',
  }

  return (
    <div className="p-5 px-6">
      {viewingDetailEvent ? (
        <EventDetailView 
          event={viewingDetailEvent} 
          onBack={() => {
            setViewingDetailEvent(null)
            loadEvents()
          }}
          onEdit={(e) => handleOpenEdit(viewingDetailEvent, e)}
          tokens={tokens}
          showToast={showToast}
        />
      ) : (
        <>
      
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold m-0 tracking-tight" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
            Events
          </h1>
          <p className="text-[13px] mt-1" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
            Manage all campus events
          </p>
        </div>
        
        {/* Actions Button */}
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold bg-transparent transition-all duration-200"
            style={{ border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`, color: dark ? '#7a98bb' : '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#64748b' }}
          >
            <Upload size={14} /> Import
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold bg-transparent transition-all duration-200"
            style={{ border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`, color: dark ? '#7a98bb' : '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#64748b' }}
          >
            <Download size={14} /> Export
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-bold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-px"
            style={{ background: BRAND, boxShadow: '0 4px 14px rgba(97,95,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(97,95,255,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(97,95,255,0.4)' }}
          >
            <Plus size={15} /> Create Event
          </button>
        </div>
      </div>

      {/* ── Filter Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        
        {/* Search */}
        <div className="relative w-full max-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: dark ? '#7a98bb' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-[42px] rounded-xl text-[13px] outline-none transition-all duration-200 border"
            style={{
              borderColor: dark ? '#1a3050' : '#e2e8f0',
              color: dark ? '#e8f0fe' : '#475569',
              background: dark ? '#0f1e30' : '#ffffff',
              fontWeight: 500,
            }}
            onFocus={e => { 
              e.target.style.borderColor = BRAND; 
              e.target.style.boxShadow = `0 0 0 3px ${BRAND}20`;
            }}
            onBlur={e => { 
              e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; 
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Tab & Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Status Tabs */}
          <div 
            className="flex items-center rounded-xl p-1 border h-[42px] box-border overflow-x-auto max-w-full flex-nowrap"
            style={{
              borderColor: dark ? '#1a3050' : '#e2e8f0',
              background: dark ? '#0f1e30' : '#ffffff',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {statuses.map(st => {
              const active = activeStatus === st
              return (
                <button
                  key={st}
                  onClick={() => setActiveStatus(st)}
                  className="px-4 h-[32px] rounded-xl text-[12px] border-none cursor-pointer flex items-center justify-center transition-all duration-200"
                  style={{
                    background: active ? BRAND : 'transparent',
                    color: active ? '#ffffff' : (dark ? '#7a98bb' : '#5c6f84'),
                    boxShadow: active ? '0 3px 10px rgba(97,95,255,0.3)' : 'none',
                    fontWeight: active ? '700' : '600',
                  }}
                >
                  {st}
                </button>
              )
            })}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
              className="pl-5 pr-9 h-[42px] rounded-full text-[12.5px] outline-none cursor-pointer border transition-all duration-200 appearance-none font-bold"
              style={{
                background: dark ? '#0f1e30' : '#ffffff',
                borderColor: dark ? '#1a3050' : '#e2e8f0',
                color: dark ? '#e8f0fe' : '#5c6f84',
              }}
              onFocus={e => {
                e.target.style.borderColor = BRAND;
                e.target.style.boxShadow = `0 0 0 3px ${BRAND}20`;
              }}
              onBlur={e => {
                e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All' : cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1.5L5 4.5L9 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` }}>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>EVENT ID</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>EVENT NAME</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>CATEGORY & TYPE</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>VENUE</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>DATE</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>REGISTRATION & CAPACITY</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>STATUS</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>ADMIN APPROVAL</th>
                <th className="px-5 py-4 text-[11px] font-bold tracking-wider text-right" style={{ color: dark ? '#7a98bb' : '#64748b' }}>ACTIONS</th>
              </tr>
            </thead>
            
            <tbody className="divide-y" style={{ divideColor: dark ? '#1a3050' : '#e2e8f0' }}>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-5 py-4"><div className="w-12 h-3.5 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="px-5 py-4">
                      <div className="w-36 h-4 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse mb-1" />
                      <div className="w-24 h-3 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" />
                    </td>
                    <td className="px-5 py-4"><div className="w-16 h-3.5 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-28 h-3.5 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3.5 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="px-5 py-4">
                      <div className="w-32 h-2 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse" />
                    </td>
                    <td className="px-5 py-4"><div className="w-16 h-5 rounded-full bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-6 rounded-full bg-slate-200/50 dark:bg-slate-800 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-7 rounded bg-slate-200/50 dark:bg-slate-800 animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <Calendar size={40} className="block mx-auto mb-3" style={{ color: dark ? '#3d5470' : '#94a3b8' }} />
                    <p className="text-[14px] font-medium" style={{ color: dark ? '#7a98bb' : '#64748b' }}>No events found</p>
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event, i) => {
                  const isApproved = (event.approvalStatus || 'Approved') === 'Approved'
                  const effectiveRegCount = isApproved ? (event.registrationsCount || 0) : 0
                  const regPercent = isApproved && event.capacity ? Math.min(Math.round((effectiveRegCount / event.capacity) * 100), 100) : 0
                  const badge = getStatusBadgeStyles(event.status)
                  
                  return (
                    <tr 
                      key={event.id}
                      className="transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-[#162640]/20"
                      style={{ borderBottom: i < paginatedEvents.length - 1 ? `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` : 'none' }}
                    >
                      {/* ID */}
                      <td className="px-5 py-4 text-[13px] font-bold" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                        {event.id}
                      </td>

                      {/* Name + Organizer */}
                      <td className="px-5 py-4">
                        <div className="text-[13.5px] font-bold" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>{event.name}</div>
                        <div className="text-[11px] mt-0.5 font-medium" style={{ color: dark ? '#7a98bb' : '#64748b' }}>{event.organizer}</div>
                      </td>

                      {/* Category & Type */}
                      <td className="px-5 py-4">
                        <div className="text-[13px] font-semibold" style={{ color: dark ? '#e8f0fe' : '#334155' }}>
                          {event.category}
                        </div>
                        <span
                          className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                          style={{
                            background: dark ? `${BRAND}20` : `${BRAND}12`,
                            color: BRAND
                          }}
                        >
                          {event.eventType || 'Individual'}
                        </span>
                      </td>

                      {/* Venue */}
                      <td className="px-5 py-4 text-[13px]" style={{ color: dark ? '#7a98bb' : '#475569' }}>
                        {event.venue}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-[13px]" style={{ color: dark ? '#7a98bb' : '#475569' }}>
                        {event.date}
                      </td>

                      {/* Combined Registrations & Capacity */}
                      <td className="px-5 py-4 min-w-[150px]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[13px] font-extrabold" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                            {effectiveRegCount} <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">/ {event.capacity}</span>
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500">
                            {regPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${regPercent}%`, 
                              background: isApproved ? BRAND : (dark ? '#334155' : '#cbd5e1') 
                            }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block text-center"
                          style={{ background: badge.bg, color: badge.text }}
                        >
                          {event.status}
                        </span>
                      </td>

                      {/* Admin Approval Switch / Badge */}
                      <td className="px-5 py-4">
                        {isApproved ? (
                          <span 
                            className="px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default w-fit"
                            title="Approved (Decision Locked)"
                          >
                            <Check size={12} strokeWidth={3} />
                            Approved
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleOpenApprovalConfirm(event, 'Approved', e)}
                              title="Click to Approve Event"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1 border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <Check size={11} strokeWidth={3} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenApprovalConfirm(event, 'Rejected', e)}
                              title="Click to Reject Event"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1 border bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                            >
                              <X size={11} strokeWidth={3} />
                              Rejected
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={(e) => handleOpenView(event, e)}
                            title="View event details"
                            className="w-[28px] h-[28px] rounded-lg bg-transparent cursor-pointer flex items-center justify-center transition-all duration-150"
                            style={{ border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`, color: dark ? '#7a98bb' : '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#94a3b8' }}
                          >
                            <Eye size={12.5} />
                          </button>
                          
                          <button
                            onClick={(e) => handleOpenEdit(event, e)}
                            title="Edit event"
                            className="w-[28px] h-[28px] rounded-lg bg-transparent cursor-pointer flex items-center justify-center transition-all duration-150"
                            style={{ border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`, color: dark ? '#7a98bb' : '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#94a3b8' }}
                          >
                            <Pencil size={12.5} />
                          </button>

                          <button
                            onClick={(e) => handleOpenDelete(event, e)}
                            title="Delete event"
                            className="w-[28px] h-[28px] rounded-lg bg-transparent cursor-pointer flex items-center justify-center transition-all duration-150"
                            style={{ border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`, color: dark ? '#7a98bb' : '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#94a3b8' }}
                          >
                            <Trash2 size={12.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination Bar ── */}
        <div 
          className="flex items-center justify-between flex-wrap gap-4 px-6 py-4"
          style={{ borderTop: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` }}
        >
          {/* Showing status & Items per page */}
          <div className="flex items-center gap-4">
            <span className="text-[12.5px] font-medium" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
              Showing <strong style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{' '}
              <strong style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>{endIndex}</strong> of{' '}
              <strong style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>{totalItems}</strong> entries
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={e => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1 rounded-lg text-[12px] font-bold outline-none cursor-pointer border"
                style={{
                  background: dark ? '#0f1e30' : '#ffffff',
                  borderColor: dark ? '#1a3050' : '#cbd5e1',
                  color: dark ? '#e8f0fe' : '#334155'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Pagination Page Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border bg-transparent cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: dark ? '#1a3050' : '#e2e8f0',
                color: dark ? '#e8f0fe' : '#475569'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const active = page === currentPage
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg text-[12.5px] font-extrabold cursor-pointer transition-all border-none"
                  style={{
                    background: active ? BRAND : (dark ? '#0f1e30' : '#f1f5f9'),
                    color: active ? '#ffffff' : (dark ? '#7a98bb' : '#475569'),
                    boxShadow: active ? '0 3px 10px rgba(97,95,255,0.3)' : 'none'
                  }}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border bg-transparent cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: dark ? '#1a3050' : '#e2e8f0',
                color: dark ? '#e8f0fe' : '#475569'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT EVENT MODAL ── */}
      {createEditOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-fadeIn"
          onClick={e => { if (e.target === e.currentTarget) setCreateEditOpen(false) }}
        >
          <div
            className="rounded-[24px] w-full max-w-[650px] overflow-hidden transition-all duration-300"
            style={{
              background: dark ? '#0c1829' : '#ffffff',
              border: `1px solid ${dark ? '#1a3050' : '#e8edf5'}`,
              boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
              animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <style>{`
              @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: `1px solid ${dark ? '#1a3050' : '#e8edf5'}` }}>
              <h2 className="text-[19px] font-extrabold m-0" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                {selectedEvent ? `Edit Event — ${selectedEvent.id}` : 'Create New Event'}
              </h2>
              <button
                onClick={() => setCreateEditOpen(false)}
                className="w-8 h-8 rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-150"
                style={{ color: dark ? '#4a6a8a' : '#94a3b8' }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#162640' : '#f1f5f9'; e.currentTarget.style.color = dark ? '#e8f0fe' : '#475569' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = dark ? '#4a6a8a' : '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              
              {/* Event Name */}
              <div>
                <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                  Event Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. TechFest 2025"
                  value={formState.name}
                  onChange={e => setFormState(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                  style={{
                    ...inputStyle,
                    borderColor: formErrors.name ? '#ef4444' : dark ? '#1a3050' : '#e2e8f0'
                  }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                  onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
                {formErrors.name && <span className="text-[11px] text-red-500 mt-1.5 block">{formErrors.name}</span>}
              </div>

              {/* Grid: Category & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={formState.category}
                      onChange={e => setFormState(p => ({ ...p, category: e.target.value }))}
                      className="w-full pl-4 pr-10 py-3 rounded-xl text-[13.5px] outline-none cursor-pointer border appearance-none transition-all duration-200"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                      onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1.5L5 4.5L9 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium"
                    value={formState.venue}
                    onChange={e => setFormState(p => ({ ...p, venue: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.venue ? '#ef4444' : dark ? '#1a3050' : '#e2e8f0'
                    }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                    onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                  {formErrors.venue && <span className="text-[11px] text-red-500 mt-1.5 block">{formErrors.venue}</span>}
                </div>
              </div>

              {/* Grid: Event Type (Participation) & Admin Approval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Participation Type (Individual / Team / Group)
                  </label>
                  <div className="relative">
                    <select
                      value={formState.eventType || 'Individual'}
                      onChange={e => setFormState(p => ({ ...p, eventType: e.target.value }))}
                      className="w-full pl-4 pr-10 py-3 rounded-xl text-[13.5px] outline-none cursor-pointer border appearance-none transition-all duration-200 font-semibold"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                      onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    >
                      {eventTypes.map(t => (
                        <option key={t} value={t}>{t} Event</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1.5L5 4.5L9 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Admin Approval Status
                  </label>
                  <div className="relative">
                    <select
                      value={formState.approvalStatus || 'Approved'}
                      onChange={e => setFormState(p => ({ ...p, approvalStatus: e.target.value }))}
                      className="w-full pl-4 pr-10 py-3 rounded-xl text-[13.5px] outline-none cursor-pointer border appearance-none transition-all duration-200 font-bold"
                      style={{
                        ...inputStyle,
                        color: (formState.approvalStatus || 'Approved') === 'Approved' ? '#10b981' : '#ef4444'
                      }}
                      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                      onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    >
                      <option value="Approved" className="text-emerald-500 font-bold">Approved</option>
                      <option value="Rejected" className="text-red-500 font-bold">Rejected</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1.5L5 4.5L9 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formState.date}
                    onChange={e => setFormState(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.date ? '#ef4444' : dark ? '#1a3050' : '#e2e8f0',
                      colorScheme: dark ? 'dark' : 'light'
                    }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                    onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                  {formErrors.date && <span className="text-[11px] text-red-500 mt-1.5 block">{formErrors.date}</span>}
                </div>

                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={formState.time}
                    onChange={e => setFormState(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                    style={{
                      ...inputStyle,
                      colorScheme: dark ? 'dark' : 'light'
                    }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                    onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              {/* Grid: Capacity & Registration Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={formState.capacity}
                    onChange={e => setFormState(p => ({ ...p, capacity: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.capacity ? '#ef4444' : dark ? '#1a3050' : '#e2e8f0'
                    }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                    onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                  {formErrors.capacity && <span className="text-[11px] text-red-500 mt-1.5 block">{formErrors.capacity}</span>}
                </div>

                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={formState.registrationDeadline}
                    onChange={e => setFormState(p => ({ ...p, registrationDeadline: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.registrationDeadline ? '#ef4444' : dark ? '#1a3050' : '#e2e8f0',
                      colorScheme: dark ? 'dark' : 'light'
                    }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                    onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                  {formErrors.registrationDeadline && <span className="text-[11px] text-red-500 mt-1.5 block">{formErrors.registrationDeadline}</span>}
                </div>
              </div>

              {/* Grid: Assign Organizer & Blank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                    Assign Organizer
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Priya Sharma"
                    value={formState.organizer}
                    onChange={e => setFormState(p => ({ ...p, organizer: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-200 border"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.organizer ? '#ef4444' : dark ? '#1a3050' : '#e2e8f0'
                    }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                    onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                  {formErrors.organizer && <span className="text-[11px] text-red-500 mt-1.5 block">{formErrors.organizer}</span>}
                </div>
                <div />
              </div>

              {/* Event Description */}
              <div>
                <label className="text-[13px] font-bold block mb-1.5" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                  Event Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the event..."
                  value={formState.description}
                  onChange={e => setFormState(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none resize-none transition-all duration-200 border"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                  onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Enable QR Attendance Switch */}
              <div 
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                style={{
                  background: dark ? '#091526' : '#f0f4f8',
                  border: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setFormState(p => ({ ...p, qrAttendance: p.qrAttendance === 'Enabled' ? 'Disabled' : 'Enabled' }))}
                  className="w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer outline-none border-none shrink-0"
                  style={{
                    backgroundColor: formState.qrAttendance === 'Enabled' ? BRAND : (dark ? '#162640' : '#cbd5e1'),
                  }}
                >
                  <div 
                    className="w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-transform duration-200 shadow"
                    style={{
                      transform: formState.qrAttendance === 'Enabled' ? 'translateX(22px)' : 'translateX(4px)',
                    }}
                  />
                </button>

                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[13px] font-bold" style={{ color: dark ? '#e8f0fe' : '#1e293b' }}>
                    Enable QR Attendance
                  </span>
                  <span className="text-[11.5px] leading-tight font-medium" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                    Generate QR code for contactless attendance marking
                  </span>
                </div>
              </div>

              {/* Image Drag and Drop Upload */}
              <div>
                <input 
                  type="file"
                  accept="image/*"
                  id="banner-file-input"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setFormState(p => ({ ...p, banner: reader.result }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <label
                  htmlFor="banner-file-input"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-[#162640]/20"
                  style={{
                    borderColor: dark ? '#1a3050' : '#d8e3f0',
                    background: dark ? '#091526' : '#ffffff',
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setFormState(p => ({ ...p, banner: reader.result }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                >
                  {formState.banner ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img 
                        src={formState.banner} 
                        alt="Banner preview" 
                        className="max-h-[140px] rounded-lg object-cover mb-2 w-full"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setFormState(p => ({ ...p, banner: null }))
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 border-none cursor-pointer flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                      <span className="text-[12px] font-bold text-slate-500">Click or drag to replace image</span>
                    </div>
                  ) : (
                    <>
                      <Image size={32} className="mb-2" style={{ color: dark ? '#7a98bb' : '#94a3b8' }} />
                      <div className="text-[13px] font-semibold text-center" style={{ color: dark ? '#cbd5e1' : '#475569' }}>
                        Drop event banner here or <span className="text-blue-500 font-bold hover:underline">browse</span>
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: dark ? '#7a98bb' : '#94a3b8' }}>
                        PNG, JPG up to 5MB
                      </div>
                    </>
                  )}
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 px-8 py-5" style={{ borderTop: `1px solid ${dark ? '#1a3050' : '#e8edf5'}` }}>
              <button
                onClick={() => handleSaveEvent(true)}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-[13.5px] font-bold bg-transparent transition-all duration-150 border cursor-pointer"
                style={{ 
                  borderColor: dark ? '#1a3050' : '#e2e8f0', 
                  color: dark ? '#cbd5e1' : '#475569',
                  background: dark ? '#162640' : '#f8fafc' 
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#cbd5e1' : '#475569' }}
              >
                Save Draft
              </button>

              <button
                onClick={() => handleSaveEvent(false)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13.5px] font-bold text-white border-none cursor-pointer transition-all duration-200 disabled:opacity-50"
                style={{ background: BRAND, boxShadow: '0 4px 14px rgba(97,95,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(97,95,255,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(97,95,255,0.4)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : 'Publish Event'}
              </button>
            </div>

          </div>
        </div>
      )}

        </>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-fadeIn"
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirmOpen(false) }}
        >
          <div
            className="rounded-[20px] w-full max-w-[400px] overflow-hidden"
            style={{
              background: dark ? '#0c1829' : '#ffffff',
              border: `1px solid ${dark ? '#1a3050' : '#e8edf5'}`,
              boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
              animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Body */}
            <div className="px-6 py-6 flex flex-col items-center text-center">
              <div className="w-[50px] h-[50px] rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-[17px] font-extrabold m-0 mb-2" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                Delete Event?
              </h3>
              <p className="text-[13px] leading-relaxed m-0" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                Are you sure you want to delete <strong style={{ color: dark ? '#e8f0fe' : '#334155' }}>{selectedEvent.name}</strong> ({selectedEvent.id})? This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${dark ? '#1a3050' : '#e8edf5'}` }}>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-transparent transition-all duration-150 border cursor-pointer"
                style={{ borderColor: dark ? '#1a3050' : '#e2e8f0', color: dark ? '#7a98bb' : '#64748b' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#64748b' }}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-[10px] text-[13px] font-bold text-white border-none cursor-pointer bg-red-500 transition-all duration-200"
                style={{ boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.4)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPROVAL CONFIRMATION MODAL ── */}
      {approvalConfirmModal.open && approvalConfirmModal.event && (
        <div
          className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-fadeIn"
          onClick={e => { if (e.target === e.currentTarget) setApprovalConfirmModal({ open: false, event: null, targetStatus: 'Approved' }) }}
        >
          <div
            className="rounded-[20px] w-full max-w-[400px] overflow-hidden"
            style={{
              background: dark ? '#0c1829' : '#ffffff',
              border: `1px solid ${dark ? '#1a3050' : '#e8edf5'}`,
              boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
              animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Body */}
            <div className="px-6 py-6 flex flex-col items-center text-center">
              <div className={`w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4 ${
                approvalConfirmModal.targetStatus === 'Approved' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {approvalConfirmModal.targetStatus === 'Approved' ? (
                  <CheckCircle2 size={26} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <h3 className="text-[17px] font-extrabold m-0 mb-2" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                {approvalConfirmModal.targetStatus === 'Approved' ? 'Approve Event?' : 'Reject Event?'}
              </h3>
              <p className="text-[13px] leading-relaxed m-0" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                Are you sure you want to {approvalConfirmModal.targetStatus === 'Approved' ? 'approve' : 'reject'}{' '}
                <strong style={{ color: dark ? '#e8f0fe' : '#334155' }}>{approvalConfirmModal.event.name}</strong>?
                {approvalConfirmModal.targetStatus === 'Approved' && ' Once approved, this decision cannot be reverted.'}
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${dark ? '#1a3050' : '#e8edf5'}` }}>
              <button
                onClick={() => setApprovalConfirmModal({ open: false, event: null, targetStatus: 'Approved' })}
                className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-transparent transition-all duration-150 border cursor-pointer"
                style={{ borderColor: dark ? '#1a3050' : '#e2e8f0', color: dark ? '#7a98bb' : '#64748b' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#64748b' }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmApprovalStatus}
                className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold text-white border-none cursor-pointer transition-all duration-200 ${
                  approvalConfirmModal.targetStatus === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                style={{ 
                  boxShadow: approvalConfirmModal.targetStatus === 'Approved'
                    ? '0 4px 14px rgba(16, 185, 129, 0.4)'
                    : '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT MODAL ── */}
      {importOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-fadeIn"
          onClick={e => { if (e.target === e.currentTarget) setImportOpen(false) }}
        >
          <div
            className="rounded-[20px] w-full max-w-[480px] overflow-hidden"
            style={{
              background: dark ? '#0c1829' : '#ffffff',
              border: `1px solid ${dark ? '#1a3050' : '#e8edf5'}`,
              boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
              animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${dark ? '#1a3050' : '#e8edf5'}` }}>
              <h2 className="text-[17px] font-extrabold m-0 flex items-center gap-2" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                <FileSpreadsheet size={18} style={{ color: BRAND }} /> Import Events
              </h2>
              <button
                onClick={() => setImportOpen(false)}
                className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-150"
                style={{ color: dark ? '#4a6a8a' : '#94a3b8' }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#162640' : '#f1f5f9'; e.currentTarget.style.color = dark ? '#e8f0fe' : '#475569' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = dark ? '#4a6a8a' : '#94a3b8' }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              
              {/* Option 1: Demo Import */}
              <div className="p-4 rounded-xl border border-dashed flex flex-col gap-3" style={{ borderColor: dark ? '#1a3050' : '#e2e8f0', background: dark ? '#060e1c' : '#f8fafc' }}>
                <div>
                  <h4 className="text-[13.5px] font-extrabold m-0" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>Option 1: Import Demo Events</h4>
                  <p className="text-[12px] mt-1 mb-0" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                    Quickly load 3 pre-configured campus events to populate the dashboard table for testing.
                  </p>
                </div>
                <button
                  onClick={handleImportDemo}
                  disabled={importing}
                  className="w-full py-2 flex items-center justify-center gap-1.5 rounded-[8px] text-[12px] font-bold text-white border-none cursor-pointer transition-all duration-200"
                  style={{ background: BRAND, boxShadow: '0 2px 8px rgba(97,95,255,0.3)' }}
                >
                  {importing ? <Loader2 size={13} className="animate-spin" /> : 'Load Demo Events'}
                </button>
              </div>

              <div className="text-center text-[11px] font-bold" style={{ color: dark ? '#3d5470' : '#94a3b8' }}>— OR —</div>

              {/* Option 2: Custom JSON */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                  Option 2: Paste JSON List
                </label>
                <textarea
                  rows={6}
                  placeholder={`[\n  {\n    "name": "Custom Hackathon",\n    "organizer": "Dr. Anita Nair",\n    "category": "Technical",\n    "venue": "Lab C",\n    "date": "2025-10-15",\n    "capacity": 100,\n    "status": "Upcoming"\n  }\n]`}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[12px] outline-none resize-none box-border font-mono transition-all duration-200"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
                  onBlur={e => { e.target.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  onClick={handleImportCustom}
                  disabled={importing || !importText.trim()}
                  className="w-full py-2.5 rounded-[8px] text-[12px] font-bold text-white border-none cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: BRAND }}
                >
                  Import Paste JSON
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// EVENT DETAIL VIEW SUB-COMPONENT
// ─────────────────────────────────────────────────────────────────
function EventDetailView({ event, onBack, onEdit, tokens, showToast }) {
  const { dark } = tokens
  const BRAND = tokens?.brand || DEFAULT_BRAND
  const [activeTab, setActiveTab] = useState('Overview')
  const [registrations, setRegistrations] = useState([])
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [attendance, setAttendance] = useState([])
  const [loadingAtt, setLoadingAtt] = useState(false)

  const loadRegistrations = async () => {
    setLoadingRegs(true)
    const res = await eventsService.fetchRegistrations(event.id)
    if (res.success) {
      setRegistrations(res.registrations)
    }
    setLoadingRegs(false)
  }

  const loadAttendance = async () => {
    setLoadingAtt(true)
    const res = await eventsService.fetchAttendance(event.id)
    if (res.success) {
      setAttendance(res.attendance)
    }
    setLoadingAtt(false)
  }

  useEffect(() => {
    loadRegistrations()
    loadAttendance()
  }, [event.id])

  const handleStatusChange = async (regId, status) => {
    const res = await eventsService.updateRegistrationStatus(regId, status)
    if (res.success) {
      showToast(`Registration status updated to ${status}.`, 'success')
      setRegistrations(prev =>
        prev.map(r => r.id === regId ? { ...r, status } : r)
      )
      
      let change = 0
      const oldReg = registrations.find(r => r.id === regId)
      if (oldReg) {
        if (oldReg.status !== 'Approved' && status === 'Approved') change = 1
        else if (oldReg.status === 'Approved' && status !== 'Approved') change = -1
      }
      if (change !== 0) {
        event.registrationsCount = Math.max(0, (event.registrationsCount || 0) + change)
      }
    } else {
      showToast(res.message || 'Failed to update registration status.', 'error')
    }
  }
  
  // Custom status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Upcoming':
        return { bg: '#e0f2fe', text: '#0369a1' } // Sky/Blue
      case 'Ongoing':
        return { bg: '#dcfce7', text: '#15803d' } // Green
      case 'Completed':
        return { bg: '#f1f5f9', text: '#475569' } // Slate
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#b91c1c' } // Red
      default:
        return { bg: '#e2e8f0', text: '#475569' }
    }
  }

  const getRegStatusStyle = (status) => {
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

  const badge = getStatusStyle(event.status)
  const isApproved = (event.approvalStatus || 'Approved') === 'Approved'
  const effectiveRegs = isApproved ? (event.registrationsCount || 0) : 0
  const regPercent = isApproved && event.capacity ? Math.min(Math.round((effectiveRegs / event.capacity) * 100), 100) : 0
  const remaining = isApproved ? Math.max(event.capacity - effectiveRegs, 0) : event.capacity

  // Sub-tabs list
  const tabs = ['Overview', 'Registrations', 'Attendance', 'Analytics', 'Certificates', 'Gallery']

  return (
    <div className="animate-fadeIn m-4" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
      
      {/* ── TOP HEADER ROW ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{ 
              borderColor: dark ? '#1a3050' : '#e2e8f0', 
              background: dark ? '#0f1e30' : '#ffffff',
              color: dark ? '#7a98bb' : '#64748b'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#1a3050' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#7a98bb' : '#64748b' }}
          >
            <ChevronLeft size={18} />
          </button>
          
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-extrabold m-0 leading-tight">
                {event.name}
              </h1>
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: badge.bg, color: badge.text }}
              >
                {event.status}
              </span>
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                style={{ 
                  background: dark ? `${BRAND}25` : `${BRAND}15`, 
                  color: BRAND 
                }}
              >
                {event.eventType || 'Individual'} Event
              </span>
              <span 
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  (event.approvalStatus || 'Approved') === 'Approved'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
                }`}
              >
                Admin {(event.approvalStatus || 'Approved')}
              </span>
            </div>
            <p className="text-[12px] mt-1 mb-0 font-semibold" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
              ID: {event.id} &middot; Organized by {event.organizer}
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-px"
          style={{ background: BRAND, boxShadow: '0 4px 14px rgba(97,95,255,0.4)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(97,95,255,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(97,95,255,0.4)' }}
        >
          <Pencil size={13} /> Edit Event
        </button>
      </div>

      {/* ── BANNER CARD ── */}
      <div 
        className="rounded-[24px] p-8 md:p-10 mb-6 relative overflow-hidden flex flex-col justify-end min-h-[160px]"
        style={{ 
          background: `linear-gradient(135deg, ${BRAND} 0%, #4c49d8 100%)`,
          boxShadow: '0 12px 32px rgba(97,95,255,0.25)' 
        }}
      >
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-white/5 blur-lg pointer-events-none" />

        <div className="relative z-10 text-white">
          <div className="text-[12px] font-extrabold uppercase tracking-widest opacity-80 flex items-center gap-1.5 mb-2">
            <Clock size={12} /> {event.date} &bull; {event.time}
          </div>
          <h2 className="text-[28px] md:text-[34px] font-black m-0 leading-tight tracking-tight">
            {event.name}
          </h2>
          <div className="flex flex-wrap items-center gap-5 mt-4 text-[13.5px] font-bold opacity-90">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {event.venue}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} /> {event.registrationsCount} / {event.capacity} registered
            </span>
          </div>
        </div>
      </div>

      {/* ── SUB-TABS BAR ── */}
      <div 
        className="rounded-2xl p-1 mb-6 border flex flex-wrap gap-1.5"
        style={{ 
          borderColor: dark ? '#1a3050' : '#e2e8f0', 
          background: dark ? '#0f1e30' : '#ffffff' 
        }}
      >
        {tabs.map(tab => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer transition-all duration-200"
              style={{
                background: active ? BRAND : 'transparent',
                color: active ? '#ffffff' : (dark ? '#7a98bb' : '#5c6f84'),
                boxShadow: active ? '0 3px 10px rgba(97,95,255,0.3)' : 'none'
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div>
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* About card */}
              <div 
                className="rounded-2xl p-6 border"
                style={{ 
                  borderColor: dark ? '#1a3050' : '#e2e8f0', 
                  background: dark ? '#0f1e30' : '#ffffff' 
                }}
              >
                <h3 className="text-[16px] font-extrabold m-0 mb-4" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                  About this Event
                </h3>
                <p className="text-[13.5px] leading-relaxed font-medium m-0" style={{ color: dark ? '#7a98bb' : '#5c6f84' }}>
                  {event.description}
                </p>
              </div>

              {/* Schedule card */}
              <div 
                className="rounded-2xl p-6 border"
                style={{ 
                  borderColor: dark ? '#1a3050' : '#e2e8f0', 
                  background: dark ? '#0f1e30' : '#ffffff' 
                }}
              >
                <h3 className="text-[16px] font-extrabold m-0 mb-5" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                  Schedule
                </h3>
                <div className="flex flex-col gap-5">
                  {event.schedule && event.schedule.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="text-[12.5px] font-black w-20 shrink-0 mt-0.5 text-center py-0.5 rounded bg-slate-100 dark:bg-slate-800" style={{ color: BRAND }}>
                        {item.time}
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-extrabold m-0" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                          {item.title}
                        </h4>
                        <p className="text-[12px] font-semibold mt-1 mb-0" style={{ color: dark ? '#7a98bb' : '#94a3b8' }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              
              {/* Event Details card */}
              <div 
                className="rounded-2xl p-6 border"
                style={{ 
                  borderColor: dark ? '#1a3050' : '#e2e8f0', 
                  background: dark ? '#0f1e30' : '#ffffff' 
                }}
              >
                <h3 className="text-[16px] font-extrabold m-0 mb-4" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                  Event Details
                </h3>
                <div className="flex flex-col gap-3.5">
                  {[
                    { label: 'Category', value: event.category },
                    { label: 'Venue', value: event.venue },
                    { label: 'Date', value: event.date },
                    { label: 'Time', value: event.time },
                    { label: 'Capacity', value: `${event.capacity} seats` },
                    { label: 'Registered', value: `${event.registrationsCount} students` },
                    { label: 'Organizer', value: event.organizer },
                    { label: 'QR Attendance', value: event.qrAttendance || 'Enabled' }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px] font-semibold">
                      <span style={{ color: dark ? '#7a98bb' : '#94a3b8' }}>{row.label}</span>
                      <span style={{ color: dark ? '#e8f0fe' : '#334155' }} className="text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Progress card */}
              <div 
                className="rounded-2xl p-6 border"
                style={{ 
                  borderColor: dark ? '#1a3050' : '#e2e8f0', 
                  background: dark ? '#0f1e30' : '#ffffff' 
                }}
              >
                <h3 className="text-[16px] font-extrabold m-0 mb-4" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                  Registration Progress
                </h3>
                
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-[34px] font-black leading-none" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                    {regPercent}%
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: dark ? '#7a98bb' : '#94a3b8' }}>
                    capacity filled
                  </span>
                </div>

                <div className="h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${regPercent}%`, background: BRAND }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
                  <span>{event.registrationsCount} registered</span>
                  <span>{remaining} remaining</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'Registrations' && (
          <div 
            className="rounded-2xl p-6 border overflow-x-auto"
            style={{ 
              borderColor: dark ? '#1a3050' : '#e2e8f0', 
              background: dark ? '#0f1e30' : '#ffffff' 
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-extrabold m-0" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
                Registered Students List
              </h3>
              <span className="px-3 py-1 rounded-full text-[11.5px] font-bold" style={{ background: `${BRAND}15`, color: BRAND }}>
                {registrations.length} registrations
              </span>
            </div>
            
            {loadingRegs ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                No registrations found for this event.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` }}>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>STUDENT NAME</th>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>ROLL NO</th>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>DEPARTMENT</th>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>YEAR</th>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>DATE</th>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>STATUS</th>
                    <th className="py-3 text-[11px] font-bold tracking-wider" style={{ color: dark ? '#7a98bb' : '#64748b' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: dark ? '#1a3050' : '#e2e8f0' }}>
                  {registrations.map((att, i) => {
                    const statusBadge = getRegStatusStyle(att.status)
                    return (
                      <tr key={att.id} style={{ borderBottom: i < registrations.length - 1 ? `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` : 'none' }}>
                        <td className="py-3.5 text-[13px] font-bold" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>{att.studentName}</td>
                        <td className="py-3.5 text-[13px] font-semibold text-slate-500 dark:text-[#7a98bb]">{att.rollNo}</td>
                        <td className="py-3.5 text-[13px] font-semibold text-slate-600 dark:text-[#7a98bb]">{att.department}</td>
                        <td className="py-3.5 text-[13px] font-semibold text-slate-500 dark:text-[#7a98bb]">{att.year}</td>
                        <td className="py-3.5 text-[13px] font-medium text-slate-500 dark:text-[#7a98bb]">{att.date}</td>
                        <td className="py-3.5 text-[13px]">
                          <span 
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block text-center"
                            style={{ background: statusBadge.bg, color: statusBadge.text }}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-[13px]">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleStatusChange(att.id, 'Approved')}
                              className="w-7 h-7 rounded-lg bg-transparent border-none cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              style={{ color: dark ? '#7a98bb' : '#64748b' }}
                              title="Approve"
                            >
                              <Check size={16} className="hover:text-emerald-500 transition-colors" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(att.id, 'Rejected')}
                              className="w-7 h-7 rounded-lg bg-transparent border-none cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              style={{ color: dark ? '#7a98bb' : '#64748b' }}
                              title="Reject"
                            >
                              <XCircle size={16} className="hover:text-rose-500 transition-colors" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="flex flex-col gap-6">
            {loadingAtt ? (
              <div 
                className="rounded-2xl p-12 border text-center flex flex-col items-center justify-center gap-3"
                style={{ 
                  borderColor: dark ? '#1a3050' : '#e2e8f0', 
                  background: dark ? '#0f1e30' : '#ffffff' 
                }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
                <span className="text-[13px] font-semibold text-slate-500">Loading attendance data...</span>
              </div>
            ) : (
              <>
                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Present */}
                  <div 
                    className="rounded-2xl p-6 text-center border"
                    style={{
                      borderColor: dark ? '#1a3050' : '#e2e8f0', 
                      background: dark ? '#0f1e30' : '#ffffff' 
                    }}
                  >
                    <div className="text-[32px] font-black text-emerald-500">
                      {attendance.filter(a => a.status === 'Present').length}
                    </div>
                    <div className="text-[13px] font-bold text-slate-500 mt-1">Present</div>
                  </div>

                  {/* Card 2: Absent */}
                  <div 
                    className="rounded-2xl p-6 text-center border"
                    style={{
                      borderColor: dark ? '#1a3050' : '#e2e8f0', 
                      background: dark ? '#0f1e30' : '#ffffff' 
                    }}
                  >
                    <div className="text-[32px] font-black text-rose-500">
                      {attendance.filter(a => a.status === 'Absent').length}
                    </div>
                    <div className="text-[13px] font-bold text-slate-500 mt-1">Absent</div>
                  </div>

                  {/* Card 3: Late */}
                  <div 
                    className="rounded-2xl p-6 text-center border"
                    style={{
                      borderColor: dark ? '#1a3050' : '#e2e8f0', 
                      background: dark ? '#0f1e30' : '#ffffff' 
                    }}
                  >
                    <div className="text-[32px] font-black text-amber-500">
                      {attendance.filter(a => a.status === 'Late').length}
                    </div>
                    <div className="text-[13px] font-bold text-slate-500 mt-1">Late</div>
                  </div>

                  {/* Card 4: Attendance % */}
                  <div 
                    className="rounded-2xl p-6 text-center border"
                    style={{
                      borderColor: dark ? '#1a3050' : '#e2e8f0', 
                      background: dark ? '#0f1e30' : '#ffffff' 
                    }}
                  >
                    <div className="text-[32px] font-black text-indigo-500">
                      {attendance.length > 0 
                        ? Math.round(
                            ((attendance.filter(a => a.status === 'Present').length + 
                              attendance.filter(a => a.status === 'Late').length) / 
                             attendance.length) * 100
                          ) 
                        : 0}%
                    </div>
                    <div className="text-[13px] font-bold text-slate-500 mt-1">Attendance %</div>
                  </div>
                </div>

                {/* ── ATTENDANCE TABLE ── */}
                <div 
                  className="rounded-2xl border overflow-x-auto"
                  style={{
                    borderColor: dark ? '#1a3050' : '#e2e8f0', 
                    background: dark ? '#0f1e30' : '#ffffff' 
                  }}
                >
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr style={{ background: dark ? '#060e1c' : '#f8fafc', borderBottom: `1px solid ${dark ? '#1a3050' : '#e2e8f0'}` }}>
                        <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Student</th>
                        <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Roll No</th>
                        <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Check-in</th>
                        <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Check-out</th>
                        <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((row) => {
                        let statusColor = { bg: '#e2e8f0', text: '#475569' }
                        if (row.status === 'Present') {
                          statusColor = {
                            bg: dark ? 'rgba(16, 185, 129, 0.15)' : '#e6fbf2',
                            text: '#00BC7D',
                          }
                        } else if (row.status === 'Late') {
                          statusColor = {
                            bg: dark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                            text: '#d97706',
                          }
                        } else if (row.status === 'Absent') {
                          statusColor = {
                            bg: dark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                            text: '#ef4444',
                          }
                        }

                        return (
                          <tr 
                            key={row.id} 
                            className="border-b last:border-b-0 transition-colors"
                            style={{ 
                              borderColor: dark ? '#1a3050' : '#e2e8f0',
                            }}
                          >
                            <td className="p-4 text-[13.5px] font-bold text-slate-900 dark:text-slate-100">{row.studentName}</td>
                            <td className="p-4 text-[13.5px] font-semibold text-slate-500 dark:text-slate-400">{row.rollNo}</td>
                            <td className="p-4 text-[13.5px] font-medium text-slate-600 dark:text-slate-300">{row.checkIn}</td>
                            <td className="p-4 text-[13.5px] font-medium text-slate-600 dark:text-slate-300">{row.checkOut}</td>
                            <td className="p-4 text-[13.5px]">
                              <span 
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                style={{ background: statusColor.bg, color: statusColor.text }}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'Analytics' && (
          <div 
            className="rounded-2xl p-6 border text-center"
            style={{ 
              borderColor: dark ? '#1a3050' : '#e2e8f0', 
              background: dark ? '#0f1e30' : '#ffffff' 
            }}
          >
            <BarChart2 size={40} className="mx-auto mb-3" style={{ color: BRAND }} />
            <h3 className="text-[16px] font-extrabold m-0 mb-2" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
              Event Insights & Analytics
            </h3>
            <p className="text-[13.5px] max-w-sm mx-auto leading-relaxed m-0" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
              Detailed registration timelines, department conversions, and post-event attendance ratios are processing.
            </p>
          </div>
        )}

        {activeTab === 'Certificates' && (
          <div 
            className="rounded-2xl p-6 border text-center"
            style={{ 
              borderColor: dark ? '#1a3050' : '#e2e8f0', 
              background: dark ? '#0f1e30' : '#ffffff' 
            }}
          >
            <Award size={40} className="mx-auto mb-3" style={{ color: BRAND }} />
            <h3 className="text-[16px] font-extrabold m-0 mb-2" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
              Certificate Generation
            </h3>
            <p className="text-[13.5px] max-w-md mx-auto leading-relaxed mb-5" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
              Create and distribute digital certificates of participation. You can trigger automated email delivery to all attendees who completed check-in.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold text-white border-none cursor-pointer transition-all duration-200"
              style={{ background: BRAND, boxShadow: '0 4px 14px rgba(97,95,255,0.4)' }}
            >
              Issue Certificates
            </button>
          </div>
        )}

        {activeTab === 'Gallery' && (
          <div 
            className="rounded-2xl p-6 border text-center"
            style={{ 
              borderColor: dark ? '#1a3050' : '#e2e8f0', 
              background: dark ? '#0f1e30' : '#ffffff' 
            }}
          >
            <Image size={40} className="mx-auto mb-3" style={{ color: BRAND }} />
            <h3 className="text-[16px] font-extrabold m-0 mb-2" style={{ color: dark ? '#e8f0fe' : '#0f172a' }}>
              Event Gallery
            </h3>
            <p className="text-[13.5px] max-w-sm mx-auto leading-relaxed mb-0" style={{ color: dark ? '#7a98bb' : '#64748b' }}>
              Upload event photos and media. Shared images will be visible in the student mobile application feed.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
