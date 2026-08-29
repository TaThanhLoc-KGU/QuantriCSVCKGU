import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { IdCardIcon, CheckCircleIcon, ShieldCheckIcon } from "../components/icons";
import { SearchSelect, type SearchSelectOption } from "../components/SearchSelect";
import { PublicFileDropzone } from "../components/PublicFileDropzone";
import classesData from "../data/classes.json";
import unitsData from "../data/units.json";

const inputClass =
  "block w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

const CLASS_OPTIONS: SearchSelectOption[] = (classesData as { code: string; name: string; year: string }[]).map((c) => ({
  value: c.code,
  label: `${c.code} ${c.name}`,
  sublabel: c.year ? `${c.name} · ${c.year}` : c.name,
}));

const UNIT_OPTIONS: SearchSelectOption[] = (unitsData as string[]).map((u) => ({ value: u, label: u }));

type StudentKind = "new" | "existing";

export function AccountRecoveryPage() {
  const [kind, setKind] = useState<StudentKind | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [classCode, setClassCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseCode, setCaseCode] = useState<string | null>(null);

  const classSublabel = useMemo(() => CLASS_OPTIONS.find((o) => o.value === classCode)?.sublabel, [classCode]);

  const canSubmit =
    !!kind &&
    fullName.trim().length > 1 &&
    email.trim().includes("@") &&
    phone.trim().length > 0 &&
    cccdNumber.trim().length > 0 &&
    studentId.trim().length > 0 &&
    (kind === "new" ? !!screenshot : !!classCode && !!unitName && !!idCard);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kind || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitAccountRecovery({
        fullName,
        email,
        phone,
        isNewStudent: kind === "new",
        studentId,
        cccdNumber,
        classCode: kind === "existing" ? classCode : undefined,
        unitName: kind === "existing" ? unitName : undefined,
        screenshot: kind === "new" ? screenshot : undefined,
        idCard: kind === "existing" ? idCard : undefined,
        website,
      });
      setCaseCode(res.caseCode);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50">
      {/* Thanh dieu huong gon: day la mot cong cu ho tro, khong phai trang noi dung thong thuong */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3.5 text-sm">
          <Link to="/" className="text-neutral-500 hover:text-brand-600">
            Trang chủ
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-medium text-neutral-800">Hỗ trợ khôi phục tài khoản</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="animate-fade-up grid gap-8 lg:grid-cols-[19rem_1fr] lg:items-start lg:gap-10">
          {/* Cot trai: the xac minh - phan anh truc tiep du lieu dang nhap, tang tin tuong */}
          <div className="lg:sticky lg:top-8">
            <VerificationCard
              fullName={fullName}
              studentId={studentId}
              kind={kind}
              classCode={classCode}
              unitName={unitName}
            />
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-3">
              <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
              <p className="text-xs leading-relaxed text-neutral-500">
                Thông tin bạn gửi chỉ Phòng Quản trị Cơ sở vật chất xem được, dùng để xác minh danh tính trước khi hỗ trợ khôi phục tài khoản.
              </p>
            </div>
          </div>

          {/* Cot phai: form */}
          <div>
            {caseCode ? (
              <div className="animate-fade-up rounded-xl border border-accent-200 bg-accent-50 p-6 text-center sm:p-8">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-white">
                  <CheckCircleIcon className="h-7 w-7" />
                </span>
                <p className="mt-4 text-lg font-bold text-accent-900">Đã tiếp nhận yêu cầu</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-accent-800">
                  Phòng Quản trị Cơ sở vật chất sẽ kiểm tra thông tin và hỗ trợ khôi phục tài khoản trong thời gian sớm nhất.
                </p>

                <div className="mx-auto mt-5 max-w-xs rounded-lg border border-dashed border-accent-300 bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">Mã hồ sơ của bạn</p>
                  <p className="font-mono text-xl font-bold tracking-wider text-accent-800">{caseCode}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">Lưu lại mã này để tra cứu kết quả sau này.</p>
                </div>

                <Link
                  to="/tra-cuu-ket-qua"
                  className="mt-4 inline-block rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
                >
                  Tra cứu kết quả →
                </Link>
                <div>
                  <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
                    ← Về trang chủ
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">Yêu cầu khôi phục tài khoản</h1>
                  <p className="mt-1 text-sm text-neutral-500">
                    Điền thông tin bên dưới để Phòng xác minh và hỗ trợ khôi phục tài khoản hệ thống của bạn.
                  </p>
                </div>

                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>

                <div>
                  <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-neutral-700">
                    Họ và tên <span className="text-urgent-600">*</span>
                  </label>
                  <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Nguyễn Văn A" />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
                    Email nhận kết quả <span className="text-urgent-600">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="ban@gmail.com"
                  />
                  <p className="mt-1 text-xs text-neutral-400">Phòng sẽ gửi kết quả xử lý về địa chỉ này.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-neutral-700">
                      Số điện thoại <span className="text-urgent-600">*</span>
                    </label>
                    <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="09xxxxxxxx" />
                  </div>
                  <div>
                    <label htmlFor="cccd" className="mb-1 block text-sm font-medium text-neutral-700">
                      Số căn cước công dân <span className="text-urgent-600">*</span>
                    </label>
                    <input id="cccd" required value={cccdNumber} onChange={(e) => setCccdNumber(e.target.value)} className={inputClass} placeholder="Dãy 12 số trên CCCD" />
                  </div>
                </div>
                <p className="-mt-3 text-xs text-neutral-400">Dùng để tra cứu kết quả sau này, cùng với mã hồ sơ.</p>

                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-neutral-700">
                    Bạn là tân sinh viên? <span className="text-urgent-600">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <KindOption
                      active={kind === "new"}
                      title="Tân sinh viên"
                      description="Mới trúng tuyển, chưa có lớp"
                      onClick={() => setKind("new")}
                    />
                    <KindOption
                      active={kind === "existing"}
                      title="Sinh viên"
                      description="Đã có lớp, đang học"
                      onClick={() => setKind("existing")}
                    />
                  </div>
                </fieldset>

                {kind === "new" && (
                  <div className="animate-fade-up space-y-5 rounded-xl border border-neutral-200 bg-white p-5">
                    <div>
                      <label htmlFor="studentId" className="mb-1 block text-sm font-medium text-neutral-700">
                        Mã số sinh viên được cấp <span className="text-urgent-600">*</span>
                      </label>
                      <input id="studentId" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass} placeholder="Ví dụ: 2026012345" />
                    </div>
                    <div>
                      <span className="mb-1 block text-sm font-medium text-neutral-700">
                        Ảnh chụp màn hình trang{" "}
                        <a href="https://tansinhvien.vnkgu.edu.vn" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                          tansinhvien.vnkgu.edu.vn
                        </a>{" "}
                        <span className="text-urgent-600">*</span>
                      </span>
                      <p className="mb-2 text-xs text-neutral-400">Chụp màn hình sao cho thấy rõ mã số sinh viên của bạn.</p>
                      <PublicFileDropzone value={screenshot} onChange={setScreenshot} hint="PNG hoặc JPG" />
                    </div>
                  </div>
                )}

                {kind === "existing" && (
                  <div className="animate-fade-up space-y-5 rounded-xl border border-neutral-200 bg-white p-5">
                    <div>
                      <label htmlFor="studentId2" className="mb-1 block text-sm font-medium text-neutral-700">
                        Mã số sinh viên <span className="text-urgent-600">*</span>
                      </label>
                      <input id="studentId2" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass} placeholder="Ví dụ: 2024012345" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                          Lớp <span className="text-urgent-600">*</span>
                        </label>
                        <SearchSelect
                          options={CLASS_OPTIONS}
                          value={classCode}
                          onChange={setClassCode}
                          placeholder="Chọn lớp…"
                          searchPlaceholder="Gõ mã lớp hoặc tên lớp…"
                        />
                        {classSublabel && <p className="mt-1 text-xs text-neutral-400">{classSublabel}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                          Khoa <span className="text-urgent-600">*</span>
                        </label>
                        <SearchSelect
                          options={UNIT_OPTIONS}
                          value={unitName}
                          onChange={setUnitName}
                          placeholder="Chọn khoa…"
                          searchPlaceholder="Gõ tên khoa…"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="mb-1 block text-sm font-medium text-neutral-700">
                        Ảnh CCCD hoặc thẻ sinh viên <span className="text-urgent-600">*</span>
                      </span>
                      <p className="mb-2 text-xs text-neutral-400">Dùng để đối chiếu, xác minh đúng là bạn.</p>
                      <PublicFileDropzone value={idCard} onChange={setIdCard} hint="PNG hoặc JPG" />
                    </div>
                  </div>
                )}

                {error && <p className="rounded-md border border-urgent-200 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {submitting ? "Đang gửi…" : "Gửi yêu cầu khôi phục"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KindOption({ active, title, description, onClick }: { active: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
        active ? "border-brand-600 bg-brand-50" : "border-neutral-200 bg-white hover:border-brand-300"
      }`}
    >
      <p className={`text-sm font-semibold ${active ? "text-brand-800" : "text-neutral-800"}`}>{title}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
    </button>
  );
}

function VerificationCard({
  fullName,
  studentId,
  kind,
  classCode,
  unitName,
}: {
  fullName: string;
  studentId: string;
  kind: StudentKind | null;
  classCode: string;
  unitName: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-5 text-white shadow-xl">
      <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-400/20 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-200">Thẻ xác minh</p>
          <IdCardIcon className="h-5 w-5 text-brand-300" />
        </div>

        <p className="mt-4 min-h-6 truncate text-lg font-bold leading-tight">{fullName || "Họ và tên"}</p>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wide text-brand-300">Mã số sinh viên</p>
          <p className="font-mono text-base tracking-wider text-white">{studentId || "— — — — — —"}</p>
        </div>

        {kind === "existing" && (classCode || unitName) && (
          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
            {classCode && (
              <p className="text-xs text-brand-100">
                <span className="text-brand-300">Lớp:</span> {classCode}
              </p>
            )}
            {unitName && (
              <p className="text-xs text-brand-100">
                <span className="text-brand-300">Khoa:</span> {unitName}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-[10px] text-brand-300">Trường Đại học Kiên Giang</span>
          {kind && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white">
              {kind === "new" ? "Tân sinh viên" : "Sinh viên"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
