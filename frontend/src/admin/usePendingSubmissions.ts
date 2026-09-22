import { useEffect, useState } from "react";
import { adminApi } from "./api";
import type { DocumentNumber } from "./types";

const POLL_MS = 45_000;

export interface PendingSubmission {
  id: number;
  numberDisplay: string;
  title: string;
  senderEmail: string | null;
  taskId: number;
}

export function usePendingSubmissions() {
  const [items, setItems] = useState<PendingSubmission[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const year = new Date().getFullYear();
        const types = await adminApi.documentTypes.list();
        const denType = types.find((t) => t.code === "DN_DEN");
        if (!denType) return;

        const [numbers, tasks] = await Promise.all([
          adminApi.documentNumbers.list(denType.id, year),
          adminApi.tasks.list({ year }),
        ]);
        if (cancelled) return;

        const doneTaskIds = new Set(tasks.filter((t) => t.status === "HOAN_THANH").map((t) => t.id));
        const pending = (numbers as DocumentNumber[])
          .filter((n) => n.taskId && !doneTaskIds.has(n.taskId))
          .map((n) => ({
            id: n.id,
            numberDisplay: n.numberDisplay,
            title: n.title,
            senderEmail: n.senderEmail,
            taskId: n.taskId as number,
          }));
        setItems(pending);
      } catch {
        // im lang - khong lam gian doan trai nghiem admin vi loi poll
      }
    }

    void poll();
    const interval = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return items;
}
