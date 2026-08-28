import type { SVGProps } from "react";

const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...base} {...props}>
      <path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4.379a1.5 1.5 0 0 1 1.06.44l1.122 1.12a1.5 1.5 0 0 0 1.06.44H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
    </svg>
  );
}

export function DocumentStackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...base} {...props}>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3.5" />
      <path d="M9 12h6M9 15.5h6" />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...base} {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 3.2 1 5.2 1.7 6.2a.8.8 0 0 1-.65 1.3H4.95a.8.8 0 0 1-.65-1.3C5 14.2 6 12.2 6 9Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...base} {...props}>
      <path d="M12 3.5 5 6v5.5c0 4.6 3 7.9 7 9 4-1.1 7-4.4 7-9V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4.2" />
    </svg>
  );
}

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...base} {...props}>
      <path d="M21 3 3 10.5l7.5 3L14 21l7-18Z" />
      <path d="M10.5 13.5 21 3" />
    </svg>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.4 2.4 4.6-5" />
    </svg>
  );
}
