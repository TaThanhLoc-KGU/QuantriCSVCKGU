import { useEffect, useState } from "react";
import { api } from "./api";
import type { PublicTool } from "./types";

let cache: PublicTool[] | null = null;
let pending: Promise<PublicTool[]> | null = null;

function load(): Promise<PublicTool[]> {
  if (cache) return Promise.resolve(cache);
  pending ??= api
    .tools()
    .then((list) => (cache = list))
    .catch(() => (cache = []));
  return pending;
}

/** Danh sách chức năng tự tạo đang hiển thị (cache theo phiên) — đưa vào menu Dịch vụ và lối tắt trang chủ. */
export function useTools(): PublicTool[] {
  const [tools, setTools] = useState<PublicTool[]>(cache ?? []);
  useEffect(() => {
    let cancelled = false;
    load().then((t) => !cancelled && setTools(t));
    return () => {
      cancelled = true;
    };
  }, []);
  return tools;
}
