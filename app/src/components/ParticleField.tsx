import { useEffect, useRef } from 'react'
import { ATOM_PALETTE } from '../theme/atomPalette'

const COUNT = 96
const EASTER_DURATION = 4.8
const EASTER_MAX_PARTICLES = 220

type P = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  alphaMax: number
  phase: number
  freq: number
  color: string
}

type EasterParticle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  color: string
  tx: number
  ty: number
  history: Array<{ x: number; y: number }>
}

function spawn(W: number, H: number, anywhere: boolean): P {
  return {
    x: Math.random() * W,
    y: anywhere ? Math.random() * H : H + Math.random() * 50,
    vx: (Math.random() - 0.5) * 0.14,
    vy: -(0.2 + Math.random() * 0.28),
    r: 0.3 + Math.pow(Math.random(), 2.2) * 2.8,
    alpha: 0,
    alphaMax: 0.04 + Math.pow(Math.random(), 1.4) * 0.52,
    phase: Math.random() * Math.PI * 2,
    freq: 0.28 + Math.random() * 0.44,
    color: ATOM_PALETTE[Math.floor(Math.random() * ATOM_PALETTE.length)].color,
  }
}

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let W = 0
    let H = 0
    let logoBurstClickCount = 0
    let easterStartTime = -1
    let easterParticles: EasterParticle[] = []

    const setSize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    setSize()
    window.addEventListener('resize', setSize)

    const ps: P[] = Array.from({ length: COUNT }, () => spawn(W, H, true))

    const buildReactTargets = () => {
      const offscreen = document.createElement('canvas')
      offscreen.width = W
      offscreen.height = H
      const offctx = offscreen.getContext('2d')
      if (!offctx) {
        return [] as Array<{ x: number; y: number; color: string }>
      }

      const fontSize = Math.max(72, Math.min(W * 0.16, 180))
  const contentAreaRect = document.querySelector('.content-area')?.getBoundingClientRect()
  const lowerBandTop = contentAreaRect ? Math.min(H, Math.max(0, contentAreaRect.bottom)) : H * 0.52
  const targetY = lowerBandTop + (H - lowerBandTop) * 0.5
      offctx.clearRect(0, 0, W, H)
      offctx.font = `800 ${fontSize}px Sora, Manrope, sans-serif`
      offctx.textAlign = 'center'
      offctx.textBaseline = 'middle'
      offctx.fillStyle = '#ffffff'
  offctx.fillText('REACT', W * 0.5, targetY)

      const image = offctx.getImageData(0, 0, W, H)
      const step = Math.max(4, Math.floor(fontSize / 24))
      const points: Array<{ x: number; y: number; color: string }> = []
      let colorIndex = 0

      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4 + 3
          if (image.data[i] > 110) {
            points.push({
              x,
              y,
              color: ATOM_PALETTE[colorIndex % ATOM_PALETTE.length].color,
            })
            colorIndex += 1
          }
        }
      }

      for (let i = points.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = points[i]
        points[i] = points[j]
        points[j] = tmp
      }

      return points.slice(0, EASTER_MAX_PARTICLES)
    }

    const startEaster = (nowSec: number) => {
      easterStartTime = nowSec
      const targets = buildReactTargets()
      easterParticles = targets.map((target) => {
        const fromSide = Math.floor(Math.random() * 4)
        let sx = Math.random() * W
        let sy = Math.random() * H

        if (fromSide === 0) {
          sx = -40 - Math.random() * 60
        } else if (fromSide === 1) {
          sx = W + 40 + Math.random() * 60
        } else if (fromSide === 2) {
          sy = -40 - Math.random() * 60
        } else {
          sy = H + 40 + Math.random() * 60
        }

        return {
          x: sx,
          y: sy,
          vx: 0,
          vy: 0,
          r: 0.9 + Math.random() * 1.7,
          alpha: 0,
          color: target.color,
          tx: target.x,
          ty: target.y,
          history: Array.from({ length: 7 }, () => ({ x: sx, y: sy })),
        }
      })
    }

    const handleLogoBurstClick = () => {
      logoBurstClickCount += 1
      if (logoBurstClickCount >= 3) {
        logoBurstClickCount = 0
        startEaster(performance.now() * 0.001)
      }
    }

    window.addEventListener('logo-burst-click', handleLogoBurstClick)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (document.visibilityState !== 'visible') return

      const t = now * 0.001
      ctx.clearRect(0, 0, W, H)

      for (const p of ps) {
        p.x += p.vx + Math.sin(t * p.freq + p.phase) * 0.07
        p.y += p.vy

        if (p.y < -14 || p.x < -24 || p.x > W + 24) {
          Object.assign(p, spawn(W, H, false))
          continue
        }

        // Fade in from bottom, hold, fade out near top
        const fadeIn = Math.min(1, (H - p.y) / (H * 0.12))
        const fadeOut = Math.min(1, p.y / (H * 0.08))
        const tgt = p.alphaMax * Math.min(fadeIn, fadeOut)
        p.alpha += (tgt - p.alpha) * 0.035

        if (p.alpha < 0.004) continue

        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.2832)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      if (easterStartTime >= 0) {
        const easterElapsed = t - easterStartTime
        const easterProgress = easterElapsed / EASTER_DURATION

        if (easterProgress >= 1) {
          easterStartTime = -1
          easterParticles = []
        } else {
          const appear = Math.min(1, easterProgress / 0.28)
          const hold = 1 - Math.max(0, (easterProgress - 0.82) / 0.18)
          const visibility = Math.min(1, appear) * Math.max(0, hold)

          easterParticles.forEach((particle, i) => {
            const dx = particle.tx - particle.x
            const dy = particle.ty - particle.y
            const pull = 0.012 + (1 - easterProgress) * 0.018

            particle.vx = (particle.vx + dx * pull) * 0.84
            particle.vy = (particle.vy + dy * pull) * 0.84

            particle.x += particle.vx + Math.sin(t * 6 + i * 0.31) * 0.1
            particle.y += particle.vy + Math.cos(t * 5 + i * 0.27) * 0.08
            particle.alpha += (visibility - particle.alpha) * 0.14

            particle.history.unshift({ x: particle.x, y: particle.y })
            if (particle.history.length > 7) {
              particle.history.pop()
            }

            for (let h = 1; h < particle.history.length; h += 1) {
              const a = particle.history[h - 1]
              const b = particle.history[h]
              const trailAlpha = particle.alpha * (1 - h / particle.history.length) * 0.55
              if (trailAlpha <= 0.004) {
                continue
              }
              ctx.globalAlpha = trailAlpha
              ctx.strokeStyle = particle.color
              ctx.lineWidth = 0.8 + (1 - h / particle.history.length) * 1.4
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }

            ctx.globalAlpha = particle.alpha
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.r, 0, 6.2832)
            ctx.fill()
          })
        }
      }

      ctx.globalAlpha = 1
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setSize)
      window.removeEventListener('logo-burst-click', handleLogoBurstClick)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
