import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { AccountRecoveryRequest, AccountRecoveryStatus } from "../types";
import { formatDateTime } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, LoadingState, PageHeader } from "../components/ui";
import { ImageLightbox } from "../components/ImageLightbox";
import { SendResultEmailModal } from "../components/SendResultEmailModal";

const STATUS_LABELS: Record<AccountRecoveryStatus, string> = {
  MOI: "Mới",
  DA_XU_LY: "Đã xử lý",
  TU_CHOI: "Từ chối",
};

const STATUS_TONES: Record<AccountRecoveryStatus, "warn" | "accent" | "urgent"> = {
  MOI: "warn",
  DA_XU_LY: "accent",
  TU_CHOI: "urgent",
};

export function AccountRecoveryPage() {
  const [rows, setRows] = useState<AccountRecoveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AccountRecoveryStatus | "ALL">("MOI");
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [composing, setComposing] = useState<AccountRecoveryRequest | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    adminApi.accountRecovery
      .list()
      .then(setRows)
      .catch(() => setError("Không thể tải danh sách yêu cầu khôi phục tài khoản."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const visible = rows.filter((r) => filter === "ALL" || r.status === filter);

  async function setStatus(row: AccountRecoveryRequest, status: AccountRecoveryStatus) {
    setBusyId(row.id);
    try {
      const updated = await adminApi.accountRecovery.updateStatus(row.id, status);
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cập nhật trạng thái thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Khôi phục tài khoản"
        description="Yêu cầu hỗ trợ khôi phục tài khoản hệ thống do sinh viên gửi qua trang công khai."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip label={`Mới (${rows.filter((r) => r.status === "MOI").length})`} active={filter === "MOI"} onClick={() => setFilter("MOI")} />
        <FilterChip label="Đã xử lý" active={filter === "DA_XU_LY"} onClick={() => setFilter("DA_XU_LY")} />
        <FilterChip label="Từ chối" active={filter === "TU_CHOI"} onClick={() => setFilter("TU_CHOI")} />
        <FilterChip label={`Tất cả (${rows.length})`} active={filter === "ALL"} onClick={() => setFilter("ALL")} />
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && visible.length === 0 && (
        <EmptyState title="Không có yêu cầu nào" description="Chưa có yêu cầu khôi phục tài khoản nào phù hợp bộ lọc." />
      )}

      {!loading && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900">{r.fullName}</p>
                    <Badge tone={r.isNewStudent ? "brand" : "neutral"}>{r.isNewStudent ? "Tân sinh viên" : "Sinh viên"}</Badge>
                    <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    Mã hồ sơ: <span className="font-mono">{r.caseCode}</span> · MSSV: <span className="font-mono">{r.studentId}</span>
                    {r.cccdNumber && (
                      <>
                        {" "}
                        · CCCD: <span className="font-mono">{r.cccdNumber}</span>
                      </>
                    )}
                    {!r.isNewStudent && (
                      <>
                        {" "}
                        · Lớp {r.classCode} · {r.unitName}
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {r.email && <>Email: {r.email}</>}
                    {r.phone && <> · SĐT: {r.phone}</>}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">Gửi lúc {formatDateTime(r.createdAt)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {r.screenshotUrl && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreview({ src: adminApi.accountRecovery.screenshotUrl(r.id), title: r.screenshotName ?? "Ảnh chụp màn hình" })}
                    >
                      📷 Xem ảnh chụp màn hình
                    </Button>
                  )}
                  {r.idCardUrl && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreview({ src: adminApi.accountRecovery.idCardUrl(r.id), title: r.idCardName ?? "CCCD/Thẻ sinh viên" })}
                    >
                      🪪 Xem CCCD/thẻ SV
                    </Button>
                  )}
                  {r.email && (
                    <Button size="sm" variant="secondary" onClick={() => setComposing(r)}>
                      ✉️ Gửi kết quả qua email
                    </Button>
                  )}
                  {r.status !== "DA_XU_LY" && (
                    <Button size="sm" disabled={busyId === r.id} onClick={() => setStatus(r, "DA_XU_LY")}>
                      Đánh dấu đã xử lý
                    </Button>
                  )}
                  {r.status === "MOI" && (
                    <Button size="sm" variant="danger" disabled={busyId === r.id} onClick={() => setStatus(r, "TU_CHOI")}>
                      Từ chối
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {preview && <ImageLightbox src={preview.src} title={preview.title} onClose={() => setPreview(null)} />}

      {composing && composing.email && (
        <SendResultEmailModal
          requestId={composing.id}
          toEmail={composing.email}
          defaultSubject={`Kết quả yêu cầu khôi phục tài khoản — ${composing.fullName}`}
          defaultBody={defaultEmailBody(composing)}
          onClose={() => setComposing(null)}
          onSent={load}
        />
      )}
    </div>
  );
}

function defaultEmailBody(r: AccountRecoveryRequest): string {
  return `Chào ${r.fullName},

Phòng Quản trị Cơ sở vật chất đã xem xét yêu cầu khôi phục tài khoản của bạn (MSSV: ${r.studentId}).

[Nhập nội dung kết quả xử lý ở đây]

Trân trọng,
Phòng Quản trị Cơ sở vật chất — Trường Đại học Kiên Giang`;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? "border-brand-600 bg-brand-600 text-white" : "border-neutral-300 bg-white text-neutral-600 hover:border-brand-300"
      }`}
    >
      {label}
    </button>
  );
}
