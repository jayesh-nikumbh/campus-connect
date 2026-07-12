import React, { useState, useEffect } from 'react'
import { CalendarDays, MapPin, Clock, Ticket, CheckCircle2, Users, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import studentService from '../../services/studentService'
import RegistrationModal from '../../components/student/RegistrationModal'

export default function EventsPage({ tokens }) {
  const { accentColor } = useTheme()
  const showToast = useToast()
  const BRAND = accentColor || '#615FFF'

  const [filter, setFilter] = useState('All')
  const [eventsList, setEventsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    studentService.fetchEventsData().then(res => {
      if (cancelled) return
      if (res.success) setEventsList(res.data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const handleRegisterClick = (event) => {
    if (event.registered) return
    setSelectedEvent(event)
  }

  const handleRegistrationSuccess = (eventId) => {
    setEventsList(prev => prev.map(e => e.id === eventId ? { ...e, registered: true, status: 'Registered' } : e))
    showToast('Successfully registered for event! 🎉', 'success')
    setSelectedEvent(null)
  }

  const filtered = eventsList.filter(e => {
    if (filter === 'Registered') return e.registered
    if (filter === 'Upcoming') return !e.registered
    return true
  })

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Top Banner */}
      <div
        className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border shadow-sm"
        style={{ background: tokens.dark ? '#0f1e30' : '#ffffff', borderColor: tokens.dark ? '#1a3050' : '#e2e8f0' }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-purple-500/10 text-purple-500">
            <CalendarDays size={14} /> Student Events
          </div>
          <h2 className="text-2xl font-black m-0" style={{ color: tokens.txtPri }}>Campus Events &amp; Registrations</h2>
          <p className="text-xs font-medium mt-1 m-0" style={{ color: tokens.txtSec }}>
            Discover upcoming fests, competitions, seminars, and manage your registrations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl border" style={{ background: tokens.dark ? '#162640' : '#f1f5f9', borderColor: tokens.border }}>
          {['All', 'Registered', 'Upcoming'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              style={{ background: filter === tab ? BRAND : 'transparent', color: filter === tab ? '#fff' : tokens.txtSec }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm font-semibold" style={{ color: tokens.txtMuted }}>Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-sm font-semibold" style={{ color: tokens.txtMuted }}>No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(event => (
            <div
              key={event.id}
              className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
              style={{ background: tokens.card, borderColor: tokens.border, boxShadow: tokens.shadow }}
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                      {event.category}
                    </span>
                    {event.mode === 'Team' && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <Users size={11} /> Team
                      </span>
                    )}
                    {event.mode === 'Solo' && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20">
                        <User size={11} /> Solo
                      </span>
                    )}
                    {(event.mode === 'Both' || event.mode === 'Solo / Team') && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Users size={11} /> Solo &amp; Team
                      </span>
                    )}
                    {event.fees > 0 && (
                      <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        ₹{event.fees}
                      </span>
                    )}
                  </div>

                  {event.registered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 shrink-0">
                      <CheckCircle2 size={13} /> Registered
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-500 shrink-0">Registration Open</span>
                  )}
                </div>

                <h3 className="text-base font-extrabold m-0 tracking-tight" style={{ color: tokens.txtPri }}>{event.title}</h3>

                <div className="flex flex-col gap-2 mt-4 text-xs font-medium" style={{ color: tokens.txtSec }}>
                  <div className="flex items-center gap-2"><CalendarDays size={14} /> {event.date}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> {event.time}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} /> {event.venue}</div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    Type: <span className="font-bold" style={{ color: tokens.txtPri }}>
                      {event.mode === 'Both' ? 'Solo & Team Event' : `${event.mode || 'Solo'} Event`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t" style={{ borderColor: tokens.border }}>
                {event.registered ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl font-bold text-xs border-none cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: tokens.hoverBg, color: tokens.txtMuted }}
                  >
                    <CheckCircle2 size={14} /> Already Registered
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterClick(event)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-px"
                    style={{ background: BRAND, boxShadow: `0 4px 14px ${BRAND}40` }}
                  >
                    <Ticket size={14} /> Register Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  )
}
