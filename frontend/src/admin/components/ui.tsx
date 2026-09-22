import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-brand-700 pb-3">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-neutral-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-neutral-600">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("border border-neutral-300 bg-white", className)}>{children}</div>;
}

const buttonVariants = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700",
  secondary: "bg-white text-neutral-800 border border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 focus-visible:outline-brand-700",
  danger: "bg-urgent-600 text-white hover:bg-urgent-500 focus-visible:outline-urgent-600",
  ghost: "text-neutral-700 hover:bg-neutral-100 focus-visible:outline-brand-700",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
});

export function Field({ label, htmlFor, error, hint, children, required }: { label: string; htmlFor?: string; error?: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[13px] font-semibold text-neutral-800">
        {label}
        {required && <span className="text-urgent-600"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-urgent-600">{error}</p>}
    </div>
  );
}

const inputBase =
  "block w-full border border-neutral-300 bg-white px-2.5 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-100 disabled:text-neutral-500";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={clsx(inputBase, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={clsx(inputBase, "min-h-24 resize-y", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={clsx(inputBase, className)} {...props}>
      {children}
    </select>
  );
});

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-800">
      <input type="checkbox" className="h-4 w-4 border-neutral-400 accent-[var(--color-brand-700)]" {...props} />
      {label}
    </label>
  );
}

const badgeTones = {
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-300",
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  accent: "bg-accent-50 text-accent-800 border-accent-200",
  urgent: "bg-urgent-50 text-urgent-600 border-urgent-500/30",
  warn: "bg-amber-50 text-amber-800 border-amber-300",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center border px-1.5 py-px text-[11px] font-bold uppercase tracking-wide", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-400 bg-white py-12 text-center">
      <p className="text-sm font-bold text-neutral-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-600">{description}</p>}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-14">
      <p className="text-sm text-neutral-500">Đang tải…</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-urgent-500/40 bg-urgent-50 px-3.5 py-2.5 text-sm font-medium text-urgent-600">
      {message}
    </div>
  );
}
