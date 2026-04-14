import { motion, AnimatePresence } from 'framer-motion'

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{ scale: 0.9,    opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase italic">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Content - Force Light Theme for Children */}
              <div className="px-8 py-8 text-gray-800 bg-white">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
