'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bot,
  Braces,
  Database,
  Fingerprint,
  GitFork,
  LockKeyhole,
  Radar as RadarIcon,
  Radio,
  Send,
  Shield,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import {
  communities,
  copilotPrompts,
  EMOTIONS,
  getEmotionSeries,
  getTopTrends,
  leaders,
  narratives,
} from '@/data/demo'
import { usePulse } from '@/lib/store'
import { Donut, Spark } from './Signals'
import { Brand, CardTitle, Citation, Reveal, SectionTitle } from './ui'
export function Narratives() {
  const day = usePulse((s) => s.day),
    setDay = usePulse((s) => s.setDay),
    setTrend = usePulse((s) => s.setTrend),
    reduce = useReducedMotion()
  const track = useRef<HTMLDivElement>(null)
  const ranked = [...narratives].sort((a, b) => Math.abs(day - a.day) - Math.abs(day - b.day))
  function scroll(direction: number) {
    const element = track.current
    if (element)
      element.scrollBy({
        left: direction * (element.firstElementChild?.clientWidth ?? 395),
        behavior: reduce ? 'instant' : 'smooth',
      })
  }
  return (
    <section className="section" id="narratives">
      <div className="shell">
        <SectionTitle
          index="06"
          label="NARRATIVE INTELLIGENCE"
          title="What the numbers"
          accent="are saying."
          description="Five field notes from the Nova X1 launch combine topic momentum, emotion, audience, and influence."
          aside={
            <div className="flex gap-2">
              <button
                className="button secondary"
                aria-label="Previous narrative"
                onClick={() => scroll(-1)}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="button secondary"
                aria-label="Next narrative"
                onClick={() => scroll(1)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          }
        />
        <div className="narrative-track" ref={track} tabIndex={0} aria-label="Narrative cards">
          {ranked.map((item) => {
            const trend = getTopTrends(day).find((t) => t.keyword === item.topic)!
            const mix = getEmotionSeries(item.cohort)[day - 1]
            const total = EMOTIONS.reduce((s, e) => s + mix[e], 0) || 1
            const top = [...EMOTIONS].sort((a, b) => mix[b] - mix[a]).slice(0, 3)
            const spread = leaders.filter((u) => u.topics.includes(item.topic)).slice(0, 3)
            return (
              <article className="glass narrative-card tilt-card" key={item.topic}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip selected">{item.tag}</span>
                  <span className="mono-label">
                    EVENT D{item.day} · REPLAY D{day}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[23px] leading-tight font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-pulse">#{item.topic}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-[#bbcae0]">{item.brief}</p>
                <div className="mt-4 rounded-lg bg-[#0d1627] p-3">
                  <Donut
                    labels={[...top, 'Other']}
                    values={[
                      ...top.map((e) => Math.round((mix[e] / total) * 100)),
                      100 - top.reduce((sum, e) => sum + Math.round((mix[e] / total) * 100), 0),
                    ]}
                  />
                </div>
                <div className="mt-3 text-[11px] text-[#b9c9e0]">
                  <b>Top cohort:</b> {communities[item.cohort]}
                  <br />
                  <b>Top spreaders:</b> {spread.map((u) => u.handle).join(' · ')}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="chip">
                    {trend.stage} · {trend.confidence}%
                  </span>
                  <Spark values={trend.forecast} low={trend.low} high={trend.high} />
                </div>
                <p className="mt-2 border-l border-[#418896] pl-2 text-[11px] text-[#bbeaf2]">
                  {item.action}
                </p>
                <a
                  className="mt-4 flex w-fit items-center gap-2 text-xs text-pulse"
                  href="#emotions"
                  onClick={() => {
                    setTrend(item.topic)
                    setDay(item.day)
                  }}
                >
                  Jump to event <ArrowUpRight size={13} />
                </a>
              </article>
            )
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#603347] bg-[#241523] p-4">
          <p className="flex items-center gap-2 text-sm text-[#ffc2cf]">
            <TriangleAlert size={17} /> Early warning · Day 12 replay detects a brewing battery
            crisis.
          </p>
          <button
            type="button"
            className="chip"
            onClick={() => {
              setDay(12)
              document.dispatchEvent(new Event('pulse-crisis'))
            }}
          >
            Review alert <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </section>
  )
}
export function Crisis() {
  const day = usePulse((s) => s.day)
  const ref = useRef<HTMLDialogElement>(null)
  const prev = useRef(0)
  useEffect(() => {
    if (day === 12 && prev.current !== 12 && !ref.current?.open) ref.current?.showModal()
    else if (day !== 12 && ref.current?.open) ref.current.close()
    prev.current = day
  }, [day])
  useEffect(() => {
    const open = () => {
      if (!ref.current?.open) ref.current?.showModal()
    }
    document.addEventListener('pulse-crisis', open)
    return () => document.removeEventListener('pulse-crisis', open)
  }, [])
  return (
    <dialog className="crisis-dialog" ref={ref} aria-labelledby="crisis-title">
      <div className="flex items-center justify-between gap-3">
        <span className="chip border-[#7b4055]! bg-[#361c2b]! text-[#ffabbc]!">
          <TriangleAlert size={14} /> EARLY WARNING · DAY 12
        </span>
        <button
          aria-label="Dismiss crisis alert"
          className="chip"
          onClick={() => ref.current?.close()}
        >
          <X size={15} />
        </button>
      </div>
      <h2
        id="crisis-title"
        className="mt-4 font-display text-4xl font-bold tracking-tight text-[#fff1f5]"
      >
        Brewing crisis
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#e3bcca]">
        #NovaBattery is crossing community boundaries while anxiety and anger displace launch
        excitement.
      </p>
      <ol className="mt-5 list-inside list-decimal space-y-2 text-sm text-[#e8d9e1]">
        <li>Validate the reported overheating conditions.</li>
        <li>Publish verified safety guidance where the thread is active.</li>
        <li>Route urgent cases to support and announce a follow-up time.</li>
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        <a className="button secondary" href="#emotions" onClick={() => ref.current?.close()}>
          See the emotion shift <ArrowUpRight size={14} />
        </a>
        <button className="chip" onClick={() => ref.current?.close()}>
          Continue replay
        </button>
      </div>
    </dialog>
  )
}
export function Copilot() {
  const reduce = useReducedMotion()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<
    { question: string; answer: string; section?: string; cite?: string }[]
  >([])
  const [typed, setTyped] = useState(0)
  const answer = messages.at(-1)?.answer ?? ''
  useEffect(() => {
    if (!answer || reduce || typed >= answer.length) return
    const t = setTimeout(() => setTyped((length) => length + 9), 23)
    return () => clearTimeout(t)
  }, [answer, reduce, typed])
  function ask(question: string) {
    const q = question.trim()
    if (!q) return
    const result =
      copilotPrompts.find((p) => p.prompt === q) ??
      (/sentiment|drop|day\s*12/i.test(q)
        ? copilotPrompts[0]
        : /driv|battery|network|influenc/i.test(q)
          ? copilotPrompts[1]
          : /excited|cohort|audience/i.test(q)
            ? copilotPrompts[2]
            : null)
    setTyped(0)
    setMessages((prev) => [
      ...prev,
      {
        question: q,
        answer:
          result?.answer ??
          'This demo Copilot only knows the Nova X1 scenario. Try one of the prompts below, or use the AI Lab to analyze a new thread.',
        section: result?.section,
        cite: result?.cite,
      },
    ])
    setInput('')
  }
  return (
    <section id="copilot" className="section">
      <div className="shell">
        <SectionTitle
          index="08"
          label="AI COPILOT"
          title="Ask a better"
          accent="question."
          description="Follow up on the replay with a scripted copilot. Each answer points back to the chart behind it."
        />
        <Reveal className="glass glass-pad mx-auto max-w-[900px]">
          <CardTitle
            icon={Bot}
            title="PulseGraph Copilot"
            sub="Scripted scenario assistant"
            aside={<span className="live-label amber">DEMO MODE</span>}
          />
          <div className="max-h-[430px] space-y-4 overflow-y-auto rounded-lg bg-[#0a111f] p-4 sm:p-5">
            <div className="max-w-[640px] rounded-lg border border-[#273952] bg-[#121d31] p-3 text-sm text-[#d1def1]">
              I’ve indexed the Nova X1 launch replay. Ask about sentiment shifts, audience cohorts,
              or who carried a narrative.
            </div>
            {messages.map((m, i) => {
              const visible =
                i < messages.length - 1 || reduce ? m.answer : m.answer.slice(0, typed)
              return (
                <div key={i} className="space-y-2">
                  <div className="ml-auto w-fit max-w-[88%] rounded-lg bg-[#19334b] p-3 text-sm">
                    {m.question}
                  </div>
                  <div className="max-w-[640px] rounded-lg border border-[#273952] bg-[#121d31] p-3 text-sm leading-relaxed text-[#d1def1]">
                    {visible || '…'}
                    {m.section && visible === m.answer && (
                      <div className="mt-2">
                        <Citation href={`#${m.section}`}>{m.cite}</Citation>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="my-3 flex flex-wrap gap-2" aria-label="Suggested prompts">
            {copilotPrompts.map((p) => (
              <button className="chip" type="button" key={p.prompt} onClick={() => ask(p.prompt)}>
                {p.prompt}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              ask(input)
            }}
          >
            <input
              className="field"
              maxLength={200}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Ask the demo Copilot"
              placeholder="Ask about the Nova launch…"
            />
            <button type="submit" aria-label="Send message" className="button primary">
              <Send size={16} />
            </button>
          </form>
          <p className="sr-only" aria-live="polite">
            {typed >= answer.length ? answer : ''}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
const architecture = [
  {
    name: 'Public sources',
    detail: 'X, Telegram and optional platforms provide authorized public data.',
    icon: Radio,
  },
  {
    name: 'Connectors',
    detail: 'Normalize events, deduplicate and preserve source timestamps.',
    icon: GitFork,
  },
  {
    name: 'Kafka',
    detail: 'Partitioned streams allow independent workers and replay.',
    icon: Braces,
  },
  {
    name: 'Storage',
    detail: 'TimescaleDB for time series, Neo4j for graphs, Qdrant for embeddings.',
    icon: Database,
  },
  {
    name: 'AI engines',
    detail: 'Emotion scores, aggregate cohorts, burst detection and network analysis.',
    icon: AudioLines,
  },
  {
    name: 'FastAPI',
    detail: 'Stateless query APIs and a WebSocket event stream.',
    icon: RadarIcon,
  },
  {
    name: 'Dashboard',
    detail: 'Next.js composes the timeline, audience views, narrative cards and analysis lab.',
    icon: Sparkles,
  },
]
export function Architecture() {
  const [selected, setSelected] = useState(3)
  return (
    <section id="architecture" className="section">
      <div className="shell">
        <SectionTitle
          index="09"
          label="SYSTEM ARCHITECTURE"
          title="From source"
          accent="to insight."
          description="The replay is self-contained. Here’s how the same flow maps onto a production data pipeline."
        />
        <Reveal>
          <div className="glass glass-pad">
            <CardTitle
              icon={GitFork}
              title="Reference architecture"
              sub="Select a stage to see what it does"
            />
            <div className="relative">
              <svg
                className="arch-trace pointer-events-none absolute inset-x-0 top-5 hidden h-8 w-full lg:block"
                viewBox="0 0 1050 32"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M75 16H975"
                  stroke="#469db2"
                  strokeWidth="2"
                  strokeDasharray="900"
                  strokeDashoffset="0"
                  fill="none"
                />
              </svg>
              <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {architecture.map(({ icon: Icon, name }, i) => (
                  <button
                    type="button"
                    title={architecture[i].detail}
                    key={name}
                    aria-pressed={selected === i}
                    className={`chip min-h-[68px]! justify-center max-sm:flex-col ${selected === i ? 'selected' : ''}`}
                    onClick={() => setSelected(i)}
                  >
                    <Icon size={16} />
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="mt-4 rounded-lg border border-[#30415b] bg-[#0c1728] p-4 text-sm text-[#bed4e9]"
              aria-live="polite"
            >
              <b className="text-pulse">{architecture[selected].name}:</b>{' '}
              {architecture[selected].detail}
            </div>
          </div>
          <div className="mt-4 subgrid">
            <article className="glass glass-pad">
              <CardTitle icon={Shield} title="Public data only" />
              <p className="muted text-sm leading-relaxed">
                Production connectors require authorized access. The demo uses fictional posts and
                never pulls from private groups.
              </p>
            </article>
            <article className="glass glass-pad">
              <CardTitle icon={Fingerprint} title="Privacy by default" />
              <p className="muted text-sm leading-relaxed">
                Demographics are aggregate. The live lab masks common identifiers and suppresses
                unsupported age estimates.
              </p>
            </article>
            <article className="glass glass-pad">
              <CardTitle icon={LockKeyhole} title="Explainable estimates" />
              <p className="muted text-sm leading-relaxed">
                Inspect evidence, replay changes and treat predicted reach or suspicion flags as
                estimates, not proof.
              </p>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
export function Footer() {
  return (
    <footer className="footer">
      <svg
        className="footer-wave"
        data-depth="75"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#483f75" stopOpacity=".35" />
            <stop offset="1" stopColor="#0a0f1b" />
          </linearGradient>
        </defs>
        <path
          d="M0 148L95 127 188 153 296 89 358 82 461 138 547 105 662 164 767 96 870 119 988 46 1084 103 1190 85 1300 147 1440 91V260H0Z"
          fill="url(#wave-gradient)"
          stroke="#8465d150"
        />
        <path
          d="M0 205L116 157 238 191 359 137 493 186 642 127 748 185 893 147 1008 172 1136 115 1276 151 1440 111V260H0Z"
          fill="#101629"
          stroke="#69eafa2a"
        />
      </svg>
      <div className="shell relative">
        <div className="footer-cta">
          <div className="eyebrow justify-center">
            <span className="status-dot" /> THE SIGNAL IS THERE
          </div>
          <h2>
            Go back to <span>the beginning.</span>
          </h2>
          <p className="my-5 text-sm text-[#bec9dd]">
            Replay the Nova X1 launch with a different cohort or test a new message tone.
          </p>
          <a href="#pipeline" className="button primary">
            Launch the demo <ArrowRight size={16} />
          </a>
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-[#38435d] py-5">
          <Brand />
          <span className="mono-label">BUILT BY TEAM PULSEGRAPH · SYNTHETIC REPLAY</span>
          <a
            className="flex items-center gap-2 text-xs text-[#b8c8e0]"
            href="https://github.com/topics/social-media-analytics"
            target="_blank"
            rel="noreferrer"
          >
            GitHub resources <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </footer>
  )
}
