import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MonthNode } from './MonthNode'

const QUARTER_MONTHS = { 1: [1,2,3], 2: [4,5,6], 3: [7,8,9], 4: [10,11,12] }

const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

export function QuarterNode({ quarter, tasks, members, memberId }) {
  // Chỉ mở quý hiện tại mặc định
  const [isOpen, setIsOpen] = useState(quarter === currentQuarter)

  const months     = QUARTER_MONTHS[quarter] || []
  const doneCount  = tasks.filter(t => t.status === 'done').length
  const totalCount = tasks.length
  const isCurrentQ = quarter === currentQuarter

  return (
    <div className="quarter-node">
      <motion.div
        className={`quarter-header ${isCurrentQ ? 'quarter-header-active' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ backgroundColor: 'rgb(var(--bg-alpha) / 0.02)' }}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.18 }}
          className="text-gray-500 text-xs w-4 shrink-0"
        >
          ▶
        </motion.span>

        <span className={`text-sm font-semibold ${isCurrentQ ? 'text-gray-200' : 'text-gray-400'}`}>
          Quý {quarter}
        </span>

        {isCurrentQ && (
          <span className="text-[10px] bg-blue-500/15 text-blue-500 px-1.5 py-0.5 rounded-full ml-1">
            hiện tại
          </span>
        )}

        <span className="ml-2 text-xs text-gray-600">
          {totalCount > 0 ? `${doneCount}/${totalCount} nhiệm vụ` : 'Chưa có nhiệm vụ'}
        </span>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pl-4">
              {months.map(month => (
                <MonthNode
                  key={month}
                  month={month}
                  quarter={quarter}
                  tasks={tasks.filter(t => t.month === month)}
                  members={members}
                  memberId={memberId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
