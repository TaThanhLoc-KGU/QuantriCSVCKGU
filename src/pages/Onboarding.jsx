import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/hooks/useAuth'

const ROLES = ['Trưởng phòng', 'Phó phòng', 'Chuyên viên']

export default function Onboarding() {
  const { saveProfile } = useUserProfile()
  const { user, logout } = useAuth()
  const [name, setName] = useState(user?.displayName || '')
  const [role, setRole] = useState('Chuyên viên')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await saveProfile({ name: name.trim(), role })
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👋</div>
          <h1 className="text-xl font-bold text-gray-50">Chào mừng!</h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Đây là lần đầu bạn đăng nhập.<br />Hãy điền thông tin để bắt đầu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Họ và tên *</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              autoFocus
            />
          </div>
          <div>
            <label className="form-label">Chức vụ</label>
            <select
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {saving ? 'Đang lưu...' : 'Bắt đầu làm việc →'}
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors text-center py-1"
        >
          Đăng xuất
        </button>
      </motion.div>
    </div>
  )
}
