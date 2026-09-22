import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ApiError } from "../api";
import { Button, Field, TextInput } from "../components/ui";
import { useSiteInfo } from "../../lib/useSiteInfo";

export function LoginPage() {
  const site = useSiteInfo();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from ?? "/admin"} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(location.state?.from ?? "/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError("Sai tên đăng nhập hoặc mật khẩu.");
      } else {
        setError("Không thể đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-neutral-100 lg:grid-cols-[minmax(0,1fr)_460px]">
      <div className="hidden flex-col justify-between bg-brand-800 p-10 text-white lg:flex">
        <img src={site.logoUrl} alt="" className="h-16 w-16 bg-white object-contain p-1.5" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-200">{site.subtitle}</p>
          <h1 className="mt-2 max-w-md text-balance text-4xl font-extrabold uppercase leading-tight">{site.name}</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100">Trang quản trị nội dung, sổ văn bản, nhiệm vụ và báo cáo của đơn vị.</p>
        </div>
        <p className="text-xs text-brand-200">© {new Date().getFullYear()} {site.name}</p>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <img src={site.logoUrl} alt="" className="h-12 w-12 object-contain" />
            <p className="mt-2 text-base font-extrabold uppercase text-brand-800">{site.name}</p>
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">Đăng nhập quản trị</h2>
          <p className="mb-5 mt-1 text-sm text-neutral-600">Dùng tài khoản do quản trị viên cấp.</p>

          <form onSubmit={handleSubmit} className="border border-neutral-300 bg-white p-5">
            <div className="space-y-4">
              <Field label="Tên đăng nhập" htmlFor="username" required>
                <TextInput id="username" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} required />
              </Field>
              <Field label="Mật khẩu" htmlFor="password" required>
                <TextInput id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </Field>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-urgent-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="mt-5 w-full">
              {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
