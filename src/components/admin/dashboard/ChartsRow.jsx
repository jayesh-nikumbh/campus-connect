import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { CHART_DATA, DEPT_DATA } from './dashboardData'

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: dark ? '#1e293b' : '#fff',
      border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 12, padding: '10px 14px', fontSize: 11,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <p style={{ fontWeight: 700, color: dark ? '#e2e8f0' : '#334155', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ChartsRow({ dark, tokens }) {
  const { card, border, txtPri, txtSec, inputBg } = tokens

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

      {/* Area Chart */}
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: txtPri, margin: 0 }}>Event &amp; Registration Growth</h2>
            <p style={{ fontSize: 12, color: txtSec, marginTop: 2 }}>January — August 2025</p>
          </div>
          <select style={{ fontSize: 12, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 12px', color: txtSec, background: inputBg, outline: 'none', cursor: 'pointer' }}>
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: txtSec }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: txtSec }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip dark={dark} />} />
            <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegistrations)" activeDot={{ r: 6 }} />
            <Area type="monotone" dataKey="attendance"    name="Attendance %"  stroke="#16a34a" strokeWidth={2}   fillOpacity={1} fill="url(#colorAttendance)"    strokeDasharray="4 2" activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingLeft: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: txtSec }}>
            <span style={{ width: 16, height: 3, background: '#4f46e5', borderRadius: 2, display: 'inline-block' }} /> Registrations
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: txtSec }}>
            <span style={{ width: 16, borderTop: '3px dashed #16a34a', display: 'inline-block' }} /> Attendance %
          </span>
        </div>
      </div>

      {/* Donut Chart */}
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20, boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}>
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: txtPri, margin: 0 }}>Dept. Participation</h2>
          <p style={{ fontSize: 12, color: txtSec, marginTop: 2 }}>By department share</p>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="value">
              {DEPT_DATA.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, n) => [`${v}%`, n]}
              contentStyle={{ fontSize: 11, borderRadius: 10, border: `1px solid ${border}`, background: card, color: txtPri }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginTop: 12 }}>
          {DEPT_DATA.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: txtSec, fontWeight: 500 }}>{d.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: txtPri, marginLeft: 'auto' }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
