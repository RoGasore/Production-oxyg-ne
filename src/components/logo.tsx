import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      {...props}
    >
      <defs>
        <linearGradient id="oxygen-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g>
        <path
          d="M 50,15 A 35,35 0 1,1 49.9,15.01 Z"
          fill="none"
          stroke="url(#oxygen-gradient)"
          strokeWidth="10"
        />
        <text
          x="75"
          y="85"
          fontSize="30"
          fontWeight="bold"
          fill="hsl(var(--foreground))"
          fontFamily="sans-serif"
        >
          2
        </text>
      </g>
    </svg>
  );
}
