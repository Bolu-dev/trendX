export function PhantomIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="128" height="128" rx="24" fill="#AB9FF2" />
      <path
        d="M110.584 64.9142H99.142C99.142 44.0419 82.0971 27 61.2248 27C40.6124 27 23.7959 43.6944 23.4189 64.0931C23.0329 84.9654 40.3074 102.829 61.2248 102.829H65.7368C84.2043 102.829 110.584 87.0319 110.584 64.9142Z"
        fill="white"
      />
      <path
        d="M79.8467 66.796C79.8467 66.796 74.9218 72.3379 65.7278 72.3379C56.5338 72.3379 50.8511 66.796 50.8511 66.796"
        stroke="#AB9FF2"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="54.5" cy="59.5" r="4.5" fill="#AB9FF2" />
      <circle cx="76.5" cy="59.5" r="4.5" fill="#AB9FF2" />
    </svg>
  );
}

export function SolflareIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="128" height="128" rx="24" fill="#FC8022" />
      <path d="M64 24L84 64L64 104L44 64L64 24Z" fill="white" />
      <path
        d="M24 64L64 44L104 64L64 84L24 64Z"
        fill="white"
        fillOpacity="0.6"
      />
    </svg>
  );
}
