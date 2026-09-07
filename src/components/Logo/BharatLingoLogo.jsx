import BharatMascot from '../Mascot/BharatMascot'

export default function BharatLingoLogo({ size = 'medium', showText = true, className = '' }) {
  const sizeMap = {
    compact: {
      icon: 36,
      textStyle: 'text-[22px]',
      subStyle: 'text-[10px] tracking-[1.4px]',
      gap: 'gap-2.5',
    },
    small: {
      icon: 42,
      textStyle: 'text-[25px]',
      subStyle: 'text-[11px] tracking-[1.6px]',
      gap: 'gap-3',
    },
    medium: {
      icon: 48,
      textStyle: 'text-[28px] sm:text-[30px]',
      subStyle: 'text-[12px] tracking-[2px]',
      gap: 'gap-3.5',
    },
    large: {
      icon: 56,
      textStyle: 'text-[32px] sm:text-[36px]',
      subStyle: 'text-[13px] tracking-[2.5px]',
      gap: 'gap-4',
    },
  }

  const current = sizeMap[size] || sizeMap.medium

  return (
    <div className={`flex items-center ${current.gap} select-none cursor-pointer ${className}`}>
      {/* Official Mascot Character: Mayur (The Peacock) */}
      <div className="shrink-0 flex items-center justify-center">
        <BharatMascot size={current.icon} mood="waving" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          {/* Main Brand Title: 24px, Black/ExtraBold, -0.5px letter spacing */}
          <div className="flex items-center">
            <span
              className={`font-black ${current.textStyle} text-[#25231F] dark:text-white leading-none`}
              style={{ letterSpacing: '-0.5px' }}
            >
              BHARAT<span className="text-[#0B8F62] dark:text-[#34D399]">LINGO</span>
            </span>
          </div>
          {/* Subtitle: 11px/12px, Semibold, 1.5px/2px tracking, muted color */}
          <span
            className={`font-semibold uppercase text-slate-500 dark:text-slate-400 ${current.subStyle} mt-1 leading-none`}
          >
            Learn Indian Languages
          </span>
        </div>
      )}
    </div>
  )
}

