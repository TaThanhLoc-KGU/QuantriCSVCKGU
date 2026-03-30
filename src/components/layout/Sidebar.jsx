import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Pin, LayoutList, Users, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'my',     label: 'Việc của tôi'    },
  { id: 'shared', label: 'Đầu việc chung'  },
  { id: 'team',   label: 'Nhóm'            },
  { id: 'report', label: 'Báo cáo AI'      },
]

function NavIcon({ id, active }) {
  const cls = `shrink-0 ${active ? 'text-blue-400' : 'text-gray-500'}`
  if (id === 'my')     return <span className={cls}><Pin        size={16} /></span>
  if (id === 'shared') return <span className={cls}><LayoutList size={16} /></span>
  if (id === 'team')   return <span className={cls}><Users      size={16} /></span>
  if (id === 'report') return <span className={cls}><Sparkles   size={16} /></span>
  return null
}

export function Sidebar({ members, tasks, view, currentMember, onSelectView }) {
  return (
    <aside className="w-52 bg-gray-900 border-r border-gray-700 flex flex-col shrink-0 h-full">

      {/* App brand */}
      <div className="px-4 py-4 border-b border-gray-700 shrink-0">
        <h1 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">QTCSVC</h1>
        <p className="text-sm font-bold text-gray-50 mt-0.5">Công việc 2026</p>
      </div>

      {/* Current user card */}
      {currentMember && (
        <div className="px-3 py-2.5 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name={currentMember.name} color={currentMember.color || 0} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">{currentMember.name}</p>
              {currentMember.role && (
                <p className="text-[10px] text-gray-500 truncate">{currentMember.role}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="py-1.5 border-b border-gray-700 shrink-0">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id
          return (
            <motion.button key={item.id}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border-l-2 cursor-pointer transition-all duration-150 text-left"
              animate={{
                borderLeftColor: isActive ? 'rgb(var(--brand-primary))' : 'transparent',
                backgroundColor: isActive ? 'rgb(var(--brand-secondary))' : 'transparent',
              }}
              whileHover={{ backgroundColor: isActive ? 'rgb(var(--brand-secondary))' : 'rgba(var(--bg-alpha) / 0.04)' }}
              onClick={() => onSelectView(item.id)}
            >
              <NavIcon id={item.id} active={isActive} />
              <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-gray-50' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Team members list — shown when on Nhóm tab */}
      {view === 'team' && (
        <div className="flex-1 overflow-y-auto py-1">
          <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Thành viên
          </p>
          {members.map((m) => {
            const tc = tasks.filter(t => t.memberId === m.id).length
            const isCurrent = currentMember?.id === m.id
            return (
              <div key={m.id}
                className={`flex items-center gap-2.5 px-3 py-2 ${isCurrent ? 'bg-blue-500/5' : ''}`}>
                <Avatar name={m.name} color={m.color || 0} size="sm" />
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${isCurrent ? 'text-gray-200' : 'text-gray-300'}`}>
                    {m.name.split(' ').pop()}
                    {isCurrent && <span className="ml-1 text-blue-400 text-[10px]">●</span>}
                  </p>
                  <p className="text-[10px] text-gray-600">{tc} nv</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Spacer for non-team tabs */}
      {view !== 'team' && <div className="flex-1" />}
    </aside>
  )
}
