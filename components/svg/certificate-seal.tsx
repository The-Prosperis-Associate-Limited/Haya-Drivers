interface Props {
  size?: number;
  className?: string;
}

export const CertificateSeal = function ({ size = 120, className }: Props) {
  const points = Array.from({ length: 28 }, (_, index) => {
    const angle = (index / 28) * Math.PI * 2;
    const radius = index % 2 === 0 ? 46 : 40;

    return `${60 + radius * Math.cos(angle)},${60 + radius * Math.sin(angle)}`;
  }).join(" ");

  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 120 162"
      fill="none"
      role="presentation"
      className={className}
    >
      <defs>
        <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5d576" />
          <stop offset="45%" stopColor="#c9992f" />
          <stop offset="100%" stopColor="#8a6516" />
        </linearGradient>
        <linearGradient id="seal-ribbon-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8a93c" />
          <stop offset="100%" stopColor="#8a6516" />
        </linearGradient>
        <linearGradient id="seal-ribbon-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c667" />
          <stop offset="100%" stopColor="#a67a20" />
        </linearGradient>
      </defs>

      <path
        d="M42 92 L26 158 L48 146 L60 162 L60 96 Z"
        fill="url(#seal-ribbon-left)"
      />
      <path
        d="M78 92 L94 158 L72 146 L60 162 L60 96 Z"
        fill="url(#seal-ribbon-right)"
      />

      <polygon points={points} fill="url(#seal-gold)" />
      <circle cx="60" cy="60" r="36" fill="#f3e2b0" />
      <circle
        cx="60"
        cy="60"
        r="33"
        fill="#fffdf6"
        stroke="#c9992f"
        strokeWidth="1.5"
      />
      <circle
        cx="60"
        cy="60"
        r="26"
        fill="none"
        stroke="#d8b356"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      <path
        d="M46 56 q-6 12 4 22 M74 56 q6 12 -4 22"
        fill="none"
        stroke="#c9992f"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
