import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskNode } from './TaskNode'
import { MemberSection } from './MemberSection'
import { Modal } from '@/components/ui/Modal'
import { addTask } from '@/lib/firestore'
import { itemVariants, listVariants } from '@/lib/animations'

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const currentMonth = new Date().getMonth() + 1

// Danh sách thành viên chưa có nhiệm vụ tháng này
function MembersEmpty({ members, month, quarter }) {
  const [show, setShow] = useState(false)
  if (!show) {
    return (
      <button
        className="text-xs text-gray-500 hover:text-gray-300 pl-2 py-1 mt-0.5 block"
        onClick={() => setShow(true)}
      >
        + {members.length} thành viên chưa có nhiệm vụ tháng này
      </button>
    )
  }
  return (
    <div>
      {members.map(m => (
        <MemberSection key={m.id} member={m} month={month} quarter={quarter} tasks={[]} />
      ))}
      <button className="text-xs text-gray-500 hover:text-gray-300 pl-2 py-1"
        onClick={() => setShow(false)}>
        Thu gọn
      </button>
    </div>
  )
}

// ── Unified mode: hiển thị nhiệm vụ chung + từng thành viên
function MonthNodeUnified({ month, quarter, tasks, members }) {
  const [isOpen, setIsOpen]          = useState(month === currentMonth)
  const [showAdd, setShowAdd]        = useState(false)
  const [addType, setAddType]        = useState('member')
  const [addMemberId, setAddMemberId] = useState(members[0]?.id || '')
  const [title, setTitle]            = useState('')
  const [note, setNote]              = useState('')

  const deptTasks = tasks.filter(t => t.scope === 'dept')
  const memberIds = [...new Set(
    tasks.filter(t => t.scope !== 'dept').map(t => t.memberId).filter(Boolean)
  )]
  const membersWithTasks    = members.filter(m => memberIds.includes(m.id))
  const membersWithoutTasks = members.filter(m => !memberIds.includes(m.id))

  const totalTasks = tasks.length
  const doneTasks  = tasks.filter(t => t.status === 'done').length

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title: title.trim(), note: note.trim(), scope: addType,
      memberId: addType === 'member' ? addMemberId : null,
      year: 2026, quarter, month, status: 'none',
    })
    setTitle(''); setNote(''); setShowAdd(false)
  }

  return (
    <div className="month-node">
      <motion.div className="month-header" onClick={() => setIsOpen(o => !o)}
        whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.02)' }}>
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="text-gray-600 text-xs w-4 shrink-0">▶</motion.span>

        <span className={`text-xs font-semibold ${month === currentMonth ? 'text-blue-400' : 'text-gray-400'}`}>
          {MONTH_NAMES[month]}
          {month === currentMonth && (
            <span className="ml-1.5 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
              hiện tại
            </span>
          )}
        </span>

        {totalTasks > 0 && (
          <span className="ml-2 text-xs text-gray-600">{doneTasks}/{totalTasks} hoàn thành</span>
        )}

        <button className="ml-auto text-xs text-gray-600 hover:text-blue-400 transition-colors"
          onClick={e => { e.stopPropagation(); setAddType('member'); setAddMemberId(members[0]?.id || ''); setShowAdd(true) }}>
          + Thêm
        </button>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}>
            <div className="pl-4 pb-1">

              {/* Nhiệm vụ chung phòng */}
              <div className="dept-section mb-1">
                <div className="dept-section-header">
                  <span className="text-xs mr-1">📋</span>
                  <span className="text-xs font-medium text-gray-400">Nhiệm vụ chung phòng</span>
                  {deptTasks.length > 0 && (
                    <span className="text-xs text-gray-600 ml-1">({deptTasks.length})</span>
                  )}
                  <button className="ml-auto text-xs text-gray-600 hover:text-blue-400 transition-colors"
                    onClick={e => { e.stopPropagation(); setAddType('dept'); setShowAdd(true) }}>+</button>
                </div>
                {deptTasks.length > 0 && (
                  <motion.div className="pl-4" variants={listVariants} initial="hidden" animate="visible">
                    {deptTasks.map(task => (
                      <motion.div key={task.id} variants={itemVariants}>
                        <TaskNode task={task} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Từng thành viên có nhiệm vụ */}
              {membersWithTasks.map(m => (
                <MemberSection key={m.id} member={m} month={month} quarter={quarter}
                  tasks={tasks.filter(t => t.memberId === m.id && t.scope !== 'dept')} />
              ))}

              {/* Thành viên chưa có nhiệm vụ */}
              {membersWithoutTasks.length > 0 && (
                <MembersEmpty members={membersWithoutTasks} month={month} quarter={quarter} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={showAdd} onClose={() => setShowAdd(false)}
        title={`Thêm nhiệm vụ — ${MONTH_NAMES[month]}`}>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="form-label">Loại nhiệm vụ</label>
            <div className="flex gap-2">
              {[['dept', '📋 Nhiệm vụ chung'], ['member', '👤 Cá nhân']].map(([v, l]) => (
                <button key={v} type="button"
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    addType === v
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                  onClick={() => setAddType(v)}>{l}</button>
              ))}
            </div>
          </div>

          {addType === 'member' && (
            <div>
              <label className="form-label">Thành viên</label>
              <select className="form-input" value={addMemberId}
                onChange={e => setAddMemberId(e.target.value)}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="form-label">Tên nhiệm vụ *</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="VD: Đấu thầu Internet" autoFocus />
          </div>
          <div>
            <label className="form-label">Ghi chú</label>
            <input className="form-input" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Tuỳ chọn" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Thêm</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Huỷ</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Member mode: chỉ nhiệm vụ của 1 thành viên ────────────
function MonthNodeMember({ month, quarter, tasks, memberId }) {
  const [isOpen, setIsOpen] = useState(month === currentMonth)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle]   = useState('')
  const [note, setNote]     = useState('')

  const done  = tasks.filter(t => t.status === 'done').length
  const total = tasks.length

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({ title: title.trim(), note: note.trim(), memberId, scope: 'member',
      year: 2026, quarter, month, status: 'none' })
    setTitle(''); setNote(''); setShowAdd(false)
  }

  return (
    <div className="month-node">
      <motion.div className="month-header" onClick={() => setIsOpen(o => !o)}
        whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.02)' }}>
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="text-gray-600 text-xs w-4 shrink-0">▶</motion.span>
        <span className={`text-xs font-semibold ${month === currentMonth ? 'text-blue-400' : 'text-gray-400'}`}>
          {MONTH_NAMES[month]}
        </span>
        {total > 0 && <span className="ml-2 text-xs text-gray-600">{done}/{total}</span>}
        <button className="ml-auto text-xs text-gray-600 hover:text-blue-400 transition-colors"
          onClick={e => { e.stopPropagation(); setShowAdd(true) }}>+ Nhiệm vụ</button>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}>
            <motion.div className="pl-4" variants={listVariants} initial="hidden" animate="visible">
              {tasks.map(task => (
                <motion.div key={task.id} variants={itemVariants}><TaskNode task={task} /></motion.div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-gray-500 py-2 pl-4 italic">Chưa có nhiệm vụ</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={showAdd} onClose={() => setShowAdd(false)}
        title={`Thêm nhiệm vụ — ${MONTH_NAMES[month]}`}>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="form-label">Tên nhiệm vụ *</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="VD: Kiểm tra thiết bị" autoFocus />
          </div>
          <div>
            <label className="form-label">Ghi chú</label>
            <input className="form-input" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Tuỳ chọn" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Thêm</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Huỷ</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// Tự động chọn mode dựa vào props
export function MonthNode({ month, quarter, tasks, members, memberId }) {
  if (members) {
    return <MonthNodeUnified month={month} quarter={quarter} tasks={tasks} members={members} />
  }
  return <MonthNodeMember month={month} quarter={quarter} tasks={tasks} memberId={memberId} />
}
