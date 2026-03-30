import { motion } from 'framer-motion'

export const STATUS_MAP = {
  done:  { label: 'Hoàn thành',    className: 'badge-done'  },
  doing: { label: 'Đang thực hiện', className: 'badge-doing' },
  wait:  { label: 'Chờ duyệt',     className: 'badge-wait'  },
  none:  { label: 'Chưa bắt đầu',  className: 'badge-none'  },
}

export function StatusBadge({ status }) {
  const { label, className } = STATUS_MAP[status] || STATUS_MAP.none

  return (
    <motion.span
      layout="position"
      className={`status-badge ${className}`}
      key={status}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {label}
    </motion.span>
  )
}

export const STATUS_CYCLE = ['none', 'doing', 'wait', 'done']
export function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}
