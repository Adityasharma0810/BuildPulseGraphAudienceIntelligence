'use client'
import { ArrowRight, Beaker, LoaderCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { platforms } from '@/data/demo'
import {
  engines,
  samples,
  type AnalyzePayload,
  type LabResults,
  type Report,
  type Stage,
} from '@/data/tryItDemo'
import { CardTitle, SectionTitle } from '../ui'
import ProcessLog from './ProcessLog'
import PipelineViz from './PipelineViz'
import RequestInspector from './RequestInspector'
import ResultsPanel from './ResultsPanel'
type Mode = {
  mode: 'live' | 'demo'
  model: string
  reason?: string
  retryAfter?: number
  illustrative?: boolean
  sample?: string
  reset?: boolean
}
export default function TryItOut() {
  const [text, setText] = useState(''),
    [context, setContext] = useState(''),
    [platform, setPlatform] = useState<string>('X'),
    [payload, setPayload] = useState<AnalyzePayload | null>(null),
    [stages, setStages] = useState<Stage[]>([]),
    [mode, setMode] = useState<Mode | null>(null),
    [data, setData] = useState<Partial<LabResults>>({}),
    [report, setReport] = useState<Report | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(false),
    [countdown, setCountdown] = useState(0)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    if (countdown < 1) return
    const t = setTimeout(() => setCountdown((n) => Math.max(0, n - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown])
  const posts = text
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    total = posts.reduce((sum, p) => sum + p.length, 0)
  const limit =
    posts.length > 20
      ? 'Use at most 20 posts.'
      : posts.some((p) => p.length > 500)
        ? 'Keep each post at or under 500 characters.'
        : total > 6000
          ? 'Trim the posts to 6,000 characters total.'
          : ''
  async function analyze(e?: FormEvent) {
    e?.preventDefault()
    if (busy) return
    if (!posts.length || limit) {
      setError(limit || 'Paste a post or load a sample to get started.')
      setRetry(false)
      return
    }
    const body = { posts, context: context.trim() }
    const abort = new AbortController()
    controller.current = abort
    setError('')
    setBusy(true)
    setRetry(false)
    setStages([])
    setData({})
    setReport(null)
    setMode(null)
    setPayload(body)
    setCountdown(0)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(body),
        signal: abort.signal,
      })
      if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('text/event-stream'))
        throw new Error('Could not start analysis')
      const reader = res.body.getReader(),
        decoder = new TextDecoder()
      let buffer = '',
        finished = false,
        hasResult = false
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let index: number
          while ((index = buffer.indexOf('\n\n')) >= 0) {
            const frame = buffer.slice(0, index)
            buffer = buffer.slice(index + 2)
            const event = frame.match(/^event: (.+)$/m)?.[1],
              raw = frame.match(/^data: (.+)$/m)?.[1]
            if (!event || !raw) continue
            const v = JSON.parse(raw)
            if (event === 'stage')
              setStages((list) =>
                list.some((s) => s.id === v.id)
                  ? list.map((s) => (s.id === v.id ? v : s))
                  : [...list, v],
              )
            if (event === 'mode') {
              setMode(v)
              setCountdown(v.retryAfter ?? 0)
              if (v.reset) {
                setData({})
                setStages((list) =>
                  list.filter((s) => !engines.some((g) => g === s.id) && s.id !== 'fusion'),
                )
              }
            }
            if (event === 'engine' && engines.includes(v.engine))
              setData((prev) => ({ ...prev, [v.engine]: v.data }))
            if (event === 'result') {
              hasResult = true
              setReport(v)
              setData(v)
            }
            if (event === 'done') finished = true
            if (event === 'error') throw new Error('Incomplete analysis')
          }
        }
      } finally {
        await reader.cancel().catch(() => {})
        reader.releaseLock()
      }
      if (!finished || !hasResult) throw new Error('Incomplete analysis')
    } catch {
      if (!abort.signal.aborted) {
        setError('The analysis connection dropped. Your input is still here; try again.')
        setRetry(true)
      }
    } finally {
      if (!abort.signal.aborted) setBusy(false)
    }
  }
  return (
    <section id="try-it" className="section try-section">
      <div className="wave-grid" data-depth="30" />
      <div className="try-glyph top-[9%] right-[12%]" data-depth="68">
        {'{ 01 }'}
      </div>
      <div className="try-glyph top-[20%] right-[30%]" data-depth="44">
        {'< / >'}
      </div>
      <div className="shell relative">
        <SectionTitle
          index="07"
          label="TRY IT OUT / AI LAB"
          title="Your posts."
          accent="Four engines."
          description="Run an analysis on your own thread, or load a sample to see how the engines combine their findings."
          aside={
            <span className={`live-label ${mode?.mode !== 'live' ? 'amber' : ''}`}>
              <span className="status-dot" />
              {mode?.mode === 'live'
                ? 'LIVE · Groq'
                : mode?.mode === 'demo'
                  ? 'DEMO MODE'
                  : 'LIVE ANALYSIS LAB'}
            </span>
          }
        />
        <div className="grid items-start gap-4 lg:grid-cols-[1.18fr_1fr]">
          <form className="glass glass-pad" onSubmit={analyze}>
            <CardTitle
              icon={Beaker}
              title="Analyze a thread"
              sub="Groq runs server-side when available"
            />
            <div className="mb-4 flex flex-wrap gap-1.5" aria-label="Platform label">
              {platforms.map((p) => (
                <button
                  key={p}
                  disabled={busy}
                  aria-pressed={platform === p}
                  type="button"
                  className={`chip ${platform === p ? 'selected' : ''}`}
                  onClick={() => setPlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <label htmlFor="lab-posts" className="mb-2 block text-xs font-medium">
              Paste 1–20 social media posts or comments (one per line)
            </label>
            <textarea
              disabled={busy}
              id="lab-posts"
              maxLength={12000}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setError('')
              }}
              className="field min-h-[147px] resize-y"
              placeholder="Paste the text of public posts here…"
              aria-describedby="lab-limits"
            />
            <div
              id="lab-limits"
              className="mt-1.5 flex flex-wrap justify-between gap-2 font-mono text-[10px] text-[#adbbd3]"
            >
              <span>Max 20 posts · 500 chars each</span>
              <span className={limit ? 'text-[#ffa1b5]' : ''}>
                {posts.length}/20 posts · {total}/6,000 chars
              </span>
            </div>
            {limit && (
              <p className="mt-2 text-xs text-[#ffa1b5]" role="status">
                {limit}
              </p>
            )}
            <div className="mt-4">
              <span className="mono-label">Load a sample</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {samples.map((s) => (
                  <button
                    type="button"
                    disabled={busy}
                    className="chip"
                    key={s.name}
                    onClick={() => {
                      setText(s.posts.join('\n'))
                      setContext(s.context)
                      setError('')
                      setRetry(false)
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-4 mb-2 block text-xs font-medium" htmlFor="lab-context">
              Context <span className="muted">(optional)</span>
            </label>
            <input
              id="lab-context"
              disabled={busy}
              className="field"
              value={context}
              maxLength={240}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Brand, topic, or event"
            />
            <p className="mt-3 flex gap-2 text-[11px] leading-relaxed text-[#adc0d7]">
              <ShieldCheck size={15} className="shrink-0 text-pulse" />
              Only submit public text you have permission to use. Masked text is sent to Groq in
              live mode. Reports are not saved by PulseGraph.
            </p>
            <button
              type="submit"
              className="button primary magnetic mt-4 w-full"
              disabled={busy || countdown > 0}
            >
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}{' '}
              {busy
                ? 'Analyzing…'
                : countdown > 0
                  ? `Try again in ${countdown}s`
                  : 'Analyze with AI'}{' '}
              <ArrowRight size={15} />
            </button>
            {error && (
              <div
                role="alert"
                className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#ffadb9]"
              >
                {error}
                {retry && (
                  <button type="button" onClick={() => void analyze()} className="chip">
                    <RefreshCw size={12} /> Retry
                  </button>
                )}
              </div>
            )}
          </form>
          <div className="grid gap-4">
            <ProcessLog stages={stages} />
            <PipelineViz stages={stages} ready={!!report} />
          </div>
        </div>
        {mode?.mode === 'demo' && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-[#644d35] bg-[#2d221c] p-3 text-sm text-[#ffce8b]"
          >
            <b>Running in demo mode.</b>{' '}
            {mode.reason === 'rate-limited'
              ? `Live analysis is temporarily rate-limited${countdown ? ` (${countdown}s to retry)` : ''}.`
              : mode.reason === 'upstream'
                ? 'Live analysis is unavailable right now.'
                : 'Using cached sample results.'}
            {mode.illustrative &&
              ` This is the “${mode.sample}” example, not an analysis of your submitted posts.`}
          </div>
        )}
        <RequestInspector payload={payload} model={mode?.model ?? ''} />
        <ResultsPanel data={data} report={report} />
      </div>
    </section>
  )
}
