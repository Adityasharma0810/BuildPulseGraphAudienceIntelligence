'use client'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  AudioLines,
  CircleHelp,
  Database,
  Fingerprint,
  GitFork,
  Globe2,
  Layers3,
  Network,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { geoMercator, geoNaturalEarth1, geoPath } from 'd3-geo'
import { scaleLinear } from 'd3-scale'
import {
  ageGroups,
  colors,
  communities,
  dateLabel,
  EMOTIONS,
  events,
  getDemographics,
  getEmotionSeries,
  getPosts,
  getTopTrends,
  interests,
  languages,
  platformColors,
  platforms,
  regions,
} from '@/data/demo'
import india from '@/data/india.json'
import worldData from '@/data/world.json'
import { usePulse } from '@/lib/store'
import { CardTitle, Reveal, SectionTitle } from './ui'
const tier = ['Essential', 'Essential', 'Desirable', 'Desirable', 'Bonus', 'Bonus']
const engineTiles = [
  { name: 'Emotion engine', icon: AudioLines },
  { name: 'Demographic engine', icon: Users },
  { name: 'Trend engine', icon: TrendingUp },
  { name: 'Influence engine', icon: Network },
]
function StreamLink({ split = false, active }: { split?: boolean; active: boolean }) {
  const paths = [-24, -11, 11, 24].map((offset) =>
    split
      ? `M0 40 C15 40 19 ${40 + offset} 36 ${40 + offset}`
      : `M0 ${40 + offset} C15 ${40 + offset} 19 40 36 40`,
  )
  return (
    <div className="pipe-arrow" aria-hidden="true">
      <svg viewBox="0 0 36 80" className="h-16 w-8" fill="none">
        {paths.map((d, i) => (
          <g key={d}>
            <path d={d} stroke="#548cae" strokeOpacity=".6" />
            {active && (
              <circle r="2" fill={split ? '#bba5ff' : '#7defff'}>
                <animateMotion
                  dur="2.1s"
                  begin={`${i * 0.32}s`}
                  path={d}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
export function Pipeline() {
  const day = usePulse((s) => s.day),
    cohort = usePulse((s) => s.cohort)
  const [offset, setOffset] = useState(0)
  const [playing, setPlaying] = useState(true)
  const reduced = useReducedMotion()
  const list = useMemo(
    () => getPosts().filter((p) => p.day === day && (cohort < 0 || p.community === cohort)),
    [day, cohort],
  )
  useEffect(() => {
    if (!playing || reduced) return
    const t = setInterval(() => setOffset((x) => x + 1), 2100)
    return () => clearInterval(t)
  }, [playing, reduced])
  const current = list.length
    ? Array.from({ length: 5 }, (_, i) => list[(offset + i) % list.length]).reverse()
    : []
  return (
    <section id="pipeline" className="section">
      <div className="shell">
        <SectionTitle
          index="01"
          label="LIVE INGESTION"
          title="From noise"
          accent="to signal."
          description="Six platforms feed one event stream. Follow a synthetic post from source to analysis."
          aside={
            <span className="live-label">
              <span className="status-dot" /> REPLAY ACTIVE
            </span>
          }
        />
        <Reveal className="chart-grid">
          <div className="glass glass-pad">
            <CardTitle
              icon={GitFork}
              title="Ingestion pipeline"
              sub="Sources → event stream → intelligence"
            />
            <div className="pipeline-grid">
              <div className="pipe-block">
                <div className="mono-label mb-2.5">01 / Sources</div>
                <div className="grid gap-1.5">
                  {platforms.map((p, i) => (
                    <div className="pipe-item" key={p}>
                      <span style={{ color: platformColors[i] }}>{p}</span>
                      <span className="font-mono text-[8px] text-[#a5b3cc]">{tier[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <StreamLink active={playing && reduced === false} />
              <div className="pipe-block flex flex-col justify-center">
                <div className="mono-label mb-3">02 / Stream</div>
                <Database className="mb-3 text-pulse" size={27} />
                <strong className="font-display text-[15px]">Event funnel</strong>
                <span className="mt-1 text-[10px] text-[#a9b6cc]">Normalize · queue · replay</span>
                <div className="pipe-connector active mt-3" />
              </div>
              <StreamLink split active={playing && reduced === false} />
              <div className="pipe-block">
                <div className="mono-label mb-2.5">03 / AI engines</div>
                <div className="grid gap-1.5">
                  {engineTiles.map(({ name, icon: Icon }) => (
                    <div className="pipe-item justify-start!" key={name}>
                      <Icon size={13} className="text-pulse" />
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="glass glass-pad">
            <CardTitle
              icon={Radio}
              title="Live feed"
              sub={`${dateLabel(day)} · UTC`}
              aside={
                <button className="chip" type="button" onClick={() => setPlaying(!playing)}>
                  {playing && !reduced ? 'Pause' : reduced ? 'Reduced motion' : 'Resume'}
                </button>
              }
            />
            <div aria-label="Recent synthetic posts">
              {current.map((p) => (
                <div className="feed-row" key={p.id} title={p.text}>
                  <span className="font-mono text-[#8496b5]">{p.timestamp.slice(11, 16)}</span>
                  <span style={{ color: platformColors[platforms.indexOf(p.platform)] }}>
                    {p.platform}
                  </span>
                  <span className="truncate">{p.text}</span>
                  <span className="hidden capitalize sm:block" style={{ color: colors[p.emotion] }}>
                    {p.emotion}
                  </span>
                </div>
              ))}
            </div>
            <details className="mt-4 border-t border-[#283650] pt-3">
              <summary className="text-xs text-pulse">Timeline database</summary>
              <ul className="mt-3 space-y-2 font-mono text-[10px] text-[#a9b6cf]">
                {current.map((p) => (
                  <li key={p.id}>
                    {p.timestamp} · {p.id}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
function EmotionTip({
  active,
  label,
  cohort,
}: {
  active?: boolean
  label?: number
  cohort: number
}) {
  if (!active || !label) return null
  const row = getEmotionSeries(cohort)[label - 1]
  if (!row) return null
  const dominant = [...EMOTIONS].sort((a, b) => row[b] - row[a])[0]
  const posts = getPosts().filter(
    (p) => p.day === label && p.emotion === dominant && (cohort < 0 || p.community === cohort),
  )
  return (
    <div className="glass max-w-[260px] p-3 text-xs">
      <div className="mono-label">
        DAY {label} / <span style={{ color: colors[dominant] }}>{dominant}</span>
      </div>
      {[...new Set(posts.map((p) => p.text))].slice(0, 3).map((text) => (
        <p key={text} className="mt-2 text-[#c9d6ed]">
          {text}
        </p>
      ))}
    </div>
  )
}
export function Timeline() {
  const day = usePulse((s) => s.day),
    cohort = usePulse((s) => s.cohort),
    setDay = usePulse((s) => s.setDay),
    reduced = useReducedMotion()
  const series = getEmotionSeries(cohort)
  const row = series[day - 1]
  const total = EMOTIONS.reduce((s, e) => s + row[e], 0)
  const pulse = Math.round((100 * (row.excitement + row.support + row.hope)) / Math.max(1, total))
  const active = events.find((e) => e.day === day)
  return (
    <section id="emotions" className="section">
      <div className="shell">
        <SectionTitle
          index="02"
          label="EMOTION TIMELINE"
          title="Read the room."
          accent="Over time."
          description="Go beyond positive and negative. Scrub through 30 days and watch seven emotions move with the news."
        />
        <div className="glass glass-pad mb-4">
          <CardTitle
            icon={Timer}
            title="Time machine"
            sub="One timeline for the entire dashboard"
            aside={
              <span className="chip selected">
                DAY {String(day).padStart(2, '0')} · {dateLabel(day)}
              </span>
            }
          />
          <input
            aria-label="Replay day"
            className="timeline-input"
            type="range"
            min="1"
            max="30"
            value={day}
            onChange={(e) => setDay(+e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {events.map((e) => (
              <button
                type="button"
                key={e.day}
                className={`chip ${day === e.day ? 'selected' : ''}`}
                onClick={() => setDay(e.day)}
              >
                {String(e.day).padStart(2, '0')} / {e.name}
              </button>
            ))}
          </div>
        </div>
        <Reveal className="chart-grid">
          <div className="glass glass-pad">
            <CardTitle
              icon={AudioLines}
              title="Emotion stream"
              sub={
                active
                  ? `DAY ${day} · ${active.name}`
                  : `DAILY DISTRIBUTION · ${cohort < 0 ? 'All cohorts' : communities[cohort]}`
              }
            />
            <div className="h-[280px] w-full" aria-label="Stacked daily counts of seven emotions">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 12, right: 9, bottom: 0, left: -23 }}>
                  <defs>
                    {EMOTIONS.map((e) => (
                      <linearGradient key={e} id={`emotion-${e}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={colors[e]} stopOpacity={0.83} />
                        <stop offset="100%" stopColor={colors[e]} stopOpacity={0.35} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="#253049" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#9aaac8', fontSize: 10 }}
                    tickFormatter={(v) => `D${v}`}
                    minTickGap={26}
                    stroke="#313b53"
                  />
                  <YAxis tick={{ fill: '#9aaac8', fontSize: 10 }} stroke="#313b53" />
                  <Tooltip
                    content={({ active, label }) => (
                      <EmotionTip active={active} label={Number(label)} cohort={cohort} />
                    )}
                  />
                  {[3, 8, 12, 20].map((d) => (
                    <ReferenceLine key={d} x={d} stroke="#70829d" strokeDasharray="4 7" />
                  ))}
                  {EMOTIONS.map((e) => (
                    <Area
                      key={e}
                      type="monotone"
                      stackId="emotion"
                      dataKey={e}
                      fill={`url(#emotion-${e})`}
                      stroke={colors[e]}
                      strokeWidth={1.35}
                      isAnimationActive={!reduced}
                    />
                  ))}
                  <ReferenceLine
                    x={day}
                    stroke="#e8faff"
                    strokeWidth={1.7}
                    label={{
                      value: `D${day}`,
                      fill: '#f5fbff',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] capitalize text-[#aebcd3]">
              {EMOTIONS.map((e) => (
                <span className="flex items-center gap-1.5" key={e}>
                  <i className="size-2 rounded-full" style={{ background: colors[e] }} />
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="glass glass-pad">
              <CardTitle icon={Zap} title="Sentiment pulse" />
              <div className="flex items-center gap-4">
                <div
                  className="grid size-[80px] place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(${pulse < 40 ? '#fb7893' : '#64eaf0'} ${pulse}%, #28344d 0)`,
                  }}
                >
                  <div className="grid size-[68px] place-items-center rounded-full bg-[#101727] font-display text-[25px] font-bold">
                    {pulse}
                    <span className="sr-only"> percent</span>
                  </div>
                </div>
                <div>
                  <div className="font-display text-base font-semibold">
                    {pulse < 40
                      ? 'Negative shift'
                      : pulse > 60
                        ? 'Positive momentum'
                        : 'Mixed sentiment'}
                  </div>
                  <p className="mt-1 text-xs text-[#a5b3cc]">
                    Excitement, support and hope as a share of posts.
                  </p>
                </div>
              </div>
            </div>
            <div className="glass glass-pad">
              <CardTitle icon={CircleHelp} title="Sarcasm detector" sub="EXPLAINABILITY EXAMPLE" />
              <p className="rounded-lg bg-[#221a32] p-3 text-[13px] leading-relaxed">
                <mark className="bg-transparent font-semibold text-[#f48cce]">Love</mark> that my
                Nova doubles as a{' '}
                <mark className="bg-transparent font-semibold text-[#f48cce]">hand warmer</mark>.
                Premium feature.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#a5b3cc]">
                Positive wording contrasts with an overheating complaint; the original post adds a
                laughing reaction.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
export function Bars({
  labels,
  values,
  max = 45,
}: {
  labels: string[]
  values: number[]
  max?: number
}) {
  return (
    <div className="space-y-3">
      {labels.map((label, i) => (
        <div className="barchart-row" key={label}>
          <span>{label}</span>
          <span className="barchart-rail">
            <i style={{ width: `${Math.min(100, (values[i] / max) * 100)}%` }} />
          </span>
          <span className="text-right font-mono">{values[i]}%</span>
        </div>
      ))}
    </div>
  )
}
const donutColors = [
  '#65e7f5',
  '#8b77fb',
  '#f083c8',
  '#9fe076',
  '#ffb76d',
  '#567fe4',
  '#ff7d76',
  '#62bcaa',
  '#9baacb',
]
export function Donut({ labels, values }: { labels: string[]; values: number[] }) {
  const total = values.reduce((a, b) => a + b, 0) || 1
  let sum = 0
  const slices = values.map((v, i) => {
    const left = sum
    sum += (v / total) * 100
    return `${donutColors[i % donutColors.length]} ${left}% ${sum}%`
  })
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div
        aria-hidden="true"
        className="grid size-[108px] shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${slices.join(',') || '#28334a 0% 100%'})` }}
      >
        <span className="grid size-[77px] place-items-center rounded-full bg-[#111728] font-mono text-[11px] text-pulse">
          {labels.length} MIX
        </span>
      </div>
      <ul className="grid min-w-[100px] flex-1 gap-1.5 text-[10px]">
        {labels.map((label, i) => (
          <li key={label} className="flex gap-2">
            <i
              className="my-auto size-1.5 shrink-0 rounded-full"
              style={{ background: donutColors[i % donutColors.length] }}
            />
            <span>{label}</span>
            <span className="ml-auto font-mono text-[#a6b6d2]">{values[i]}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
export function Radar({ labels, values }: { labels: string[]; values: number[] }) {
  const xy = (i: number, r: number) => [
    120 + Math.sin((i * 2 * Math.PI) / labels.length) * r,
    97 - Math.cos((i * 2 * Math.PI) / labels.length) * r,
  ]
  const coords = (v: number[]) => v.map((n, i) => xy(i, n).join(',')).join(' ')
  const max = Math.max(1, ...values)
  return (
    <svg
      viewBox="0 0 240 194"
      role="img"
      aria-label={labels.map((l, i) => `${l}: ${values[i]}`).join(', ')}
      className="mx-auto max-h-[220px] w-full max-w-[300px]"
    >
      {[17, 34, 51, 68].map((r) => (
        <polygon key={r} points={coords(labels.map(() => r))} stroke="#364263" fill="none" />
      ))}
      {labels.map((l, i) => {
        const [x, y] = xy(i, 70),
          [lx, ly] = xy(i, 86)
        return (
          <g key={l}>
            <line x1="120" y1="97" x2={x} y2={y} stroke="#364263" />
            <text x={lx} y={ly + 3} textAnchor="middle" fontSize="8" fill="#b5c5e1">
              {l}
            </text>
          </g>
        )
      })}
      <polygon
        points={coords(values.map((v) => (v / max) * 68))}
        stroke="#65e9fc"
        strokeWidth="1.8"
        fill="#45d4f13b"
      />
    </svg>
  )
}
const indiaGeo = india as Parameters<ReturnType<typeof geoPath>>[0] & typeof india
const worldGeo = worldData as Parameters<ReturnType<typeof geoPath>>[0] & typeof worldData
const indianPaths = geoPath(
  geoMercator().fitExtent(
    [
      [19, 10],
      [376, 258],
    ],
    indiaGeo,
  ),
)
const worldProjection = geoNaturalEarth1().fitExtent(
  [
    [7, 9],
    [394, 250],
  ],
  worldGeo,
)
const worldPaths = geoPath(worldProjection)
const existingMap = {
  'Andaman and Nicobar': 'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  Pondicherry: 'Puducherry',
} as Record<string, string>
const markers = [
  ['India', 78.9, 20.6],
  ['United States', -98.5, 38],
  ['United Kingdom', -2, 53],
  ['Canada', -103, 57],
  ['United Arab Emirates', 54, 24],
  ['Singapore', 104, 1.3],
] as const
export function Audience() {
  const day = usePulse((s) => s.day),
    cohort = usePulse((s) => s.cohort),
    setCohort = usePulse((s) => s.setCohort)
  const [world, setWorld] = useState(false)
  const [hover, setHover] = useState('')
  const d = getDemographics(day, cohort)
  const [shapes, paths] = world ? [worldGeo.features, worldPaths] : [indiaGeo.features, indianPaths]
  const tint = scaleLinear<string>()
    .domain([0, Math.max(...d.regions)])
    .range(['#202940', '#53dbec'])
  return (
    <section id="audience" className="section">
      <div className="shell">
        <SectionTitle
          index="03"
          label="AUDIENCE DEMOGRAPHICS"
          title="Who’s in"
          accent="the conversation?"
          description="Compare regions, age groups, languages, and interests across synthetic audience segments."
          aside={
            <span className="live-label">
              <ShieldCheck size={13} /> AGGREGATE ONLY
            </span>
          }
        />
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Audience cohort">
          {['All cohorts', ...communities].map((c, i) => (
            <button
              type="button"
              className={`chip ${i - 1 === cohort ? 'selected' : ''}`}
              aria-pressed={i - 1 === cohort}
              onClick={() => setCohort(i - 1)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <Reveal className="grid gap-4 lg:grid-cols-2">
          <div className="glass glass-pad">
            <CardTitle
              icon={Globe2}
              title="Geographic density"
              sub={hover || 'Share of synthetic audience'}
              aside={
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    aria-pressed={!world}
                    className={`chip ${!world ? 'selected' : ''}`}
                    onClick={() => {
                      setWorld(false)
                      setHover('')
                    }}
                  >
                    India
                  </button>
                  <button
                    type="button"
                    aria-pressed={world}
                    className={`chip ${world ? 'selected' : ''}`}
                    onClick={() => {
                      setWorld(true)
                      setHover('')
                    }}
                  >
                    World
                  </button>
                </div>
              }
            />
            <svg
              viewBox="0 0 400 266"
              className="mx-auto h-[245px] w-full sm:h-[290px]"
              role="img"
              aria-label={world ? 'World audience map' : 'Indian state audience map'}
            >
              {shapes
                .filter((f) => f.properties.name !== 'Antarctica')
                .map((f) => {
                  const name = f.properties.name
                  const region = existingMap[name] ?? name
                  const value = d.regions[regions.indexOf(region)] ?? 0
                  return (
                    <path
                      key={name}
                      d={paths(f as Parameters<typeof paths>[0]) ?? undefined}
                      fill={world ? '#293651' : tint(value)}
                      stroke="#0a1120"
                      strokeWidth=".65"
                      onPointerEnter={() => {
                        if (!world) setHover(`${region} · ${value}%`)
                      }}
                      onPointerLeave={() => setHover('')}
                    >
                      <title>{world ? name : `${region}: ${value}%`}</title>
                    </path>
                  )
                })}
              {world
                ? markers.map(([name, lon, lat], i) => {
                    const [x, y] = worldProjection([lon, lat])!
                    return (
                      <circle
                        key={name}
                        cx={x}
                        cy={y}
                        r={i === 0 ? 5 : 3}
                        fill="#7bf2fa"
                        stroke="#5299c7"
                        strokeWidth="3"
                        onPointerEnter={() => setHover(`${name} · ${d.world[i]}%`)}
                        onPointerLeave={() => setHover('')}
                      >
                        <title>
                          {name}: {d.world[i]}%
                        </title>
                      </circle>
                    )
                  })
                : [0, 1, 2, 3].map((i) => {
                    const f = india.features.find((x) => x.properties.name === regions[i])
                    if (!f) return null
                    const [x, y] = indianPaths.centroid(f as Parameters<typeof indianPaths>[0])
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={3}
                        fill="#c1fbff"
                        stroke="#5aeafa"
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                    )
                  })}
            </svg>
            <details className="mt-2 text-[11px] text-[#a7b7d2]">
              <summary>Geography data table</summary>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {(world ? markers.map((m) => m[0]) : regions).map((region, i) => (
                  <span key={region}>
                    {region}: {(world ? d.world : d.regions)[i]}%
                  </span>
                ))}
              </div>
            </details>
          </div>
          <div className="glass glass-pad">
            <CardTitle icon={Users} title="Age brackets" sub="Share of audience, grouped" />
            <Bars labels={ageGroups} values={d.ages} max={52} />
            <div className="mt-7 rounded-lg border border-[#294153] bg-[#10202c] p-3 text-[11px] leading-relaxed text-[#b5c9db]">
              <Fingerprint size={15} className="mr-2 inline text-pulse" /> Production privacy
              target: k-anonymity ≥ 50 · differential privacy ε = 1.0 · no individual profiles
              stored. Demo counts are synthetic.
            </div>
          </div>
          <div className="glass glass-pad">
            <CardTitle icon={Radio} title="Language mix" sub="Includes code-mixed Hinglish" />
            <Donut labels={languages} values={d.languages} />
          </div>
          <div className="glass glass-pad">
            <CardTitle
              icon={Layers3}
              title="Professional interests"
              sub="Aggregate interests and community themes"
            />
            <Radar labels={interests} values={d.interests} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
export function Spark({
  values,
  low,
  high,
  color = '#63eaf5',
}: {
  values: number[]
  low?: number[]
  high?: number[]
  color?: string
}) {
  if (!values.length) return null
  const all = [...values, ...(low ?? []), ...(high ?? [])]
  const min = Math.min(...all) - 3,
    max = Math.max(...all) + 3
  const points = (v: number[]) =>
    v.map(
      (n, i) =>
        `${4 + (i * 84) / Math.max(1, v.length - 1)},${30 - ((n - min) / (max - min)) * 26}`,
    )
  return (
    <svg viewBox="0 0 92 34" className="h-8 w-[83px] shrink-0" aria-hidden="true">
      {low && high && (
        <polygon
          fill={`${color}32`}
          points={[...points(high), ...points(low).reverse()].join(' ')}
        />
      )}
      <polyline fill="none" stroke={color} strokeWidth="1.7" points={points(values).join(' ')} />
    </svg>
  )
}
export function Trends() {
  const day = usePulse((s) => s.day),
    cohort = usePulse((s) => s.cohort),
    selected = usePulse((s) => s.trend),
    setTrend = usePulse((s) => s.setTrend),
    reduced = useReducedMotion()
  const ranked = getTopTrends(day, cohort),
    top = ranked.slice(0, 10),
    spot = ranked.find((t) => t.keyword === selected) ?? top[0],
    viral =
      [...ranked].filter((t) => t.stage === 'Rising').sort((a, b) => b.velocity - a.velocity)[0] ??
      ranked[0]
  return (
    <section id="trends" className="section">
      <div className="shell">
        <SectionTitle
          index="04"
          label="TREND RADAR"
          title="See what’s"
          accent="catching on."
          description="Rank topics by momentum, identify their lifecycle, and inspect the next 24 hours."
          aside={<span className="chip selected">DAY {String(day).padStart(2, '0')}</span>}
        />
        <Reveal className="chart-grid">
          <div className="glass glass-pad overflow-x-auto">
            <CardTitle
              icon={TrendingUp}
              title="Top 10 topics"
              sub="Ranks update with the timeline and cohort"
            />
            <table className="trend-table min-w-[530px]">
              <thead>
                <tr>
                  <th>Rank / Topic</th>
                  <th>Momentum</th>
                  <th>Velocity</th>
                  <th>Lifecycle</th>
                  <th>24h forecast</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {top.map((t, i) => (
                    <motion.tr
                      layout={!reduced}
                      key={t.keyword}
                      className={t.keyword === selected ? 'picked' : ''}
                    >
                      <td>
                        <button
                          type="button"
                          onClick={() => setTrend(t.keyword)}
                          aria-pressed={t.keyword === selected}
                          className="text-left font-medium hover:text-pulse"
                        >
                          <span className="mr-2 font-mono text-[#8596b8]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {t.hashtag}
                        </button>
                      </td>
                      <td>
                        <Spark values={t.history} />
                      </td>
                      <td className={t.velocity < 0 ? 'text-[#ffa1b5]' : 'text-[#a5ed9d]'}>
                        {t.velocity >= 0 ? '+' : ''}
                        {t.velocity}%
                      </td>
                      <td>
                        <span
                          className={`chip ${t.stage === 'Viral' || t.stage === 'Rising' ? 'selected' : ''}`}
                        >
                          {t.stage}
                        </span>
                      </td>
                      <td>
                        <Spark values={t.forecast} low={t.low} high={t.high} color="#b397ff" />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="grid content-start gap-4">
            <div className="glass glass-pad">
              <CardTitle
                icon={Sparkles}
                title="Predicted to go viral"
                sub="Scenario forecast · next 24h"
              />
              <p className="font-display text-2xl font-bold text-pulse">{viral.hashtag}</p>
              <div className="my-3 flex items-center gap-3">
                <div className="barchart-rail flex-1">
                  <i style={{ width: `${viral.confidence}%` }} />
                </div>
                <span className="font-mono text-xs">{viral.confidence}%</span>
              </div>
              <div className="mono-label">
                T − {Math.max(0, 24 - ((day * 7) % 20))}h / signal window
              </div>
            </div>
            <div className="glass glass-pad">
              <CardTitle
                icon={ScanLine}
                title="Keyword cloud"
                sub="Select a topic to inspect its forecast"
              />
              <div className="flex flex-wrap gap-2.5">
                {top.slice(0, 8).map((t, i) => (
                  <button
                    type="button"
                    key={t.keyword}
                    className="bubble"
                    aria-pressed={t.keyword === selected}
                    onClick={() => setTrend(t.keyword)}
                    style={
                      {
                        '--bubble': donutColors[i],
                        animationDelay: `-${i * 0.66}s`,
                      } as CSSProperties
                    }
                  >
                    {t.hashtag}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between gap-2 rounded-lg bg-[#0e192a] p-3">
                <div>
                  <div className="text-xs font-semibold">{spot.hashtag}</div>
                  <div className="mt-1 text-[10px] text-[#a6b4cc]">
                    {spot.stage} · {spot.confidence}% model confidence
                  </div>
                </div>
                <Spark values={spot.forecast} low={spot.low} high={spot.high} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
