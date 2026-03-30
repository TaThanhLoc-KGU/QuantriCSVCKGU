import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { TaskNode } from '@/components/tree/TaskNode'
import { addTask } from '@/lib/firestore'
import { pageVariants, pageTransition } from '@/lib/animations'

const curMonth   = new Date().getMonth() + 1
const curQuarter = Math.ceil(curMonth / 3)
const MONTHS     = Array.from({ length: 12 }, (_, i) => i + 1)
const MONTH_NAMES = ['','Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
const QUARTER_MONTHS = { 1:[1,2,3], 2:[4,5,6], 3:[7,8,9], 4:[10,11,12] }

/* ── Quick-add bar ──────────────────────────────────────────── */
function QuickAddBar() {
  const [title, setTitle]   = useState('')
  const [month, setMonth]   = useState(curMonth)
  const [saving, setSaving] = useState(false)
  const [ok, setOk]         = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await addTask({
      title:    title.trim(),
      scope:    'dept',
      memberId: null,
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
        placeholder="Thêm đầu việc chung... (nhấn Enter để thêm nhanh)"
        className="flex-1 min-w-0 bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200
                   placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
      />
      <select
        value={month}
        onChange={e => setMonth(+e.target.value)}
        className="shrink-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-gray-400
                   outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
      >
        {MONTHS.map(m => (
          <option key={m} value={m}>T{m}{m === curMonth ? ' ✓' : ''}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!title.trim() || saving}
        className="shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white
                   text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
      >
        {ok ? '✓' : saving ? '...' : '+ Thêm'}
      </button>
    </form>
  )
}

/* ── Quarter section ─────────────────────────────────────────── */
function QuarterSection({ quarter, tasks }) {
  const [isOpen, setIsOpen] = useState(quarter === curQuarter)
  const months   = QUARTER_MONTHS[quarter] || []
  const total    = tasks.length
  const done     = tasks.filter(t => t.status === 'done').length
  const isCur    = quarter === curQuarter

  // Hide quarters with no tasks (except current)
  if (!total && !isCur) return null

  return (
    <div className="quarter-node">
      <motion.div
        className={`quarter-header ${isCur ? 'quarter-header-active' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.02)' }}
      >
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.18 }}
          className="text-gray-500 text-xs w-4 shrink-0">▶</motion.span>
        <span className={`text-sm font-semibold ${isCur ? 'text-gray-200' : 'text-gray-400'}`}>
          Quý {quarter}
        </span>
        {isCur && (
          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full ml-1">
            hiện tại
          </span>
        )}
        <span className="ml-2 text-xs text-gray-600">
          {total > 0 ? `${done}/${total} đầu việc` : 'Chưa có'}
        </span>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}>
            <div className="pl-4">
              {months.map(month => {
                const mt    = tasks.filter(t => t.month === month)
                const isCurM = month === curMonth
                if (!mt.length && !isCurM) return null
                return (
                  <div key={month} className="month-node">
                    <div className="month-header">
                      <span className={`text-xs font-semibold ${isCurM ? 'text-blue-400' : 'text-gray-400'}`}>
                        {MONTH_NAMES[month]}
                      </span>
                      {isCurM && (
                        <span className="ml-1.5 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                          hiện tại
                        </span>
                      )}
                      {mt.length > 0 && (
                        <span className="ml-2 text-xs text-gray-600">
                          {mt.filter(t => t.status === 'done').length}/{mt.length}
                        </span>
                      )}
                    </div>
                    <div className="pl-4">
                      {mt.length === 0
                        ? <p className="text-xs text-gray-600 italic py-1 pl-2">Chưa có đầu việc</p>
                        : mt.map(task => <TaskNode key={task.id} task={task} />)
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main view ──────────────────────────────────────────────── */
export default function SharedTasksView({ tasks }) {
  const shared = tasks.filter(t => t.scope === 'dept')
  const done   = shared.filter(t => t.status === 'done').length
  const doing  = shared.filter(t => t.status === 'doing').length

  const stats = [
    { label: 'đầu việc chung', value: shared.length, color: '#6fcf97' },
    { label: 'hoàn thành',     value: done,           color: '#6fcf97' },
    { label: 'đang thực hiện', value: doing,          color: '#4f8ef7' },
  ]

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" key="shared"
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}>

      <Topbar title="Đầu việc chung" stats={stats} />
      <QuickAddBar />

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          {shared.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-5xl opacity-60">📋</span>
              <p className="text-gray-400 font-medium">Chưa có đầu việc chung nào</p>
              <p className="text-gray-500 text-xs">Gõ đầu việc vào ô phía trên và nhấn Enter để thêm nhanh!</p>
            </div>
          ) : (
            <div className="year-node">
              <div className="year-header">
                <span className="text-base font-bold text-gray-50">Năm 2026</span>
                <span className="ml-3 text-xs text-gray-500">{done}/{shared.length} hoàn thành</span>
              </div>
              {[1, 2, 3, 4].map(q => (
                <QuarterSection key={q} quarter={q}
                  tasks={shared.filter(t => t.quarter === q)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
