// Lightweight canvas confetti — zero dependencies, ~2KB.
// Usage: import { burstConfetti } from '@/utils/confetti'; burstConfetti()

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  spin: number
  life: number
}

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f87171', '#facc15']

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let rafId: number | null = null

function ensureCanvas(): void {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  const resize = (): void => {
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  window.addEventListener('resize', resize)
  resize()
}

function loop(): void {
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  particles = particles.filter((p) => p.life > 0)
  for (const p of particles) {
    p.vy += 0.18                // gravity
    p.vx *= 0.995
    p.x += p.vx
    p.y += p.vy
    p.rot += p.spin
    p.life -= 1
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
    ctx.restore()
  }
  if (particles.length > 0) {
    rafId = window.requestAnimationFrame(loop)
  } else {
    if (rafId) window.cancelAnimationFrame(rafId)
    rafId = null
  }
}

export interface BurstOptions {
  x?: number               // origin x in viewport coords; defaults to centre
  y?: number               // origin y in viewport coords; defaults to top third
  count?: number           // particle count
  spread?: number          // angle spread in radians
  power?: number           // initial velocity multiplier
}

export function burstConfetti(opts: BurstOptions = {}): void {
  if (typeof window === 'undefined') return
  ensureCanvas()
  const cx = opts.x ?? window.innerWidth / 2
  const cy = opts.y ?? window.innerHeight / 3
  const count = opts.count ?? 90
  const spread = opts.spread ?? Math.PI
  const power = opts.power ?? 1
  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread
    const speed = (Math.random() * 6 + 5) * power
    const color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#fff'
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 6 + 4,
      color,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      life: 100 + Math.floor(Math.random() * 40)
    })
  }
  if (!rafId) rafId = window.requestAnimationFrame(loop)
}

export function celebrateWin(): void {
  if (typeof window === 'undefined') return
  burstConfetti({ count: 140, power: 1.4 })
  window.setTimeout(() => burstConfetti({ x: window.innerWidth * 0.2, count: 80, power: 1.2 }), 250)
  window.setTimeout(() => burstConfetti({ x: window.innerWidth * 0.8, count: 80, power: 1.2 }), 500)
}

export function screenShake(durationMs = 500): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.add('shake')
  window.setTimeout(() => root.classList.remove('shake'), durationMs)
}
