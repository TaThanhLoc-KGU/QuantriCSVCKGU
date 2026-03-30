import { useState } from 'react'
import { motion } from 'framer-motion'
import { updateStepStatus, updateStep, deleteStep } from '@/lib/firestore'
import { nextStatus, STATUS_MAP } from '@/components/ui/StatusBadge'

const STEP_STATUS_COLORS = {
  done:  'text-emerald-500',
  doing: 'text-blue-500',
  wait:  'text-amber-500',
  none:  'text-gray-500',
}

const STEP_ICONS = {
  done:  '✓',
  doing: '▶',
  wait:  '⏸',
  none:  '○',
}

export function StepItem({ step, taskId }) {
  const [editing, setEditing]   = useState(false)
  const [editName, setEditName] = useState(step.name)
  const [editDate, setEditDate] = useState(step.date || '')

  const handleToggle = async () => {
    const ns = nextStatus(step.status || 'none')
    await updateStepStatus(step.id, ns)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (confirm(`Xóa bước "${step.name}"?`)) await deleteStep(step.id)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setEditName(step.name)
    setEditDate(step.date || '')
    setEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    await updateStep(step.id, { name: editName.trim(), date: editDate.trim() })
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setEditing(false)
  }

  const colorClass = STEP_STATUS_COLORS[step.status] || STEP_STATUS_COLORS.none
  const icon       = STEP_ICONS[step.status]       || STEP_ICONS.none

  if (editing) {
    return (
      <motion.form onSubmit={handleSave}
        className="step-item gap-2 bg-gray-800/50 rounded-lg"
        onClick={e => e.stopPropagation()}>
        <button type="button" onClick={handleToggle}
          className={`step-icon ${colorClass} shrink-0`}>{icon}</button>
        <input
          className="flex-1 bg-transparent border-b border-blue-500 text-xs text-gray-200 outline-none px-0.5 min-w-0"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <input
          className="w-20 bg-transparent border-b border-gray-600 text-xs text-gray-500 outline-none px-0.5"
          value={editDate}
          onChange={e => setEditDate(e.target.value)}
          placeholder="Ngày"
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="text-xs text-blue-400 hover:text-blue-300 px-1 shrink-0">✓</button>
        <button type="button" className="text-xs text-gray-600 hover:text-gray-400 px-1 shrink-0"
          onClick={() => setEditing(false)}>✕</button>
      </motion.form>
    )
  }

  return (
    <motion.div
      className="step-item group"
      whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.03)' }}
    >
      {/* Status toggle */}
      <button onClick={handleToggle}
        className={`step-icon ${colorClass}`}
        title={STATUS_MAP[step.status]?.label || 'Chưa bắt đầu'}>
        {icon}
      </button>

      {/* Step name */}
      <div className="flex-1 min-w-0">
        <span className={`text-xs ${step.status === 'done' ? 'line-through text-gray-500' : 'text-gray-300'}`}>
          {step.name}
        </span>
        {step.date && (
          <span className="ml-2 text-xs text-gray-600">{step.date}</span>
        )}
      </div>

      {/* Edit */}
      <button onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-blue-400 transition-all text-xs px-1"
        title="Sửa">✏</button>

      {/* Delete */}
      <button onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-rose-400 transition-all text-xs px-1">✕</button>
    </motion.div>
  )
}
