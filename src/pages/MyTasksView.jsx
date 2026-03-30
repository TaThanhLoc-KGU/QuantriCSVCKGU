import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { YearNode } from '@/components/tree/YearNode'
import { Topbar } from '@/components/layout/Topbar'
import { Avatar } from '@/components/ui/Avatar'
import { addTask } from '@/lib/firestore'
import { pageVariants, pageTransition } from '@/lib/animations'
import MindMapView from '@/components/mindmap/MindMapView'

const curMonth   = new Date().getMonth() + 1
const curQuarter = Math.ceil(curMonth / 3)
const MONTHS     = Array.from({ length: 12 }, (_, i) => i + 1)

/* ── Quick-add bar ──────────────────────────────────────────── */
function QuickAddBar({ member }) {
  const [title, setTitle]   = useState('')
  const [month, setMonth]   = useState(curMonth)
  const [saving, setSaving] = useState(false)
  const [ok, setOk]         = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !member) return
    setSaving(true)
    await addTask({
      title:    title.trim(),
      memberId: member.id,
      scope:    'member',
      year:     2026,
      quarter:  Math.ceil(month / 3),
      month,
      status:   'none',
    })
    setTitle('')
    setSaving(false)
    setOk(true)
    setTimeout(() => setOk(false), 1400)
  }

  return (
    <form onSubmit={submit}
      className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-700 shrink-0">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Thêm nhiệm vụ mới... (nhấn Enter để thêm nhanh)"
        className="flex-1 min-w-0 bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200
                   placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
      />
      <select
        value={month}
        onChange={e => setMonth(+e.target.value)}
        className="shrink-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-gray-400
                   outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
      >
        {MONTHS.map(m => (
          <option key={m} value={m}>T{m}{m === curMonth ? ' ✓' : ''}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!title.trim() || saving || !member}
        className="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white
                   text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
      >
        {ok ? '✓' : saving ? '...' : '+ Thêm'}
      </button>
    </form>
  )
}

/* ── Main view ──────────────────────────────────────────────── */
export default function MyTasksView({ tasks, currentMember }) {
  const [viewMode, setViewMode] = useState('tree')

  const myTasks = tasks.filter(t => t.memberId === currentMember?.id)
  const done    = myTasks.filter(t => t.status === 'done').length
  const doing   = myTasks.filter(t => t.status === 'doing').length
  const wait    = myTasks.filter(t => t.status === 'wait').length

  const stats = [
    { label: 'nhiệm vụ',       value: myTasks.length, color: '#9ca3af' },
    { label: 'hoàn thành',     value: done,            color: '#6fcf97' },
    { label: 'đang thực hiện', value: doing,           color: '#4f8ef7' },
    { label: 'chờ duyệt',      value: wait,            color: '#f2994a' },
  ]

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" key="my-tasks"
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}>

      <Topbar
        title={
          currentMember
            ? (
              <span className="flex items-center gap-2">
                <Avatar name={currentMember.name} color={currentMember.color || 0} size="sm" />
                <span>Việc của tôi</span>
                <span className="text-xs font-normal text-gray-500 hidden md:inline">
                  — {currentMember.name}
                </span>
              </span>
            )
            : 'Việc của tôi'
        }
        stats={stats}
      >
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-0.5 shrink-0">
          {[
            { id: 'tree', icon: '🌳', label: 'Cây' },
            { id: 'map',  icon: '🗺️', label: 'Sơ đồ' },
          ].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === v.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}>
              <span>{v.icon}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </Topbar>

      {/* Persistent quick-add bar */}
      {viewMode === 'tree' && <QuickAddBar member={currentMember} />}

      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === 'tree' ? (
            <motion.div key="tree" className="p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>
              {!currentMember ? (
                <div className="text-center py-20 text-gray-500 text-sm">
                  Chưa có hồ sơ — vui lòng đăng xuất và đăng nhập lại.
                </div>
              ) : myTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <span className="text-5xl opacity-60">📋</span>
                  <p className="text-gray-400 font-medium">Chưa có nhiệm vụ nào</p>
                  <p className="text-gray-500 text-xs">Gõ nhiệm vụ vào ô phía trên và nhấn Enter để thêm nhanh!</p>
                </div>
              ) : (
                <YearNode year={2026} tasks={myTasks} memberId={currentMember.id} />
              )}
            </motion.div>
          ) : (
            <motion.div key="map" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <MindMapView
                tasks={myTasks}
                members={currentMember ? [currentMember] : []}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
