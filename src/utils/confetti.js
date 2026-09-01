// Zero-dependency HTML5 Canvas Confetti Burst

export function triggerConfetti() {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '99999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#0B8F62', '#2F9E69', '#F39A45', '#3B82F6', '#EC4899', '#8B5CF6', '#FACC15']
  const particleCount = 120
  const particles = []

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width * 0.5,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    })
  }

  let animationFrameId
  const startTime = Date.now()

  function render() {
    const elapsed = Date.now() - startTime
    if (elapsed > 2600) {
      cancelAnimationFrame(animationFrameId)
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas)
      }
      return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.45 // Gravity
      p.vx *= 0.98 // Air resistance
      p.rotation += p.rotationSpeed
      p.opacity = Math.max(0, 1 - elapsed / 2600)

      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()
}
