import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Pin, LayoutList, Users, Sparkles, LogOut, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { id: 'my',      label: 'Việc của tôi',    icon: Pin },
  { id: 'shared',  label: 'Đầu việc chung',  icon: LayoutList },
  { id: 'docs',    label: 'Văn bản',         icon: FileText },
  { id: 'team',    label: 'Nhóm',            icon: Users },
  { id: 'report',  label: 'Báo cáo AI',      icon: Sparkles },
]

export function Sidebar({ members, tasks, view, currentMember, onSelectView }) {
  const { logout } = useAuth()

  return (
    <aside className="layout-sidebar h-full flex flex-col shadow-sm">

      {/* App Brand */}
      <div className="px-6 py-8 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            Q
          </div>
          <h1 className="text-[10px] font-black text-gray-900 tracking-tighter uppercase leading-tight">
            PHÒNG QUẢN TRỊ<br/>CƠ SỞ VẬT CHẤT
          </h1>
        </div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Hệ thống quản lý 2026</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'} />
              <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}

        {/* Team Members Section (Conditional) */}
        {view === 'team' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="px-4 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Thành viên nhóm
            </p>
            <div className="space-y-1">
              {members.map((m) => {
                const tc = tasks.filter(t => t.memberId === m.id).length
                const isCurrent = currentMember?.id === m.id
                return (
                  <div key={m.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isCurrent ? 'bg-blue-50' : 'hover:bg-gray-100'
                    }`}>
                    <Avatar name={m.name} color={m.color || 0} size="sm" />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-700' : 'text-gray-700'}`}>
                        {m.name.split(' ').pop()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{tc} nhiệm vụ</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        {currentMember && (
          <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 bg-white shadow-sm mb-3">
            <Avatar name={currentMember.name} color={currentMember.color || 0} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{currentMember.name}</p>
              <p className="text-[10px] text-gray-500 font-medium truncate">{currentMember.role || 'Thành viên'}</p>
            </div>
          </div>
        )}
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors uppercase tracking-wider"
        >
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
