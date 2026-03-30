import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'

const QUARTER_MONTHS = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
}

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const currentMonth   = new Date().getMonth() + 1
const currentQuarter = Math.ceil(currentMonth / 3)

function statusColor(tasks) {
  if (!tasks.length) return 'border-gray-700 bg-gray-800/60'
  const done = tasks.filter(t => t.status === 'done').length
  const pct  = done / tasks.length
  if (pct === 1)  return 'border-emerald-500/60 bg-emerald-500/10'
  if (pct >= 0.5) return 'border-blue-500/50 bg-blue-500/10'
  return 'border-amber-500/40 bg-amber-500/8'
}

function pct(tasks) {
  if (!tasks.length) return 0
  return Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100)
}

function StatusDot({ status }) {
  const cls = {
    done:  'bg-emerald-500',
    doing: 'bg-blue-500',
    wait:  'bg-amber-500',
  }[status] || 'bg-gray-600'
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls}`} />
}

/* ── Mini progress bar ─────────────────────────────── */
function MiniBar({ tasks }) {
  const p = pct(tasks)
  return (
    <div className="mt-2 h-1 rounded-full bg-gray-700 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${p}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

/* ── Card ──────────────────────────────────────────── */
function Card({ children, selected, onClick, className = '' }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        mind-card border-2 rounded-2xl p-3 cursor-pointer select-none
        transition-all duration-150
        ${selected
          ? 'border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/20'
          : 'hover:border-gray-500 hover:bg-gray-800'
        }
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

/* ── Column ────────────────────────────────────────── */
function Column({ title, children, highlight }) {
  return (
    <div className="mind-column flex flex-col gap-2 min-w-0">
      <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${highlight ? 'text-blue-400' : 'text-gray-500'}`}>
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

/* ── Task detail panel (rightmost) ─────────────────── */
function TaskPanel({ task, members }) {
  if (!task) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-600">
      <span className="text-3xl">👆</span>
      <p className="text-xs">Chọn nhiệm vụ để xem chi tiết</p>
    </div>
  )

  const member = members.find(m => m.id === task.memberId)
  const statusLabel = { done: 'Hoàn thành', doing: 'Đang làm', wait: 'Chờ duyệt' }[task.status] || '—'
  const badgeCls    = { done: 'badge-done', doing: 'badge-doing', wait: 'badge-wait' }[task.status] || 'badge-none'

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm font-semibold text-gray-50 leading-snug">{task.title}</p>

      <span className={`status-badge ${badgeCls} w-fit`}>{statusLabel}</span>

      {task.scope === 'member' && member && (
        <div className="flex items-center gap-2">
          <Avatar name={member.name} color={member.color || 0} size="sm" />
          <div>
            <p className="text-xs text-gray-300">{member.name}</p>
            {member.role && <p className="text-xs text-gray-500">{member.role}</p>}
          </div>
        </div>
      )}

      {task.scope === 'dept' && (
        <p className="text-xs text-gray-500 italic">Nhiệm vụ phòng</p>
      )}

      {task.description && (
        <p className="text-xs text-gray-400 leading-relaxed">{task.description}</p>
      )}
    </motion.div>
  )
}

