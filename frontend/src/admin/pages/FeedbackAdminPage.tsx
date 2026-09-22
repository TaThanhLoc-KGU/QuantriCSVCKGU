import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { FeedbackMessage } from "../types";
import { Badge, Button, Card, EmptyState, ErrorBanner, LoadingState, PageHeader } from "../components/ui";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatDateTime } from "../../lib/format";

export function FeedbackAdminPage() {
  const [items, setItems] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<FeedbackMessage | null>(null);

  function load() {
    setLoading(true);
    adminApi.feedback
      .list()
      .then(setItems)
      .catch(() => setError("Không thể tải danh sách góp ý."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggle(m: FeedbackMessage) {
    try {
      const updated = await adminApi.feedback.setStatus(m.id, m.status === "MOI" ? "DA_XU_LY" : "MOI");
      setItems((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.feedback.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá thất bại.");
      setToDelete(null);
    }
  }

  const pending = items.filter((i) => i.status === "MOI").length;

  return (
    <div>
      <PageHeader title="Hòm thư góp ý" description={`Ý kiến gửi từ trang công khai — ${pending} chưa xử lý.`} />
      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có góp ý nào" />}
      <div className="space-y-3">
        {items.map((m) => (
          <Card key={m.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-neutral-900">{m.subject}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {m.fullName}
                  {m.email && ` · ${m.email}`}
                  {m.phone && ` · ${m.phone}`} · {formatDateTime(m.createdAt)}
                </p>
              </div>
              <Badge tone={m.status === "MOI" ? "warn" : "accent"}>{m.status === "MOI" ? "Mới" : "Đã xử lý"}</Badge>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{m.content}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => void toggle(m)}>
                {m.status === "MOI" ? "Đánh dấu đã xử lý" : "Mở lại"}
              </Button>
              {m.email && (
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}>
                  <Button size="sm" variant="secondary">
                    Trả lời qua email
                  </Button>
                </a>
              )}
              <Button size="sm" variant="danger" onClick={() => setToDelete(m)}>
                Xoá
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={!!toDelete} title="Xoá góp ý này?" confirmLabel="Xoá" danger onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
