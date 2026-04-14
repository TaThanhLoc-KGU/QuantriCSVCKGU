import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { Modal } from '@/components/ui/Modal'
import { db } from '@/lib/firebase'
import {
  collection, addDoc, updateDoc, query, where, onSnapshot,
  serverTimestamp, deleteDoc, doc, writeBatch, getDocs
} from 'firebase/firestore'
import * as XLSX from 'xlsx'
import {
  Plus, FileText, Trash2, Upload, User, Calendar,
  ChevronDown, ChevronLeft, ChevronRight, Pencil,
  Download, X, Check
} from 'lucide-react'

/* ── Tabs ────────────────────────────────────────────────── */
const TABS = [
  { id: 'ttr', label: 'Tờ Trình',    code: 'TTr-QTCSVC',  colorClass: 'bg-blue-600',    textClass: 'text-blue-600',    badgeBg: 'bg-blue-50',    badgeText: 'text-blue-700'    },
  { id: 'dn',  label: 'Đề Nghị',     code: 'ĐN-QTCSVC',   colorClass: 'bg-emerald-600', textClass: 'text-emerald-600', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
  { id: 'cv',  label: 'Công văn đi', code: 'ĐHKG-QTCSVC', colorClass: 'bg-violet-600',  textClass: 'text-violet-600',  badgeBg: 'bg-violet-50',  badgeText: 'text-violet-700'  },
]

/* ── Seed data 2026 ──────────────────────────────────────── */
const TTR_SEED_2026 = [
  { n:  1, date: '19/01/2026', title: 'TT Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thi công lắp đặt hệ thống ống nước phục vụ tưới cây trong khuôn viên trường', person: 'Hiền' },
  { n:  2, date: '19/01/2026', title: 'TT Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thi công lắp đặt hệ thống ống nước phục vụ tưới cây trong khuôn viên trường', person: 'Hiền' },
  { n:  3, date: '27/01/2026', title: 'TT Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thi công sân nền, vỉa hè trước nhà đa năng', person: 'Hiền' },
  { n:  4, date: '27/01/2026', title: 'TT Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thi công sân nền, vỉa hè trước nhà đa năng', person: 'Hiền' },
  { n:  5, date: '28/01/2026', title: 'TT Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', person: 'Hảo' },
  { n:  6, date: '28/01/2026', title: 'TT Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', person: 'Hảo' },
  { n:  7, date: '29/01/2026', title: 'Phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua Tivi trang bị các phòng học của Trường Đại học Kiên Giang', person: 'Luân' },
  { n:  8, date: '02/02/2026', title: 'Phê duyệt kết quả lựa chọn đơn vị Cung cấp Tivi trang bị các phòng học của Trường Đại học Kiên Giang', person: 'Luân' },
  { n:  9, date: '03/02/2026', title: 'Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', person: 'Hảo' },
  { n: 10, date: '03/02/2026', title: 'Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', person: 'Hảo' },
  { n: 11, date: '10/02/2026', title: '', person: '' },
  { n: 12, date: '11/02/2026', title: '', person: '' },
  { n: 13, date: '23/02/2026', title: '', person: '' },
  { n: 14, date: '23/02/2026', title: '', person: '' },
  { n: 15, date: '25/02/2026', title: 'Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Sửa chữa Lát gạch sân nền, hành lang nhà điều hành trung tâm bị bong tróc', person: 'Hảo' },
  { n: 16, date: '25/02/2026', title: '', person: 'Hảo' },
  { n: 17, date: '25/02/2026', title: 'Về việc bổ sung nhân sự tại Phòng Quản trị cơ sở vật chất', person: '' },
  { n: 18, date: '27/02/2026', title: 'Tờ trình phê duyệt chủ trương sửa chữa bảo dưỡng nhà A', person: 'Hiền' },
  { n: 19, date: '27/02/2026', title: 'Tờ trình phê duyệt kế hoạch lựa chọn các gói thầu chuẩn bị đầu tư sửa chữa bảo dưỡng nhà A', person: 'Hiền' },
  { n: 20, date: '02/03/2026', title: 'Phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua sắm thiết bị trực tuyến lắp đặt tại phòng họp của Trường Đại học Kiên Giang', person: 'Luân' },
  { n: 21, date: '03/03/2026', title: 'Tờ trình phê duyệt lựa chọn đơn vị lập báo cáo KTKT cải tạo nhà A', person: 'Hiền' },
  { n: 22, date: '03/03/2026', title: 'Tờ trình phê duyệt lựa chọn đơn vị thẩm tra báo cáo KTKT cải tạo nhà A', person: '' },
  { n: 23, date: '03/03/2026', title: 'Tờ trình về việc đề nghị ký hợp đồng thuê khoán dịch vụ tạp vụ', person: '' },
  { n: 24, date: '03/03/2026', title: 'Tờ trình về việc đề nghị chuyển hợp đồng thuê khoán dịch vụ tạp vụ sang hợp đồng thuê khoán dịch vụ cây xanh', person: '' },
  { n: 25, date: '09/03/2026', title: 'Phê duyệt dự toán và KHLCNT Mua trang phục an ninh quốc phòng cho sinh viên', person: 'Hảo' },
  { n: 26, date: '09/03/2026', title: 'Phê duyệt LCNT Mua trang phục an ninh quốc phòng cho sinh viên', person: 'Hảo' },
  { n: 27, date: '10/03/2026', title: 'Tờ trình phê duyệt chủ trương xây dựng nhà thực hành cơ khí', person: 'Hiền' },
  { n: 28, date: '11/03/2026', title: 'Tờ trình phê duyệt kế hoạch lựa chọn các gói thầu chuẩn bị đầu tư xây dựng nhà thực hành cơ khí', person: 'Hiền' },
  { n: 29, date: '12/03/2026', title: 'Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu mua sắm lắp đặt thiết bị Internet tại nhà ĐHTT', person: 'Lộc' },
  { n: 30, date: '12/03/2026', title: 'Tờ trình phê duyệt lựa chọn đơn vị lập báo cáo KTKT xây dựng nhà xưởng thực hành', person: '' },
  { n: 31, date: '12/03/2026', title: 'Tờ trình phê duyệt lựa chọn đơn vị thẩm tra báo cáo KTKT xây dựng nhà xưởng thực hành', person: '' },
  { n: 32, date: '18/03/2026', title: 'Tờ trình về việc phê duyệt kết quả lựa chọn nhà thầu gói thầu mua sắm, lắp đặt thiết bị internet tại nhà điều hành trung tâm', person: 'Lộc' },
  { n: 33, date: '25/03/2026', title: 'Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt và di dời phòng làm việc theo đề nghị của các phòng khoa và trung tâm', person: 'Hảo' },
  { n: 34, date: '25/03/2026', title: 'Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt và di dời phòng làm việc theo đề nghị của các phòng khoa và trung tâm', person: 'Hảo' },
  { n: 35, date: '25/03/2026', title: 'Đề nghị tiếp tục ký hợp đồng lao động', person: '' },
  { n: 36, date: '08/04/2026', title: 'Phê duyệt dự toán và kế hoạch lựa chọn nhà thầu gói sửa chữa phòng đọc sách thư viện ĐHKG', person: 'Hiền' },
  { n: 37, date: '10/04/2026', title: 'Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt thiết bị các tòa nhà Ký túc xá, nhà B, C, Trung tâm thông tin thư viện theo đề nghị của các phòng khoa', person: 'Hảo' },
  { n: 38, date: '10/04/2026', title: 'Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt thiết bị các tòa nhà Ký túc xá, nhà B, C, Trung tâm thông tin thư viện theo đề nghị của các phòng khoa', person: 'Hảo' },
  { n: 39, date: '10/04/2026', title: 'Phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua sắm dụng cụ phục vụ giảng dạy giáo dục thể chất – Quốc phòng an ninh của Trường Đại học Kiên Giang', person: 'Luân' },
  { n: 40, date: '10/04/2026', title: 'Phê duyệt dự toán và kế hoạch lựa chọn các gói thầu công trình bảo dưỡng sửa chữa nhà A', person: 'Hiền' },
]
const DN_SEED_2026 = [
  { n: 15, date: '22/02/2026', title: 'Sửa chữa Lát gạch sân nền, hành lang nhà điều hành trung tâm bị bong tróc', person: 'Hảo' },
  { n: 20, date: '09/03/2026', title: 'Sửa chữa lắp đặt di dời theo đề nghị của các phòng khoa', person: 'Hảo' },
  { n: 20, date: '12/03/2026', title: 'Thuê xe đi vận chuyển xe về đơn vị', person: 'Luân' },
  { n: 21, date: '24/03/2026', title: 'Sửa chữa Bộ lưu điện UPS', person: '' },
  { n: 22, date: '25/03/2026', title: 'Sửa chữa các tòa nhà', person: 'Hảo' },
  { n: 23, date: '03/04/2026', title: 'Sửa chữa cải tạo phòng nội thất thư viện', person: 'Hiền' },
  { n: 24, date: '06/04/2026', title: 'Mua sắm công cụ dụng cụ vệ sinh trường quý 2 2026', person: 'Hiền' },
  { n: 25, date: '10/04/2026', title: 'Mua camera an ninh phục vụ công tác giám sát phục vụ các kỳ thi', person: 'Lộc' },
  { n: 26, date: '10/04/2026', title: 'Thuê mướn đơn vị diệt trừ mối', person: 'Hảo' },
]
const SEED_DATA = { ttr: TTR_SEED_2026, dn: DN_SEED_2026 }

/* ── Utils ───────────────────────────────────────────────── */
function fmtNum(n, code) { return `${String(n).padStart(2, '0')}/${code}` }
function isoToVN(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function vnToIso(vn) {
  if (!vn || !vn.includes('/')) return ''
  const parts = vn.split('/')
  if (parts.length !== 3) return ''
  return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
}

const currentYear  = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
const PAGE_SIZES   = [5, 10, 20, 50, 100, 200, 500]

/* ── Edit Modal ──────────────────────────────────────────── */
function EditModal({ open, onClose, record, activeTab, onSave }) {
  const [title,  setTitle]  = useState('')
  const [date,   setDate]   = useState('')
  const [person, setPerson] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (record) {
      setTitle(record.title  || '')
      setDate(vnToIso(record.date) || new Date().toISOString().split('T')[0])
      setPerson(record.person || '')
    }
  }, [record])

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    await onSave(record.id, {
      title:  title.trim(),
      date:   isoToVN(date),
      person: person.trim(),
    })
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Chỉnh sửa — ${record?.number || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Số văn bản</label>
          <div className={`inline-block text-sm font-black px-3 py-1.5 rounded-lg text-white ${activeTab?.colorClass}`}>
            {record?.number}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Tên văn bản</label>
          <textarea value={title} onChange={e => setTitle(e.target.value)} rows={4}
            placeholder="Trích yếu nội dung..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Ngày</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Người thực hiện</label>
            <input value={person} onChange={e => setPerson(e.target.value)}
              placeholder="Họ tên..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
            Hủy
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Check size={15} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function DocumentsView() {
  const [tab,      setTab]      = useState('ttr')
  const [year,     setYear]     = useState(currentYear)
  const [docs,     setDocs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [seeding,  setSeeding]  = useState(false)
  const seededRef  = useRef({})

  /* Pagination */
  const [pageSize, setPageSize] = useState(20)
  const [page,     setPage]     = useState(1)

  /* Add form */
  const [title,  setTitle]  = useState('')
  const [date,   setDate]   = useState(new Date().toISOString().split('T')[0])
  const [person, setPerson] = useState('')
  const [saving, setSaving] = useState(false)

  /* Edit modal */
  const [editDoc,    setEditDoc]    = useState(null)
  const [showEdit,   setShowEdit]   = useState(false)
  const [exporting,  setExporting]  = useState(false)

  const activeTab = TABS.find(t => t.id === tab)

  /* Auto-seed */
  const runSeed = async (type, code, seed) => {
    const key = `${type}-2026`
    if (seededRef.current[key]) return
    seededRef.current[key] = true
    setSeeding(true)
    const batch = writeBatch(db)
    for (const row of seed) {
      batch.set(doc(collection(db, 'documents')), {
        type, year: 2026, numberInt: row.n,
        number: fmtNum(row.n, code),
        title: row.title, date: row.date, person: row.person,
        createdAt: serverTimestamp(),
      })
    }
    await batch.commit()
    setSeeding(false)
  }

  /* Listener */
  useEffect(() => {
    setLoading(true)
    setDocs([])
    setPage(1)
    const q = query(
      collection(db, 'documents'),
      where('type', '==', tab),
      where('year', '==', year)
    )
    return onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.numberInt - a.numberInt || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      if (snap.empty && year === 2026 && SEED_DATA[tab])
        runSeed(tab, activeTab.code, SEED_DATA[tab])
      setDocs(list)
      setLoading(false)
    })
  }, [tab, year])

  const nextInt = docs.length > 0 ? Math.max(...docs.map(d => d.numberInt)) + 1 : 1

  /* Add */
  const handleAdd = async e => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'documents'), {
      type: tab, year, numberInt: nextInt,
      number: fmtNum(nextInt, activeTab.code),
      title: title.trim(), date: isoToVN(date), person: person.trim(),
      createdAt: serverTimestamp(),
    })
    setTitle(''); setPerson('')
    setSaving(false)
  }

  /* Edit */
  const handleSave = async (id, data) => {
    await updateDoc(doc(db, 'documents', id), { ...data, updatedAt: serverTimestamp() })
  }

  /* Delete */
  const handleDelete = async id => {
    if (confirm('Xóa bản ghi này?')) await deleteDoc(doc(db, 'documents', id))
  }

  /* Export Excel — 3 sheets */
  const handleExport = async () => {
    setExporting(true)
    const wb = XLSX.utils.book_new()
    for (const t of TABS) {
      const snap = await getDocs(query(
        collection(db, 'documents'),
        where('type', '==', t.id),
        where('year', '==', year)
      ))
      const rows = snap.docs
        .map(d => d.data())
        .sort((a, b) => a.numberInt - b.numberInt)
        .map((d, i) => ({
          'STT':              i + 1,
          'Số văn bản':       d.number  || '',
          'Tên văn bản':      d.title   || '',
          'Ngày':             d.date    || '',
          'Người thực hiện':  d.person  || '',
        }))
      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 70 }, { wch: 14 }, { wch: 18 }]
      XLSX.utils.book_append_sheet(wb, ws, t.label)
    }
    XLSX.writeFile(wb, `VanBan_QTCSVC_${year}.xlsx`)
    setExporting(false)
  }

  /* Seed manual */
  const handleSeed = async () => {
    const seed = SEED_DATA[tab]
    if (!seed) return
    if (!confirm(`Nhập ${seed.length} bản ghi lịch sử năm 2026? Chỉ thực hiện 1 lần.`)) return
    setSeeding(true)
    const batch = writeBatch(db)
    for (const row of seed) {
      batch.set(doc(collection(db, 'documents')), {
        type: tab, year: 2026, numberInt: row.n,
        number: fmtNum(row.n, activeTab.code),
        title: row.title, date: row.date, person: row.person,
        createdAt: serverTimestamp(),
      })
    }
    await batch.commit()
    setSeeding(false)
  }

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(docs.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pageStart  = (safePage - 1) * pageSize
  const pageDocs   = docs.slice(pageStart, pageStart + pageSize)
  const goPage     = p => setPage(Math.max(1, Math.min(p, totalPages)))
  const pageNums   = (() => {
    const range = []
    for (let i = Math.max(1, safePage - 2); i <= Math.min(totalPages, safePage + 2); i++) range.push(i)
    return range
  })()

  return (
    <motion.div className="flex-1 flex flex-col h-full bg-gray-50/50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <Topbar title="Quản lý Văn bản" />

      {/* ── Tabs + Year + Export ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-6 pt-3 pb-0 bg-white border-b border-gray-100">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 md:px-5 py-2.5 text-[11px] md:text-xs font-black uppercase tracking-widest rounded-t-xl transition-all border-b-2 ${
                tab === t.id ? `bg-white border-blue-600 ${t.textClass}` : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-0.5">
          {/* Year */}
          <div className="relative">
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-black text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Export */}
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-60">
            <Download size={13} />
            <span className="hidden sm:inline">{exporting ? 'Xuất...' : 'Xuất Excel'}</span>
          </button>
        </div>
      </div>

      {/* ── Quick-add form ── */}
      <form onSubmit={handleAdd}
        className="flex flex-wrap md:flex-nowrap gap-2 px-4 md:px-6 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <span className={`shrink-0 self-center text-xs font-black px-3 py-2 rounded-lg text-white ${activeTab.colorClass}`}>
          {fmtNum(nextInt, activeTab.code)}
        </span>
        <input value={title} onChange={e => setTitle(e.target.value)} required
          placeholder="Tên văn bản / trích yếu nội dung..."
          className="flex-1 min-w-0 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full md:w-36 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        <input value={person} onChange={e => setPerson(e.target.value)}
          placeholder="Người thực hiện"
          className="w-full md:w-36 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        <button type="submit" disabled={!title.trim() || saving}
          className="w-full md:w-auto btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
          <Plus size={15} strokeWidth={3} />
          {saving ? '...' : 'Xin số'}
        </button>
      </form>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3">

        {seeding && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold px-2">
            <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
            Đang nhập dữ liệu lịch sử...
          </div>
        )}

        {/* ── Desktop Table ── */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-10">#</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Số văn bản</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên văn bản</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-28">Ngày</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-28">Người thực hiện</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageDocs.map((d, i) => (
                <tr key={d.id} className="hover:bg-blue-50/20 transition-colors group align-top">
                  <td className="px-4 py-3 text-xs font-black text-gray-300">{pageStart + i + 1}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[11px] font-black px-2.5 py-1 rounded-lg text-white ${activeTab.colorClass}`}>
                      {d.number}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-sm leading-relaxed ${d.title ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                      {d.title || '(Chưa có nội dung)'}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={11} className="text-gray-300 shrink-0" />{d.date}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {d.person
                      ? <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <User size={11} className="text-gray-300 shrink-0" />{d.person}
                        </div>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditDoc(d); setShowEdit(true) }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && docs.length === 0 && <EmptyState year={year} hasSeed={!!SEED_DATA[tab]} seedCount={SEED_DATA[tab]?.length} onSeed={handleSeed} seeding={seeding} />}

          {docs.length > 0 && <PaginationBar
            pageStart={pageStart} pageSize={pageSize} total={docs.length}
            safePage={safePage} totalPages={totalPages} pageNums={pageNums}
            onPageSize={s => { setPageSize(s); setPage(1) }}
            onPage={goPage}
          />}
        </div>

        {/* ── Mobile Cards ── */}
        <div className="md:hidden space-y-2">
          {!loading && docs.length === 0 && <EmptyState year={year} hasSeed={!!SEED_DATA[tab]} seedCount={SEED_DATA[tab]?.length} onSeed={handleSeed} seeding={seeding} />}
          {pageDocs.map((d, i) => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`shrink-0 text-[11px] font-black px-2.5 py-1 rounded-lg text-white ${activeTab.colorClass}`}>
                  {d.number}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => { setEditDoc(d); setShowEdit(true) }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(d.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className={`text-sm leading-relaxed mb-3 ${d.title ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                {d.title || '(Chưa có nội dung)'}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {d.date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={11} className="text-gray-300" />{d.date}
                  </div>
                )}
                {d.person && (
                  <div className="flex items-center gap-1 font-semibold text-gray-700">
                    <User size={11} className="text-gray-300" />{d.person}
                  </div>
                )}
              </div>
            </div>
          ))}
          {docs.length > 0 && (
            <PaginationBar
              pageStart={pageStart} pageSize={pageSize} total={docs.length}
              safePage={safePage} totalPages={totalPages} pageNums={pageNums}
              onPageSize={s => { setPageSize(s); setPage(1) }}
              onPage={goPage}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        record={editDoc}
        activeTab={activeTab}
        onSave={handleSave}
      />
    </motion.div>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function EmptyState({ year, hasSeed, seedCount, onSeed, seeding }) {
  return (
    <div className="py-14 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
        <FileText size={24} className="text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500">Chưa có văn bản nào — Năm {year}</p>
        <p className="text-xs text-gray-400 mt-1">Dùng form phía trên để xin số mới.</p>
      </div>
      {hasSeed && year === 2026 && (
        <button onClick={onSeed} disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-all">
          <Upload size={13} />
          {seeding ? 'Đang nhập...' : `Nhập ${seedCount} bản ghi lịch sử 2026`}
        </button>
      )}
    </div>
  )
}

function PaginationBar({ pageStart, pageSize, total, safePage, totalPages, pageNums, onPageSize, onPage }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">
          <span className="font-bold text-gray-600">{pageStart + 1}–{Math.min(pageStart + pageSize, total)}</span> / {total}
        </span>
        <div className="relative">
          <select value={pageSize} onChange={e => onPageSize(Number(e.target.value))}
            className="appearance-none pl-2 pr-6 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / trang</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(safePage - 1)} disabled={safePage === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={14} />
        </button>
        {pageNums[0] > 1 && <>
          <button onClick={() => onPage(1)} className="w-7 h-7 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all">1</button>
          {pageNums[0] > 2 && <span className="text-xs text-gray-300 px-0.5">…</span>}
        </>}
        {pageNums.map(n => (
          <button key={n} onClick={() => onPage(n)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${n === safePage ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
            {n}
          </button>
        ))}
        {pageNums[pageNums.length - 1] < totalPages && <>
          {pageNums[pageNums.length - 1] < totalPages - 1 && <span className="text-xs text-gray-300 px-0.5">…</span>}
          <button onClick={() => onPage(totalPages)} className="w-7 h-7 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all">{totalPages}</button>
        </>}
        <button onClick={() => onPage(safePage + 1)} disabled={safePage === totalPages}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
