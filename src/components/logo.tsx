import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Logo OxyTrack</title>
      <path
        d="M8 3h8c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
      />
      <line
        x1="12"
        y1="15"
        x2="12"
        y2="3"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
      />
      <path
        d="M12 15a2 2 0 1 0 4 0"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
      />
      <path d="M10 3h4" stroke="hsl(var(--card))" strokeWidth="1.5" />
    </svg>
  );
}
