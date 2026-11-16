export function WebGLFallback() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#090909]"
    >
      {/* Subtle radial champagne vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 68% 36%, rgba(212, 175, 55, 0.14) 0%, rgba(21, 21, 21, 0.35) 38%, rgba(9, 9, 9, 1) 74%)',
        }}
      />
      {/* Static vector Royal Crown & Shuttlecock emblem */}
      <svg
        viewBox="0 0 400 320"
        className="absolute right-[6%] top-[20%] w-[280px] md:w-[420px] opacity-30"
        fill="none"
      >
        <defs>
          <linearGradient id="crownGold" x1="0" y1="0" x2="400" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5D77A" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#7C5E14" />
          </linearGradient>
        </defs>
        <path
          d="M74 224L52 108L128 158L200 66L272 158L348 108L326 224H74Z"
          stroke="url(#crownGold)"
          strokeWidth="3"
          fill="rgba(212,175,55,0.06)"
        />
        <rect
          x="74"
          y="232"
          width="252"
          height="22"
          rx="4"
          stroke="url(#crownGold)"
          strokeWidth="2.5"
          fill="rgba(212,175,55,0.1)"
        />
        <circle cx="200" cy="54" r="8" fill="#F5D77A" />
        <circle cx="52" cy="96" r="6" fill="#D4AF37" />
        <circle cx="348" cy="96" r="6" fill="#D4AF37" />
        {/* Stylized shuttlecock crest */}
        <path
          d="M200 112L178 158H222L200 112Z"
          stroke="#F5D77A"
          strokeWidth="2"
        />
        <circle cx="200" cy="170" r="10" stroke="#D4AF37" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