/* ── Main MindMapView ──────────────────────────────── */
export default function MindMapView({ tasks, members }) {
  const [selQ, setSelQ]    = useState(currentQuarter)
  const [selM, setSelM]    = useState(currentMonth)
  const [selT, setSelT]    = useState(null)

  // Mobile: which column level are we viewing (0=year, 1=quarter, 2=month, 3=task)
  const [mobileLevel, setMobileLevel] = useState(1)

  const quarterTasks = q => tasks.filter(t => t.quarter === q)
  const monthTasks   = m => tasks.filter(t => t.month === m)
  const selMonthTasks = monthTasks(selM)

  // Breadcrumb labels
  const breadcrumbs = [
    { label: '2026',              level: 0 },
    { label: `Quý ${selQ}`,      level: 1 },
    { label: MONTH_NAMES[selM],  level: 2 },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Mobile breadcrumb nav */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-b border-gray-700 text-xs overflow-x-auto shrink-0">
        {breadcrumbs.map((b, i) => (
          <span key={b.level} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-gray-500">›</span>}
            <button
              className={`px-2 py-0.5 rounded ${mobileLevel >= b.level ? 'text-blue-400' : 'text-gray-600'}`}
              onClick={() => setMobileLevel(b.level)}
            >
              {b.label}
            </button>
          </span>
        ))}
        {selT && (
          <>
            <span className="text-gray-500">›</span>
            <span className="text-gray-300 shrink-0 max-w-[120px] truncate">{selT.title}</span>
          </>
        )}
      </div>

      {/* Desktop: 4 columns / Mobile: single column */}
      <div className="flex-1 overflow-hidden">

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 h-full p-4 overflow-y-auto">

          {/* Col 1: Year */}
          <Column title="Năm">
            <Card selected className={statusColor(tasks)}>
              <p className="text-sm font-bold text-gray-50">📅 2026</p>
              <p className="text-xs text-gray-400 mt-1">{tasks.length} nhiệm vụ</p>
              <MiniBar tasks={tasks} />
            </Card>
          </Column>

          {/* Col 2: Quarters */}
          <Column title="Quý">
            {[1, 2, 3, 4].map(q => {
              const qt = quarterTasks(q)
              return (
                <Card key={q} selected={selQ === q} onClick={() => { setSelQ(q); setSelM(QUARTER_MONTHS[q][0]); setSelT(null) }}
                  className={statusColor(qt)}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-200">Quý {q}</p>
                    {q === currentQuarter && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Hiện tại</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{qt.length} nhiệm vụ · {pct(qt)}%</p>
                  <MiniBar tasks={qt} />
                </Card>
              )
            })}
          </Column>

          {/* Col 3: Months of selected quarter */}
          <Column title={`Tháng — Quý ${selQ}`} highlight>
            <AnimatePresence mode="wait">
              <motion.div key={selQ} className="flex flex-col gap-2"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {QUARTER_MONTHS[selQ].map(m => {
                  const mt = monthTasks(m)
                  return (
                    <Card key={m} selected={selM === m} onClick={() => { setSelM(m); setSelT(null) }}
                      className={statusColor(mt)}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-200">{MONTH_NAMES[m]}</p>
                        {m === currentMonth && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Hiện tại</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{mt.length} nhiệm vụ · {pct(mt)}%</p>
                      <MiniBar tasks={mt} />
                    </Card>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </Column>

          {/* Col 4: Tasks of selected month OR task detail */}
          <Column title={selT ? 'Chi tiết' : `Nhiệm vụ — ${MONTH_NAMES[selM]}`} highlight={!!selT}>
            <AnimatePresence mode="wait">
              {selT ? (
                <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-300 mb-3 flex items-center gap-1"
                    onClick={() => setSelT(null)}
                  >
                    ← Quay lại danh sách
                  </button>
                  <TaskPanel task={selT} members={members} />
                </motion.div>
              ) : (
                <motion.div key={selM} className="flex flex-col gap-2"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {selMonthTasks.length === 0 && (
                    <p className="text-xs text-gray-600 py-4 text-center">Chưa có nhiệm vụ</p>
                  )}
                  {selMonthTasks.map(t => (
                    <Card key={t.id} selected={selT?.id === t.id} onClick={() => setSelT(t)}
                      className={`border ${statusColor([t])}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusDot status={t.status} />
                        <p className="text-xs text-gray-200 truncate flex-1">{t.title}</p>
                      </div>
                      {t.scope === 'member' && (() => {
                        const m = members.find(m => m.id === t.memberId)
                        return m ? <p className="text-xs text-gray-500 mt-1 pl-4">{m.name.split(' ').pop()}</p> : null
                      })()}
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Column>
        </div>

        {/* ── MOBILE LAYOUT ── */}
        <div className="md:hidden h-full overflow-y-auto p-4">
          <AnimatePresence mode="wait">

            {/* Level 0: Year overview */}
            {mobileLevel === 0 && (
              <motion.div key="year" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Năm 2026</p>
                <Card selected className={`${statusColor(tasks)} mb-4`}>
                  <p className="text-base font-bold text-gray-50">📅 Tổng quan 2026</p>
                  <p className="text-xs text-gray-400 mt-1">{tasks.length} nhiệm vụ · {pct(tasks)}% hoàn thành</p>
                  <MiniBar tasks={tasks} />
                </Card>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Chọn quý</p>
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4].map(q => {
                    const qt = quarterTasks(q)
                    return (
                      <Card key={q} selected={selQ === q} className={statusColor(qt)}
                        onClick={() => { setSelQ(q); setSelM(QUARTER_MONTHS[q][0]); setSelT(null); setMobileLevel(1) }}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-200">Quý {q}</p>
                          {q === currentQuarter && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Hiện tại</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{qt.length} nhiệm vụ · {pct(qt)}%</p>
                        <MiniBar tasks={qt} />
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Level 1: Quarters */}
            {mobileLevel === 1 && (
              <motion.div key="quarters" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Tháng trong Quý {selQ}</p>
                <div className="flex flex-col gap-2">
                  {QUARTER_MONTHS[selQ].map(m => {
                    const mt = monthTasks(m)
                    return (
                      <Card key={m} selected={selM === m} className={statusColor(mt)}
                        onClick={() => { setSelM(m); setSelT(null); setMobileLevel(2) }}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-200">{MONTH_NAMES[m]}</p>
                          {m === currentMonth && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Hiện tại</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{mt.length} nhiệm vụ · {pct(mt)}%</p>
                        <MiniBar tasks={mt} />
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Level 2: Tasks in month */}
            {mobileLevel === 2 && (
              <motion.div key="tasks" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Nhiệm vụ — {MONTH_NAMES[selM]}
                </p>
                {selMonthTasks.length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-8">Chưa có nhiệm vụ</p>
                )}
                <div className="flex flex-col gap-2">
                  {selMonthTasks.map(t => (
                    <Card key={t.id} className={`border ${statusColor([t])}`}
                      onClick={() => { setSelT(t); setMobileLevel(3) }}>
                      <div className="flex items-center gap-2">
                        <StatusDot status={t.status} />
                        <p className="text-sm text-gray-200 flex-1">{t.title}</p>
                      </div>
                      {t.scope === 'member' && (() => {
                        const mb = members.find(mb => mb.id === t.memberId)
                        return mb ? (
                          <div className="flex items-center gap-1.5 mt-2 pl-4">
                            <Avatar name={mb.name} color={mb.color || 0} size="sm" />
                            <p className="text-xs text-gray-500">{mb.name.split(' ').pop()}</p>
                          </div>
                        ) : null
                      })()}
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Level 3: Task detail */}
            {mobileLevel === 3 && selT && (
              <motion.div key="detail" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button className="text-xs text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1"
                  onClick={() => setMobileLevel(2)}>
                  ← Danh sách nhiệm vụ
                </button>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                  <TaskPanel task={selT} members={members} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
