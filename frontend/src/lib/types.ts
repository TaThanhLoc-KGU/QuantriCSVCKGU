export type CategoryKind = "POST" | "FORM" | "PAGE";

export interface Category {
  id: number;
  name: string;
  slug: string;
  kind: CategoryKind;
  parentId: number | null;
  sortOrder: number;
  description: string | null;
}

export type PostStatus = "DRAFT" | "PUBLISHED";

export interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  categoryId: number;
  authorId: number;
  status: PostStatus;
  featured: boolean;
  pinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface Form {
  id: number;
  title: string;
  description: string | null;
  categoryId: number;
  fileId: number;
  version: string | null;
  downloadCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = "GENERAL" | "PROCUREMENT";
export type NotificationLevel = "NORMAL" | "URGENT";

export interface Notification {
  id: number;
  title: string;
  content: string | null;
  type: NotificationType;
  level: NotificationLevel;
  pinned: boolean;
  effectiveDate: string;
  expiryDate: string | null;
  createdBy: number;
  createdAt: string;
}

export interface PublicDisclosureResponse {
  posts: Post[];
  notifications: Notification[];
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
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

export interface StaffMember {
  id: number;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
}

export interface ResolvedPageBlock {
  id: number;
  type: PageBlockType;
  title: string | null;
  config: Record<string, unknown>;
  rows: PageTableRowView[];
  posts: Post[];
  staff: StaffMember[];
}

export interface PageDetail {
  category: Category;
  breadcrumb: Category[];
  children: Category[];
  blocks: ResolvedPageBlock[];
}

// ---- Danh ba email sinh vien ----

export interface StudentEmailLookupResult {
  studentId: string;
  fullName: string;
  className: string | null;
  major: string | null;
  email: string;
}
