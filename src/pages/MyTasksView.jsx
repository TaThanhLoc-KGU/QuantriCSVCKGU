import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { YearNode } from '@/components/tree/YearNode'
import { MemberTable } from '@/components/dashboard/MemberTable'
import { addTask } from '@/lib/firestore'
import { pageVariants } from '@/lib/animations'
import { Plus, LayoutGrid, List, CheckCircle2, ChevronDown } from 'lucide-react'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

/* ── Quick Add ──────────────────────────────────────────────── */
function QuickAddBar({ member, year }) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !member) return
    setSaving(true)
    await addTask({
      title: title.trim(),
      memberId: member.id,
      scope: 'member',
      year,
      month: new Date().getMonth() + 1,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
      status: 'none'
    })
    setTitle('')
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="flex gap-2 p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="flex-1 relative">
        <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder={`Thêm nhiệm vụ mới năm ${year}... (Nhấn Enter)`}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
      <button type="submit" disabled={!title.trim() || saving} className="btn-primary flex items-center gap-2 px-6">
        {saving ? '...' : 'Thêm nhanh'}
      </button>
    </form>
  )
}

/* ── Year Picker ─────────────────────────────────────────────── */
function YearPicker({ year, onChange }) {
  return (
    <div className="relative">
      <select value={year} onChange={e => onChange(Number(e.target.value))}
        className="appearance-none pl-3 pr-8 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-black text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
        {YEAR_OPTIONS.map(y => (
          <option key={y} value={y}>Năm {y}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

/* ── Main View ──────────────────────────────────────────────── */
export default function MyTasksView({ tasks, currentMember, members }) {
  const [viewMode, setViewMode] = useState('tree')
  const [filter,   setFilter]   = useState('all')
  const [year,     setYear]     = useState(currentYear)

  const myTasks  = tasks.filter(t => t.memberId === currentMember?.id && t.year === year)
  const filtered = myTasks.filter(t => {
    if (filter === 'doing') return t.status !== 'done'
    if (filter === 'done')  return t.status === 'done'
    return true
  })

  const stats = [
    { label: 'Tổng số',     value: myTasks.length,                              color: '#3b82f6' },
    { label: 'Hoàn thành',  value: myTasks.filter(t => t.status === 'done').length, color: '#10b981' },
  ]

  return (
    <motion.div className="flex-1 flex flex-col h-full bg-gray-50/50"
      variants={pageVariants} initial="initial" animate="in" exit="out">

      <Topbar title="Việc của tôi" stats={stats}>
        <div className="flex items-center gap-3">
          <YearPicker year={year} onChange={setYear} />
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            {[
              { id: 'tree',  icon: LayoutGrid, label: 'Theo Quý' },
              { id: 'table', icon: List,       label: 'Bảng' }
            ].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === v.id ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-400 hover:text-gray-800'
                }`}>
                <v.icon size={12} strokeWidth={3} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Topbar>

      <QuickAddBar member={currentMember} year={year} />

      <div className="flex-1 overflow-y-auto p-6">
        {!myTasks.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm font-bold text-gray-900">Chưa có nhiệm vụ nào — Năm {year}</p>
            <p className="text-xs text-gray-500 mt-1">Hãy thêm nhiệm vụ đầu tiên.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'tree' ? (
              <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <YearNode year={year} tasks={filtered} />
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
                  <MemberTable members={[currentMember]} tasks={tasks.filter(t => t.year === year)} onSelectMember={() => {}} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
