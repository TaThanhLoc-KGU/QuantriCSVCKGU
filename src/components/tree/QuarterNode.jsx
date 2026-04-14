import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MonthNode } from './MonthNode'
import { LayoutGrid, ChevronRight } from 'lucide-react'

const curMonth   = new Date().getMonth() + 1
const curQuarter = Math.ceil(curMonth / 3)
const QUARTERS   = { 1: [1,2,3], 2: [4,5,6], 3: [7,8,9], 4: [10,11,12] }

export function QuarterNode({ quarter, tasks }) {
  // Always visible if present, otherwise still show the header
  const [isOpen, setIsOpen] = useState(quarter === curQuarter)
  const months = QUARTERS[quarter] || []
  const done   = tasks.filter(t => t.status === 'done').length
  const total  = tasks.length

  return (
    <div className="mb-4">
      <div 
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer transition-all border shadow-sm ${
          quarter === curQuarter 
            ? 'bg-blue-600 border-blue-600 shadow-blue-500/20 text-white' 
            : 'bg-white border-gray-100 text-gray-900 hover:border-gray-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className={quarter === curQuarter ? 'text-white/70' : 'text-gray-400'}>
           <ChevronRight size={18} />
        </motion.div>
        
        <LayoutGrid size={18} className={quarter === curQuarter ? 'text-white' : 'text-blue-600'} />
        
        <div className="flex-1">
           <span className="text-sm font-black uppercase tracking-tighter">Quý {quarter}</span>
           {quarter === curQuarter && <span className="ml-2 text-[8px] bg-white text-blue-600 px-1.5 py-0.5 rounded font-black">HIỆN TẠI</span>}
        </div>

        <div className="text-right">
           <p className={`text-[10px] font-black uppercase tracking-tighter ${quarter === curQuarter ? 'text-white' : 'text-gray-900'}`}>
             {done}/{total} Hoàn thành
           </p>
           <div className={`w-24 h-1.5 rounded-full mt-1 overflow-hidden ${quarter === curQuarter ? 'bg-white/20' : 'bg-gray-100'}`}>
              <div 
                className={`h-full transition-all duration-500 ${quarter === curQuarter ? 'bg-white' : 'bg-blue-600'}`} 
                style={{ width: `${total ? (done/total)*100 : 0}%` }} 
              />
           </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 pl-4 space-y-3">
              {months.map(m => (
                <MonthNode key={m} month={m} tasks={tasks.filter(t => t.month === m)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
