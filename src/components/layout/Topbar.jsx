import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Bell, Search } from 'lucide-react'

export function Topbar({ title, stats, children }) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 gap-6 sticky top-0 z-30">
      
      {/* Title & Stats */}
      <div className="flex items-center gap-6 min-w-0">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">{title}</h2>

        {stats && (
          <div className="hidden lg:flex items-center gap-4 py-1.5 px-3 bg-gray-50 rounded-lg border border-gray-200 shrink-0">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-gray-400">{s.label}:</span>
                <span style={{ color: s.color }}>{s.value}</span>
                {i < stats.length - 1 && <span className="text-gray-200">|</span>}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search & Notif (Placeholders) */}
        <div className="flex items-center gap-1 sm:gap-2 mr-2">
          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Search size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Custom content slot (View Toggles etc) */}
        {children}

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Xác thực</p>
              <p className="text-xs font-bold text-gray-900 truncate leading-none">{user.displayName || user.email.split('@')[0]}</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
              {user.photoURL 
                ? <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                : <span className="text-xs font-bold text-gray-500 uppercase">{user.email[0]}</span>
              }
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
