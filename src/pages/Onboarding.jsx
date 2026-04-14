import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useMembers } from '@/hooks/useMembers'
import { setUserProfile } from '@/lib/firestore'
import { Avatar } from '@/components/ui/Avatar'
import { CheckCircle2, UserCircle } from 'lucide-react'

export default function Onboarding() {
  const { user }    = useAuth()
  const { members } = useMembers()
  const [memberId, setMemberId] = useState('')
  const [saving, setSaving]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!memberId || !user) return
    setSaving(true)
    await setUserProfile(user.uid, { memberId, email: user.email })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        className="bg-white border border-gray-200 rounded-[2.5rem] p-12 w-full max-w-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <UserCircle size={28} />
           </div>
           <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Xác nhận danh tính</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bước cuối cùng để bắt đầu</p>
           </div>
        </div>

        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Chào mừng bạn đến với hệ thống QTCSVC. Vui lòng chọn hồ sơ nhân sự của bạn trong danh sách dưới đây để liên kết tài khoản.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-100 rounded-2xl bg-gray-50/50">
            {members.map((m) => {
              const selected = memberId === m.id
              return (
                <label key={m.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <input type="radio" className="hidden" name="member" value={m.id}
                    onChange={() => setMemberId(m.id)} checked={selected} />
                  <Avatar name={m.name} color={m.color || 0} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${selected ? 'text-white' : 'text-gray-900'}`}>{m.name}</p>
                    <p className={`text-[10px] font-medium uppercase tracking-tighter ${selected ? 'text-blue-100' : 'text-gray-400'}`}>
                      {m.role || 'Nhân sự'}
                    </p>
                  </div>
                  {selected && <CheckCircle2 size={18} className="text-white" />}
                </label>
              )
            })}
          </div>

          <button
            type="submit"
            disabled={!memberId || saving}
            className="w-full btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-blue-600/20 disabled:opacity-30"
          >
            {saving ? 'Đang xử lý...' : 'Vào hệ thống'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
