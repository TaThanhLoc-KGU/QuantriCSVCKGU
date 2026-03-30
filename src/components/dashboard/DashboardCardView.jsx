import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'

function pct(tasks) {
  if (!tasks.length) return 0
  return Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100)
}

function borderColor(tasks) {
  if (!tasks.length) return 'border-gray-700'
  const p = pct(tasks)
  if (p === 100) return 'border-emerald-500/60'
  if (p >= 50)   return 'border-blue-500/50'
  return 'border-amber-500/40'
}

function MiniBar({ tasks }) {
  const p = pct(tasks)
  return (
    <div className="mt-2 h-1 rounded-full bg-gray-700 overflow-hidden">
      <motion.div className="h-full rounded-full bg-blue-500"
        initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.4 }} />
    </div>
  )
}

function StatusDot({ status }) {
  const cls = { done: 'bg-emerald-500', doing: 'bg-blue-500', wait: 'bg-amber-500' }[status] || 'bg-gray-600'
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 mt-0.5 ${cls}`} />
}

function Card({ children, selected, onClick, borderCls = 'border-gray-700' }) {
  return (
    <motion.div layout onClick={onClick}
      className={`border-2 rounded-2xl p-3 cursor-pointer select-none transition-all duration-150 ${
        selected
          ? 'border-blue-500 bg-blue-500/15 shadow-md shadow-blue-500/20'
          : `${borderCls} bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800`
      }`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

function ColHeader({ title, highlight }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${highlight ? 'text-blue-400' : 'text-gray-500'}`}>
      {title}
    </p>
  )
}

const STATUS_LABEL = { done: 'Hoàn thành', doing: 'Đang làm', wait: 'Chờ duyệt' }
const STATUS_BADGE = { done: 'badge-done', doing: 'badge-doing', wait: 'badge-wait' }

function TaskDetailPanel({ task, members, onViewMember }) {
  if (!task) return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-600 select-none">
      <span className="text-4xl">👈</span>
      <p className="text-xs text-center leading-relaxed">Chọn nhiệm vụ<br/>để xem chi tiết</p>
    </div>
  )

  const member = members.find(m => m.id === task.memberId)
  const badge  = STATUS_BADGE[task.status] || 'badge-none'
  const label  = STATUS_LABEL[task.status] || '—'

  return (
    <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-semibold text-gray-50 leading-snug flex-1">{task.title}</p>
        <span className={`status-badge ${badge} shrink-0`}>{label}</span>
      </div>

      {member && (
        <div className="flex items-center gap-3 p-3 bg-gray-700/40 rounded-xl">
          <Avatar name={member.name} color={member.color || 0} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-200">{member.name}</p>
            {member.role && <p className="text-xs text-gray-500">{member.role}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        {task.quarter && (
          <div className="bg-gray-700/40 rounded-lg px-3 py-2">
            <p className="text-gray-500 mb-0.5">Quý</p>
            <p className="text-gray-200 font-medium">Q{task.quarter}</p>
          </div>
        )}
        {task.month && (
          <div className="bg-gray-700/40 rounded-lg px-3 py-2">
            <p className="text-gray-500 mb-0.5">Tháng</p>
            <p className="text-gray-200 font-medium">Tháng {task.month}</p>
          </div>
        )}
      </div>

      {task.description && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Mô tả</p>
          <p className="text-sm text-gray-300 leading-relaxed">{task.description}</p>
        </div>
      )}
      {task.note && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Ghi chú</p>
          <p className="text-sm text-gray-400 italic">{task.note}</p>
        </div>
      )}

      {member && (
        <button
          className="mt-auto text-xs text-blue-500 border border-blue-500/30 hover:border-blue-500/60 rounded-xl py-2.5 transition-colors"
          onClick={() => onViewMember(member.id)}
        >
          Xem toàn bộ nhiệm vụ của {member.name.split(' ').pop()} →
        </button>
      )}
    </motion.div>
  )
}

