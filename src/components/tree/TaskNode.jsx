import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSteps } from '@/hooks/useSteps'
import { ProgressBar, calcProgress } from '@/components/ui/ProgressBar'
import { StatusBadge, nextStatus } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { updateTaskStatus, updateTask, addStep, deleteTask, updateStep } from '@/lib/firestore'
import { ChevronRight, MoreVertical, Edit2, Trash2, Calendar, Clock, Plus, Info } from 'lucide-react'

export function TaskNode({ task }) {
  const [isOpen, setIsOpen]             = useState(false)
  const [showAddStep, setShowAddStep]   = useState(false)
  const [stepName, setStepName]         = useState('')
  const [stepDate, setStepDate]         = useState('')
  const [showEdit, setShowEdit]         = useState(false)
  const [editTitle, setEditTitle]       = useState('')
  const [editNote, setEditNote]         = useState('')
  const [editDeadline, setEditDeadline] = useState('')

  const { steps } = useSteps(isOpen ? task.id : null)
  const pct = calcProgress(steps)

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
    setEditTitle(task.title); setEditNote(task.note || ''); setEditDeadline(task.deadline || ''); setShowEdit(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    await updateTask(task.id, { title: editTitle.trim(), note: editNote.trim(), deadline: editDeadline })
    setShowEdit(false)
  }

  const getDeadlineLabel = () => {
    if (!task.deadline || task.status === 'done') return null
    const dl = new Date(task.deadline)
    const diff = dl.getTime() - new Date().setHours(0,0,0,0)
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: `Trễ ${Math.abs(days)}n`, cls: 'text-rose-600 bg-rose-50' }
    if (days <= 3) return { label: `${days}n tới`, cls: 'text-amber-600 bg-amber-50' }
    return { label: dl.toLocaleDateString('vi-VN'), cls: 'text-gray-500 bg-gray-50' }
  }

  const dl = getDeadlineLabel()

  return (
    <div className="group border-b border-gray-100 last:border-none">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}>
        
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className="text-gray-400 shrink-0">
          <ChevronRight size={16} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 truncate">{task.title}</span>
            {dl && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${dl.cls}`}>{dl.label}</span>}
          </div>
          {task.note && <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">{task.note}</p>}
        </div>

        {/* Progress Bar - Fixed UI overflow */}
        <div className="w-20 shrink-0 hidden sm:block">
           <ProgressBar pct={pct} height={5} />
        </div>

        <div onClick={handleStatusClick} className="shrink-0">
          <StatusBadge status={task.status || 'none'} />
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button onClick={openEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><Edit2 size={14} /></button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"><Trash2 size={14} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/30">
            <div className="ml-8 border-l-2 border-gray-100 pl-4 py-2 space-y-1 pb-4">
               {steps.map(step => (
                 <div key={step.id} className="flex items-center gap-3 py-1.5 group/step">
                    <div className="w-4 h-4 rounded border-2 border-gray-200 flex items-center justify-center shrink-0">
                       {step.status === 'done' && <div className="w-2 h-2 bg-blue-500 rounded-sm" />}
                    </div>
                    <span className={`text-xs font-bold ${step.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {step.name}
                    </span>
                    {step.date && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">({step.date})</span>}
                 </div>
               ))}
               <button onClick={(e) => { e.stopPropagation(); setShowAddStep(true) }}
                className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 hover:translate-x-1 transition-transform">
                 <Plus size={12} strokeWidth={3} /> Thêm bước thực hiện
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Chỉnh sửa nhiệm vụ">
         <form onSubmit={handleSaveEdit} className="space-y-4">
            <div><label className="form-label">Tên nhiệm vụ</label><input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Hạn chót</label><input type="date" className="form-input" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} /></div>
              <div><label className="form-label">Tiến độ</label><div className="h-10 px-3 flex items-center bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500">{pct}% xong</div></div>
            </div>
            <div><label className="form-label">Ghi chú chi tiết</label><textarea className="form-input h-24 resize-none" value={editNote} onChange={e => setEditNote(e.target.value)} /></div>
            <button type="submit" className="w-full btn-primary py-3">Cập nhật ngay</button>
         </form>
      </Modal>

      <Modal open={showAddStep} onClose={() => setShowAddStep(false)} title="Thêm bước thực hiện">
         <form onSubmit={handleAddStep} className="space-y-4">
            <div><label className="form-label">Nội dung công việc</label><input className="form-input" value={stepName} onChange={e => setStepName(e.target.value)} placeholder="Ví dụ: Kiểm kê bàn ghế..." autoFocus /></div>
            <div><label className="form-label">Thời gian dự kiến (tuỳ chọn)</label><input className="form-input" value={stepDate} onChange={e => setStepDate(e.target.value)} placeholder="Ví dụ: Tuần 2 tháng 4" /></div>
            <button type="submit" className="w-full btn-primary py-3">Xác nhận thêm</button>
         </form>
      </Modal>
    </div>
  )
}
