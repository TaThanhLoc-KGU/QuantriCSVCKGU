import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { generateReport } from '@/lib/gemini'
import { fetchStepsForTasks, saveReport, getSavedReport } from '@/lib/firestore'
import { pageVariants, pageTransition } from '@/lib/animations'

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const currentMonth   = new Date().getMonth() + 1
const currentQuarter = Math.ceil(currentMonth / 3)

function MarkdownReport({ text }) {
  const lines = text.split('\n')
  
  // Cleanly handle bold text: replace **text** with a themed span
  const formatText = (t) => {
    const parts = t.split(/(\*\*.*?\*\*)/g)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <span key={i} className="text-blue-500 font-semibold">{p.slice(2, -2)}</span>
      }
      return p
    })
  }

  return (
    <div className="report-body">
      {lines.map((line, i) => {
        if (line.startsWith('# '))  return <h1 key={i} className="report-h1">{formatText(line.slice(2))}</h1>
        if (line.startsWith('## ')) return <h2 key={i} className="report-h2">{formatText(line.slice(3))}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="report-h3">{formatText(line.slice(4))}</h3>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="report-li">{formatText(line.slice(2))}</li>
        if (line.trim() === '') return <div key={i} className="h-3" />
        return <p key={i} className="report-p">{formatText(line)}</p>
      })}
    </div>
  )
}