export default function DashboardCardView({ members, tasks, onSelectMember }) {
  const [selMemberId, setSelMemberId] = useState(null)
  const [selTask, setSelTask]         = useState(null)
  const [mobileLevel, setMobileLevel] = useState(0)

  const selMember   = members.find(m => m.id === selMemberId)
  const memberTasks = selMemberId ? tasks.filter(t => t.memberId === selMemberId) : []

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Mobile breadcrumb */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-b border-gray-700 text-xs shrink-0">
        {[
          { label: 'Thành viên', level: 0 },
          selMember && { label: selMember.name.split(' ').pop(), level: 1 },
          selTask   && { label: 'Chi tiết', level: 2 },
        ].filter(Boolean).map((b, i) => (
          <span key={b.level} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-gray-500">›</span>}
            <button
              className={`px-2 py-0.5 rounded ${mobileLevel >= b.level ? 'text-blue-500' : 'text-gray-600'}`}
              onClick={() => setMobileLevel(b.level)}
            >{b.label}</button>
          </span>
        ))}
      </div>

      {/* ── DESKTOP: 3 columns ─────────────────────────────── */}
      <div className="hidden md:grid h-full gap-3 p-4"
        style={{ gridTemplateColumns: '190px minmax(0,1fr) minmax(0,1.7fr)' }}>

        {/* Col 1: Members */}
        <div className="overflow-y-auto flex flex-col gap-2">
          <ColHeader title="Thành viên" />
          {members.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">Chưa có thành viên</p>
          )}
          {members.map(m => {
            const mt = tasks.filter(t => t.memberId === m.id)
            return (
              <Card key={m.id} selected={selMemberId === m.id} borderCls={borderColor(mt)}
                onClick={() => { setSelMemberId(m.id); setSelTask(null) }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={m.name} color={m.color || 0} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">{m.name.split(' ').pop()}</p>
                    <p className="text-[10px] text-gray-500">{mt.length} nv · {pct(mt)}%</p>
                  </div>
                </div>
                <MiniBar tasks={mt} />
              </Card>
            )
          })}
        </div>

        {/* Col 2: Tasks */}
        <div className="overflow-y-auto flex flex-col gap-2">
          <ColHeader title={selMember ? `Nhiệm vụ — ${selMember.name.split(' ').pop()}` : 'Nhiệm vụ'} highlight={!!selMemberId} />
          <AnimatePresence mode="wait">
            <motion.div key={selMemberId ?? 'empty'} className="flex flex-col gap-2"
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
              {!selMemberId && <p className="text-xs text-gray-600 text-center py-6">← Chọn thành viên</p>}
              {selMemberId && memberTasks.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-6">Chưa có nhiệm vụ</p>
              )}
              {memberTasks.map(t => (
                <Card key={t.id} selected={selTask?.id === t.id} borderCls={borderColor([t])}
                  onClick={() => setSelTask(t)}>
                  <div className="flex items-start gap-2 min-w-0">
                    <StatusDot status={t.status} />
                    <p className="text-xs text-gray-200 leading-snug flex-1">{t.title}</p>
                  </div>
                  {(t.quarter || t.month) && (
                    <p className="text-[10px] text-gray-600 mt-1.5 pl-4">
                      {t.quarter ? `Q${t.quarter}` : ''}{t.month ? ` · T${t.month}` : ''}
                    </p>
                  )}
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Col 3: Detail (widest) */}
        <div className="overflow-y-auto">
          <ColHeader title="Chi tiết" highlight={!!selTask} />
          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5 min-h-48">
            <AnimatePresence mode="wait">
              <TaskDetailPanel key={selTask?.id ?? 'none'} task={selTask} members={members}
                onViewMember={onSelectMember} />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MOBILE ─────────────────────────────────────────── */}
      <div className="md:hidden flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">

          {mobileLevel === 0 && (
            <motion.div key="members" className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Thành viên</p>
              {members.map(m => {
                const mt = tasks.filter(t => t.memberId === m.id)
                return (
                  <Card key={m.id} selected={selMemberId === m.id} borderCls={borderColor(mt)}
                    onClick={() => { setSelMemberId(m.id); setSelTask(null); setMobileLevel(1) }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} color={m.color || 0} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-200 truncate">{m.name}</p>
                        <p className="text-xs text-gray-500">{mt.length} nhiệm vụ · {pct(mt)}%</p>
                      </div>
                    </div>
                    <MiniBar tasks={mt} />
                  </Card>
                )
              })}
            </motion.div>
          )}

          {mobileLevel === 1 && (
            <motion.div key="tasks" className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Nhiệm vụ — {selMember?.name}
              </p>
              {memberTasks.length === 0 && <p className="text-sm text-gray-600 text-center py-8">Chưa có nhiệm vụ</p>}
              {memberTasks.map(t => (
                <Card key={t.id} borderCls={borderColor([t])}
                  onClick={() => { setSelTask(t); setMobileLevel(2) }}>
                  <div className="flex items-start gap-2">
                    <StatusDot status={t.status} />
                    <p className="text-sm text-gray-200 flex-1 leading-snug">{t.title}</p>
                  </div>
                  {t.month && <p className="text-xs text-gray-600 mt-1.5 pl-4">Q{t.quarter} · T{t.month}</p>}
                </Card>
              ))}
              <button className="mt-2 text-xs text-blue-500 border border-blue-500/30 rounded-xl py-2"
                onClick={() => selMember && onSelectMember(selMember.id)}>
                Xem chi tiết theo cây →
              </button>
            </motion.div>
          )}

          {mobileLevel === 2 && selTask && (
            <motion.div key="detail"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <button className="text-xs text-gray-500 mb-4 flex items-center gap-1"
                onClick={() => setMobileLevel(1)}>← Quay lại</button>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                <TaskDetailPanel task={selTask} members={members} onViewMember={onSelectMember} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
