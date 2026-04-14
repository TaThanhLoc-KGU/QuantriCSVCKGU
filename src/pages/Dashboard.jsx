import { useState } from 'react'
import { motion } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { MemberTable } from '@/components/dashboard/MemberTable'
import { Modal } from '@/components/ui/Modal'
import { addMember } from '@/lib/firestore'
import { pageVariants, pageTransition } from '@/lib/animations'
import { UserPlus, LayoutDashboard } from 'lucide-react'

const ROLES = ['Trưởng phòng', 'Phó phòng', 'Chuyên viên']

export default function Dashboard({ tasks, members, onSelectMember }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName]       = useState('')
  const [role, setRole]       = useState('Chuyên viên')

  const stats = [
    { label: 'Thành viên', value: members.length, color: '#2563eb' },
    { label: 'Hoàn thành', value: tasks.filter(t => t.status === 'done').length, color: '#059669' },
  ]

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await addMember({ name: name.trim(), role: role.trim(), color: members.length % 10 })
    setName(''); setRole('Chuyên viên'); setShowAdd(false)
  }

  return (
    <motion.div className="flex-1 flex flex-col h-full bg-gray-50/50"
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>

      <Topbar title="Tổng quan phòng" stats={stats} />

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        {/* KPI Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard size={20} className="text-blue-600" />
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Chỉ số quan trọng</h3>
          </div>
          <KpiCards tasks={tasks} />
        </section>

        {/* Member List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Hiệu suất nhân sự</h3>
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
              <UserPlus size={16} />
              Thêm nhân sự
            </button>
          </div>
          <MemberTable members={members} tasks={tasks} onSelectMember={onSelectMember} />
        </section>
      </div>

      {/* Add Member Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Thêm nhân sự mới">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="form-label">Họ và tên nhân viên</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A" autoFocus />
          </div>
          <div>
            <label className="form-label">Chức vụ / Vai trò</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Xác nhận thêm</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Hủy</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
