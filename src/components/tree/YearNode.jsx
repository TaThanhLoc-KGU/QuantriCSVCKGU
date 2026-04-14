import { QuarterNode } from './QuarterNode'
import { Calendar } from 'lucide-react'

export function YearNode({ year, tasks }) {
  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
           <Calendar size={24} strokeWidth={3} />
        </div>
        <div>
           <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Năm {year}</h2>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng hợp {total} nhiệm vụ — Đã xong {done}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map(q => (
          <QuarterNode key={q} quarter={q} tasks={tasks.filter(t => t.quarter === q)} />
        ))}
      </div>
    </div>
  )
}
