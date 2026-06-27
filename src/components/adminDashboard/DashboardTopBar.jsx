import React from 'react'
import { Search, Moon, Sun, Bell, MessageSquare, ChevronRight, ChevronDown } from 'lucide-react'
import { BRAND } from '../../data/dashboardData'

export default function DashboardTopBar({ activeNav, dark, toggleDark, user, tokens }) {
  const { header, border, txtPri, txtSec, txtMuted, inputBg } = tokens

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: header, borderBottom: `1px solid ${border}`,
      padding: '12px 24px', display: 'flex', alignItems: 'center',
      transition: 'all 0.3s',
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: txtSec, fontWeight: 500 }}>
        <span>EventHub</span>
        <ChevronRight size={12} style={{ color: txtMuted }} />
        <span style={{ color: txtPri, fontWeight: 700 }}>{activeNav}</span>
      </div>

      {/* Right controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: txtMuted }} />
          <input type="text" placeholder="Search everything..." style={{
            width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
            borderRadius: 10, border: `1px solid ${border}`,
            fontSize: 13, color: txtPri, background: inputBg,
            outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
          }}
            onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}25` }}
            onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Theme toggle */}
        <button onClick={toggleDark} title={dark ? 'Switch to Light' : 'Switch to Dark'} style={{
          width: 38, height: 38, borderRadius: 10, border: `1px solid ${border}`,
          background: dark ? '#334155' : '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: dark ? '#fbbf24' : '#64748b',
          transition: 'all 0.2s', flexShrink: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? '#475569' : '#e2e8f0' }}
          onMouseLeave={e => { e.currentTarget.style.background = dark ? '#334155' : '#f1f5f9' }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Bell */}
        <button style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: txtSec }}>
          <Bell size={16} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
        </button>

        {/* Messages */}
        <button style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: txtSec }}>
          <MessageSquare size={16} />
        </button>

        {/* User pill */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px',
          borderRadius: 12, border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
            {user?.avatar || 'DP'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: txtPri, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'Dr. Priya Sharma'}
          </span>
          <ChevronDown size={14} style={{ color: txtMuted }} />
        </button>
      </div>
    </header>
  )
}
