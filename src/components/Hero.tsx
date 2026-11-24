'use client'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Radio,
  Send,
  Camera as Instagram,
  UsersRound as Facebook,
  CirclePlay as Youtube,
  Network,
  ScanLine,
  TrendingUp,
  Users,
  Play,
  Orbit,
  Activity,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { orb } from '@/data/orb'
import { rng } from '@/data/demo'
import { Brand } from './ui'
const Orb3D = dynamic(() => import('./Orb3D'), { ssr: false })
const nav = [
  ['pipeline', 'Pipeline'],
  ['emotions', 'Emotions'],
  ['audience', 'Audience'],
  ['trends', 'Trends'],
  ['network', 'Network'],
  ['narratives', 'Narratives'],
]
export function Header() {
  const [active, setActive] = useState('')
  const progress = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const tick = () => {
      const h = document.documentElement
      if (progress.current)
        progress.current.style.transform = `scaleX(${scrollY / Math.max(1, h.scrollHeight - innerHeight)})`
      const current = [...nav.map(([id]) => id), 'try-it', 'copilot', 'architecture']
        .reverse()
        .find((id) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < 170)
      setActive(current ?? '')
    }
    tick()
    window.addEventListener('scroll', tick, { passive: true })
    return () => window.removeEventListener('scroll', tick)
  }, [])
  return (
    <header className="header">
      <div className="scroll-progress" ref={progress} />
      <div className="shell nav-inner">
        <Brand />
        <nav aria-label="Sections" className="nav-links">
          {nav.map(([id, label]) => (
            <a key={id} className={active === id ? 'active' : ''} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <a className="nav-live" href="#try-it">
          <span className="status-dot" />
          Try it out{' '}
          <span className="rounded bg-[#153338] px-1.5 py-0.5 font-mono text-[8px] tracking-widest text-pulse">
            LIVE
          </span>
          <ArrowUpRight size={14} />
        </a>
        <a className="button primary nav-launch" href="#pipeline">
          Launch demo <ArrowRight size={14} />
        </a>
      </div>
    </header>
  )
}
const stars = (() => {
  const r = rng(5742)
  return Array.from({ length: 140 }, (_, i) => ({
    x: r() * 682,
    y: r() * 540,
    r: i % 17 === 0 ? 1.45 : r() * 0.8 + 0.19,
    o: r() * 0.55 + 0.17,
  }))
})()
const projected = orb.points.map((p) => {
  const xp = p.x * 0.94 + p.z * 0.342,
    zp = p.z * 0.94 - p.x * 0.342,
    yp = p.y * 0.97 - zp * 0.24
  const scale = 113 / (1 - zp * 0.104)
  return { x: 352 + xp * scale, y: 270 + yp * scale, z: zp, color: p.color, size: p.size }
})
function Orb() {
  const [live, setLive] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let supported: boolean | undefined
    const update = () => {
      if (!visible || motion.matches) {
        setLive(false)
        return
      }
      if (supported === undefined) {
        try {
          const gl = document.createElement('canvas').getContext('webgl2')
          supported = !!gl
          gl?.getExtension('WEBGL_lose_context')?.loseContext()
        } catch {
          supported = false
        }
      }
      setLive(supported)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        update()
      },
      { rootMargin: '100px' },
    )
    if (wrap.current) observer.observe(wrap.current)
    motion.addEventListener('change', update)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', update)
    }
  }, [])
  return (
    <div className="hero-art" ref={wrap} aria-hidden="true">
      <div className="art-nebula" data-depth="80" />
      <svg className="starfield" data-depth="37" viewBox="0 0 682 540" fill="none">
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={i % 8 === 0 ? '#aa88ff' : '#9be9ff'}
            opacity={s.o}
          />
        ))}
      </svg>
      <div className="orb-field" data-depth="48">
        <svg viewBox="0 0 682 540" fill="none" className="orb-svg">
          <defs>
            <radialGradient id="orbHaze">
              <stop stopColor="#7444e6" stopOpacity=".09" />
              <stop offset=".74" stopColor="#8359ff" stopOpacity=".06" />
              <stop offset="1" stopColor="#8359ff" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="orbOrbit"
              x1="126"
              y1="400"
              x2="574"
              y2="109"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#a76bff" stopOpacity=".25" />
              <stop offset=".52" stopColor="#6845c6" stopOpacity=".28" />
              <stop offset="1" stopColor="#34d8fa" stopOpacity=".55" />
            </linearGradient>
            <filter id="dotGlow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="3.1" result="halo" />
              <feMerge>
                <feMergeNode in="halo" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="orbGrid" width="29" height="29" patternUnits="userSpaceOnUse">
              <path
                d="M29 0H0V29"
                fill="none"
                stroke="#6087b2"
                strokeOpacity=".12"
                strokeWidth=".6"
              />
            </pattern>
            <radialGradient id="orbGridMask">
              <stop stopColor="white" stopOpacity=".8" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="orbMask">
              <ellipse cx="354" cy="269" rx="340" ry="256" fill="url(#orbGridMask)" />
            </mask>
          </defs>
          <rect width="682" height="540" fill="url(#orbGrid)" mask="url(#orbMask)" />
          <circle cx="352" cy="271" r="215" fill="url(#orbHaze)" />
          <circle
            cx="352"
            cy="270"
            r="204"
            stroke="#7967cc"
            strokeOpacity=".25"
            strokeDasharray="2 6"
          />
          <circle cx="352" cy="270" r="184" stroke="#8670d4" strokeOpacity=".24" />
          <ellipse
            cx="352"
            cy="275"
            rx="251"
            ry="65"
            transform="rotate(-22 352 275)"
            stroke="url(#orbOrbit)"
          />
          <ellipse
            cx="352"
            cy="275"
            rx="234"
            ry="76"
            transform="rotate(25 352 275)"
            stroke="url(#orbOrbit)"
            strokeDasharray="3 5"
          />
          <path d="M352 49V490M107 270H607" stroke="#665a9b" strokeDasharray="3 8" opacity=".32" />
          {orb.lines.map(({ from, to }, i) => {
            const a = projected[from],
              b = projected[to]
            return (
              <path
                key={i}
                d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`}
                stroke={a.color}
                strokeWidth=".68"
                opacity={a.z > 0.05 ? 0.4 : 0.15}
              />
            )
          })}
          {projected.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size * (p.z > 0.1 ? 1.04 : 0.73)}
              fill={p.color}
              opacity={p.z > 0.1 ? 0.94 : 0.39}
              filter={p.size > 2 ? 'url(#dotGlow)' : undefined}
            />
          ))}
          <g stroke="#73bdda" strokeWidth="1" opacity=".45">
            <path d="M83 111h12m-6-6v12m492 292h12m-6-6v12M127 406h9m-4.5-4.5v9M596 125h11m-5.5-5.5v11" />
          </g>
        </svg>
        {live && (
          <div className="webgl">
            <Orb3D />
          </div>
        )}
      </div>
      <div className="satellites" data-depth="102">
        <span className="sat s1">
          <b>𝕏</b>
          <small>X / 45%</small>
        </span>
        <span className="sat s2">
          <Send size={17} />
          <small>TELEGRAM</small>
        </span>
        <span className="sat s3">
          <Instagram size={18} />
        </span>
        <span className="sat s4">
          <Network size={17} />
          <small>06 CLUSTERS</small>
        </span>
        <span className="sat s5">
          <Facebook size={16} />
        </span>
        <span className="sat s6">
          <Youtube size={18} />
        </span>
        <span className="sat s7">
          <Orbit size={16} />
        </span>
      </div>
      <div className="orb-caption">
        <span className="status-dot" /> NETWORK FIELD <i /> <span>FIG 01</span>
      </div>
    </div>
  )
}
const stats = [
  { icon: ScanLine, label: 'POSTS ANALYZED', number: '12,480', detail: 'Across six platforms' },
  { icon: Users, label: 'USERS MAPPED', number: '150', detail: 'Anonymized nodes' },
  { icon: AudioLines, label: 'EMOTIONS DETECTED', number: '07', detail: 'Multilingual signals' },
  { icon: TrendingUp, label: 'TRENDS TRACKED', number: '20', detail: 'With 24h forecasts' },
]
function Count({ value }: { value: string }) {
  const [text, setText] = useState(value)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const goal = Number(value.replace(',', ''))
    let raf = 0
    const t = performance.now()
    const loop = (now: number) => {
      const p = Math.min(1, (now - t) / 950)
      const n = Math.round(goal * (1 - (1 - p) ** 3))
      setText(value.length === 2 ? String(n).padStart(2, '0') : n.toLocaleString('en-US'))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{text}</>
}
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="shell hero-inner">
        <Orb />
        <div className="hero-copy" data-depth="-22">
          <div className="hero-kicker">
            <span className="status-dot" /> NARRATIVE INTELLIGENCE PLATFORM
          </div>
          <h1>
            Hear the whole <br />
            <span>audience.</span>
          </h1>
          <p>
            Sentiment, demographics, trends, and influence.
            <br className="hidden sm:block" /> Four signals. One bigger picture.
          </p>
          <div className="hero-actions">
            <a className="button primary magnetic" href="#pipeline">
              <Play size={15} fill="currentColor" /> Launch live demo <ArrowRight size={17} />
            </a>
            <a className="button secondary" href="#architecture">
              See the architecture <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="hero-note">
            <Radio size={14} /> <span>DEMO DATA</span>
            <i /> NOVA X1 LAUNCH · 30-DAY REPLAY
          </div>
        </div>
        <div className="metric-strip">
          {stats.map(({ icon: Icon, label, number, detail }) => (
            <div className="metric" key={label}>
              <span className="metric-icon">
                <Icon size={19} />
              </span>
              <div>
                <div className="metric-label">{label}</div>
                <strong>
                  <Count value={number} />
                </strong>
                <small>{detail}</small>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-end">
          <a href="#pipeline">
            <ArrowDown size={13} /> EXPLORE THE SIGNALS
          </a>
          <span>
            <Activity size={13} /> SYSTEM ONLINE <i /> SIMULATION ACTIVE
          </span>
        </div>
      </div>
    </section>
  )
}
