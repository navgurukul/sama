import React from 'react';

export default function SamaAuthArt({ className = "auth-art" }) {
  return (
    <svg className={className} viewBox="0 0 420 380" aria-hidden="true" fill="none">
      <g stroke="#F6DC8E" strokeWidth="5" strokeLinecap="round">
        <path d="M262 40l-8 22" />
        <path d="M286 72l-24 14" />
        <path d="M296 118l-26 4" />
      </g>
      <path
        d="M30 98c0-10 6-17 17-17l178 4c10 0 16 6 16 16v140c0 10-6 17-16 17l-64 2-0 22h30c8 0 14 3 14 8 0 6-8 9-18 9h-92c-10 0-18-3-18-9 0-5 6-8 14-8h30l0-22-70-3c-10 0-16-7-16-17z"
        fill="#2B3059"
      />
      <rect x="42" y="96" width="186" height="140" rx="8" fill="#E6E7EA" />
      <path
        d="M96 150c-8-34 24-52 36-30"
        stroke="#D3B0A3"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <rect x="84" y="148" width="86" height="76" rx="22" fill="#D3B0A3" />
      <circle cx="127" cy="178" r="9" fill="#A8909F" />
      <path d="M127 184l-5 24h10z" fill="#A8909F" />
      <g transform="rotate(14 190 182)">
        <rect x="140" y="174" width="86" height="15" rx="4" fill="#F6DC8E" />
        <rect x="190" y="188" width="9" height="16" rx="2" fill="#F6DC8E" />
        <rect x="206" y="188" width="9" height="12" rx="2" fill="#F6DC8E" />
        <rect x="226" y="172" width="4" height="22" rx="2" fill="#C9C9CF" />
      </g>
      <circle cx="196" cy="268" r="3" fill="#4A5088" />
      <circle cx="206" cy="268" r="3" fill="#4A5088" />
      <path
        d="M22 354l18-62c3-8 9-12 17-12h172c8 0 14 4 18 12l20 62c2 7-2 12-9 12H34c-8 0-14-5-12-12z"
        fill="#3B4270"
        transform="translate(0 -10)"
      />
      <g
        stroke="#9AA0C4"
        strokeWidth="1.2"
        opacity=".7"
        transform="translate(0 -10)"
      >
        <path d="M60 300h180M52 322h202M44 344h216" />
        <path
          d="M98 284l-24 70M138 284l-12 70M178 284l0 70M218 284l12 70M250 284l24 70"
          opacity=".8"
        />
      </g>
      <path
        d="M296 190c26-22 64-18 82 6 14 20 4 48-18 56-20 8-44-2-60-18-14-14-14-34-4-44z"
        fill="#A8909F"
      />
      <circle cx="304" cy="198" r="17" stroke="#F6DC8E" strokeWidth="9" />
      <circle cx="296" cy="206" r="11" stroke="#F6DC8E" strokeWidth="8" />
      <path
        d="M378 262c26 20 40 44 42 74"
        stroke="#C7C4C8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M336 264c-4 30 6 62 32 90"
        stroke="#C7C4C8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
