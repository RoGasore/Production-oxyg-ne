
import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="relative h-24 w-24">
        <Logo className="absolute inset-0 h-full w-full" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
              <linearGradient id="bubble-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.7 }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.7 }} />
              </linearGradient>
          </defs>
          <g>
            <circle cx="50" cy="12" r="4" fill="url(#bubble-gradient)">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -40"
                begin="0s"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0"
                begin="0s"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="50" cy="12" r="3" fill="url(#bubble-gradient)">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="5 5; 5 -35"
                begin="0.5s"
                dur="1.7s"
                repeatCount="indefinite"
              />
               <animate
                attributeName="opacity"
                values="1;0"
                begin="0.5s"
                dur="1.7s"
                repeatCount="indefinite"
              />
            </circle>
             <circle cx="50" cy="12" r="5" fill="url(#bubble-gradient)">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="-5 0; -5 -50"
                begin="1s"
                dur="2s"
                repeatCount="indefinite"
              />
               <animate
                attributeName="opacity"
                values="1;0"
                begin="1s"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  );
}
