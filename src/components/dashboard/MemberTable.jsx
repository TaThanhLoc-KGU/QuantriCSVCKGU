import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { itemVariants, listVariants } from '@/lib/animations'

// tasks prop comes from parent — no Firestore calls here
export function MemberTable({ members, tasks, onSelectMember }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {['Thành viên', 'Tổng', 'Hoàn thành', 'Đang làm', 'Chờ duyệt', 'Tiến độ'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={listVariants} initial="hidden" animate="visible">
          {members.map(m => {
            const mTasks = tasks.filter(t => t.memberId === m.id)
            const done   = mTasks.filter(t => t.status === 'done').length
            const doing  = mTasks.filter(t => t.status === 'doing').length
            const wait   = mTasks.filter(t => t.status === 'wait').length
            const pct    = mTasks.length ? Math.round((done / mTasks.length) * 100) : 0

            return (
              <motion.tr key={m.id} className="table-row cursor-pointer" variants={itemVariants}
                onClick={() => onSelectMember(m.id)}
                whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.03)' }}>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar name={m.name} color={m.color || 0} size="sm" />
                    <div>
                      <p className="text-sm text-gray-200">{m.name}</p>
                      {m.role && <p className="text-xs text-gray-500">{m.role}</p>}
                    </div>
                  </div>
                </td>
                <td className="table-cell text-center text-sm text-gray-300">{mTasks.length}</td>
                <td className="table-cell text-center text-sm text-emerald-400">{done}</td>
                <td className="table-cell text-center text-sm text-blue-400">{doing}</td>
                <td className="table-cell text-center text-sm text-amber-400">{wait}</td>
                <td className="table-cell"><ProgressBar pct={pct} /></td>
              </motion.tr>
            )
          })}
        </motion.tbody>
      </table>
    </div>
  )
}
