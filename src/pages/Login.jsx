import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-blue-100">
      <motion.div
        className="bg-white border border-gray-200 rounded-[2.5rem] p-12 w-full max-w-md text-center shadow-xl shadow-blue-500/5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Brand Icon */}
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-600/30 mx-auto mb-8">
          Q
        </div>

        <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight uppercase text-center leading-relaxed">PHÒNG QUẢN TRỊ CƠ SỞ VẬT CHẤT<br/><span className="text-lg">TRƯỜNG ĐẠI HỌC KIÊN GIANG</span></h1>
        <p className="text-sm font-bold text-gray-400 mb-10 tracking-widest uppercase">
          Quản trị Cơ sở vật chất 2026
        </p>

        <motion.button
          onClick={login}
          className="w-full flex items-center justify-center gap-4 bg-gray-900 text-white font-bold text-sm py-4 px-6 rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-900/10"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" opacity="0.8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Đăng nhập với Google
        </motion.button>

        <div className="mt-12 pt-8 border-t border-gray-100">
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
             Hệ thống nội bộ trường đại học
           </p>
        </div>
      </motion.div>
    </div>
  )
}
