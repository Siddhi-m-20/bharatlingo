export default function LanguageFlag({ languageId = 'hi', size = 20, className = '' }) {
  if (languageId === 'en') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        className={`inline-block rounded-full shadow-sm shrink-0 ${className}`}
      >
        <clipPath id="uk-clip">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
        <g clipPath="url(#uk-clip)">
          <path fill="#00247D" d="M0 0h36v36H0z" />
          <path stroke="#FFF" strokeWidth="6" d="M0 0l36 36M36 0L0 36" />
          <path stroke="#CF142B" strokeWidth="3" d="M0 0l36 36M36 0L0 36" />
          <path stroke="#FFF" strokeWidth="10" d="M18 0v36M0 18h36" />
          <path stroke="#CF142B" strokeWidth="6" d="M18 0v36M0 18h36" />
        </g>
      </svg>
    )
  }

  // Indian Tricolor Flag with Ashoka Chakra (Renders beautifully on Windows, Mac, Linux, Android, iOS)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className={`inline-block rounded-full shadow-sm shrink-0 ${className}`}
    >
      <clipPath id="in-clip">
        <circle cx="18" cy="18" r="18" />
      </clipPath>
      <g clipPath="url(#in-clip)">
        {/* Saffron Band */}
        <path fill="#FF9933" d="M0 0h36v12H0z" />
        {/* White Band */}
        <path fill="#FFFFFF" d="M0 12h36v12H0z" />
        {/* India Green Band */}
        <path fill="#138808" d="M0 24h36v12H0z" />
        {/* Ashoka Chakra */}
        <circle cx="18" cy="18" r="4.5" fill="none" stroke="#000080" strokeWidth="0.8" />
        <circle cx="18" cy="18" r="1" fill="#000080" />
        {/* Spokes */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="18"
            y1="18"
            x2={18 + 4 * Math.cos((deg * Math.PI) / 180)}
            y2={18 + 4 * Math.sin((deg * Math.PI) / 180)}
            stroke="#000080"
            strokeWidth="0.5"
          />
        ))}
      </g>
    </svg>
  )
}
