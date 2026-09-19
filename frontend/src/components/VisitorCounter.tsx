import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatNumber } from "../lib/format";

const VISITOR_KEY = "qtcsvc.visitorId";
const SESSION_KEY = "qtcsvc.visitCounted";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

/** Bo dem truy cap: dem 1 luot moi phien trinh duyet, gui heartbeat 60s/lan de tinh "dang online". */
export function VisitorCounter() {
  const [stats, setStats] = useState<{ total: number; online: number } | null>(null);

  useEffect(() => {
    const id = getVisitorId();
    let newVisit = false;
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        newVisit = true;
      }
    } catch {
      // khong co sessionStorage - bo qua, khong dem them
    }
    const ping = (isNew: boolean) => api.pingStats(id, isNew).then(setStats).catch(() => undefined);
    void ping(newVisit);
    const timer = window.setInterval(() => void ping(false), 60000);
    return () => window.clearInterval(timer);
  }, []);

  if (!stats) return null;
  return (
    <ul className="mt-3 space-y-1 text-sm text-brand-200">
      <li>
        Đang online: <span className="font-semibold text-white">{formatNumber(stats.online)}</span>
      </li>
      <li>
        Tổng lượt truy cập: <span className="font-semibold text-white">{formatNumber(stats.total)}</span>
      </li>
    </ul>
  );
}
