import BharatMascot from '../Mascot/BharatMascot'

export default function BharatLingoLogo({ size = 'medium', showText = true, className = '' }) {
  const sizeMap = {
    compact: { icon: 32, text: 'text-lg', sub: 'text-[9px]' },
    small: { icon: 36, text: 'text-lg', sub: 'text-[9px]' },
    medium: { icon: 40, text: 'text-xl', sub: 'text-[10px]' },
    large: { icon: 54, text: 'text-2xl', sub: 'text-xs' },
  }

  const currentSize = sizeMap[size] || sizeMap.medium

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer ${className}`}>
      {/* Official Mascot Character: Mayur (The Peacock) */}
      <BharatMascot size={currentSize.icon} mood="waving" />

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className={`font-black tracking-tight ${currentSize.text} text-[#25231F] dark:text-white leading-none`}>
              BHARAT<span className="text-[#0B8F62] dark:text-[#34D399]">LINGO</span>
            </span>
          </div>
          <span className={`font-extrabold uppercase tracking-wider text-[#77736B] dark:text-slate-400 ${currentSize.sub} mt-1`}>
            Learn Indian Languages
          </span>
        </div>
      )}
    </div>
  )
}
