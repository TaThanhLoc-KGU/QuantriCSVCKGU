export type Role = "STAFF" | "EDITOR" | "ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE" | "BOTH";

export interface MeResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  authProvider: AuthProvider;
  role: Role;
  memberId: number | null;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Member {
  id: number;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
  sortOrder: number;
}

export type Direction = "OUTGOING" | "INCOMING";

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  symbolCode: string;
  direction: Direction;
  resetYearly: boolean;
  sortOrder: number;
  active: boolean;
}

export interface DocumentNumber {
  id: number;
  documentTypeId: number;
  year: number;
  numberInt: number;
  numberDisplay: string;
  title: string;
  person: string | null;
  issueDate: string;
  note: string | null;
  senderUnit: string | null;
  originalRef: string | null;
  receivedDate: string | null;
  createdBy: number | null;
  createdAt: string;
  senderEmail: string | null;
  senderPhone: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  taskId: number | null;
}

export type TaskScope = "DEPT" | "PERSONAL";
export type TaskStatus = "CHUA_BAT_DAU" | "DANG_LAM" | "HOAN_THANH" | "VUONG_MAC" | "TAM_DUNG" | "HUY";
export type TaskStepStatus = "CHUA_BAT_DAU" | "DANG_LAM" | "HOAN_THANH" | "VUONG_MAC";

export interface TaskStep {
  id: number;
  title: string;
  status: TaskStepStatus;
  note: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskView {
  id: number;
  scope: TaskScope;
  year: number;
  quarter: number | null;
  month: number | null;
  title: string;
  description: string | null;
  assigneeId: number | null;
  ownerUserId: number | null;
  status: TaskStatus;
  progressPercent: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  steps: TaskStep[];
}

export interface Kpi {
  totalTasks: number;
  completed: number;
  inProgress: number;
  blocked: number;
  overallProgressPercent: number;
}

export interface MemberRow {
  memberId: number;
  memberName: string;
  taskCount: number;
  avgProgressPercent: number;
}

export type PeriodType = "MONTH" | "QUARTER";

export interface Report {
  id: number;
  periodType: PeriodType;
  periodId: string;
  year: number;
  sections: Record<string, string>;
  aiProvider: string | null;
  aiGeneratedAt: string | null;
  updatedBy: number | null;
  updatedAt: string;
}

export interface SettingView {
  key: string;
  value: string | null;
  configured: boolean;
  updatedAt: string | null;
}

export interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  folder: string | null;
  uploadedBy: number | null;
  createdAt: string;
}

export interface CongVanIncomingDocument {
  id: string;
  soVanBan: string;
  soDen: string | null;
  ngayDen: string | null;
  ngayBanHanh: string | null;
  trichYeu: string;
  coQuanBanHanh: string | null;
  loaiVanBan: string | null;
  nguoiKy: string | null;
  donViXuLyChinh: string | null;
  hanXuLy: string | null;
  ngayHoanThanh: string | null;
  trangThai: string;
  trangThaiText: string;
  coFile: boolean;
}

export interface CongVanIncomingListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: CongVanIncomingDocument[];
}

export interface CongVanInternalDocument {
  id: number;
  stt: number | null;
  soHieu: string | null;
  tieuDe: string;
  noiDung: string | null;
  ngayBanHanh: string;
  nguoiKy: string | null;
  trangThai: number;
  trangThaiText: string;
  ngayTao: string;
  soFile: number | null;
}

export interface CongVanInternalFile {
  id: number;
  tenFile: string;
  ngayUpload: string;
}

export interface CongVanInternalDocumentDetail extends Omit<CongVanInternalDocument, "soFile"> {
  files: CongVanInternalFile[];
}

export interface CongVanOutgoingDocument {
  id: string;
  soVanBan: string;
  ngayVanBan: string | null;
  ngayBanHanh: string | null;
  trichYeu: string;
  loaiVanBan: string | null;
  soVanBanThuoc: string | null;
  nguoiKy: string | null;
  donViSoanThao: string | null;
  daKySo: boolean;
  coFile: boolean;
  ngayCongKhai: string | null;
}

export interface CongVanOutgoingListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: CongVanOutgoingDocument[];
}

export interface CongVanCategoryItem {
  ma: number;
  ten: string;
}

export interface CongVanOutgoingCategories {
  soVanBan: CongVanCategoryItem[];
  loaiVanBan: CongVanCategoryItem[];
}

export type AccountRecoveryStatus = "MOI" | "DA_XU_LY" | "TU_CHOI";

export interface AccountRecoveryRequest {
  id: number;
  caseCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  isNewStudent: boolean;
  studentId: string;
  cccdNumber: string | null;
  classCode: string | null;
  unitName: string | null;
  screenshotUrl: string | null;
  screenshotName: string | null;
  idCardUrl: string | null;
  idCardName: string | null;
  status: AccountRecoveryStatus;
  adminNote: string | null;
  resultMessage: string | null;
  createdAt: string;
  processedAt: string | null;
  processedBy: number | null;
}

// ---- Trang con (site pages) ----

export type PageBlockType = "RICH_TEXT" | "POST_LIST" | "DATA_TABLE" | "STAFF_LIST";
export type DataTableColumnType = "TEXT" | "DATE" | "LINK" | "FILE";

export interface DataTableColumn {
  key: string;
  label: string;
  type: DataTableColumnType;
}

export interface DataTableGroup {
  key: string;
  name: string;
}

export interface PageTableRowView {
  id: number;
  groupKey: string | null;
  sortOrder: number;
  data: Record<string, unknown>;
}

export interface PageBlockView {
  id: number;
  categoryId: number;
  type: PageBlockType;
  title: string | null;
  sortOrder: number;
  config: Record<string, unknown>;
  rows: PageTableRowView[];
}

// ---- Danh ba email sinh vien ----

export interface StudentEmailRecordView {
  id: number;
  studentId: string;
  fullName: string;
  className: string | null;
  major: string | null;
  majorCode: string | null;
  cohort: string | null;
  email: string;
  importedAt: string;
}

export interface StudentEmailListResponse {
  total: number;
  items: StudentEmailRecordView[];
}

export interface StudentEmailImportPreview {
  validCount: number;
  errors: string[];
}

export interface StudentEmailImportResult {
  importedCount: number;
}

export interface FeedbackMessage {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  subject: string;
  content: string;
  status: "MOI" | "DA_XU_LY";
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface ToolView {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  kind: "FORM" | "LOOKUP";
  config: Record<string, unknown>;
  active: boolean;
  sortOrder: number;
  pending: number;
  rowCount: number;
}

export interface ToolSubmission {
  id: number;
  code: string;
  data: Record<string, unknown>;
  status: "MOI" | "DA_XU_LY" | "TU_CHOI";
  resultMessage: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface ToolRow {
  id: number;
  keyValue: string;
  data: Record<string, unknown>;
}

export const REPORT_SECTION_LABELS: Record<string, string> = {
  "muc1": "I. Đặc điểm tình hình",
  "muc2": "II. Công tác chỉ đạo, điều hành",
  "muc3.xay_dung": "1. Công tác xây dựng, bảo dưỡng, sửa chữa",
  "muc3.mang_muasam": "2. Công tác quản trị mạng, mua sắm và quản lý tài sản",
  "muc3.canh_quan": "3. Công tác cảnh quan và môi trường",
  "muc3.phoi_hop": "4. Công tác phối hợp",
  "muc4": "IV. Công tác đoàn thể và phục vụ cộng đồng",
  "muc5": "V. Phương hướng kỳ tới",
};

export const REPORT_SECTION_KEYS = Object.keys(REPORT_SECTION_LABELS);
