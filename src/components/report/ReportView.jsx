import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { generateReport } from '@/lib/gemini'
import { fetchStepsForTasks, saveReport, getSavedReport } from '@/lib/firestore'
import { pageVariants, pageTransition } from '@/lib/animations'
import { FileText, Wand2, Printer, Copy, RotateCcw } from 'lucide-react'

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const currentMonth   = new Date().getMonth() + 1
const currentQuarter = Math.ceil(currentMonth / 3)

function MarkdownReport({ text }) {
  const lines = text.split('\n')
  const formatText = (t) => {
    const parts = t.split(/(\*\*.*?\*\*)/g)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <span key={i} className="text-blue-600 font-bold">{p.slice(2, -2)}</span>
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
        if (line.trim() === '') return <div key={i} className="h-4" />
        return <p key={i} className="report-p">{formatText(line)}</p>
      })}
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

  useEffect(() => {
    const loadSaved = async () => {
      setFetching(true); setReport(''); setSavedAt(null)
      try {
        const saved = await getSavedReport(periodId)
        if (saved) { setReport(saved.content); setSavedAt(saved.updatedAt?.toDate()) }
      } finally { setFetching(false) }
    }
    loadSaved()
  }, [periodId])

  const periodTasks = tasks.filter(t =>
    t.year === 2026 && (mode === 'month' ? t.month === month : t.quarter === quarter)
  )

  const handleGenerate = async (isRegen = false) => {
    if (!periodTasks.length) { setError('Không có dữ liệu trong kỳ này.'); return }
    setLoading(true); setError(''); if (isRegen) setReport('')
    try {
      const steps = await fetchStepsForTasks(periodTasks.map(t => t.id))
      const period = mode === 'month' ? `${MONTH_NAMES[month]}/2026` : `Quý ${quarter}/2026`
      const text = await generateReport({ tasks: periodTasks, steps, members, period })
      await saveReport({ periodId, content: text, metadata: { tasksCount: periodTasks.length, generatedAt: new Date().toISOString() } })
      setReport(text); setSavedAt(new Date())
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <motion.div className="flex-1 flex flex-col h-full bg-gray-50/50"
      initial="initial" animate="in" exit="out" variants={pageVariants}>

      <Topbar title="Báo cáo AI" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">Thiết lập báo cáo</h3>
              </div>

              <div>
                <label className="form-label">Phạm vi thời gian</label>
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  {[['month', 'Tháng'], ['quarter', 'Quý']].map(([v, l]) => (
                    <button key={v} onClick={() => setMode(v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        mode === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'month' ? (
                <div>
                  <label className="form-label">Chọn tháng</label>
                  <select className="form-input" value={month} onChange={e => setMonth(+e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{MONTH_NAMES[m]}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="form-label">Chọn quý</label>
                  <select className="form-input" value={quarter} onChange={e => setQuarter(+e.target.value)}>
                    {[1, 2, 3, 4].map(q => <option key={q} value={q}>Quý {q}</option>)}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Dữ liệu nguồn</p>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-xs font-bold text-gray-900 mb-1">{periodTasks.length} nhiệm vụ</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Đã hoàn thành {periodTasks.filter(t => t.status === 'done').length} đầu việc trong kỳ được chọn.
                  </p>
                </div>
              </div>

              {report ? (
                <button onClick={() => handleGenerate(true)} disabled={loading}
                  className="w-full btn-ghost flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50">
                  <RotateCcw size={14} />
                  Làm mới báo cáo
                </button>
              ) : (
                <button onClick={() => handleGenerate(false)} disabled={loading || !hasApiKey || !periodTasks.length}
                  className="w-full btn-primary flex items-center justify-center gap-2 shadow-blue-600/20">
                  <Wand2 size={16} />
                  {loading ? 'Đang phân tích...' : 'Tạo báo cáo AI'}
                </button>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            {report ? (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border-none">
                <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-gray-50/50 print:hidden">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bản thảo báo cáo</p>
                   <div className="flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(report)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20">
                        <Printer size={16} />
                        In ngay
                      </button>
                   </div>
                </div>
                
                <div className="p-10 md:p-16 print:p-0">
                  {/* Print Header */}
                  <div className="hidden print:flex justify-between items-start border-b-2 border-black pb-8 mb-10 text-black">
                    <div className="text-center">
                      <p className="font-bold text-xs uppercase">Đại học Kiên Giang</p>
                      <p className="font-bold text-[10px] uppercase underline underline-offset-4">Phòng Quản trị CSVC</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xs uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
                      <p className="font-bold text-[10px] underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                  </div>

                  <MarkdownReport text={report} />

                  {/* Print Footer */}
                  <div className="hidden print:grid grid-cols-2 mt-20 text-black">
                    <div></div>
                    <div className="text-center space-y-20">
                       <div className="space-y-1">
                          <p className="italic text-[10px]">Kiên Giang, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                          <p className="font-bold uppercase text-xs">Người lập báo cáo</p>
                       </div>
                       <p className="font-bold">__________________________</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-10">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} />
                </div>
                <p className="text-sm font-bold text-gray-900">Chưa có nội dung báo cáo</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Hãy chọn kỳ báo cáo và nhấn nút "Tạo báo cáo AI" để hệ thống tự động tổng hợp công việc.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
