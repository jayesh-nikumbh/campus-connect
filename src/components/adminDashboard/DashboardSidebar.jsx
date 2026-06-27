import React from 'react'
import { GraduationCap, ChevronLeft, LogOut } from 'lucide-react'
import { TextAlignJustify } from 'lucide-react'
import { NAV, BRAND } from '../../data/dashboardData'

export default function DashboardSidebar({ collapsed, setCollapsed, activeNav, setActiveNav, dark, tokens, onLogout }) {
  const { sidebar, border, txtPri, txtSec, hoverBg } = tokens

  return (
    <aside style={{
      width: collapsed ? 70 : 240,
      background: sidebar,
      borderRight: `1px solid ${border}`,
      position: 'fixed',
      height: '100%',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Logo + Collapse Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '16px 0' : '16px 20px',
        borderBottom: `1px solid ${border}`,
        minHeight: 64, boxSizing: 'border-box', flexShrink: 0, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: BRAND, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0,
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 2,
            opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto',
            overflow: 'hidden', transition: 'opacity 0.2s, width 0.3s', whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: txtPri, lineHeight: 1 }}>EventHub</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: txtSec, lineHeight: 1 }}>Admin Portal</span>
          </div>
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{
            background: 'transparent', border: 'none', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: txtSec, cursor: 'pointer', padding: 4, borderRadius: 6,
            flexShrink: 0, transition: 'all 0.15s',
          }}>
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{
        flex: 1, padding: collapsed ? '12px 10px' : '16px 14px',
        display: 'flex', flexDirection: 'column', gap: 2,
        overflowY: 'auto', overflowX: 'hidden', transition: 'padding 0.3s',
      }}>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} title="Expand sidebar" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: txtSec, width: '100%',
            marginBottom: 8, transition: 'all 0.15s',
          }}>
            <TextAlignJustify size={18} />
          </button>
        )}

        {NAV.map(({ icon: Icon, label, badge }) => {
          const active = activeNav === label
          return (
            <button key={label} onClick={() => setActiveNav(label)} title={collapsed ? label : ''}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 12, padding: collapsed ? '11px' : '10px 14px',
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', width: '100%', position: 'relative',
                background: active ? `${BRAND}12` : 'transparent',
                color: active ? BRAND : txtSec, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} style={{ flexShrink: 0, color: active ? BRAND : txtSec }} />
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
              )}
              {badge && !collapsed && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: BRAND, color: '#fff' }}>{badge}</span>
              )}
              {badge && collapsed && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: BRAND }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 14px', borderTop: `1px solid ${border}`, flexShrink: 0, transition: 'padding 0.3s' }}>
        <button onClick={onLogout} title={collapsed ? 'Logout' : ''} style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 12, padding: collapsed ? '11px' : '10px 14px',
          borderRadius: 10, fontSize: 13, fontWeight: 600,
          border: 'none', cursor: 'pointer', background: 'transparent',
          color: txtSec, width: '100%', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = dark ? '#2d1b1b' : '#fef2f2' }}
          onMouseLeave={e => { e.currentTarget.style.color = txtSec; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
