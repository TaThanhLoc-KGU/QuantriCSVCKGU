import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api";
import type { Kpi, MemberRow } from "../types";
import { Card, ErrorBanner, LoadingState, PageHeader } from "../components/ui";
import type { FeedbackMessage, AccountRecoveryRequest } from "../types";

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_QUARTER = Math.floor(now.getMonth() / 3) + 1;

export function DashboardPage() {
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState<number | null>(null);
  const [pendingRecovery, setPendingRecovery] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminApi.dashboard.kpi({ year: CURRENT_YEAR, quarter: CURRENT_QUARTER }),
      adminApi.dashboard.members(CURRENT_YEAR),
    ])
      .then(([k, m]) => {
        if (cancelled) return;
        setKpi(k);
        setMembers(m);
      })
      .catch(() => !cancelled && setError("Không thể tải dữ liệu tổng quan."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    adminApi.feedback.list().then((l: FeedbackMessage[]) => setPendingFeedback(l.filter((x) => x.status === "MOI").length)).catch(() => undefined);
    adminApi.accountRecovery.list().then((l: AccountRecoveryRequest[]) => setPendingRecovery(l.filter((x) => x.status === "MOI").length)).catch(() => undefined);
  }, []);

  return (
    <div>
      <PageHeader title="Tổng quan" description={`Nhiệm vụ quý ${CURRENT_QUARTER}/${CURRENT_YEAR}`} />

      <div className="mb-5 grid border-l border-t border-neutral-300 bg-white sm:grid-cols-2 lg:grid-cols-4">
        <Todo to="/admin/gop-y" label="Góp ý chưa xử lý" value={pendingFeedback} />
        <Todo to="/admin/khoi-phuc-tai-khoan" label="Yêu cầu khôi phục tài khoản mới" value={pendingRecovery} />
        <Todo to="/admin/van-ban" label="Sổ văn bản" hint="Cấp số, tra cứu" />
        <Todo to="/admin/bai-viet" label="Bài viết" hint="Soạn và đăng tin" />
      </div>

      {loading && <LoadingState />}
      {error && <ErrorBanner message={error} />}

      {kpi && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Tổng nhiệm vụ" value={kpi.totalTasks} />
          <StatCard label="Hoàn thành" value={kpi.completed} tone="accent" />
          <StatCard label="Đang thực hiện" value={kpi.inProgress} tone="brand" />
          <StatCard label="Vướng mắc" value={kpi.blocked} tone="urgent" />
        </div>
      )}

      {kpi && (
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">Tiến độ chung</p>
            <p className="text-sm font-semibold text-neutral-900">{kpi.overallProgressPercent}%</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden bg-neutral-100">
            <div className="h-full bg-brand-600" style={{ width: `${kpi.overallProgressPercent}%` }} />
          </div>
        </Card>
      )}

      {members.length > 0 && (
        <Card className="mt-4">
          <div className="border-b border-neutral-200 px-5 py-3">
            <p className="text-sm font-semibold text-neutral-900">Khối lượng công việc theo nhân sự ({CURRENT_YEAR})</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Nhân sự</th>
                <th className="px-5 py-2 font-medium">Số nhiệm vụ</th>
                <th className="px-5 py-2 font-medium">Tiến độ TB</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.memberId} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 text-neutral-900">{m.memberName}</td>
                  <td className="px-5 py-2.5 text-neutral-600">{m.taskCount}</td>
                  <td className="px-5 py-2.5 text-neutral-600">{m.avgProgressPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <QuickLink to="/admin/bai-viet" label="Quản lý bài viết" />
        <QuickLink to="/admin/van-ban" label="Sổ văn bản" />
        <QuickLink to="/admin/nhiem-vu" label="Nhiệm vụ" />
        <QuickLink to="/admin/bao-cao" label="Báo cáo định kỳ" />
      </div>
    </div>
  );
}

function Todo({ to, label, value, hint }: { to: string; label: string; value?: number | null; hint?: string }) {
  return (
    <Link to={to} className="group flex items-center justify-between gap-3 border-b border-r border-neutral-300 px-4 py-3 hover:bg-brand-700">
      <span className="text-[13px] font-bold text-neutral-900 group-hover:text-white">
        {label}
        {hint && <span className="mt-0.5 block text-xs font-normal text-neutral-500 group-hover:text-white/80">{hint}</span>}
      </span>
      {value != null && (
        <span className={`tnum text-2xl font-extrabold group-hover:text-white ${value > 0 ? "text-urgent-600" : "text-neutral-400"}`}>{value}</span>
      )}
    </Link>
  );
}

function StatCard({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "accent" | "brand" | "urgent" }) {
  const toneClass = {
    neutral: "text-neutral-900",
    accent: "text-accent-700",
    brand: "text-brand-700",
    urgent: "text-urgent-600",
  }[tone];
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
    </Card>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-brand-300 hover:text-brand-700"
    >
      {label} →
    </Link>
  );
}
