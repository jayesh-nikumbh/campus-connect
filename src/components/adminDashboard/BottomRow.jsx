import React from 'react'
import { MapPin, Clock, ExternalLink } from 'lucide-react'
import { UPCOMING_EVENTS, RECENT_ACTIVITY, BRAND } from '../../data/dashboardData'

export default function BottomRow({ dark, tokens }) {
  const { card, border, txtPri, txtSec, txtMuted } = tokens

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 20 }}>

      {/* ── Upcoming Events ── */}
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: txtPri, margin: 0 }}>Upcoming Events</h2>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: BRAND, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            View all <ExternalLink size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {UPCOMING_EVENTS.map(ev => {
            const pct = Math.round((ev.registered / ev.capacity) * 100)
            return (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 14,
                border: `1px solid ${border}`,
                background: dark ? '#0f172a' : '#f8fafc',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ev.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${ev.color}18` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Date badge */}
                <div style={{
                  minWidth: 48, height: 54, borderRadius: 12, background: ev.color,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, opacity: 0.9, textTransform: 'uppercase' }}>{ev.month}</span>
                  <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{ev.day}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: txtPri, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: txtSec }}>
                      <MapPin size={10} /> {ev.venue}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: txtSec }}>
                      <Clock size={10} /> {ev.time}
                    </span>
                  </div>
                </div>

                {/* Count + progress bar */}
                <div style={{ flexShrink: 0, minWidth: 160, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right', minWidth: 70 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: txtPri, margin: 0 }}>
                      {ev.registered.toLocaleString()}
                      <span style={{ fontSize: 11, fontWeight: 500, color: txtMuted }}>/{ev.capacity.toLocaleString()}</span>
                    </p>
                    <p style={{ fontSize: 10, color: txtMuted, margin: '2px 0 0', fontWeight: 500 }}>registered</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 70 }}>
                    <div style={{ height: 6, borderRadius: 99, background: dark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: ev.color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: txtPri, margin: '0 0 16px 0' }}>Recent Activity</h2>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {RECENT_ACTIVITY.map((act, idx) => {
            const Icon = act.icon
            const isLast = idx === RECENT_ACTIVITY.length - 1
            return (
              <div key={act.id} style={{ display: 'flex', gap: 12 }}>
                {/* Icon + vertical connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `${act.iconColor}20`,
                    border: `1.5px solid ${act.iconColor}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: act.iconColor }} />
                  </div>
                  {!isLast && (
                    <div style={{ width: 2, flex: 1, minHeight: 10, background: dark ? '#334155' : '#e2e8f0', margin: '4px 0', borderRadius: 99 }} />
                  )}
                </div>

                {/* Text */}
                <div style={{ paddingBottom: isLast ? 0 : 16, flex: 1, minWidth: 0, paddingTop: 5 }}>
                  <p style={{ fontSize: 12, color: txtPri, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{act.text}</p>
                  <p style={{ fontSize: 10.5, color: txtMuted, margin: '4px 0 0', fontWeight: 500 }}>{act.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
