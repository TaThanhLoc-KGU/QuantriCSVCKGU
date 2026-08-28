import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ApiError } from "../api";
import { Button, Field, TextInput } from "../components/ui";

export function LoginPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">
            QT
          </div>
          <p className="mt-3 text-base font-semibold text-neutral-900">Phòng Quản trị Cơ sở vật chất</p>
          <p className="text-sm text-neutral-500">Trường Đại học Kiên Giang — Trang quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <Field label="Tên đăng nhập" htmlFor="username" required>
              <TextInput
                id="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Field>
            <Field label="Mật khẩu" htmlFor="password" required>
              <TextInput
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          </div>

          {error && <p className="mt-4 text-sm text-urgent-600">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-5 w-full">
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
