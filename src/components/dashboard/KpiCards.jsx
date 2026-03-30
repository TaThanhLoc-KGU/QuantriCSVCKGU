import { motion } from 'framer-motion'
import { itemVariants } from '@/lib/animations'

export function KpiCards({ tasks = [] }) {
  const total   = tasks.length
  const done    = tasks.filter(t => t.status === 'done').length
  const doing   = tasks.filter(t => t.status === 'doing').length
  const wait    = tasks.filter(t => t.status === 'wait').length
  const none    = tasks.filter(t => !t.status || t.status === 'none').length
  const pct     = total ? Math.round((done / total) * 100) : 0

  const cards = [
    { label: 'Tổng nhiệm vụ',   value: total, textColor: 'text-blue-500',    bg: 'bg-blue-500/10'    },
    { label: 'Hoàn thành',      value: done,  textColor: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Đang thực hiện',  value: doing, textColor: 'text-cyan-500',    bg: 'bg-cyan-500/10'    },
    { label: 'Chờ duyệt',       value: wait,  textColor: 'text-amber-500',   bg: 'bg-amber-500/10'   },
    { label: 'Chưa bắt đầu',   value: none,  textColor: 'text-gray-500',    bg: 'bg-gray-500/10'    },
    { label: 'Tiến độ chung',   value: `${pct}%`, textColor: pct === 100 ? 'text-emerald-500' : 'text-blue-500', bg: 'bg-indigo-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className={`${card.bg} rounded-xl p-4 border border-gray-700`}
          variants={itemVariants}
          custom={i}
        >
          <p className="text-xs text-gray-400 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  )
}
