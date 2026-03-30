import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useSteps } from '@/hooks/useSteps'
import { StepItem } from './StepItem'
import { ProgressBar, calcProgress } from '@/components/ui/ProgressBar'
import { StatusBadge, nextStatus } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { updateTaskStatus, updateTask, addStep, deleteTask, updateStep } from '@/lib/firestore'

/* Drag handle — used by parent Reorder.Item via dragControls */
export function DragHandle({ controls }) {
  return (
    <span
      className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-500 text-sm px-0.5 shrink-0 select-none touch-none leading-none"
      onPointerDown={(e) => { e.preventDefault(); controls.start(e) }}
      title="Kéo để sắp xếp"
    >⠿</span>
  )
}

export function TaskNode({ task, dragControls }) {
  const [isOpen, setIsOpen]             = useState(false)
  const [showAddStep, setShowAddStep]   = useState(false)
  const [stepName, setStepName]         = useState('')
  const [stepDate, setStepDate]         = useState('')
  const [showEdit, setShowEdit]         = useState(false)
  const [editTitle, setEditTitle]       = useState('')
  const [editNote, setEditNote]         = useState('')
  const [orderedSteps, setOrderedSteps] = useState([])

  const { steps } = useSteps(isOpen ? task.id : null)
  const pct = calcProgress(steps)

  // Keep orderedSteps in sync when steps arrive from Firestore
  useEffect(() => { setOrderedSteps(steps) }, [steps])

  const displaySteps = orderedSteps.length ? orderedSteps : steps

  const handleStatusClick = async (e) => {
    e.stopPropagation()
    await updateTaskStatus(task.id, nextStatus(task.status || 'none'))
  }

  const handleAddStep = async (e) => {
    e.preventDefault()
    if (!stepName.trim()) return
    const maxOrder = steps.reduce((m, s) => Math.max(m, s.order || 0), 0)
    await addStep(task.id, { name: stepName.trim(), date: stepDate, status: 'none', order: maxOrder + 1 })
    setStepName(''); setStepDate(''); setShowAddStep(false)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (confirm(`Xóa nhiệm vụ "${task.title}"?`)) await deleteTask(task.id)
  }

  const openEdit = (e) => {
    e.stopPropagation()
    setEditTitle(task.title)
    setEditNote(task.note || '')
    setShowEdit(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    await updateTask(task.id, { title: editTitle.trim(), note: editNote.trim() })
    setShowEdit(false)
  }

  const handleStepsReorder = async (newOrder) => {
    setOrderedSteps(newOrder)
    await Promise.all(newOrder.map((s, i) => updateStep(s.id, { order: i })))
  }

  return (
    <div className="task-node">
      {/* Task header */}
      <motion.div
        className="task-header group"
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.03)' }}
      >
        {/* Drag handle (passed from MemberSection Reorder) */}
        {dragControls && <DragHandle controls={dragControls} />}

        {/* Arrow */}
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}
          className="text-gray-500 text-xs shrink-0 w-4">▶</motion.span>

        {/* Title */}
        <span className="flex-1 text-sm text-gray-200 truncate">{task.title}</span>

        {/* Note */}
        {task.note && (
          <span className="text-xs text-gray-500 truncate max-w-[150px] hidden md:block">{task.note}</span>
        )}

        <ProgressBar pct={pct} />

        <div onClick={handleStatusClick}>
          <StatusBadge status={task.status || 'none'} />
        </div>

        {/* Edit button */}
        <button onClick={openEdit}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-blue-400 transition-all text-xs px-1 ml-0.5"
          title="Chỉnh sửa">✏</button>

        {/* Delete button */}
        <button onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-rose-400 transition-all text-xs px-1">✕</button>
      </motion.div>

      {/* Steps */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="steps"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}>
            <div className="steps-wrap">
              <Reorder.Group values={displaySteps} onReorder={handleStepsReorder} axis="y" as="div">
                {displaySteps.map((step, i) => (
                  <Reorder.Item key={step.id} value={step} as="div"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <StepItem step={step} taskId={task.id} />
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              <button
                className="ml-8 mt-1 mb-2 text-xs text-gray-600 hover:text-blue-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); setShowAddStep(true) }}>
                + Thêm bước
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add step modal */}
      <Modal open={showAddStep} onClose={() => setShowAddStep(false)} title="Thêm bước thực hiện">
        <form onSubmit={handleAddStep} className="space-y-3">
          <div>
            <label className="form-label">Tên bước *</label>
            <input className="form-input" value={stepName} onChange={e => setStepName(e.target.value)}
              placeholder="VD: Lập hồ sơ" autoFocus />
          </div>
          <div>
            <label className="form-label">Thời gian (tuỳ chọn)</label>
            <input className="form-input" value={stepDate} onChange={e => setStepDate(e.target.value)}
              placeholder="VD: 02–07/01" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Thêm</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowAddStep(false)}>Huỷ</button>
          </div>
        </form>
      </Modal>

      {/* Edit task modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Chỉnh sửa nhiệm vụ">
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <div>
            <label className="form-label">Tên nhiệm vụ *</label>
            <input className="form-input" value={editTitle}
              onChange={e => setEditTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="form-label">Ghi chú</label>
            <input className="form-input" value={editNote}
              onChange={e => setEditNote(e.target.value)} placeholder="Tuỳ chọn" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Lưu</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowEdit(false)}>Huỷ</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
