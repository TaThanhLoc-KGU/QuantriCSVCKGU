import { motion, AnimatePresence } from 'framer-motion'

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1,    y: 0  }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-50">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-50 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
