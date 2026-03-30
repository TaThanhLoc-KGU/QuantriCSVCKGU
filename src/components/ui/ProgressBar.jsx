import { motion } from 'framer-motion'

const getBarColor = (p) => {
  if (p === 100) return 'bg-emerald-500'
  if (p > 50)  return 'bg-blue-500'
  if (p > 0)   return 'bg-amber-500'
  return 'bg-gray-600'
}

const getTextColor = (p) => {
  if (p === 100) return 'text-emerald-500'
  if (p > 50)  return 'text-blue-500'
  if (p > 0)   return 'text-amber-500'
  return 'text-gray-600'
}

export function ProgressBar({ pct = 0 }) {
  const safe = Math.min(100, Math.max(0, pct))

  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor(safe)}`}
          animate={{ width: `${safe}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <motion.span
        className={`text-xs font-mono min-w-[30px] text-right ${getTextColor(safe)}`}
        key={safe}
        initial={{ scale: 1.3, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {safe}%
      </motion.span>
    </div>
  )
}

export function calcProgress(steps = []) {
  if (!steps.length) return 0
  const done = steps.filter(s => s.status === 'done').length
  return Math.round((done / steps.length) * 100)
}
