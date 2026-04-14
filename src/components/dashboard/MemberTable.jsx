import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function MemberTable({ members, tasks, onSelectMember }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Thành viên', 'Nhiệm vụ', 'Hoàn thành', 'Đang làm', 'Tiến độ'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => {
              const mTasks = tasks.filter(t => t.memberId === m.id)
              const done   = mTasks.filter(t => t.status === 'done').length
              const doing  = mTasks.filter(t => t.status === 'doing').length
              const pct    = mTasks.length ? Math.round((done / mTasks.length) * 100) : 0

              return (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectMember(m.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} color={m.color || 0} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{m.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{m.role || 'Thành viên'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{mTasks.length}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{done}</td>
                  <td className="px-6 py-4 text-sm font-bold text-amber-600">{doing}</td>
                  <td className="px-6 py-4 w-40">
                    <ProgressBar pct={pct} height={6} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
