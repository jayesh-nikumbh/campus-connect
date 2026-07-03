import React, { useState } from 'react'
import { CalendarDays, Search, MapPin, Clock, Users, Ticket, CheckCircle2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function StudentEventsView({ tokens }) {
  const { accentColor } = useTheme()
  const BRAND = accentColor || '#615FFF'
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const EVENTS_DATA = [
    { id: 1, title: 'TechFest 2K25', category: 'Technical', date: 'Aug 15, 2025', time: '09:00 AM', venue: 'Main Auditorium', registered: true, status: 'Registered' },
    { id: 2, title: 'Annual Cultural Fest', category: 'Cultural', date: 'Jul 22, 2025', time: '06:00 PM', venue: 'Open Air Theatre', registered: true, status: 'Registered' },
    { id: 3, title: 'Sports Meet 2K25', category: 'Sports', date: 'Sep 5, 2025', time: '07:00 AM', venue: 'University Grounds', registered: true, status: 'Registered' },
    { id: 4, title: 'National Hackathon 2025', category: 'Technical', date: 'Oct 10, 2025', time: '09:00 AM', venue: 'CS Lab 2', registered: false, status: 'Open' },
    { id: 5, title: 'AI & Data Workshop', category: 'Workshop', date: 'Nov 15, 2025', time: '10:00 AM', venue: 'Online Webinar', registered: true, status: 'Registered' },
    { id: 6, title: 'Entrepreneurship Summit', category: 'Business', date: 'Dec 1, 2025', time: '11:00 AM', venue: 'Seminar Hall 3', registered: false, status: 'Open' },
  ]

  const filtered = EVENTS_DATA.filter(e => {
    const matchesFilter = filter === 'All' ? true : filter === 'Registered' ? e.registered : !e.registered
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Top Banner Card */}
      <div
        className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border shadow-sm"
        style={{
          background: tokens.dark ? '#0f1e30' : '#ffffff',
          borderColor: tokens.dark ? '#1a3050' : '#e2e8f0',
        }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-purple-500/10 text-purple-500">
            <CalendarDays size={14} /> Student Events
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white m-0">
            Campus Events & Registrations
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-[#7a98bb] mt-1 m-0">
            Discover upcoming fests, competitions, seminars, and manage your registrations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#162640] border border-slate-200 dark:border-[#1a3050]">
          {['All', 'Registered', 'Upcoming'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              style={{
                background: filter === tab ? BRAND : 'transparent',
                color: filter === tab ? '#ffffff' : (tokens.dark ? '#7a98bb' : '#64748b'),
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
            style={{
              background: tokens.dark ? '#0f1e30' : '#ffffff',
              borderColor: tokens.dark ? '#1a3050' : '#e2e8f0',
              boxShadow: tokens.shadow,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                  {event.category}
                </span>
                {event.registered ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                    <CheckCircle2 size={13} /> Registered
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-500">
                    Registration Open
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0 tracking-tight">
                {event.title}
              </h3>

              <div className="flex flex-col gap-2 mt-4 text-xs font-medium text-slate-500 dark:text-[#7a98bb]">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-slate-400" /> {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" /> {event.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" /> {event.venue}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1a3050]">
              {event.registered ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-[#162640] text-slate-400 dark:text-[#4a6a8a] border-none cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={14} /> Already Registered
                </button>
              ) : (
                <button
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: BRAND }}
                >
                  <Ticket size={14} /> Register Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
