import { motion } from 'framer-motion'

export function KpiCards({ tasks = [] }) {
  const total   = tasks.length
  const done    = tasks.filter(t => t.status === 'done').length
  const doing   = tasks.filter(t => t.status === 'doing').length
  const pct     = total ? Math.round((done / total) * 100) : 0

  const cards = [
    { label: 'Tổng nhiệm vụ',   value: total, color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100' },
    { label: 'Đã hoàn thành',   value: done,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Đang thực hiện',  value: doing, color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
    { label: 'Tiến độ chung',   value: `${pct}%`, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`${card.bg} rounded-2xl p-5 border shadow-sm`}
        >
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
          <p className={`text-3xl font-black tracking-tight ${card.color}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  )
}
