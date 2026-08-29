import type {
  Banner,
  Category,
  CategoryKind,
  Form,
  Notification,
  PageDetail,
  PageResponse,
  Post,
  PublicDisclosureResponse,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    let detail = `Yêu cầu thất bại (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // than nothien khong phai JSON, giu thong bao mac dinh
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function postForm<T>(path: string, formData: FormData): Promise<T> {
  if (!readCookie("XSRF-TOKEN")) {
    await fetch("/api/auth/csrf", { credentials: "include" });
  }
  const token = readCookie("XSRF-TOKEN");
  const headers = new Headers();
  if (token) headers.set("X-XSRF-TOKEN", token);

  const res = await fetch(path, { method: "POST", body: formData, headers, credentials: "include" });
  if (!res.ok) {
    let detail = `Yêu cầu thất bại (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // than nien khong phai JSON, giu thong bao mac dinh
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!readCookie("XSRF-TOKEN")) {
    await fetch("/api/auth/csrf", { credentials: "include" });
  }
  const token = readCookie("XSRF-TOKEN");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("X-XSRF-TOKEN", token);

  const res = await fetch(path, { method: "POST", body: JSON.stringify(body), headers, credentials: "include" });
  if (!res.ok) {
    let detail = `Yêu cầu thất bại (${res.status})`;
    try {
      const responseBody = (await res.json()) as { detail?: string };
      if (responseBody.detail) detail = responseBody.detail;
    } catch {
      // than nien khong phai JSON, giu thong bao mac dinh
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export const api = {
  categories(kind: CategoryKind = "POST"): Promise<Category[]> {
    return getJson(withQuery("/api/public/categories", { kind }));
  },

  banners(): Promise<Banner[]> {
    return getJson("/api/public/banners");
  },

  featuredPosts(limit = 5): Promise<Post[]> {
    return getJson(withQuery("/api/public/posts/featured", { limit }));
  },

  posts(params: { category?: number; page?: number; size?: number }): Promise<PageResponse<Post>> {
    return getJson(withQuery("/api/public/posts", params));
  },

  postBySlug(slug: string): Promise<Post> {
    return getJson(`/api/public/posts/${encodeURIComponent(slug)}`);
  },

  relatedPosts(slug: string, limit = 4): Promise<Post[]> {
    return getJson(withQuery(`/api/public/posts/${encodeURIComponent(slug)}/related`, { limit }));
  },

  forms(params: { category?: number; q?: string }): Promise<Form[]> {
    return getJson(withQuery("/api/public/forms", params));
  },

  formDownloadUrl(id: number): string {
    return `/api/public/forms/${id}/download`;
  },

  notifications(): Promise<Notification[]> {
    return getJson("/api/public/notifications");
  },

  disclosures(): Promise<PublicDisclosureResponse> {
    return getJson("/api/public/public-disclosures");
  },

  search(q: string, limit = 20): Promise<Post[]> {
    return getJson(withQuery("/api/public/search", { q, limit }));
  },

  mediaUrl(id: number): string {
    return `/api/public/media/${id}`;
  },

  resolvePage(path: string): Promise<PageDetail> {
    return getJson(withQuery("/api/public/pages/resolve", { path }));
  },

  submitDocument(input: {
    title: string;
    senderName: string;
    senderOrg?: string;
    senderEmail: string;
    senderPhone?: string;
    file?: File | null;
    website?: string; // honeypot - de trong
  }): Promise<{ numberDisplay: string; message: string }> {
    const fd = new FormData();
    fd.set("title", input.title);
    fd.set("senderName", input.senderName);
    if (input.senderOrg) fd.set("senderOrg", input.senderOrg);
    fd.set("senderEmail", input.senderEmail);
    if (input.senderPhone) fd.set("senderPhone", input.senderPhone);
    fd.set("website", input.website ?? "");
    if (input.file) fd.set("file", input.file);
    return postForm("/api/public/document-submissions", fd);
  },

  submitAccountRecovery(input: {
    fullName: string;
    email: string;
    phone: string;
    isNewStudent: boolean;
    studentId: string;
    cccdNumber: string;
    classCode?: string;
    unitName?: string;
    screenshot?: File | null;
    idCard?: File | null;
    website?: string; // honeypot - de trong
  }): Promise<{ caseCode: string; message: string }> {
    const fd = new FormData();
    fd.set("fullName", input.fullName);
    fd.set("email", input.email);
    fd.set("phone", input.phone);
    fd.set("isNewStudent", String(input.isNewStudent));
    fd.set("studentId", input.studentId);
    fd.set("cccdNumber", input.cccdNumber);
    if (input.classCode) fd.set("classCode", input.classCode);
    if (input.unitName) fd.set("unitName", input.unitName);
    fd.set("website", input.website ?? "");
    if (input.screenshot) fd.set("screenshot", input.screenshot);
    if (input.idCard) fd.set("idCard", input.idCard);
    return postForm("/api/public/account-recovery", fd);
  },

  lookupAccountRecovery(
    query: string,
  ): Promise<{ status: "MOI" | "DA_XU_LY" | "TU_CHOI"; fullName: string; resultMessage: string | null; createdAt: string; processedAt: string | null }> {
    return postJson("/api/public/account-recovery/lookup", { query });
  },
};
