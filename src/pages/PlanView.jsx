import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { YearNode } from '@/components/tree/YearNode'
import { Topbar } from '@/components/layout/Topbar'
import { pageVariants, pageTransition } from '@/lib/animations'
import MindMapView from '@/components/mindmap/MindMapView'

export default function PlanView({ tasks, members }) {
  const [viewMode, setViewMode] = useState('tree') // 'tree' | 'map'

  const done  = tasks.filter(t => t.status === 'done').length
  const doing = tasks.filter(t => t.status === 'doing').length
  const wait  = tasks.filter(t => t.status === 'wait').length

  const stats = [
    { label: 'tổng nhiệm vụ',   value: tasks.length,  color: '#9ca3af' },
    { label: 'hoàn thành',      value: done,           color: '#6fcf97' },
    { label: 'đang thực hiện',  value: doing,          color: '#4f8ef7' },
    { label: 'chờ duyệt',       value: wait,           color: '#f2994a' },
  ]

  return (
    <motion.div
      className="flex-1 flex flex-col min-h-0"
      key="plan"
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}
    >
      <Topbar title="Kế hoạch công việc 2026" stats={stats}>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-0.5 shrink-0">
          {[
            { id: 'tree', icon: '🌳', label: 'Cây' },
            { id: 'map',  icon: '🗺️', label: 'Sơ đồ' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === v.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{v.icon}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </Topbar>

      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === 'tree' ? (
            <motion.div
              key="tree"
              className="p-4 h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <YearNode year={2026} tasks={tasks} members={members} />
            </motion.div>
          ) : (
            <motion.div
              key="map"
              className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MindMapView tasks={tasks} members={members} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
