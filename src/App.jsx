import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useMembers } from '@/hooks/useMembers'
import { useTasks } from '@/hooks/useTasks'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Sidebar } from '@/components/layout/Sidebar'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import MyTasksView from '@/pages/MyTasksView'
import SharedTasksView from '@/pages/SharedTasksView'
import Dashboard from '@/pages/Dashboard'
import ReportView from '@/components/report/ReportView'
import DocumentsView from '@/pages/DocumentsView'

const NAV_ITEMS = [
  { id: 'my',     icon: '📌', label: 'Việc tôi'  },
  { id: 'shared', icon: '📋', label: 'Chung'      },
  { id: 'docs',   icon: '📄', label: 'Văn bản'    },
  { id: 'team',   icon: '👥', label: 'Nhóm'       },
  { id: 'report', icon: '✨', label: 'Báo cáo'    },
]

export default function App() {
  const { user, loading: authLoading }       = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const { members }                          = useMembers()
  const { tasks }                            = useTasks()

  const [view, setView] = useState('my')

  /* ── Loading ──────────────────────────────────────── */
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Đang khởi động...</p>
        </div>
      </div>
    )
  }

  if (!user)    return <Login />
  if (!profile) return <Onboarding />

  /* Current user's member record */
  const currentMember = members.find(m => m.id === profile.memberId) ?? null

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 selection:bg-blue-100 selection:text-blue-900">

      {/* ── Desktop sidebar ─────────────────────────── */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0">
        <Sidebar
          members={members}
          tasks={tasks}
          view={view}
          currentMember={currentMember}
          onSelectView={setView}
        />
      </div>

      {/* ── Main content ────────────────────────────── */}
      <main className="layout-main flex-1 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          {view === 'my' && (
            <MyTasksView key="my" tasks={tasks} currentMember={currentMember} members={members} />
          )}
          {view === 'shared' && (
            <SharedTasksView key="shared" tasks={tasks} />
          )}
          {view === 'docs' && (
            <DocumentsView key="docs" />
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-stretch h-16 shadow-2xl">
        {NAV_ITEMS.map(item => (
          <button key={item.id}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
              view === item.id ? 'text-blue-600 scale-110' : 'text-gray-400'
            }`}
            onClick={() => setView(item.id)}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