/* Shows a live summary of what will actually be sent to AI */
function DataPreview({ tasks, members }) {
  if (!tasks.length) return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
      <p className="text-sm font-semibold text-amber-400 mb-1">Không có dữ liệu trong kỳ này</p>
      <p className="text-xs text-amber-400/80">
        Kỳ được chọn chưa có nhiệm vụ nào. Hãy chọn kỳ khác hoặc thêm nhiệm vụ trước.
      </p>
    </div>
  )

  const done  = tasks.filter(t => t.status === 'done').length
  const doing = tasks.filter(t => t.status === 'doing').length
  const wait  = tasks.filter(t => t.status === 'wait').length
  const none  = tasks.filter(t => !t.status || t.status === 'none').length

  const byMember = members
    .map(m => ({ name: m.name, count: tasks.filter(t => t.memberId === m.id).length }))
    .filter(m => m.count > 0)

  return (
    <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Dữ liệu thực từ Firestore ({tasks.length} nhiệm vụ)
      </p>
      <div className="flex flex-wrap gap-2">
        {done  > 0 && <span className="badge-done  status-badge">{done} hoàn thành</span>}
        {doing > 0 && <span className="badge-doing status-badge">{doing} đang làm</span>}
        {wait  > 0 && <span className="badge-wait  status-badge">{wait} chờ duyệt</span>}
        {none  > 0 && <span className="badge-none  status-badge">{none} chưa bắt đầu</span>}
      </div>
      {byMember.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {byMember.map(m => (
            <span key={m.name}
              className="text-xs bg-gray-700/50 text-gray-400 rounded-full px-2.5 py-0.5 border border-gray-600">
              {m.name.split(' ').pop()}: {m.count} nv
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReportView({ tasks = [], members = [] }) {
  const [mode, setMode]       = useState('month')
  const [month, setMonth]     = useState(currentMonth)
  const [quarter, setQuarter] = useState(currentQuarter)
  const [report, setReport]   = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError]     = useState('')
  const [savedAt, setSavedAt] = useState(null)

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY
  const periodId  = mode === 'month' ? `2026-M${month}` : `2026-Q${quarter}`

  // Check for saved report when period changes
  useEffect(() => {
    const loadSaved = async () => {
      setFetching(true)
      setReport('')
      setSavedAt(null)
      try {
        const saved = await getSavedReport(periodId)
        if (saved) {
          setReport(saved.content)
          setSavedAt(saved.updatedAt?.toDate())
        }
      } finally {
        setFetching(false)
      }
    }
    loadSaved()
  }, [periodId])

  // Filter from already-loaded global tasks — no extra Firestore read needed
  const periodTasks = tasks.filter(t =>
    t.year === 2026 &&
    (mode === 'month' ? t.month === month : t.quarter === quarter)
  )

  const handleGenerate = async (isRegen = false) => {
    if (!periodTasks.length) {
      setError('Không có nhiệm vụ trong kỳ được chọn. Hãy thêm dữ liệu trước.')
      return
    }
    setLoading(true)
    setError('')
    if (isRegen) setReport('')
    
    try {
      // Only fetch steps — tasks already in memory (from global useTasks listener)
      const steps = await fetchStepsForTasks(periodTasks.map(t => t.id))

      const period = mode === 'month'
        ? `${MONTH_NAMES[month]}/2026`
        : `Quý ${quarter}/2026`

      const text = await generateReport({ tasks: periodTasks, steps, members, period })
      
      // Save to Firestore automatically
      await saveReport({
        periodId,
        content: text,
        metadata: {
          tasksCount: periodTasks.length,
          generatedAt: new Date().toISOString()
        }
      })
      
      setReport(text)
      setSavedAt(new Date())
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo báo cáo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" key="report"
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}>

      <Topbar title="Báo cáo AI" />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-5 pb-10">

          {/* Config panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-50">Cấu hình báo cáo</h3>

            <div>
              <label className="form-label">Kỳ báo cáo</label>
              <div className="flex gap-2">
                {[['month', 'Theo tháng'], ['quarter', 'Theo quý']].map(([v, l]) => (
                  <button key={v} type="button"
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      mode === v
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-gray-700 text-gray-500 hover:border-gray-600'
                    }`}
                    onClick={() => { setMode(v); setError('') }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'month' ? (
              <div>
                <label className="form-label">Tháng</label>
                <select className="form-input" value={month}
                  onChange={e => { setMonth(+e.target.value); setError('') }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{MONTH_NAMES[m]}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="form-label">Quý</label>
                <select className="form-input" value={quarter}
                  onChange={e => { setQuarter(+e.target.value); setError('') }}>
                  {[1, 2, 3, 4].map(q => (
                    <option key={q} value={q}>Quý {q}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Live data preview */}
            <DataPreview tasks={periodTasks} members={members} />

            {!hasApiKey && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-500">
                <p className="font-semibold mb-1">Chưa cấu hình Gemini API Key</p>
                <p>Thêm vào <code className="bg-amber-500/20 px-1 rounded">.env.local</code>:</p>
                <code className="block mt-1 text-amber-500">VITE_GEMINI_API_KEY=AIza...</code>
              </div>
            )}

            {fetching ? (
              <div className="h-10 flex items-center justify-center gap-2 text-xs text-gray-500">
                <motion.div className="w-3 h-3 border-2 border-gray-600 border-t-blue-500 rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} />
                Đang kiểm tra báo cáo đã lưu...
              </div>
            ) : report ? (
              <div className="flex gap-2">
                <div className="flex-1 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-2 flex flex-col justify-center">
                  <p className="text-xs text-blue-500 font-medium">Đã có báo cáo lưu trữ</p>
                  {savedAt && <p className="text-[10px] text-gray-500">Cập nhật: {savedAt.toLocaleString()}</p>}
                </div>
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-4 rounded-xl border border-gray-700 transition-colors"
                >
                  {loading ? '...' : '🔄 Làm mới'}
                </button>
              </div>
            ) : (
              <button onClick={() => handleGenerate(false)}
                disabled={loading || !hasApiKey || !periodTasks.length}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                    Đang tạo báo cáo...
                  </>
                ) : '✨ Tạo báo cáo bằng AI'}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm text-rose-500">
              {error}
            </div>
          )}

          {report && (
            <motion.div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-950/50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kết quả AI</span>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(report)}
                    className="text-xs text-gray-500 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-800 transition-colors">
                    📋 Sao chép
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-gray-950/20">
                <MarkdownReport text={report} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

