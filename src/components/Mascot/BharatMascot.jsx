import { motion } from 'framer-motion'

/**
 * "Mayur" - The Official Mascot of BharatLingo
 * Bold, charming, chunky peacock character with full fanned-out tail plumage feathers.
 */
export default function BharatMascot({
  size = 64,
  mood = 'happy', // 'happy' | 'waving' | 'celebrating' | 'talking'
  showFeathers = true,
  className = '',
}) {
  const isWaving = mood === 'waving' || mood === 'celebrating'

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.25 }}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id="mayurBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#0B8F62" />
            <stop offset="100%" stopColor="#065F46" />
          </linearGradient>

          {/* Saffron Beak Gradient */}
          <linearGradient id="mayurBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Royal Blue Belly Gradient */}
          <linearGradient id="mayurBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Outer Plume Feather Gradient */}
          <linearGradient id="featherPlumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Secondary Feather Plume Gradient */}
          <linearGradient id="innerFeatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Peacock Eye Gold Gradient */}
          <linearGradient id="ocellusGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Peacock Eye Royal Blue Gradient */}
          <linearGradient id="ocellusBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. LARGE FULL PEACOCK TAIL PLUMAGE (FAN OF FEATHERS)           */}
        {/* ============================================================== */}
        {showFeathers && (
          <motion.g
            animate={
              isWaving
                ? { rotate: [-1.5, 1.5, -1.5], scale: [1, 1.02, 1] }
                : { rotate: [-0.5, 0.5, -0.5] }
            }
            transition={{
              repeat: Infinity,
              duration: isWaving ? 2.5 : 4,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '60px 80px' }}
          >
            {/* Background Glow / Aura */}
            <circle
              cx="60"
              cy="52"
              r="48"
              fill="url(#innerFeatherGrad)"
              opacity="0.12"
            />

            {/* Inner Fan Layer (Layer of smaller supportive plumes) */}
            <g opacity="0.9">
              {/* Inner 1 */}
              <ellipse cx="23" cy="50" rx="10" ry="6" transform="rotate(-60 23 50)" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
              {/* Inner 2 */}
              <ellipse cx="33" cy="33" rx="10" ry="6" transform="rotate(-38 33 33)" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
              {/* Inner 3 */}
              <ellipse cx="48" cy="23" rx="10" ry="6" transform="rotate(-15 48 23)" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
              {/* Inner 4 */}
              <ellipse cx="72" cy="23" rx="10" ry="6" transform="rotate(15 72 23)" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
              {/* Inner 5 */}
              <ellipse cx="87" cy="33" rx="10" ry="6" transform="rotate(38 87 33)" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
              {/* Inner 6 */}
              <ellipse cx="97" cy="50" rx="10" ry="6" transform="rotate(60 97 50)" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
            </g>

            {/* Radial Feather Shafts / Quill Ribs */}
            <g stroke="#064E3B" strokeWidth="2" strokeLinecap="round" opacity="0.8">
              <path d="M60 76 Q38 68 18 58" />
              <path d="M60 76 Q40 54 26 40" />
              <path d="M60 76 Q48 44 42 26" />
              <path d="M60 76 L60 18" strokeWidth="2.5" />
              <path d="M60 76 Q72 44 78 26" />
              <path d="M60 76 Q80 54 94 40" />
              <path d="M60 76 Q82 68 102 58" />
            </g>

            {/* 7 MAIN RADIANT PEACOCK FEATHER PLUMES */}
            {/* 1. Far Left Plume */}
            <g>
              <ellipse cx="18" cy="58" rx="13" ry="9" transform="rotate(-68 18 58)" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="18" cy="58" rx="7" ry="5.5" transform="rotate(-68 18 58)" fill="url(#ocellusGold)" />
              <ellipse cx="18" cy="58" rx="4.5" ry="3.5" transform="rotate(-68 18 58)" fill="url(#ocellusBlue)" />
              <circle cx="18" cy="58" r="2" fill="#38BDF8" />
              <circle cx="17.2" cy="57.2" r="0.8" fill="#FFFFFF" />
            </g>

            {/* 2. Mid-Left Plume */}
            <g>
              <ellipse cx="26" cy="40" rx="14" ry="9.5" transform="rotate(-45 26 40)" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="26" cy="40" rx="7.5" ry="6" transform="rotate(-45 26 40)" fill="url(#ocellusGold)" />
              <ellipse cx="26" cy="40" rx="5" ry="4" transform="rotate(-45 26 40)" fill="url(#ocellusBlue)" />
              <circle cx="26" cy="40" r="2.2" fill="#38BDF8" />
              <circle cx="25.2" cy="39.2" r="0.9" fill="#FFFFFF" />
            </g>

            {/* 3. Upper-Left Plume */}
            <g>
              <ellipse cx="42" cy="26" rx="14.5" ry="10" transform="rotate(-22 42 26)" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="42" cy="26" rx="8" ry="6.2" transform="rotate(-22 42 26)" fill="url(#ocellusGold)" />
              <ellipse cx="42" cy="26" rx="5.2" ry="4.2" transform="rotate(-22 42 26)" fill="url(#ocellusBlue)" />
              <circle cx="42" cy="26" r="2.4" fill="#38BDF8" />
              <circle cx="41.2" cy="25.2" r="1" fill="#FFFFFF" />
            </g>

            {/* 4. Center-Top Plume (Tallest & Grandest) */}
            <g>
              <ellipse cx="60" cy="18" rx="15" ry="10.5" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="60" cy="18" rx="8.5" ry="6.5" fill="url(#ocellusGold)" />
              <ellipse cx="60" cy="18" rx="5.5" ry="4.5" fill="url(#ocellusBlue)" />
              <circle cx="60" cy="18" r="2.6" fill="#38BDF8" />
              <circle cx="59.2" cy="17.2" r="1.1" fill="#FFFFFF" />
            </g>

            {/* 5. Upper-Right Plume */}
            <g>
              <ellipse cx="78" cy="26" rx="14.5" ry="10" transform="rotate(22 78 26)" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="78" cy="26" rx="8" ry="6.2" transform="rotate(22 78 26)" fill="url(#ocellusGold)" />
              <ellipse cx="78" cy="26" rx="5.2" ry="4.2" transform="rotate(22 78 26)" fill="url(#ocellusBlue)" />
              <circle cx="78" cy="26" r="2.4" fill="#38BDF8" />
              <circle cx="77.2" cy="25.2" r="1" fill="#FFFFFF" />
            </g>

            {/* 6. Mid-Right Plume */}
            <g>
              <ellipse cx="94" cy="40" rx="14" ry="9.5" transform="rotate(45 94 40)" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="94" cy="40" rx="7.5" ry="6" transform="rotate(45 94 40)" fill="url(#ocellusGold)" />
              <ellipse cx="94" cy="40" rx="5" ry="4" transform="rotate(45 94 40)" fill="url(#ocellusBlue)" />
              <circle cx="94" cy="40" r="2.2" fill="#38BDF8" />
              <circle cx="93.2" cy="39.2" r="0.9" fill="#FFFFFF" />
            </g>

            {/* 7. Far Right Plume */}
            <g>
              <ellipse cx="102" cy="58" rx="13" ry="9" transform="rotate(68 102 58)" fill="url(#featherPlumeGrad)" stroke="#064E3B" strokeWidth="2" />
              <ellipse cx="102" cy="58" rx="7" ry="5.5" transform="rotate(68 102 58)" fill="url(#ocellusGold)" />
              <ellipse cx="102" cy="58" rx="4.5" ry="3.5" transform="rotate(68 102 58)" fill="url(#ocellusBlue)" />
              <circle cx="102" cy="58" r="2" fill="#38BDF8" />
              <circle cx="101.2" cy="57.2" r="0.8" fill="#FFFFFF" />
            </g>
          </motion.g>
        )}

        {/* ============================================================== */}
        {/* 2. TOP CROWN CREST (PEACOCK CROWN)                            */}
        {/* ============================================================== */}
        <g>
          {/* Left Crest Feather */}
          <path d="M60 44 C52 35 47 32 45 28" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="27" r="5" fill="#0284C7" stroke="#064E3B" strokeWidth="1.8" />
          <circle cx="44" cy="27" r="2.3" fill="#FBBF24" />

          {/* Center Crest Feather */}
          <path d="M60 42 C60 32 60 28 60 23" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="22" r="6" fill="#0284C7" stroke="#064E3B" strokeWidth="1.8" />
          <circle cx="60" cy="22" r="2.8" fill="#FBBF24" />

          {/* Right Crest Feather */}
          <path d="M60 44 C68 35 73 32 75 28" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="76" cy="27" r="5" fill="#0284C7" stroke="#064E3B" strokeWidth="1.8" />
          <circle cx="76" cy="27" r="2.3" fill="#FBBF24" />
        </g>

        {/* ============================================================== */}
        {/* 3. BOLD ORANGE FEET                                            */}
        {/* ============================================================== */}
        <ellipse cx="50" cy="103" rx="6.5" ry="3.5" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.8" />
        <ellipse cx="70" cy="103" rx="6.5" ry="3.5" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.8" />

        {/* ============================================================== */}
        {/* 4. MAIN ROUND CHUNKY EMERALD BODY                              */}
        {/* ============================================================== */}
        <ellipse
          cx="60"
          cy="74"
          rx="35"
          ry="28"
          fill="url(#mayurBodyGrad)"
          stroke="#064E3B"
          strokeWidth="3"
        />

        {/* ============================================================== */}
        {/* 5. ROYAL BLUE BELLY / CHEST SHIELD                             */}
        {/* ============================================================== */}
        <path
          d="M42 72 C42 90 50 96 60 96 C70 96 78 90 78 72 C71 68 49 68 42 72 Z"
          fill="url(#mayurBellyGrad)"
          stroke="#0369A1"
          strokeWidth="1.8"
        />

        {/* Subtle Belly Feather Pattern Texture */}
        <path d="M52 80 Q60 83 68 80" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M55 86 Q60 88 65 86" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

        {/* ============================================================== */}
        {/* 6. BIG SIDE WINGS (WITH WAVING ANIMATION)                      */}
        {/* ============================================================== */}
        {isWaving ? (
          <>
            {/* Left Resting Wing */}
            <path
              d="M26 71 C22 81 27 90 37 90 C34 83 31 77 26 71 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="2.5"
            />
            {/* Right Animated Waving Wing */}
            <motion.path
              d="M90 68 C100 56 105 70 94 82 C92 76 90 71 90 68 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="2.5"
              animate={{ rotate: [-8, 12, -8], y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              style={{ transformOrigin: '90px 72px' }}
            />
          </>
        ) : (
          <>
            {/* Left Wing */}
            <path
              d="M26 71 C22 81 27 90 37 90 C34 83 31 77 26 71 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="2.5"
            />
            {/* Right Wing */}
            <path
              d="M94 71 C98 81 93 90 83 90 C86 83 89 77 94 71 Z"
              fill="#047857"
              stroke="#064E3B"
              strokeWidth="2.5"
            />
          </>
        )}

        {/* ============================================================== */}
        {/* 7. GIANT BOLD SPARKLING EYES (DUOLINGO STYLE)                  */}
        {/* ============================================================== */}
        {/* Left Eye */}
        <circle cx="48" cy="62" r="10.5" fill="#FFFFFF" stroke="#064E3B" strokeWidth="2.5" />
        <circle cx="50" cy="62" r="6.5" fill="#1E293B" />
        <circle cx="47.5" cy="59.5" r="2.8" fill="#FFFFFF" />
        <circle cx="52" cy="64.5" r="1.4" fill="#FFFFFF" />

        {/* Right Eye */}
        <circle cx="72" cy="62" r="10.5" fill="#FFFFFF" stroke="#064E3B" strokeWidth="2.5" />
        <circle cx="70" cy="62" r="6.5" fill="#1E293B" />
        <circle cx="67.5" cy="59.5" r="2.8" fill="#FFFFFF" />
        <circle cx="72" cy="64.5" r="1.4" fill="#FFFFFF" />

        {/* ============================================================== */}
        {/* 8. CUTE PINK BLUSH CHEEKS                                      */}
        {/* ============================================================== */}
        <circle cx="36" cy="72" r="5" fill="#F472B6" opacity="0.8" />
        <circle cx="84" cy="72" r="5" fill="#F472B6" opacity="0.8" />

        {/* ============================================================== */}
        {/* 9. BIG CHUNKY SAFFRON BEAK                                     */}
        {/* ============================================================== */}
        <path
          d="M51 65 Q60 63 69 65 Q60 80 51 65 Z"
          fill="url(#mayurBeakGrad)"
          stroke="#B45309"
          strokeWidth="2"
        />
        {/* Beak Highlight */}
        <path d="M54 66 Q60 65 66 66" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

