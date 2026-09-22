import { createPortal } from "react-dom";
import { Button } from "./ui";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button aria-label="Đóng" onClick={onCancel} className="absolute inset-0 bg-neutral-900/40" />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <p className="text-base font-semibold text-neutral-900">{title}</p>
        {description && <p className="mt-2 text-sm text-neutral-500">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
