import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, RotateCcw, Check, Sparkles, ArrowRight } from 'lucide-react'
import { AudioService } from '../../services/audio/AudioService'
import { getStrokesForCharacter } from '../../data/strokeData'
import { useTheme } from '../../services/themeContext'

export default function LetterWritingCanvas({
  character = 'अ',
  roman = 'a',
  example = 'अनार (Pomegranate)',
  languageId = 'hi',
  onMastered,
  onNext,
  currentIndex = 0,
  totalCount = 1,
  onClose,
  showTopBar = true,
}) {
  const { t } = useTheme()
  const strokes = getStrokesForCharacter(character, languageId)
  const hasStrokes = Boolean(strokes && strokes.length > 0)
  
  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0)
  const [strokeProgress, setStrokeProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const [isTracing, setIsTracing] = useState(false)

  const svgRef = useRef(null)
  const activePathRef = useRef(null)
  const isTracingRef = useRef(false)
  const pathSamplesRef = useRef([])

  // Reset when character changes
  useEffect(() => {
    setActiveStrokeIndex(0)
    setStrokeProgress(0)
    setIsCompleted(false)
    setSparkles([])
    isTracingRef.current = false
    setIsTracing(false)
  }, [character])

  // Memoized synchronous SVG path measurement & high-density sampling
  const activeStroke = strokes[activeStrokeIndex]

  const activePathData = useMemo(() => {
    if (!activeStroke || activeStroke.type === 'dot') {
      return { totalLength: 0, samples: [] }
    }
    if (typeof document === 'undefined') {
      return { totalLength: 100, samples: [] }
    }

    try {
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      pathEl.setAttribute('d', activeStroke.path)
      const totalLength = pathEl.getTotalLength() || 100
      const samples = []
      const sampleCount = 80
      for (let i = 0; i <= sampleCount; i++) {
        const len = (i / sampleCount) * totalLength
        const pt = pathEl.getPointAtLength(len)
        samples.push({ x: pt.x, y: pt.y, t: i / sampleCount, len })
      }
      return { totalLength, samples }
    } catch {
      return { totalLength: 100, samples: [] }
    }
  }, [activeStroke])

  // Current position of the guided arrow bead along the active stroke
  const activeStrokePos = useMemo(() => {
    if (!activeStroke?.start) return { x: 150, y: 150 }
    if (
      activeStroke.type === 'dot' ||
      strokeProgress === 0 ||
      !activePathData?.samples ||
      activePathData.samples.length === 0
    ) {
      return activeStroke.start
    }
    const sampleIdx = Math.min(
      Math.max(0, Math.floor(strokeProgress * (activePathData.samples.length - 1))),
      activePathData.samples.length - 1
    )
    return activePathData.samples[sampleIdx] || activeStroke.start
  }, [activeStroke, strokeProgress, activePathData])

  // Play audio pronunciation
  const handlePlayAudio = useCallback(() => {
    AudioService.speak(character, languageId)
  }, [character, languageId])

  // Auto-play audio on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayAudio()
    }, 300)
    return () => clearTimeout(timer)
  }, [character, handlePlayAudio])

  // Reset current letter to practice again
  const handleReset = () => {
    setActiveStrokeIndex(0)
    setStrokeProgress(0)
    setIsCompleted(false)
    setSparkles([])
    isTracingRef.current = false
    setIsTracing(false)
  }

  // Trigger spark particles on stroke completion
  const spawnSparkle = (x, y) => {
    const id = Date.now() + Math.random()
    setSparkles((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id))
    }, 800)
  }

  // Advance to next stroke or finish character
  const completeCurrentStroke = useCallback(() => {
    const currentStroke = strokes[activeStrokeIndex]
    if (currentStroke?.end) {
      spawnSparkle(currentStroke.end.x, currentStroke.end.y)
    }

    try {
      AudioService.playChime(true)
    } catch {}

    if (activeStrokeIndex + 1 >= strokes.length) {
      // Completed all strokes for this letter
      setActiveStrokeIndex(strokes.length)
      setStrokeProgress(1)
      setIsCompleted(true)
      isTracingRef.current = false
      setIsTracing(false)

      // Audio feedback & speak character
      setTimeout(() => {
        handlePlayAudio()
      }, 250)
    } else {
      // Advance to next stroke
      setActiveStrokeIndex((prev) => prev + 1)
      setStrokeProgress(0)
      isTracingRef.current = false
      setIsTracing(false)
    }
  }, [activeStrokeIndex, strokes, handlePlayAudio])

  // Convert client pointer coordinate to SVG coordinate space
  const getSvgCoordinates = (e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    return { x: svgP.x, y: svgP.y }
  }

  // Handle pointer down (mouse click / touch)
  const handlePointerDown = (e) => {
    if (isCompleted || activeStrokeIndex >= strokes.length) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()

    const currentStroke = strokes[activeStrokeIndex]
    const { x, y } = getSvgCoordinates(e)

    // If it's a dot stroke, clicking near it completes it immediately
    if (currentStroke?.type === 'dot') {
      const dist = Math.hypot(x - currentStroke.start.x, y - currentStroke.start.y)
      if (dist < 60) {
        completeCurrentStroke()
      }
      return
    }

    const samples = activePathData.samples
    if (!samples || samples.length === 0) return

    // Find distance to start or closest point on first half of stroke
    const startPoint = samples[0]
    const distToStart = Math.hypot(x - startPoint.x, y - startPoint.y)

    let closestDist = Infinity
    let closestT = 0
    for (const sample of samples) {
      const d = Math.hypot(x - sample.x, y - sample.y)
      if (d < closestDist) {
        closestDist = d
        closestT = sample.t
      }
    }

    // Generous start zone: within 80px of start point OR near curve with progress <= 0.4
    if (distToStart <= 80 || (closestDist <= 75 && closestT <= 0.45)) {
      isTracingRef.current = true
      setIsTracing(true)
      setStrokeProgress(Math.max(0, closestT))
      try {
        e.target.setPointerCapture?.(e.pointerId)
      } catch {}
    }
  }

  // Handle pointer move (smooth, forgiving auto-correct along path)
  const handlePointerMove = (e) => {
    if (isCompleted || activeStrokeIndex >= strokes.length) return

    // Ensure mouse button is down for mouse interactions
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      if (isTracingRef.current) {
        isTracingRef.current = false
        setIsTracing(false)
        if (strokeProgress < 0.65) setStrokeProgress(0)
      }
      return
    }

    const { x, y } = getSvgCoordinates(e)
    const samples = activePathData.samples
    if (!samples || samples.length === 0) return

    // If mouse button is held down and user drags near the start, auto-start tracing
    if (!isTracingRef.current) {
      const startPt = samples[0]
      if (Math.hypot(x - startPt.x, y - startPt.y) <= 70) {
        isTracingRef.current = true
        setIsTracing(true)
        try {
          e.target.setPointerCapture?.(e.pointerId)
        } catch {}
      } else {
        return
      }
    }

    const currentStroke = strokes[activeStrokeIndex]
    if (currentStroke?.type === 'dot') return

    // Find the closest point on the stroke curve to the cursor
    let minDist = Infinity
    let closestT = 0

    for (const sample of samples) {
      const d = Math.hypot(x - sample.x, y - sample.y)
      if (d < minDist) {
        minDist = d
        closestT = sample.t
      }
    }

    // Generous tolerance (up to 85px from curve) & smooth forward progression
    if (minDist <= 85) {
      if (closestT >= strokeProgress - 0.18) {
        const newProgress = Math.max(strokeProgress, closestT)
        setStrokeProgress(newProgress)

        // Snap to 100% when reaching 80% of the stroke
        if (newProgress >= 0.80) {
          completeCurrentStroke()
        }
      }
    }
  }

  // Handle pointer up / mouse button release
  const handlePointerUp = (e) => {
    if (isCompleted) return
    isTracingRef.current = false
    setIsTracing(false)

    try {
      if (e?.pointerId && e?.target?.releasePointerCapture) {
        e.target.releasePointerCapture(e.pointerId)
      }
    } catch {}

    // Snap completion if user dragged past 65%
    if (strokeProgress >= 0.65) {
      completeCurrentStroke()
    } else {
      setStrokeProgress(0)
    }
  }

  // When user clicks the big green CHECK button
  const handleCheck = () => {
    if (!isCompleted) return

    try {
      AudioService.playVictory()
    } catch {}

    if (onMastered) {
      onMastered(character, 100)
    }

    if (onNext) {
      onNext()
    }
  }


  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between select-none">
      {/* ── TOP HEADER: Progress Bar & Exit ── */}
      {showTopBar && (
        <div className="flex items-center gap-3 mb-4 w-full">
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('close')}
            >
              ✕
            </button>
          )}

          {/* Duolingo Pill Progress Bar */}
          <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-[#58CC02] rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(10, ((currentIndex + (isCompleted ? 1 : 0)) / Math.max(1, totalCount)) * 100)}%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('reset_letter') || 'Reset Letter'}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}

      {/* ── HEADER ROW: TITLE & CHARACTER PREVIEW ── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-left">
          <h2 className="text-lg sm:text-xl font-black text-[#25231F] dark:text-white tracking-tight leading-tight">
            {t('trace_character') || 'Trace the character'}
          </h2>
          {example && (
            <p className="text-xs text-[#77736B] dark:text-slate-400 font-medium mt-0.5">
              {t('example') || 'Example'}: <span className="font-bold text-[#25231F] dark:text-slate-200">{example}</span>
            </p>
          )}
        </div>

        {/* Compact Character & Audio Speaker Capsule + Reset Button */}
        <div className="flex items-center gap-1.5 bg-[#F7F5EF] dark:bg-slate-800/90 p-1.5 rounded-2xl border border-[#E8E6E0] dark:border-slate-700/70 shadow-xs shrink-0">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="w-8 h-8 rounded-xl bg-[#1CB0F6] hover:bg-[#0ea5e9] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
            title={t('listen_pronunciation') || 'Listen to character pronunciation'}
          >
            <Volume2 size={16} className="fill-current" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
            title={t('reset_letter') || 'Reset Letter'}
          >
            <RotateCcw size={15} />
          </button>
          <div className="flex flex-col text-left pr-1 pl-1">
            <span className="text-2xl font-black text-[#25231F] dark:text-white leading-none">
              {character}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 mt-0.5 leading-none">
              {roman}
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN DUOLINGO TRACING CANVAS OR UNAVAILABLE NOTICE ── */}
      <div className="relative w-full aspect-square max-w-[270px] sm:max-w-[290px] mx-auto bg-slate-50 dark:bg-slate-950/70 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-inner p-4 flex flex-col items-center justify-center text-center overflow-hidden touch-none">
        {!hasStrokes ? (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-6xl sm:text-7xl font-black text-[#25231F] dark:text-white mb-2 select-none">
              {character}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-400 mb-3">
              {roman}
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
              <span>{t('tracing_unavailable_character') || 'Tracing unavailable for this character'}</span>
            </div>
            <p className="text-[11px] text-[#77736B] dark:text-slate-400 max-w-[210px] leading-relaxed">
              {t('writing_unavailable_msg') || 'Interactive writing practice is not yet available for this script.'}
            </p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 300 300"
            className="w-full h-full cursor-crosshair select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Subtle Duolingo Grid Crosshairs */}
            <line
              x1="150"
              y1="25"
              x2="150"
              y2="275"
              stroke="#CBD5E1"
              className="dark:stroke-slate-800/80"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <line
              x1="25"
              y1="150"
              x2="275"
              y2="150"
              stroke="#CBD5E1"
              className="dark:stroke-slate-800/80"
              strokeWidth="2"
              strokeDasharray="5 5"
            />

            {/* 1. Base Outline of ALL strokes (Clearly visible background guide) */}
            {strokes.map((s, idx) => (
              <path
                key={`bg-${idx}`}
                d={s.path}
                stroke="#CBD5E1"
                className="dark:stroke-white/20"
                strokeWidth={s.type === 'dot' ? '26' : '30'}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={s.type === 'dot' ? '#CBD5E1' : 'none'}
              />
            ))}

            {/* 2. Completed Strokes (Solid Vivid Blue) */}
            {strokes.map((s, idx) => {
              if (idx < activeStrokeIndex || isCompleted) {
                return (
                  <path
                    key={`done-${idx}`}
                    d={s.path}
                    stroke="#1CB0F6"
                    strokeWidth={s.type === 'dot' ? '26' : '30'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={s.type === 'dot' ? '#1CB0F6' : 'none'}
                  />
                )
              }
              return null
            })}

            {/* 3. Active Stroke Guide (Animated dashed line + Snapped auto-correct fill) */}
            {activeStroke && !isCompleted && (
              <g>
                {/* Invisible reference path for measurement */}
                <path
                  ref={activePathRef}
                  d={activeStroke.path}
                  stroke="transparent"
                  strokeWidth="40"
                  fill="none"
                />

                {/* Pulsing Guide Track */}
                <path
                  d={activeStroke.path}
                  stroke="#1CB0F6"
                  strokeWidth={activeStroke.type === 'dot' ? '26' : '30'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="14 10"
                  fill={activeStroke.type === 'dot' ? '#1CB0F6' : 'none'}
                  opacity={activeStroke.type === 'dot' ? '0.4' : '0.6'}
                  className="animate-pulse"
                />

                {/* Progressively filled path while user is dragging */}
                {strokeProgress > 0 && activeStroke.type !== 'dot' && (
                  <path
                    d={activeStroke.path}
                    stroke="#1CB0F6"
                    strokeWidth="30"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{
                      strokeDasharray: activePathData.totalLength,
                      strokeDashoffset: activePathData.totalLength * (1 - strokeProgress),
                    }}
                  />
                )}
              </g>
            )}

            {/* 4. Draggable Origin Arrow Bead */}
            {activeStroke && !isCompleted && activeStroke.start && (
              <g
                transform={`translate(${
                  activeStroke.type === 'dot'
                    ? activeStroke.start.x
                    : activeStrokePos.x
                }, ${
                  activeStroke.type === 'dot'
                    ? activeStroke.start.y
                    : activeStrokePos.y
                })`}
                className="cursor-grab active:cursor-grabbing transition-transform duration-75"
              >
                <circle
                  r="24"
                  fill="#1CB0F6"
                  opacity="0.25"
                  className="animate-ping"
                />
                <circle
                  r="18"
                  fill="#1CB0F6"
                  className="shadow-lg filter drop-shadow-md"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="16"
                  fontWeight="900"
                  className="pointer-events-none select-none font-sans"
                >
                  {activeStroke.arrow || '↓'}
                </text>
              </g>
            )}

            {/* 5. Destination End Arrow Marker */}
            {activeStroke && !isCompleted && activeStroke.type !== 'dot' && activeStroke.end && (
              <circle
                cx={activeStroke.end.x}
                cy={activeStroke.end.y}
                r="7"
                fill="#1CB0F6"
                opacity="0.4"
              />
            )}

            {/* 6. Sparkle particle bursts */}
            {sparkles.map((sp) => (
              <g key={sp.id} transform={`translate(${sp.x}, ${sp.y})`}>
                <circle r="12" fill="#FBBF24" opacity="0.8" className="animate-ping" />
                <circle r="6" fill="#10B981" />
              </g>
            ))}
          </svg>
        )}

        {/* Full Letter Complete Glow Overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-[#1CB0F6]/10 flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-14 h-14 rounded-full bg-[#58CC02] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2"
              >
                <Check size={32} strokeWidth={3.5} />
              </motion.div>
              <span className="text-sm font-black text-[#58CC02] uppercase tracking-wider">
                {t('nicely_traced') || 'Nicely Traced!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM DUOLINGO ACTION BAR: CHECK / NEXT BUTTON ── */}
      <div className="pt-3">
        {!hasStrokes ? (
          <button
            type="button"
            onClick={onNext || handlePlayAudio}
            className="w-full py-3 rounded-2xl uppercase tracking-wider font-black text-sm flex items-center justify-center gap-2 bg-[#1CB0F6] hover:bg-[#0ea5e9] active:translate-y-0.5 text-white shadow-[0_3px_0_#0284c7] cursor-pointer transition-all"
          >
            <span>{t('next_letter') || 'Next Letter'}</span>
            <ArrowRight size={16} strokeWidth={3} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!isCompleted}
            className={`w-full py-3 rounded-2xl uppercase tracking-wider font-black text-sm flex items-center justify-center gap-2 transition-all ${
              isCompleted
                ? 'bg-[#58CC02] hover:bg-[#61E002] active:translate-y-0.5 active:shadow-none text-white shadow-[0_3px_0_#46a302] cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{t('check_answer') || t('continue') || 'Check'}</span>
            {isCompleted && <ArrowRight size={16} strokeWidth={3} />}
          </button>
        )}
      </div>
    </div>
  )
}
