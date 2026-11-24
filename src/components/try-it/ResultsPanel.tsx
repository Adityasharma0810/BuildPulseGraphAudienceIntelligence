'use client'
import { useMemo, useState } from 'react'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'
import {
  AudioLines,
  Braces,
  Download,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { colors } from '@/data/demo'
import { emotionKeys, type LabResults, type Report } from '@/data/tryItDemo'
import { Bars, Donut, Radar, Spark } from '../Signals'
import { CardTitle } from '../ui'
function MiniGraph({ value }: { value: LabResults['network'] }) {
  const points = useMemo(() => {
    const nodes = value.nodes.map((n, i) => ({
      ...n,
      x: 140 + Math.cos(i * 2.39) * 48,
      y: 84 + Math.sin(i * 2.39) * 48,
    }))
    const links = value.edges.map((e) => ({ ...e }))
    forceSimulation(nodes)
      .force('center', forceCenter(140, 84))
      .force(
        'link',
        forceLink<(typeof nodes)[number], (typeof links)[number]>(links)
          .id((n) => n.id)
          .distance(42),
      )
      .force('repel', forceManyBody().strength(-32))
      .force('collide', forceCollide(12))
      .stop()
      .tick(98)
    return new Map(
      nodes.map((n) => [
        n.id,
        { ...n, x: Math.max(15, Math.min(265, n.x)), y: Math.max(17, Math.min(145, n.y)) },
      ]),
    )
  }, [value])
  return (
    <>
      {points.size ? (
        <svg
          viewBox="0 0 280 166"
          className="h-[180px] w-full rounded-lg bg-[#091725]"
          role="img"
          aria-label="Inferred links between numbered posts"
        >
          {value.edges.map((e, i) => {
            const a = points.get(e.source),
              b = points.get(e.target)
            return a && b ? (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6073a8" strokeWidth="1.5">
                <title>{e.type}</title>
              </line>
            ) : null
          })}
          {[...points.values()].map((n) => (
            <g key={n.id}>
              {n.id === value.influencer && (
                <circle cx={n.x} cy={n.y} r="14" fill="#419ea53b" stroke="#71f2fe" />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={4 + n.influence * 5}
                fill={n.id === value.influencer ? '#8cf6fd' : '#ad99ff'}
              />
              <text x={n.x} y={n.y + 19} textAnchor="middle" fill="#cbd8ef" fontSize="8">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <p className="muted text-xs">No reliable interaction links found.</p>
      )}
      <p className="muted mt-3 text-xs">{value.note}</p>
      {value.path.length > 0 && (
        <p className="mt-2 text-xs text-pulse">Path: {value.path.join(' → ')}</p>
      )}
    </>
  )
}
export default function ResultsPanel({
  data,
  report,
}: {
  data: Partial<LabResults>
  report: Report | null
}) {
  const [copied, setCopied] = useState('')
  const { emotions, demographics, trends, network, brief } = data
  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      setCopied('Copied.')
    } catch {
      setCopied('Clipboard unavailable. Use Download report.')
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'pulsegraph-report.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  if (!Object.keys(data).length) return null
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2" aria-label="Progressive analysis results">
      {emotions && (
        <motion.div
          initial={{ y: 10, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass glass-pad"
        >
          <CardTitle icon={AudioLines} title="Emotion signals" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
              {emotions.posts.map((p) => (
                <details key={p.index} className="rounded-lg border border-[#2b3750] p-2">
                  <summary className="text-[11px]">
                    Post {p.index} ·{' '}
                    <b className="capitalize" style={{ color: colors[p.dominant] }}>
                      {p.dominant}
                    </b>
                  </summary>
                  <p className="muted mt-2 text-[11px]">{p.reason}</p>
                  <div className="my-2 space-y-1">
                    {emotionKeys.map((e) => (
                      <div key={e} className="barchart-row capitalize">
                        <span>{e}</span>
                        <span className="barchart-rail">
                          <i
                            style={{
                              width: `${Math.round(p.scores[e] * 100)}%`,
                              background: colors[e],
                            }}
                          />
                        </span>
                        <span className="text-right font-mono">
                          {Math.round(p.scores[e] * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {p.tokens.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.tokens.map((t, i) => (
                        <mark
                          key={i}
                          className="rounded bg-[#422445] px-1.5 text-[11px] text-[#fface1]"
                        >
                          {t}
                        </mark>
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </div>
            <Radar
              labels={emotionKeys.map((e) => e[0].toUpperCase() + e.slice(1))}
              values={emotionKeys.map((e) =>
                Math.round(
                  (100 * emotions.posts.reduce((s, p) => s + p.scores[e], 0)) /
                    emotions.posts.length,
                ),
              )}
            />
          </div>
        </motion.div>
      )}
      {demographics && (
        <motion.div
          initial={{ y: 10, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass glass-pad"
        >
          <CardTitle
            icon={Users}
            title="Aggregate audience"
            aside={
              <span className="chip">
                <ShieldCheck size={13} /> NO PROFILES
              </span>
            }
          />
          {demographics.ages.length ? (
            <Bars
              labels={demographics.ages.map((g) => g.label)}
              values={demographics.ages.map((g) => g.value)}
              max={100}
            />
          ) : (
            <p className="muted mb-3 text-xs">
              Age breakdown withheld: insufficient aggregate evidence.
            </p>
          )}
          {demographics.languages.length > 0 && (
            <Donut
              labels={demographics.languages.map((g) => g.label)}
              values={demographics.languages.map((g) => g.value)}
            />
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[...demographics.interests, ...demographics.regions].map((x, i) => (
              <span className="chip" key={i}>
                {x}
              </span>
            ))}
          </div>
          <p className="muted mt-3 text-xs">{demographics.note}</p>
        </motion.div>
      )}
      {trends && (
        <motion.div
          initial={{ y: 10, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass glass-pad"
        >
          <CardTitle
            icon={TrendingUp}
            title="Topics and 24h outlook"
            sub="Hypotheses, not measured growth"
          />
          {trends.topics.length === 0 && <p className="muted text-xs">No stable topic found.</p>}
          {trends.topics.map((n, i) => (
            <div className="mb-2 rounded-lg border border-[#2b3750] p-3" key={i}>
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-pulse">{n.label}</strong>
                <span className="chip">{n.stage}</span>
                <span className="chip">{n.velocity} velocity</span>
                <Spark values={n.forecast} />
              </div>
              <p className="muted text-xs">{n.prediction}</p>
              <div className="mt-2 text-[10px] text-[#a6bad8]">
                {[...n.hashtags, ...n.keywords].join(' · ')}
              </div>
            </div>
          ))}
        </motion.div>
      )}
      {network && (
        <motion.div
          initial={{ y: 10, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass glass-pad"
        >
          <CardTitle
            icon={Network}
            title="Narrative spread"
            sub="Likely relationships within this thread"
          />
          <MiniGraph value={network} />
        </motion.div>
      )}
      {brief && report && (
        <div className="glass glass-pad border-[#4b708d]! lg:col-span-2">
          <CardTitle
            icon={Sparkles}
            title={brief.title}
            sub={`${report.meta.model} · ${report.meta.totalLatencyMs}ms · ${report.meta.totalTokens} tokens`}
          />
          <p className="max-w-[740px] leading-relaxed text-[#d2e3f4]">{brief.insight}</p>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-[#b7c6e0]">
            {brief.actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="button secondary" onClick={copy}>
              <Braces size={14} /> Copy as JSON
            </button>
            <button type="button" className="button secondary" onClick={download}>
              <Download size={14} /> Download report
            </button>
            <span role="status" className="self-center text-xs text-pulse">
              {copied}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
