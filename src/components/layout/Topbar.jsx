import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Avatar } from '@/components/ui/Avatar'

export function Topbar({ title, stats, children }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 md:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-4 min-w-0">
        <h2 className="text-sm font-semibold text-gray-50 truncate">{title}</h2>

        {stats && (
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                className="flex items-center gap-1.5 text-xs text-gray-400"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span style={{ color: s.color }}>{s.value}</span>
                <span>{s.label}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Extra controls slot (view toggle etc.) */}
        {children}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Chuyển sáng' : 'Chuyển tối'}
          className="text-base p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden lg:block">{user.email}</span>
            <button onClick={logout}
              className="text-xs text-gray-500 hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-800">
              Đăng xuất
            </button>
            {user.photoURL
              ? <img src={user.photoURL} className="w-7 h-7 rounded-full" alt="" />
              : <Avatar name={user.displayName || user.email} size="sm" />
            }
          </div>
        )}
      </div>
    </header>
  )
}
