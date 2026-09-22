import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // nguoi dung huy chia se, khong lam gi them
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard khong kha dung, bo qua trong im lang
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="ml-auto flex items-center gap-1 rounded-md border border-neutral-300 px-2.5 py-1 text-neutral-600 transition-colors hover:border-brand-500 hover:text-brand-700"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="15" cy="5" r="2.2" />
        <circle cx="5" cy="10" r="2.2" />
        <circle cx="15" cy="15" r="2.2" />
        <path d="m7 9 6-3M7 11l6 3" strokeLinecap="round" />
      </svg>
      {copied ? "Đã sao chép liên kết" : "Chia sẻ"}
    </button>
  );
}
