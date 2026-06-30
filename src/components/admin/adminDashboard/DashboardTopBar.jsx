import React from 'react'
import { Search, Moon, Sun, Bell, MessageSquare, ChevronRight, ChevronDown } from 'lucide-react'
import { BRAND } from '../../../data/dashboardData'

export default function DashboardTopBar({ activeNav, dark, toggleDark, user, panelOpen, setPanelOpen, unreadCount }) {
  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-[#0c1829] border-b border-slate-200 dark:border-[#1a3050] px-6 py-3 flex items-center transition-all duration-300 shadow-sm dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-[#4a6a8a] font-medium">
        <span>EventHub</span>
        <ChevronRight size={12} className="text-slate-300 dark:text-[#2a4060]" />
        <span className="text-slate-900 dark:text-[#e8f0fe] font-bold">{activeNav}</span>
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-3">

        {/* Search */}
        <div className="relative w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#3d5470]" />
          <input
            type="text"
            placeholder="Search everything..."
            className="w-full pl-9 pr-3.5 py-2 rounded-[10px] border border-slate-200 dark:border-[#1a3050] text-[13px] text-slate-800 dark:text-[#e8f0fe] bg-slate-50 dark:bg-[#060e1c] outline-none transition-all duration-200 focus:border-brand placeholder:text-slate-400 dark:placeholder:text-[#3d5470]"
            onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20` }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          title={dark ? 'Switch to Light' : 'Switch to Dark'}
          className="w-[38px] h-[38px] rounded-[10px] border border-slate-200 dark:border-[#1a3050] flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 bg-slate-100 dark:bg-[#162640] text-slate-500 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-[#1c3050]"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Bell — triggers slide-in panel */}
        <button
          onClick={() => setPanelOpen(prev => !prev)}
          title="Notifications"
          className="relative w-[38px] h-[38px] rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 border border-slate-200 dark:border-[#1a3050] text-slate-500 dark:text-[#7a98bb] hover:border-brand hover:text-brand dark:hover:border-brand dark:hover:text-brand"
          style={{
            border: panelOpen ? `1px solid ${BRAND}` : undefined,
            background: panelOpen ? `${BRAND}18` : undefined,
            color: panelOpen ? BRAND : undefined,
          }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 rounded-full bg-red-500 text-white flex items-center justify-center border-[1.5px] border-white dark:border-[#0c1829] font-extrabold"
              style={{
                width: unreadCount > 9 ? 14 : 8,
                height: unreadCount > 9 ? 14 : 8,
                fontSize: 9,
              }}
            >
              {unreadCount > 9 ? '9+' : ''}
            </span>
          )}
        </button>

        {/* Messages */}
        <button className="w-[38px] h-[38px] rounded-[10px] border border-slate-200 dark:border-[#1a3050] bg-transparent flex items-center justify-center cursor-pointer text-slate-500 dark:text-[#7a98bb] hover:bg-slate-100 dark:hover:bg-[#162640] transition-all duration-150">
          <MessageSquare size={16} />
        </button>

        {/* User pill */}
        <button className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1a3050] bg-transparent cursor-pointer hover:bg-slate-50 dark:hover:bg-[#162640] transition-all duration-150">
          <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-[11px] font-bold">
            {user?.avatar || 'SA'}
          </div>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-[#e8f0fe] max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
            {user?.name || 'Super Admin'}
          </span>
          <ChevronDown size={14} className="text-slate-400 dark:text-[#3d5470]" />
        </button>
      </div>
    </header>
  )
}
