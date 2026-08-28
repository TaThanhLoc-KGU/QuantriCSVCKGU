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
  mscv: string;
  soCV: string | null;
  trichYeu: string;
  ngayDen: string;
  nguoiKy: string | null;
  tenCoQuan: string | null;
  ngayBanHanh: string | null;
  hanXuLy: string | null;
  ngayHoanThanh: string | null;
  coFile: boolean;
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
