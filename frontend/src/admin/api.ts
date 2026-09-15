import type {
  AccountRecoveryRequest,
  AccountRecoveryStatus,
  AdminUser,
  CongVanIncomingListResponse,
  CongVanInternalDocument,
  CongVanInternalDocumentDetail,
  CongVanInternalFile,
  CongVanOutgoingCategories,
  CongVanOutgoingListResponse,
  DocumentNumber,
  DocumentType,
  Kpi,
  MeResponse,
  Member,
  MemberRow,
  MediaFile,
  PageBlockType,
  PageBlockView,
  PageTableRowView,
  Report,
  SettingView,
  StudentEmailImportPreview,
  StudentEmailImportResult,
  StudentEmailListResponse,
  TaskView,
} from "./types";
import type { Banner, Category, CategoryKind, Form, Notification, Post } from "../lib/types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfCookie(): Promise<void> {
  if (readCookie("XSRF-TOKEN")) return;
  await fetch("/api/auth/csrf", { credentials: "include" });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (method !== "GET" && method !== "HEAD") {
    await ensureCsrfCookie();
    const token = readCookie("XSRF-TOKEN");
    if (token) headers.set("X-XSRF-TOKEN", token);
  }

  const res = await fetch(path, { ...init, headers, credentials: "include" });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let detail = `Yêu cầu thất bại (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: string; error?: string };
      if (body.detail) detail = body.detail;
      else if (body.error) detail = body.error;
    } catch {
      // than nien khong phai JSON, giu thong bao mac dinh
    }
    throw new ApiError(res.status, detail);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function getJson<T>(path: string): Promise<T> {
  return request<T>(path);
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function putJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function patchJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

function withQuery(path: string, params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export interface CategoryRequest {
  name: string;
  kind: CategoryKind;
  parentId: number | null;
  sortOrder?: number;
  description?: string | null;
}

export interface PostRequest {
  title: string;
  summary?: string | null;
  content?: string | null;
  thumbnailUrl?: string | null;
  categoryId: number;
  featured?: boolean;
  pinned?: boolean;
  publish?: boolean;
}

export interface BannerRequest {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface FormRequest {
  title: string;
  description?: string | null;
  categoryId: number;
  fileId: number;
  version?: string | null;
  active?: boolean;
}

export interface NotificationRequest {
  title: string;
  content?: string | null;
  type: Notification["type"];
  level: Notification["level"];
  pinned?: boolean;
  effectiveDate: string;
  expiryDate?: string | null;
}

export interface DocumentTypeRequest {
  code: string;
  name: string;
  symbolCode: string;
  direction: DocumentType["direction"];
  resetYearly?: boolean;
  sortOrder?: number;
  active?: boolean;
}

export interface DocumentNumberRequest {
  documentTypeId: number;
  year: number;
  numberInt: number;
  title: string;
  person?: string | null;
  issueDate: string;
  note?: string | null;
  senderUnit?: string | null;
  originalRef?: string | null;
  receivedDate?: string | null;
  confirmDuplicate?: boolean;
}

export interface TaskRequest {
  scope: TaskView["scope"];
  year: number;
  quarter?: number | null;
  month?: number | null;
  title: string;
  description?: string | null;
  assigneeId?: number | null;
  sortOrder?: number;
}

export interface TaskStepRequest {
  title: string;
  note?: string | null;
  sortOrder?: number;
}

export interface MemberRequest {
  name: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  active?: boolean;
  sortOrder?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: AdminUser["role"];
  memberId: number | null;
  authProvider: AdminUser["authProvider"];
}

export interface PageBlockRequest {
  type: PageBlockType;
  title?: string | null;
  config: Record<string, unknown>;
}

export interface PageTableRowRequest {
  groupKey?: string | null;
  data: Record<string, unknown>;
}

export interface CongVanNoiBoSaveRequest {
  soHieu?: string | null;
  tieuDe: string;
  noiDung?: string | null;
  ngayBanHanh: string;
  nguoiKy?: string | null;
  trangThai?: number;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  role: AdminUser["role"];
  memberId: number | null;
  active: boolean;
}

export const adminApi = {
  csrf(): Promise<void> {
    return request("/api/auth/csrf");
  },
  login(username: string, password: string): Promise<MeResponse> {
    return postJson("/api/auth/login", { username, password });
  },
  me(): Promise<MeResponse> {
    return getJson("/api/auth/me");
  },
  logout(): Promise<void> {
    return request("/api/auth/logout", { method: "POST" });
  },

  users: {
    list: (): Promise<AdminUser[]> => getJson("/api/admin/users"),
    create: (body: CreateUserRequest): Promise<AdminUser> => postJson("/api/admin/users", body),
    update: (id: number, body: UpdateUserRequest): Promise<AdminUser> => putJson(`/api/admin/users/${id}`, body),
    resetPassword: (id: number, newPassword: string): Promise<void> =>
      patchJson(`/api/admin/users/${id}/password`, { newPassword }),
    remove: (id: number): Promise<void> => del(`/api/admin/users/${id}`),
  },

  members: {
    list: (): Promise<Member[]> => getJson("/api/admin/members"),
    create: (body: MemberRequest): Promise<Member> => postJson("/api/admin/members", body),
    update: (id: number, body: MemberRequest): Promise<Member> => putJson(`/api/admin/members/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/members/${id}`),
  },

  categories: {
    list: (kind: CategoryKind): Promise<Category[]> => getJson(withQuery("/api/admin/categories", { kind })),
    create: (body: CategoryRequest): Promise<Category> => postJson("/api/admin/categories", body),
    update: (id: number, body: CategoryRequest): Promise<Category> => putJson(`/api/admin/categories/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/categories/${id}`),
  },

  media: {
    list: (folder?: string): Promise<MediaFile[]> => getJson(withQuery("/api/admin/media", { folder })),
    upload: async (file: File, folder = "misc"): Promise<MediaFile> => {
      await ensureCsrfCookie();
      const token = readCookie("XSRF-TOKEN");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const headers = new Headers();
      if (token) headers.set("X-XSRF-TOKEN", token);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd, headers, credentials: "include" });
      if (!res.ok) throw new ApiError(res.status, `Tải tệp thất bại (${res.status})`);
      return res.json();
    },
    remove: (id: number): Promise<void> => del(`/api/admin/media/${id}`),
  },

  posts: {
    list: (params: { category?: number; status?: string; author?: number; q?: string } = {}): Promise<Post[]> =>
      getJson(withQuery("/api/admin/posts", params)),
    create: (body: PostRequest): Promise<Post> => postJson("/api/admin/posts", body),
    update: (id: number, body: PostRequest): Promise<Post> => putJson(`/api/admin/posts/${id}`, body),
    setPublish: (id: number, publish: boolean): Promise<Post> => patchJson(`/api/admin/posts/${id}/status`, { publish }),
    remove: (id: number): Promise<void> => del(`/api/admin/posts/${id}`),
  },

  banners: {
    list: (): Promise<Banner[]> => getJson("/api/admin/banners"),
    create: (body: BannerRequest): Promise<Banner> => postJson("/api/admin/banners", body),
    update: (id: number, body: BannerRequest): Promise<Banner> => putJson(`/api/admin/banners/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/banners/${id}`),
  },

  forms: {
    list: (): Promise<Form[]> => getJson("/api/admin/forms"),
    create: (body: FormRequest): Promise<Form> => postJson("/api/admin/forms", body),
    update: (id: number, body: FormRequest): Promise<Form> => putJson(`/api/admin/forms/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/forms/${id}`),
  },

  notifications: {
    list: (): Promise<Notification[]> => getJson("/api/admin/notifications"),
    create: (body: NotificationRequest): Promise<Notification> => postJson("/api/admin/notifications", body),
    update: (id: number, body: NotificationRequest): Promise<Notification> =>
      putJson(`/api/admin/notifications/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/notifications/${id}`),
  },

  documentTypes: {
    list: (): Promise<DocumentType[]> => getJson("/api/admin/document-types"),
    create: (body: DocumentTypeRequest): Promise<DocumentType> => postJson("/api/admin/document-types", body),
    update: (id: number, body: DocumentTypeRequest): Promise<DocumentType> =>
      putJson(`/api/admin/document-types/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/document-types/${id}`),
  },

  documentNumbers: {
    list: (type: number, year: number): Promise<DocumentNumber[]> =>
      getJson(withQuery("/api/admin/document-numbers", { type, year })),
    next: (type: number, year: number): Promise<{ nextNumber: number }> =>
      getJson(withQuery("/api/admin/document-numbers/next", { type, year })),
    create: (body: DocumentNumberRequest): Promise<DocumentNumber> => postJson("/api/admin/document-numbers", body),
    update: (id: number, body: DocumentNumberRequest): Promise<DocumentNumber> =>
      putJson(`/api/admin/document-numbers/${id}`, body),
    remove: (id: number): Promise<void> => del(`/api/admin/document-numbers/${id}`),
    exportUrl: (type: number, year: number): string =>
      withQuery("/api/admin/document-numbers/export", { type, year }),
    attachmentUrl: (id: number): string => `/api/admin/document-numbers/${id}/attachment`,
    previewText: (id: number): Promise<{ text: string }> => getJson(`/api/admin/document-numbers/${id}/attachment/preview-text`),
  },

  tasks: {
    list: (params: { scope?: string; year?: number; quarter?: number; month?: number; owner?: number } = {}): Promise<TaskView[]> =>
      getJson(withQuery("/api/admin/tasks", params)),
    get: (id: number): Promise<TaskView> => getJson(`/api/admin/tasks/${id}`),
    create: (body: TaskRequest): Promise<TaskView> => postJson("/api/admin/tasks", body),
    update: (id: number, body: TaskRequest): Promise<TaskView> => putJson(`/api/admin/tasks/${id}`, body),
    setStatus: (id: number, status: TaskView["status"]): Promise<TaskView> =>
      patchJson(`/api/admin/tasks/${id}/status`, { status }),
    remove: (id: number): Promise<void> => del(`/api/admin/tasks/${id}`),
    addStep: (id: number, body: TaskStepRequest): Promise<TaskView> => postJson(`/api/admin/tasks/${id}/steps`, body),
    updateStep: (id: number, stepId: number, body: TaskStepRequest): Promise<TaskView> =>
      putJson(`/api/admin/tasks/${id}/steps/${stepId}`, body),
    setStepStatus: (id: number, stepId: number, status: TaskView["steps"][number]["status"], note?: string | null): Promise<TaskView> =>
      patchJson(`/api/admin/tasks/${id}/steps/${stepId}/status`, { status, note }),
    removeStep: (id: number, stepId: number): Promise<TaskView> => request(`/api/admin/tasks/${id}/steps/${stepId}`, { method: "DELETE" }),
  },

  dashboard: {
    kpi: (params: { year?: number; quarter?: number; month?: number } = {}): Promise<Kpi> =>
      getJson(withQuery("/api/admin/dashboard/kpi", params)),
    members: (year: number): Promise<MemberRow[]> => getJson(withQuery("/api/admin/dashboard/members", { year })),
  },

  reports: {
    get: (periodId: string): Promise<Report> => getJson(`/api/admin/reports/${encodeURIComponent(periodId)}`),
    save: (periodId: string, sections: Record<string, string>): Promise<Report> =>
      putJson(`/api/admin/reports/${encodeURIComponent(periodId)}`, { sections }),
    generateDraft: (periodId: string): Promise<Report> =>
      postJson(`/api/admin/reports/${encodeURIComponent(periodId)}/generate`, {}),
    exportDocxUrl: (periodId: string): string => `/api/admin/reports/${encodeURIComponent(periodId)}/export/docx`,
  },

  settings: {
    list: (): Promise<SettingView[]> => getJson("/api/admin/settings"),
    update: (values: Record<string, string>): Promise<SettingView[]> => putJson("/api/admin/settings", values),
  },

  congVan: {
    incoming: (params: { year?: number; q?: string; page?: number; pageSize?: number } = {}): Promise<CongVanIncomingListResponse> =>
      getJson(withQuery("/api/admin/congvan/incoming", params)),
    createTask: (id: string): Promise<TaskView> =>
      postJson(`/api/admin/congvan/incoming/${encodeURIComponent(id)}/create-task`, {}),
    incomingFileUrl: (id: string, fileId: number): string =>
      `/api/admin/congvan/incoming/${encodeURIComponent(id)}/files/${fileId}`,

    outgoing: (params: { nam?: number; maSCV?: number; maLVB?: number; q?: string; page?: number; pageSize?: number } = {}): Promise<CongVanOutgoingListResponse> =>
      getJson(withQuery("/api/admin/congvan/outgoing", params)),
    outgoingCategories: (): Promise<CongVanOutgoingCategories> => getJson("/api/admin/congvan/outgoing/danh-muc"),
    outgoingCreateTask: (id: string): Promise<TaskView> =>
      postJson(`/api/admin/congvan/outgoing/${encodeURIComponent(id)}/create-task`, {}),
    outgoingFileUrl: (id: string): string => `/api/admin/congvan/outgoing/${encodeURIComponent(id)}/file`,

    noibo: {
      list: (params: { nam?: number; tuKhoa?: string } = {}): Promise<CongVanInternalDocument[]> =>
        getJson(withQuery("/api/admin/congvan/noibo", params)),
      get: (id: number): Promise<CongVanInternalDocumentDetail> => getJson(`/api/admin/congvan/noibo/${id}`),
      create: (body: CongVanNoiBoSaveRequest): Promise<CongVanInternalDocument> => postJson("/api/admin/congvan/noibo", body),
      update: (id: number, body: CongVanNoiBoSaveRequest): Promise<CongVanInternalDocument> => putJson(`/api/admin/congvan/noibo/${id}`, body),
      remove: (id: number): Promise<void> => del(`/api/admin/congvan/noibo/${id}`),
      uploadFile: async (id: number, file: File): Promise<CongVanInternalFile> => {
        await ensureCsrfCookie();
        const token = readCookie("XSRF-TOKEN");
        const fd = new FormData();
        fd.append("file", file);
        const headers = new Headers();
        if (token) headers.set("X-XSRF-TOKEN", token);
        const res = await fetch(`/api/admin/congvan/noibo/${id}/files`, { method: "POST", body: fd, headers, credentials: "include" });
        if (!res.ok) throw new ApiError(res.status, `Tải tệp thất bại (${res.status})`);
        return res.json();
      },
      fileUrl: (id: number, fileId: number): string => `/api/admin/congvan/noibo/${id}/files/${fileId}`,
      removeFile: (id: number, fileId: number): Promise<void> => del(`/api/admin/congvan/noibo/${id}/files/${fileId}`),
    },
  },

  pages: {
    blocks: {
      list: (categoryId: number): Promise<PageBlockView[]> => getJson(`/api/admin/pages/${categoryId}/blocks`),
      create: (categoryId: number, body: PageBlockRequest): Promise<PageBlockView> =>
        postJson(`/api/admin/pages/${categoryId}/blocks`, body),
      update: (blockId: number, body: PageBlockRequest): Promise<PageBlockView> =>
        putJson(`/api/admin/pages/blocks/${blockId}`, body),
      remove: (blockId: number): Promise<void> => del(`/api/admin/pages/blocks/${blockId}`),
      move: (blockId: number, direction: "UP" | "DOWN"): Promise<PageBlockView> =>
        patchJson(`/api/admin/pages/blocks/${blockId}/move`, { direction }),
    },
    rows: {
      create: (blockId: number, body: PageTableRowRequest): Promise<PageTableRowView> =>
        postJson(`/api/admin/pages/blocks/${blockId}/rows`, body),
      update: (rowId: number, body: PageTableRowRequest): Promise<PageTableRowView> =>
        putJson(`/api/admin/pages/rows/${rowId}`, body),
      remove: (rowId: number): Promise<void> => del(`/api/admin/pages/rows/${rowId}`),
      move: (rowId: number, direction: "UP" | "DOWN"): Promise<PageTableRowView> =>
        patchJson(`/api/admin/pages/rows/${rowId}/move`, { direction }),
    },
  },

  studentEmails: {
    list: (q = ""): Promise<StudentEmailListResponse> => getJson(withQuery("/api/admin/student-emails", { q })),
    previewImport: async (file: File): Promise<StudentEmailImportPreview> => {
      await ensureCsrfCookie();
      const token = readCookie("XSRF-TOKEN");
      const fd = new FormData();
      fd.append("file", file);
      const headers = new Headers();
      if (token) headers.set("X-XSRF-TOKEN", token);
      const res = await fetch("/api/admin/student-emails/import?preview=true", { method: "POST", body: fd, headers, credentials: "include" });
      if (!res.ok) throw new ApiError(res.status, `Đọc file thất bại (${res.status})`);
      return res.json();
    },
    commitImport: async (file: File): Promise<StudentEmailImportResult> => {
      await ensureCsrfCookie();
      const token = readCookie("XSRF-TOKEN");
      const fd = new FormData();
      fd.append("file", file);
      const headers = new Headers();
      if (token) headers.set("X-XSRF-TOKEN", token);
      const res = await fetch("/api/admin/student-emails/import?preview=false", { method: "POST", body: fd, headers, credentials: "include" });
      if (!res.ok) throw new ApiError(res.status, `Nhập dữ liệu thất bại (${res.status})`);
      return res.json();
    },
  },

  accountRecovery: {
    list: (): Promise<AccountRecoveryRequest[]> => getJson("/api/admin/account-recovery"),
    updateStatus: (id: number, status: AccountRecoveryStatus, adminNote?: string | null): Promise<AccountRecoveryRequest> =>
      patchJson(`/api/admin/account-recovery/${id}/status`, { status, adminNote: adminNote ?? null }),
    sendResult: (id: number, subject: string, body: string): Promise<AccountRecoveryRequest> =>
      postJson(`/api/admin/account-recovery/${id}/send-result`, { subject, body }),
    screenshotUrl: (id: number): string => `/api/admin/account-recovery/${id}/screenshot`,
    idCardUrl: (id: number): string => `/api/admin/account-recovery/${id}/id-card`,
  },
};
