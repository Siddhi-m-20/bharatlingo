import { motion } from 'framer-motion'

/**
 * "Mayur" - The Official Mascot of BharatLingo
 * High-visibility, bold, chunky character design inspired by Duolingo's iconic style.
 */
export default function BharatMascot({
  size = 64,
  mood = 'happy', // 'happy' | 'waving' | 'celebrating'
  className = '',
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      transition={{ duration: 0.3 }}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich Emerald Body Gradient */}
          <linearGradient id="mayurBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0B8F62" />
          </linearGradient>

          {/* Saffron Beak Gradient */}
          <linearGradient id="mayurBeak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Royal Blue Belly Gradient */}
          <linearGradient id="mayurBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* 1. Chunky Top Crest (Peacock Crown) */}
        <g>
          {/* Left Feather */}
          <path d="M50 26 C42 16 35 14 34 11" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="33" cy="10" r="7" fill="#0284C7" stroke="#064E3B" strokeWidth="2.5" />
          <circle cx="33" cy="10" r="3.5" fill="#FBBF24" />

          {/* Center Feather */}
          <path d="M50 24 C50 14 50 10 50 6" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="5" r="8" fill="#0284C7" stroke="#064E3B" strokeWidth="2.5" />
          <circle cx="50" cy="5" r="4" fill="#FBBF24" />

          {/* Right Feather */}
          <path d="M50 26 C58 16 65 14 66 11" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="67" cy="10" r="7" fill="#0284C7" stroke="#064E3B" strokeWidth="2.5" />
          <circle cx="67" cy="10" r="3.5" fill="#FBBF24" />
        </g>

        {/* 2. Bold Orange Feet */}
        <ellipse cx="38" cy="94" rx="7" ry="4" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />
        <ellipse cx="62" cy="94" rx="7" ry="4" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />

        {/* 3. Main Round Chunky Green Body */}
        <ellipse
          cx="50"
          cy="60"
          rx="42"
          ry="34"
          fill="url(#mayurBody)"
          stroke="#064E3B"
          strokeWidth="3.5"
        />

        {/* 4. Royal Blue Chest / Plumage */}
        <path
          d="M28 58 C28 80 38 88 50 88 C62 88 72 80 72 58 C64 54 36 54 28 58 Z"
          fill="url(#mayurBelly)"
          stroke="#0369A1"
          strokeWidth="2"
        />

        {/* 5. Big Side Wings */}
        {mood === 'waving' || mood === 'celebrating' ? (
          <>
            {/* Left Resting Wing */}
            <path
              d="M10 56 C6 68 12 80 24 80 C20 72 16 64 10 56 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="3"
            />
            {/* Right Waving Wing */}
            <path
              d="M86 52 C98 38 104 54 90 70 C88 62 86 56 86 52 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="3"
            />
          </>
        ) : (
          <>
            <path
              d="M10 56 C6 68 12 80 24 80 C20 72 16 64 10 56 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="3"
            />
            <path
              d="M90 56 C94 68 88 80 76 80 C80 72 84 64 90 56 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="3"
            />
          </>
        )}

        {/* 6. Giant Bold Eyes (Duolingo Style) */}
        {/* Left Eye */}
        <circle cx="36" cy="46" r="13" fill="#FFFFFF" stroke="#064E3B" strokeWidth="3" />
        <circle cx="38" cy="46" r="8" fill="#1E293B" />
        <circle cx="35" cy="43" r="3.5" fill="#FFFFFF" />
        <circle cx="41" cy="49" r="1.8" fill="#FFFFFF" />

        {/* Right Eye */}
        <circle cx="64" cy="46" r="13" fill="#FFFFFF" stroke="#064E3B" strokeWidth="3" />
        <circle cx="62" cy="46" r="8" fill="#1E293B" />
        <circle cx="59" cy="43" r="3.5" fill="#FFFFFF" />
        <circle cx="65" cy="49" r="1.8" fill="#FFFFFF" />

        {/* 7. Cute Pink Cheeks */}
        <circle cx="22" cy="58" r="6" fill="#F472B6" opacity="0.75" />
        <circle cx="78" cy="58" r="6" fill="#F472B6" opacity="0.75" />

        {/* 8. Big Chunky Saffron Beak */}
        <path
          d="M40 50 Q50 48 60 50 Q50 68 40 50 Z"
          fill="url(#mayurBeak)"
          stroke="#B45309"
          strokeWidth="2.5"
        />
        {/* Beak Highlight */}
        <path d="M44 51 Q50 50 56 51" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}
