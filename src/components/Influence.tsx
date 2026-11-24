'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import {
  Activity,
  CircleDot,
  GitBranch,
  Network,
  Orbit,
  Play,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import {
  communities,
  communityColors,
  edges,
  getGraph,
  leaders,
  rng,
  shortestPath,
  simulateCascade,
  tones,
  users,
  type Edge,
  type Tone,
  type User,
} from '@/data/demo'
import { usePulse } from '@/lib/store'
import { CardTitle, Reveal, SectionTitle } from './ui'
const centers = [
  [185, 121],
  [470, 87],
  [729, 129],
  [220, 351],
  [490, 333],
  [751, 344],
]
const maxRank = leaders[0].pageRank
const nodeRadius = (n: User) => 2.6 + (8 * n.pageRank) / maxRank
const layout = (() => {
  const rand = rng(641)
  const nodes = users.map((u) => ({
    ...u,
    x: centers[u.community][0] + (rand() - 0.5) * 97,
    y: centers[u.community][1] + (rand() - 0.5) * 88,
  }))
  const links = edges.map(({ source, target }) => ({ source, target }))
  forceSimulation(nodes)
    .randomSource(rand)
    .force('charge', forceManyBody().strength(-14))
    .force('x', forceX<(typeof nodes)[number]>((n) => centers[n.community][0]).strength(0.19))
    .force('y', forceY<(typeof nodes)[number]>((n) => centers[n.community][1]).strength(0.22))
    .force(
      'collision',
      forceCollide<(typeof nodes)[number]>((n) => nodeRadius(n) + 3),
    )
    .force(
      'links',
      forceLink<(typeof nodes)[number], { source: number; target: number }>(links)
        .id((n) => n.id)
        .distance(27)
        .strength(0.028),
    )
    .stop()
    .tick(200)
  return nodes
})()
const format = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
function CanvasGraph({
  links,
  selected,
  cohort,
  flag,
  cascade,
  onPick,
}: {
  links: Edge[]
  selected: number
  cohort: number
  flag: boolean
  cascade: ReturnType<typeof simulateCascade> | null
  onPick: (id: number) => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [box, setBox] = useState({ w: 1, h: 1 })
  const [reach, setReach] = useState(0)
  const reduce = useReducedMotion()
  const [near, setNear] = useState(-1)
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const observer = new ResizeObserver(([entry]) =>
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height }),
    )
    observer.observe(c)
    return () => observer.disconnect()
  }, [])
  const scale = Math.min(box.w / 920, box.h / 470),
    ox = (box.w - 920 * scale) / 2,
    oy = (box.h - 470 * scale) / 2
  useEffect(() => {
    const c = canvas.current,
      ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const dpr = Math.min(devicePixelRatio, 2)
    c.width = box.w * dpr
    c.height = box.h * dpr
    const t = performance.now()
    let frame = 0,
      previous = -1
    function draw(now: number) {
      if (!ctx) return
      const elapsed = (now - t) / 510
      const step = cascade
        ? reduce
          ? cascade.waves.length - 1
          : Math.min(cascade.waves.length - 1, Math.floor(elapsed))
        : -1
      const lit = new Set(cascade?.waves.slice(0, step + 1).flat() ?? [])
      if (step !== previous) {
        previous = step
        setReach([...lit].reduce((acc, i) => acc + users[i].followers, 0))
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, box.w, box.h)
      ctx.translate(ox, oy)
      ctx.scale(scale, scale)
      ctx.lineWidth = 0.75
      for (const e of links) {
        const a = layout[e.source],
          b = layout[e.target]
        ctx.strokeStyle =
          a.community === b.community ? `${communityColors[a.community]}36` : '#52688a3b'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      if (cascade && step >= 0) {
        for (const { source, target } of cascade.links[step] ?? []) {
          const a = layout[source],
            b = layout[target],
            f = reduce ? 1 : elapsed % 1
          ctx.strokeStyle = '#8dfaff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f)
          ctx.stroke()
          ctx.fillStyle = '#e0fdff'
          ctx.beginPath()
          ctx.arc(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      for (const n of layout) {
        const col = communityColors[n.community],
          r = nodeRadius(n),
          active = lit.has(n.id),
          marked = n.id === selected || n.id === near,
          high = n.pageRank / maxRank > 0.68
        ctx.globalAlpha = cohort >= 0 && cohort !== n.community && !marked && !active ? 0.31 : 1
        ctx.fillStyle = active ? '#d4fdff' : col
        ctx.shadowColor = col
        ctx.shadowBlur = marked || high || active ? 14 : 0
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        if (marked || (flag && n.bot) || high) {
          ctx.setLineDash(flag && n.bot ? [3, 3] : [])
          ctx.strokeStyle = flag && n.bot ? '#ff6d89' : marked ? '#d2fdff' : `${col}8a`
          ctx.lineWidth = marked ? 2 : 1
          ctx.beginPath()
          ctx.arc(n.x, n.y, r + (marked ? 5 : 4), 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
      ctx.globalAlpha = 1
      if (cascade && !reduce && elapsed < cascade.waves.length) frame = requestAnimationFrame(draw)
    }
    draw(t)
    return () => cancelAnimationFrame(frame)
  }, [links, selected, cohort, flag, cascade, box, scale, ox, oy, reduce, near])
  return (
    <div className="relative">
      <canvas
        ref={canvas}
        className="network-canvas"
        aria-label="Interactive influence network. Use the node selector below for keyboard access."
        role="img"
        onPointerLeave={() => setNear(-1)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left - ox) / scale,
            y = (e.clientY - rect.top - oy) / scale
          const n = layout
            .map((n) => ({ id: n.id, d: Math.hypot(n.x - x, n.y - y) }))
            .sort((a, b) => a.d - b.d)[0]
          setNear(n.d < 16 ? n.id : -1)
          e.currentTarget.style.cursor = n.d < 16 ? 'pointer' : 'default'
        }}
        onClick={() => {
          if (near >= 0) onPick(near)
        }}
      />
      <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-2">
        <span className="chip">{users.length} NODES</span>
        <span className="chip">{links.length} LINKS</span>
        {cascade && <span className="chip selected">{format(reach)} POTENTIAL REACH</span>}
      </div>
      {near >= 0 && (
        <span className="chip pointer-events-none absolute right-3 bottom-3">
          {users[near].handle}
        </span>
      )}
    </div>
  )
}
function Sankey({ links }: { links: Edge[] }) {
  const pairs = Array.from({ length: 6 }, () => Array(6).fill(0) as number[])
  for (const edge of links) pairs[users[edge.source].community][users[edge.target].community]++
  const y = (i: number) => 27 + i * 24
  return (
    <svg
      viewBox="0 0 650 182"
      className="w-full"
      role="img"
      aria-label="Flow of interactions from source communities to target communities"
    >
      {pairs.flatMap((targets, i) =>
        targets.map(
          (v, j) =>
            v > 0 && (
              <path
                key={`${i}-${j}`}
                d={`M145 ${y(i)} C278 ${y(i)}, 375 ${y(j)}, 503 ${y(j)}`}
                stroke={communityColors[i]}
                strokeWidth={Math.min(14, 1 + v * 0.38)}
                opacity={i === j ? 0.31 : 0.57}
                fill="none"
              >
                <title>
                  {communities[i]} → {communities[j]}: {v}
                </title>
              </path>
            ),
        ),
      )}
      {communities.map((name, i) => (
        <g key={name}>
          <rect x="139" y={y(i) - 7} width="7" height="14" rx="2" fill={communityColors[i]} />
          <rect x="503" y={y(i) - 7} width="7" height="14" rx="2" fill={communityColors[i]} />
          <text x="130" y={y(i) + 4} fill="#b8c4de" textAnchor="end" fontSize="11">
            {name}
          </text>
          <text x="520" y={y(i) + 4} fill="#b8c4de" fontSize="11">
            {name}
          </text>
        </g>
      ))}
    </svg>
  )
}
export default function Influence() {
  const day = usePulse((s) => s.day),
    cohort = usePulse((s) => s.cohort),
    trend = usePulse((s) => s.trend),
    selected = usePulse((s) => s.node),
    setSelected = usePulse((s) => s.setNode)
  const [tone, setTone] = useState<Tone>('Empathetic'),
    [flag, setFlag] = useState(false),
    [play, setPlay] = useState<{
      day: number
      cohort: number
      seed: number
      tone: Tone
      compare: boolean
      run: number
    } | null>(null)
  const links = useMemo(() => getGraph(day, cohort).edges, [day, cohort])
  const active = play?.day === day && play.cohort === cohort ? play : null
  const cascade = useMemo(
    () => (active ? simulateCascade(active.seed, active.tone, day, cohort) : null),
    [active, day, cohort],
  )
  const baseline = active?.compare ? simulateCascade(active.seed, 'Neutral', day, cohort).reach : 0
  const node = users[selected]
  const path = shortestPath(selected, (node.community + 1) % 6, day)
  const start = (seed: number, tone: Tone, compare: boolean) =>
    setPlay((p) => ({ day, cohort, seed, tone, compare, run: (p?.run ?? 0) + 1 }))
  return (
    <section id="network" className="section">
      <div className="shell">
        <SectionTitle
          index="05"
          label="INFLUENCE NETWORK"
          title="Trace the spread."
          accent="Find the bridge."
          description="Select an anonymized node, flag suspicious clusters, or model how a message travels across communities."
          aside={<span className="chip selected">#{trend}</span>}
        />
        <Reveal>
          <div className="glass overflow-hidden">
            <div className="glass-pad pb-2!">
              <CardTitle
                icon={Network}
                title="Community graph"
                sub={`DAY ${String(day).padStart(2, '0')} · DIRECTED INTERACTIONS`}
                aside={
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="chip"
                      aria-pressed={flag}
                      onClick={() => setFlag(!flag)}
                    >
                      <ShieldAlert size={14} /> {flag ? 'Hide' : 'Flag'} suspicious clusters
                    </button>
                    <button
                      type="button"
                      className="button primary min-h-8!"
                      onClick={() =>
                        start(
                          leaders.find((n) => n.topics.includes(trend))?.id ?? leaders[0].id,
                          'Neutral',
                          false,
                        )
                      }
                    >
                      <Play size={13} /> Cascade replay
                    </button>
                  </div>
                }
              />
            </div>
            <CanvasGraph
              links={links}
              selected={selected}
              cohort={cohort}
              flag={flag}
              cascade={cascade}
              onPick={setSelected}
            />
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#26334c] p-4 text-[11px] text-[#bfd0e8]">
              {communities.map((c, i) => (
                <span key={c} className="flex items-center gap-2">
                  <i className="size-2 rounded-full" style={{ background: communityColors[i] }} />
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="glass glass-pad">
              <CardTitle
                icon={CircleDot}
                title="Node inspector"
                sub="Anonymized synthetic profile"
              />
              <label className="mono-label" htmlFor="graph-node">
                Select a node
              </label>
              <select
                id="graph-node"
                className="field my-2"
                value={selected}
                onChange={(e) => setSelected(+e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.handle} · {communities[u.community]}
                  </option>
                ))}
              </select>
              <motion.div key={selected} initial={{ x: 8 }} animate={{ x: 0 }}>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="chip">PageRank {node.pageRank.toFixed(4)}</span>
                  <span className="chip">Betweenness {node.betweenness.toFixed(3)}</span>
                  <span className="chip">{format(node.followers)} followers</span>
                </div>
                <p className="mt-3 text-xs text-[#a8bad3]">
                  {node.topics.map((t) => `#${t}`).join(' · ')}
                </p>
                <p className="mt-3 text-[11px] text-[#a8bad3]">
                  Shortest bridge to {communities[(node.community + 1) % 6]}:{' '}
                  {path.length ? path.map((id) => users[id].handle).join(' → ') : 'No active path'}
                </p>
              </motion.div>
            </div>
            <div className="glass glass-pad">
              <CardTitle
                icon={SlidersHorizontal}
                title="What-if simulator"
                sub="Independent Cascade · deterministic replay"
              />
              <p className="text-xs text-[#a8bad3]">
                Seed: <strong className="text-pulse">{node.handle}</strong>
              </p>
              <label htmlFor="tone" className="mono-label mt-3 block">
                Message tone
              </label>
              <select
                id="tone"
                className="field my-2"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                {tones.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                className="button primary mt-1 w-full"
                onClick={() => start(selected, tone, true)}
              >
                <Activity size={15} /> Simulate reach
              </button>
              {active?.compare && cascade && (
                <p role="status" className="mt-3 text-xs text-[#bdd9e9]">
                  Neutral <b>{format(baseline)}</b> → {active.tone}{' '}
                  <b className="text-pulse">{format(cascade.reach)}</b> potential impressions (not
                  deduplicated)
                </p>
              )}
            </div>
            <div className="glass glass-pad">
              <CardTitle icon={GitBranch} title="Narrative flow" sub="Links between communities" />
              <Sankey links={links} />
              <div className="mono-label mt-2 flex justify-between">
                <span>Source</span>
                <Orbit size={12} />
                <span>Destination</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
