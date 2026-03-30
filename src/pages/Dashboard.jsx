import { useState } from 'react'
import { motion } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { MemberTable } from '@/components/dashboard/MemberTable'
import DashboardCardView from '@/components/dashboard/DashboardCardView'
import { listVariants } from '@/lib/animations'
import { Modal } from '@/components/ui/Modal'
import { addMember } from '@/lib/firestore'
import { pageVariants, pageTransition } from '@/lib/animations'

const ROLES = ['Trưởng phòng', 'Phó phòng', 'Chuyên viên']

export default function Dashboard({ tasks, members, onSelectMember }) {
  const [viewMode, setViewMode] = useState('card') // 'card' | 'table'
  const [showAdd, setShowAdd]   = useState(false)
  const [name, setName]         = useState('')
  const [role, setRole]         = useState('Chuyên viên')

  const stats = [
    { label: 'thành viên', value: members.length,                                 color: '#4f8ef7' },
    { label: 'nhiệm vụ',   value: tasks.length,                                   color: '#6fcf97' },
    { label: 'hoàn thành', value: tasks.filter(t => t.status === 'done').length,  color: '#56ccf2' },
    { label: 'đang làm',   value: tasks.filter(t => t.status === 'doing').length, color: '#f2994a' },
  ]

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await addMember({ name: name.trim(), role: role.trim(), color: members.length % 10 })
    setName(''); setRole('Chuyên viên'); setShowAdd(false)
  }

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" key="dashboard"
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>

      <Topbar title="Tổng quan phòng" stats={stats}>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-0.5 shrink-0">
          {[
            { id: 'card',  icon: '🫧', label: 'Sơ đồ' },
            { id: 'table', icon: '📋', label: 'Bảng'  },
          ].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === v.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}>
              <span>{v.icon}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </Topbar>

      {viewMode === 'card' ? (
        <div className="flex-1 min-h-0">
          <DashboardCardView members={members} tasks={tasks} onSelectMember={onSelectMember} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <motion.div variants={listVariants} initial="hidden" animate="visible">
            <KpiCards tasks={tasks} />
          </motion.div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Theo thành viên</h3>
              <button onClick={() => setShowAdd(true)} className="btn-primary text-xs px-3 py-1.5">
                + Thêm thành viên
              </button>
            </div>
            <MemberTable members={members} tasks={tasks} onSelectMember={onSelectMember} />
          </div>
        </div>
      )}

      {/* Add member button on card view */}
      {viewMode === 'card' && (
        <div className="px-4 pb-4 flex justify-end shrink-0">
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs px-3 py-1.5">
            + Thêm thành viên
          </button>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Thêm thành viên">
        <form onSubmit={handleAddMember} className="space-y-3">
          <div>
            <label className="form-label">Họ và tên *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn An" autoFocus />
          </div>
          <div>
            <label className="form-label">Chức vụ</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Thêm</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Huỷ</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
