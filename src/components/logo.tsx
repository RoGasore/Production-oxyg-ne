
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
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#00AEEF' }} />
          <stop offset="100%" style={{ stopColor: '#A200FF' }} />
        </linearGradient>
        <radialGradient id="bubble-gradient-center">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
      </defs>
      <g>
        <path
          d="M 50,20 A 30,30 0 1,1 49.9,20.01 Z"
          fill="none"
          stroke="url(#logo-gradient)"
          strokeWidth="10"
        />
        <circle cx="50" cy="50" r="8" fill="url(#bubble-gradient-center)" />
        <circle cx="50" cy="33" r="5" fill="url(#bubble-gradient-center)" />
        <circle cx="50" cy="20" r="3" fill="url(#bubble-gradient-center)" />
        <circle cx="43" cy="15" r="2.5" fill="url(#bubble-gradient-center)" />
        <circle cx="57" cy="15" r="2" fill="url(#bubble-gradient-center)" />
         <circle cx="37" cy="25" r="1.5" fill="url(#bubble-gradient-center)" />
        <circle cx="63" cy="25" r="1.5" fill="url(#bubble-gradient-center)" />
      </g>
    </svg>
  );
}
