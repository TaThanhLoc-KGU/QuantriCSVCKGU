// seed.mjs — Đẩy toàn bộ dữ liệu lịch sử lên Firestore
// Chạy: node seed.mjs

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { initializeApp } = require('./node_modules/firebase/app/dist/index.cjs.js')
const { getFirestore, collection, doc, writeBatch, serverTimestamp } = require('./node_modules/firebase/firestore/dist/index.cjs.js')

const firebaseConfig = {
  apiKey:            'AIzaSyAyxIvv5V920yxd0dXu3a6FuKXxtZR2XoE',
  authDomain:        'qtcsvc-2026.firebaseapp.com',
  projectId:         'qtcsvc-2026',
  storageBucket:     'qtcsvc-2026.firebasestorage.app',
  messagingSenderId: '801054074255',
  appId:             '1:801054074255:web:cbadf8614a71cb74b497fa',
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

function fmtNum(n, code) {
  return `${String(n).padStart(2, '0')}/${code}`
}

const TTR = [
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

const DN = [
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

async function seedCollection(rows, type, code) {
  // Chia thành batch tối đa 500 docs mỗi lần
  const CHUNK = 499
  let total = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = writeBatch(db)
    const chunk = rows.slice(i, i + CHUNK)
    for (const row of chunk) {
      const ref = doc(collection(db, 'documents'))
      batch.set(ref, {
        type,
        year:      2026,
        numberInt: row.n,
        number:    fmtNum(row.n, code),
        title:     row.title,
        date:      row.date,
        person:    row.person,
        createdAt: serverTimestamp(),
      })
    }
    await batch.commit()
    total += chunk.length
    console.log(`  ✓ ${type.toUpperCase()} — đã ghi ${total}/${rows.length}`)
  }
}

async function main() {
  console.log('🚀 Bắt đầu seed dữ liệu vào Firestore...\n')

  console.log(`📄 Tờ Trình (${TTR.length} bản ghi)...`)
  await seedCollection(TTR, 'ttr', 'TTr-QTCSVC')

  console.log(`\n📄 Đề Nghị (${DN.length} bản ghi)...`)
  await seedCollection(DN, 'dn', 'ĐN-QTCSVC')

  console.log('\n✅ Hoàn thành! Tất cả dữ liệu đã được đẩy lên Firestore.')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Lỗi:', err.message)
  process.exit(1)
})
