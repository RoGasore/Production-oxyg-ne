
import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#00AEEF' }} />
                <stop offset="100%" style={{ stopColor: '#A200FF' }} />
            </linearGradient>
            <radialGradient id="bubble-loader-gradient">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E0E0E0" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          <path
            d="M 50,20 A 30,30 0 1,1 49.9,20.01 Z"
            fill="none"
            stroke="url(#logo-gradient)"
            strokeWidth="10"
          />
          <g>
            <circle cx="50" cy="50" r="8" fill="url(#bubble-loader-gradient)">
              <animateTransform attributeName="transform" type="translate" values="0 0; 0 -30" begin="0s" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" begin="0s" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="8;4" begin="0s" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="5" fill="url(#bubble-loader-gradient)">
              <animateTransform attributeName="transform" type="translate" values="0 0; 0 -45" begin="0.3s" dur="1.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" begin="0.3s" dur="1.7s" repeatCount="indefinite" />
               <animate attributeName="r" values="5;2" begin="0.3s" dur="1.7s" repeatCount="indefinite" />
            </circle>
             <circle cx="50" cy="50" r="3" fill="url(#bubble-loader-gradient)">
              <animateTransform attributeName="transform" type="translate" values="0 0; 0 -60" begin="0.6s" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" begin="0.6s" dur="2s" repeatCount="indefinite" />
              <animate attributeName="r" values="3;1" begin="0.6s" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  );
}
