import { motion } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { YearNode } from '@/components/tree/YearNode'
import { Avatar } from '@/components/ui/Avatar'
import { pageVariants, pageTransition } from '@/lib/animations'

export default function MemberView({ member, tasks }) {
  const memberTasks = tasks.filter(t => t.memberId === member?.id)
  const done  = memberTasks.filter(t => t.status === 'done').length
  const doing = memberTasks.filter(t => t.status === 'doing').length
  const wait  = memberTasks.filter(t => t.status === 'wait').length

  const stats = [
    { label: 'tổng',       value: memberTasks.length, color: '#9ca3af' },
    { label: 'hoàn thành', value: done,               color: '#6fcf97' },
    { label: 'đang làm',   value: doing,              color: '#4f8ef7' },
    { label: 'chờ duyệt',  value: wait,               color: '#f2994a' },
  ]

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" key={member?.id}
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Topbar
        title={
          <span className="flex items-center gap-2">
            <Avatar name={member?.name} color={member?.color} size="sm" />
            {member?.name}
            {member?.role && <span className="text-xs font-normal text-gray-500">— {member.role}</span>}
          </span>
        }
        stats={stats}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <YearNode year={2026} tasks={memberTasks} memberId={member?.id} />
      </div>
    </motion.div>
  )
}
