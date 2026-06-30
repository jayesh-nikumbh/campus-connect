import React from 'react'
import { GraduationCap, ChevronLeft, LogOut } from 'lucide-react'
import { TextAlignJustify } from 'lucide-react'
import { NAV, BRAND } from '../../../data/dashboardData'

export default function DashboardSidebar({ collapsed, setCollapsed, activeNav, setActiveNav, dark, onLogout }) {
  return (
    <aside
      style={{ width: collapsed ? 70 : 240 }}
      className="
        fixed h-full z-30 flex flex-col overflow-hidden
        bg-white dark:bg-[#0c1829]
        border-r border-slate-200 dark:border-[#1a3050]
        transition-[width] duration-300 ease-in-out
        shadow-sm dark:shadow-[2px_0_20px_rgba(0,0,0,0.4)]
      "
    >
      {/* Logo + Collapse Toggle */}
      <div
        className="flex items-center border-b border-slate-200 dark:border-[#1a3050] shrink-0 overflow-hidden"
        style={{
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '16px 0' : '16px 20px',
          minHeight: 64,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-[38px] h-[38px] rounded-[10px] shrink-0 flex items-center justify-center shadow-md"
            style={{
              background: BRAND,
              marginLeft: collapsed ? 'auto' : 0,
              marginRight: collapsed ? 'auto' : 0,
            }}
          >
            <GraduationCap size={20} color="#fff" />
          </div>
          <div
            className="flex flex-col gap-0.5 overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300"
            style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          >
            <span className="text-[15px] font-extrabold leading-none text-slate-900 dark:text-[#e8f0fe]">EventHub</span>
            <span className="text-[11px] font-medium leading-none text-slate-400 dark:text-[#4a6a8a]">Admin Portal</span>
          </div>
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center justify-center shrink-0 text-slate-400 dark:text-[#4a6a8a] cursor-pointer p-1 rounded-md border-none bg-transparent hover:text-slate-700 dark:hover:text-[#e8f0fe] transition-all duration-150"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav
        className="flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden transition-[padding] duration-300"
        style={{ padding: collapsed ? '12px 10px' : '16px 14px' }}
      >
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="flex items-center justify-center p-2.5 rounded-[10px] border-none cursor-pointer bg-transparent text-slate-400 dark:text-[#4a6a8a] w-full mb-2 hover:bg-slate-100 dark:hover:bg-[#162640] transition-all duration-150"
          >
            <TextAlignJustify size={18} />
          </button>
        )}

        {NAV.map(({ icon: Icon, label, badge }) => {
          const active = activeNav === label
          return (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              title={collapsed ? label : ''}
              className="flex items-center rounded-[10px] text-[13px] font-semibold border-none cursor-pointer w-full relative transition-all duration-150"
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 12,
                padding: collapsed ? '11px' : '10px 14px',
                background: active ? `${BRAND}18` : 'transparent',
                color: active ? BRAND : undefined,
              }}
              onMouseEnter={e => { if (!active) {e.currentTarget.style.background = dark ? '#162640' : '#f1f5f9'} }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} className="shrink-0" style={{ color: active ? BRAND : '#7a98bb' }} />
              {!collapsed && (
                <span
                  className="whitespace-nowrap overflow-hidden text-ellipsis text-slate-500 dark:text-[#7a98bb]"
                  style={{ color: active ? BRAND : undefined }}
                >
                  {label}
                </span>
              )}
              {badge && !collapsed && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: BRAND }}>
                  {badge}
                </span>
              )}
              {badge && collapsed && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: BRAND }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div
        className="shrink-0 border-t border-slate-200 dark:border-[#1a3050] transition-[padding] duration-300"
        style={{ padding: collapsed ? '12px 10px' : '12px 14px' }}
      >
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : ''}
          className="flex items-center rounded-[10px] text-[13px] font-semibold border-none cursor-pointer bg-transparent text-slate-500 dark:text-[#7a98bb] w-full transition-all duration-150 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#2d1b1b] dark:hover:text-red-400"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 12,
            padding: collapsed ? '11px' : '10px 14px',
          }}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
