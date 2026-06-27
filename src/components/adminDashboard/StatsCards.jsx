import React from 'react'
import { TrendingUp } from 'lucide-react'
import { STATS } from '../../data/dashboardData'

export default function StatsCards({ tokens }) {
  const { card, border, txtPri, txtSec, dark } = tokens

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
      {STATS.map(({ label, value, delta, icon: Icon, iconBg, iconColor }) => (
        <div key={label} style={{
          background: card, borderRadius: 18, padding: 20,
          border: `1px solid ${border}`,
          boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)',
          transition: 'all 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} style={{ color: iconColor }} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
              <TrendingUp size={12} /> {delta}
            </span>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, color: txtPri, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{value}</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: txtSec, marginTop: 6 }}>{label}</p>
        </div>
      ))}
    </div>
  )
}
