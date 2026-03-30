import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useMembers } from '@/hooks/useMembers'
import { useTasks } from '@/hooks/useTasks'
import { useTheme } from '@/hooks/useTheme'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Sidebar } from '@/components/layout/Sidebar'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import MyTasksView from '@/pages/MyTasksView'
import SharedTasksView from '@/pages/SharedTasksView'
import Dashboard from '@/pages/Dashboard'
import ReportView from '@/components/report/ReportView'

const NAV_ITEMS = [
  { id: 'my',     icon: '📌', label: 'Việc tôi'  },
  { id: 'shared', icon: '📋', label: 'Chung'      },
  { id: 'team',   icon: '👥', label: 'Nhóm'       },
  { id: 'report', icon: '✨', label: 'Báo cáo'    },
]

export default function App() {
  const { user, loading: authLoading }       = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const { members }                          = useMembers()
  const { tasks }                            = useTasks()
  useTheme()

  const [view, setView] = useState('my')

  /* ── Loading ──────────────────────────────────────── */
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Đang khởi động...</div>
      </div>
    )
  }

  if (!user)    return <Login />
  if (!profile) return <Onboarding />

  /* Current user's member record */
  const currentMember = members.find(m => m.id === profile.memberId) ?? null

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── Desktop sidebar ─────────────────────────── */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          members={members}
          tasks={tasks}
          view={view}
          currentMember={currentMember}
          onSelectView={setView}
        />
      </div>

      {/* ── Main content ────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          {view === 'my' && (
            <MyTasksView key="my" tasks={tasks} currentMember={currentMember} />
          )}
          {view === 'shared' && (
            <SharedTasksView key="shared" tasks={tasks} />
          )}
          {view === 'team' && (
            <Dashboard key="team" tasks={tasks} members={members} onSelectMember={() => {}} />
          )}
          {view === 'report' && (
            <ReportView key="report" tasks={tasks} members={members} />
          )}
        </AnimatePresence>
      </main>

      {/* ── Mobile bottom tab bar ───────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 flex items-stretch h-16">
        {NAV_ITEMS.map(item => (
          <button key={item.id}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              view === item.id ? 'text-blue-400' : 'text-gray-500'
            }`}
            onClick={() => setView(item.id)}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
