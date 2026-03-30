import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar, calcProgress } from '@/components/ui/ProgressBar'
import { TaskNode, DragHandle } from './TaskNode'
import { Modal } from '@/components/ui/Modal'
import { addTask, updateTask } from '@/lib/firestore'
import { itemVariants, listVariants } from '@/lib/animations'

/* Wrapper so each task in the list has its own drag controls */
function DraggableTask({ task }) {
  const controls = useDragControls()
  return (
    <Reorder.Item key={task.id} value={task} as="div" dragControls={controls} dragListener={false}>
      <TaskNode task={task} dragControls={controls} />
    </Reorder.Item>
  )
}

export function MemberSection({ member, tasks, month, quarter }) {
  const [isOpen, setIsOpen]     = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [title, setTitle]       = useState('')
  const [note, setNote]         = useState('')
  const [orderedTasks, setOrderedTasks] = useState([])

  // Sort tasks by order field, then keep in sync
  useEffect(() => {
    setOrderedTasks(prev => {
      const sorted = [...tasks].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      // If same tasks (same IDs), preserve local order but update task data
      const prevIds = prev.map(t => t.id).join(',')
      const newIds  = sorted.map(t => t.id).join(',')
      if (prevIds === newIds && prev.length > 0) {
        return prev.map(p => sorted.find(s => s.id === p.id) || p)
      }
      return sorted
    })
  }, [tasks])

  const done = tasks.filter(t => t.status === 'done').length
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title: title.trim(), note: note.trim(),
      memberId: member.id, scope: 'member',
      year: 2026, quarter, month, status: 'none',
      order: orderedTasks.length,
    })
    setTitle(''); setNote(''); setShowAdd(false)
  }

  const handleReorder = async (newOrder) => {
    setOrderedTasks(newOrder)
    await Promise.all(newOrder.map((t, i) => updateTask(t.id, { order: i })))
  }

  const displayTasks = orderedTasks.length ? orderedTasks : tasks

  return (
    <div className="member-section">
      {/* Header */}
      <motion.div className="member-section-header group"
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.02)' }}>
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="text-gray-600 text-xs w-3 shrink-0">▶</motion.span>
        <Avatar name={member.name} color={member.color || 0} size="sm" />
        <span className="text-xs font-medium text-gray-300 flex-1 truncate">{member.name}</span>
        {tasks.length > 0 && <ProgressBar pct={pct} />}
        <span className="text-xs text-gray-600 shrink-0">{tasks.length} nv</span>
        <button
          className="opacity-0 group-hover:opacity-100 ml-1 text-xs text-gray-600 hover:text-blue-400 transition-all"
          onClick={(e) => { e.stopPropagation(); setShowAdd(true) }}>+</button>
      </motion.div>

      {/* Task list with drag reorder */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}>
            <div className="pl-6">
              <Reorder.Group values={displayTasks} onReorder={handleReorder} axis="y" as="div">
                {displayTasks.map(task => (
                  <DraggableTask key={task.id} task={task} />
                ))}
              </Reorder.Group>
              {tasks.length === 0 && (
                <p className="text-xs text-gray-500 py-1.5 pl-4 italic">Chưa có nhiệm vụ</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add task modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Thêm nhiệm vụ — ${member.name}`}>
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
