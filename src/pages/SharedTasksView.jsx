import { useState } from 'react'
import { motion } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { YearNode } from '@/components/tree/YearNode'
import { addTask } from '@/lib/firestore'
import { pageVariants } from '@/lib/animations'
import { LayoutList, Plus, CheckCircle2, ChevronDown } from 'lucide-react'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export default function SharedTasksView({ tasks }) {
  const [title,  setTitle]  = useState('')
  const [saving, setSaving] = useState(false)
  const [year,   setYear]   = useState(currentYear)

  const shared = tasks.filter(t => t.scope === 'dept' && t.year === year)
  const stats = [
    { label: 'Đầu việc chung', value: shared.length,                               color: '#3b82f6' },
    { label: 'Hoàn thành',     value: shared.filter(t => t.status === 'done').length, color: '#10b981' },
  ]

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await addTask({
      title: title.trim(),
      scope: 'dept',
      memberId: null,
      year,
      month: new Date().getMonth() + 1,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
      status: 'none'
    })
    setTitle('')
    setSaving(false)
  }

  return (
    <motion.div className="flex-1 flex flex-col h-full bg-gray-50/50"
      variants={pageVariants} initial="initial" animate="in" exit="out">

      <Topbar title="Đầu việc chung" stats={stats}>
        <div className="relative">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-black text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            {YEAR_OPTIONS.map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </Topbar>

      {/* Quick Add */}
      <form onSubmit={submit} className="flex gap-2 p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="flex-1 relative">
          <LayoutList size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder={`Thêm đầu việc chung năm ${year}... (Nhấn Enter)`}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button type="submit" disabled={!title.trim() || saving} className="btn-primary flex items-center gap-2 px-6">
          {saving ? '...' : 'Thêm đầu việc'}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto p-6">
        {!shared.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm font-bold text-gray-900">Chưa có đầu việc chung — Năm {year}</p>
            <p className="text-xs text-gray-500 mt-1">Hãy thêm đầu việc chung cho cả phòng.</p>
          </div>
        ) : (
          <YearNode year={year} tasks={shared} />
        )}
      </div>
    </motion.div>
  )
}
