import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL = 'gemini-3.1-flash-lite-preview' // 'gemini-2.0-pro' có thể trả về kết quả chi tiết hơn nhưng chậm hơn

function getClient() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('Thiếu VITE_GEMINI_API_KEY trong .env.local')
  return new GoogleGenerativeAI(key)
}

const STATUS_LABEL = {
  done:  'Hoàn thành',
  doing: 'Đang thực hiện',
  wait:  'Chờ duyệt',
  none:  'Chưa bắt đầu',
}

function formatTask(task, steps = []) {
  const status = STATUS_LABEL[task.status] || 'Chưa bắt đầu'
  const done   = steps.filter(s => s.status === 'done').length
  const pct    = steps.length ? Math.round((done / steps.length) * 100) : 0
  let out = `  - ${task.title} [${status}${steps.length ? `, ${pct}%` : ''}]`
  if (task.note) out += ` — ${task.note}`
  steps.forEach(s => {
    out += `\n      • ${s.name}: ${STATUS_LABEL[s.status] || 'Chưa bắt đầu'}`
  })
  return out
}

export async function generateReport({ tasks, steps, members, period }) {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({ model: MODEL })

  // Group steps by taskId
  const stepsByTask = {}
  steps.forEach(s => {
    if (!stepsByTask[s.taskId]) stepsByTask[s.taskId] = []
    stepsByTask[s.taskId].push(s)
  })

  // Build data section
  const deptTasks   = tasks.filter(t => t.scope === 'dept')
  const memberTasks = tasks.filter(t => t.scope !== 'dept')

  let dataText = ''

  if (deptTasks.length) {
    dataText += 'NHIỆM VỤ CHUNG CỦA PHÒNG:\n'
    deptTasks.forEach(t => {
      dataText += formatTask(t, stepsByTask[t.id] || []) + '\n'
    })
    dataText += '\n'
  }

  dataText += 'NHIỆM VỤ THEO THÀNH VIÊN:\n'
  members.forEach(m => {
    const mTasks = memberTasks.filter(t => t.memberId === m.id)
    if (!mTasks.length) return
    dataText += `\n${m.name} (${m.role || 'Nhân viên'}):\n`
    mTasks.forEach(t => {
      dataText += formatTask(t, stepsByTask[t.id] || []) + '\n'
    })
  })

  const taskCount = tasks.length
  const doneCount = tasks.filter(t => t.status === 'done').length

  const prompt = `Bạn là trợ lý tổng hợp báo cáo nội bộ của Phòng Quản trị Cơ sở Vật chất (QTCSVC).

⚠ QUY TẮC BẮT BUỘC:
- CHỈ sử dụng dữ liệu được cung cấp bên dưới, không được thêm hoặc bịa đặt bất kỳ thông tin nào.
- Nếu một mục không có dữ liệu thực, ghi rõ "Không có" hoặc bỏ qua mục đó.
- Chỉ nhắc tên nhiệm vụ, tên thành viên có trong dữ liệu, không tự nghĩ thêm.

DỮ LIỆU THỰC TẾ ${period} (${taskCount} nhiệm vụ, ${doneCount} hoàn thành):
===
${dataText}
===

Hãy tổng hợp thành BÁO CÁO bằng tiếng Việt theo cấu trúc sau (chỉ dựa trên dữ liệu trên):

# BÁO CÁO CÔNG VIỆC ${period.toUpperCase()}

## I. TỔNG QUAN
(Tổng số nhiệm vụ, tỷ lệ hoàn thành, nhận xét chung)

## II. KẾT QUẢ ĐẠT ĐƯỢC
(Liệt kê chính xác tên nhiệm vụ/bước đã hoàn thành — chỉ từ dữ liệu)

## III. CÔNG VIỆC ĐANG TIẾN HÀNH
(Liệt kê chính xác tên nhiệm vụ đang thực hiện — chỉ từ dữ liệu)

## IV. CÔNG VIỆC CÒN TỒN ĐỌNG
(Nhiệm vụ chưa bắt đầu hoặc chờ duyệt — chỉ từ dữ liệu)

## V. TỔNG HỢP THEO THÀNH VIÊN
(Mỗi thành viên có trong dữ liệu: đã làm gì, đang làm gì)

## VI. ĐỀ XUẤT / GHI CHÚ
(Nhận xét thực tế dựa trên dữ liệu trên, không đưa ra khuyến nghị chung chung)

Viết ngắn gọn, chuyên nghiệp, phù hợp báo cáo nội bộ cơ quan nhà nước.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
