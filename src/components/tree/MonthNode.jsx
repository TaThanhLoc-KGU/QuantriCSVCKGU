import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskNode } from './TaskNode'
import { ChevronRight, Calendar } from 'lucide-react'

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const curMonth = new Date().getMonth() + 1

export function MonthNode({ month, tasks }) {
  const [isOpen, setIsOpen] = useState(month === curMonth)
  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length

  if (!total && month !== curMonth) return null

  return (
    <div className="mb-2">
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
          month === curMonth ? 'bg-blue-50/50' : 'hover:bg-gray-50'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className="text-gray-400">
          <ChevronRight size={14} />
        </motion.div>
        <Calendar size={14} className={month === curMonth ? 'text-blue-500' : 'text-gray-400'} />
        <span className={`text-xs font-bold ${month === curMonth ? 'text-blue-700' : 'text-gray-700'}`}>
          {MONTH_NAMES[month]}
        </span>
        {total > 0 && (
          <span className="text-[10px] font-black text-gray-400 ml-auto">
            {done}/{total} NV
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="ml-4 mt-1 border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
              {tasks.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic p-4 text-center">Chưa có nhiệm vụ</p>
              ) : (
                tasks.map(task => <TaskNode key={task.id} task={task} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
