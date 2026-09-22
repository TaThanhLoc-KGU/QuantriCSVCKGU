import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import { REPORT_SECTION_KEYS, REPORT_SECTION_LABELS, type PeriodType, type Report } from "../types";
import { Button, Card, ErrorBanner, Field, LoadingState, PageHeader, Select, Textarea } from "../components/ui";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1];

export function ReportsPage() {
  const [periodType, setPeriodType] = useState<PeriodType>("QUARTER");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [value, setValue] = useState(Math.floor(new Date().getMonth() / 3) + 1);

  const periodId = `${year}-${periodType === "MONTH" ? "M" : "Q"}${value}`;

  const [report, setReport] = useState<Report | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    setSaved(false);
    adminApi.reports
      .get(periodId)
      .then((r) => {
        setReport(r);
        setSections({ ...Object.fromEntries(REPORT_SECTION_KEYS.map((k) => [k, ""])), ...r.sections });
      })
      .catch(() => setError("Không thể tải báo cáo cho kỳ này."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [periodId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const r = await adminApi.reports.save(periodId, sections);
      setReport(r);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu báo cáo thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateDraft() {
    setGenerating(true);
    setError(null);
    try {
      const r = await adminApi.reports.generateDraft(periodId);
      setReport(r);
      setSections({ ...Object.fromEntries(REPORT_SECTION_KEYS.map((k) => [k, ""])), ...r.sections });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể sinh nháp bằng AI.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Báo cáo định kỳ"
        description="Báo cáo công tác theo tháng hoặc quý, xuất file Word theo mẫu hành chính."
        actions={
          <a
            href={adminApi.reports.exportDocxUrl(periodId)}
            className="rounded-md border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Xuất Word
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="Loại kỳ báo cáo">
          <Select value={periodType} onChange={(e) => { setPeriodType(e.target.value as PeriodType); setValue(1); }}>
            <option value="MONTH">Theo tháng</option>
            <option value="QUARTER">Theo quý</option>
          </Select>
        </Field>
        <Field label={periodType === "MONTH" ? "Tháng" : "Quý"}>
          <Select value={value} onChange={(e) => setValue(Number(e.target.value))}>
            {(periodType === "MONTH" ? Array.from({ length: 12 }, (_, i) => i + 1) : [1, 2, 3, 4]).map((v) => (
              <option key={v} value={v}>
                {periodType === "MONTH" ? `Tháng ${v}` : `Quý ${v}`}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Năm">
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
        <Button variant="secondary" onClick={handleGenerateDraft} disabled={generating}>
          {generating ? "Đang sinh nháp…" : "Sinh nháp bằng AI"}
        </Button>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {loading && <LoadingState />}

      {!loading && (
        <>
          {report?.updatedAt && (
            <p className="mb-3 text-xs text-neutral-500">
              Cập nhật lần cuối: {new Date(report.updatedAt).toLocaleString("vi-VN")}
              {report.aiProvider && ` · Có nội dung do AI (${report.aiProvider}) hỗ trợ soạn`}
            </p>
          )}

          <Card className="space-y-5 p-5">
            {REPORT_SECTION_KEYS.map((key) => (
              <Field key={key} label={REPORT_SECTION_LABELS[key]}>
                <Textarea
                  rows={key.startsWith("muc3") ? 3 : 4}
                  value={sections[key] ?? ""}
                  onChange={(e) => setSections({ ...sections, [key]: e.target.value })}
                />
              </Field>
            ))}
          </Card>

          <div className="mt-5 flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-accent-700">Đã lưu.</span>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu báo cáo"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
