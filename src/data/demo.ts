export const EMOTIONS = [
  'excitement',
  'support',
  'anxiety',
  'anger',
  'sarcasm',
  'opposition',
  'hope',
] as const
export type Emotion = (typeof EMOTIONS)[number]
export const colors: Record<Emotion, string> = {
  excitement: '#f8b65f',
  support: '#a3e635',
  anxiety: '#a78bfa',
  anger: '#fb647a',
  sarcasm: '#ec4899',
  opposition: '#fb923c',
  hope: '#22d3ee',
}
export const platforms = ['X', 'Telegram', 'Instagram', 'Facebook', 'Reddit', 'YouTube'] as const
export const platformColors = ['#dce8f9', '#55c9ff', '#f27bb1', '#739afa', '#fa956c', '#fa667d']
export const communities = [
  'Tech Reviewers',
  'Students',
  'Gamers',
  'Finance Folks',
  'Brand Loyalists',
  'Skeptics',
]
export const communityColors = ['#35e2f0', '#a389ff', '#f078b6', '#f7bc73', '#a3e635', '#6b9dff']
export const events = [
  { day: 3, name: 'Nova X1 launch' },
  { day: 8, name: 'Influencer review' },
  { day: 12, name: 'Battery controversy' },
  { day: 15, name: 'CEO response' },
  { day: 20, name: 'Free replacements' },
  { day: 27, name: 'Competitor comparison' },
]
export const stages = ['Emerging', 'Rising', 'Viral', 'Peaking', 'Declining'] as const
export function rng(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}
const start = Date.UTC(2026, 3, 1)
export function stamp(day: number, hour = 0, minute = 0) {
  return new Date(start + (((day - 1) * 24 + hour) * 60 + minute) * 60000).toISOString()
}
export function dateLabel(day: number) {
  return `APR ${String(day).padStart(2, '0')}, 2026`
}
const bell = (day: number, center: number, spread = 1.65) =>
  Math.exp(-((day - center) ** 2) / (2 * spread ** 2))
const narrative = [
  'NovaX1',
  'NovaBattery',
  'ShotOnNova',
  'NovaReplace',
  'FlagshipFaceoff',
  'ThermalTest',
  'NovaUnboxed',
  'GamingOnX1',
  'CEOResponse',
  'NovaCamera',
  'NovaDisplay',
  'FastCharging',
  'NovaCare',
  'BatteryTips',
  'NovaUpdate',
  'PhoneDeals',
  'CreatorTest',
  'NovaAccessories',
  'RepairRight',
  'AndroidTalk',
]
const peakDays = [3, 12, 8, 20, 27, 13, 4, 10, 15, 10, 6, 17, 22, 13, 23, 28, 19, 29, 17, 25]
const trendAmplitude = (i: number) => (i === 1 ? 133 : 98 - i * 3.2)
const rand = rng(901)
export const users = Array.from({ length: 150 }, (_, id) => ({
  id,
  handle: `@signal_${String(id + 1).padStart(3, '0')}`,
  community: id % 6,
  followers: Math.round(420 + rand() ** 3 * 88500),
  pageRank: 0,
  betweenness: 0,
  bot: id % 13 === 11,
  topics: [narrative[id % 20], narrative[(id + 1) % 20], narrative[(id + 5) % 20]],
}))
export type User = (typeof users)[number]
export type Edge = {
  source: number
  target: number
  day: number
  timestamp: string
  type: 'reply' | 'retweet' | 'mention' | 'forward'
}
const connections = new Set<string>()
export const edges: Edge[] = []
function edge(source: number, target: number, day: number) {
  const pair = `${source}:${target}`
  if (source === target || connections.has(pair)) return
  connections.add(pair)
  edges.push({
    source,
    target,
    day,
    timestamp: stamp(day, Math.floor(rand() * 24)),
    type: (['reply', 'retweet', 'mention', 'forward'] as const)[Math.floor(rand() * 4)],
  })
}
for (let i = 0; i < 150; i++) {
  edge(i, (i + 6) % 150, 1 + Math.floor(rand() * 10))
  edge(i, i % 6 === 0 ? (i + 1) % 150 : (i + 18) % 150, 1 + Math.floor(rand() * 20))
}
while (edges.length < 408)
  edge(Math.floor(rand() * 150), Math.floor(rand() * 150), 1 + Math.floor(rand() * 30))
const adjacency = users.map((u) => edges.filter((e) => e.source === u.id).map((e) => e.target))
let ranks = users.map(() => 1 / 150)
for (let t = 0; t < 32; t++) {
  const next = users.map(() => 0.15 / 150)
  adjacency.forEach((targets, id) =>
    targets.forEach((target) => (next[target] += (0.85 * ranks[id]) / targets.length)),
  )
  ranks = next
}
// Brandes centrality on the seeded directed interaction graph.
const central = users.map(() => 0)
for (const u of users) {
  const dist = users.map(() => -1),
    count = users.map(() => 0),
    dep = users.map(() => 0),
    parents = users.map(() => [] as number[]),
    queue = [u.id]
  dist[u.id] = 0
  count[u.id] = 1
  for (let j = 0; j < queue.length; j++) {
    const v = queue[j]
    for (const w of adjacency[v]) {
      if (dist[w] < 0) {
        dist[w] = dist[v] + 1
        queue.push(w)
      }
      if (dist[w] === dist[v] + 1) {
        count[w] += count[v]
        parents[w].push(v)
      }
    }
  }
  for (const w of queue.reverse()) {
    for (const v of parents[w]) dep[v] += (count[v] / count[w]) * (1 + dep[w])
    if (w !== u.id) central[w] += dep[w]
  }
}
users.forEach((u, i) => {
  u.pageRank = ranks[i]
  u.betweenness = central[i] / (149 * 148)
})
export const leaders = [...users].sort((a, b) => b.pageRank - a.pageRank)
const texts: Record<Emotion, string[]> = {
  excitement: [
    'Finally got my hands on the Nova X1. That display is unreal!',
    'Nova X1 ka camera dekha? Itna crisp!',
    'Launch event camera demo was genuinely wild.',
  ],
  support: [
    'A week with the X1 and I would still recommend it.',
    'That independent review made a convincing case.',
    'Build quality is solid, price ke hisaab se great.',
  ],
  anxiety: [
    'My X1 started heating up on charge. Is it safe to keep using it?',
    'Battery itni garam kyun ho rahi hai?',
    'Waiting for an official update before I charge it again.',
  ],
  anger: [
    'The phone overheats on a normal call. This is unacceptable.',
    'Three support tickets and still no real answer.',
    'Stop blaming customers for a hardware problem.',
  ],
  sarcasm: [
    'Love that my new Nova doubles as a hand warmer. Premium feature 😂',
    'Amazing battery innovation: it heats up before I do.',
    'Wah Nova, phone ke saath complimentary heater bhi!',
  ],
  opposition: [
    'I would not buy this until we see independent thermal tests.',
    'The competing model looks like the better deal.',
    'Design is fine but that repair policy is a dealbreaker.',
  ],
  hope: [
    'Free replacements are a promising start. Let’s see how it goes.',
    'A transparent recall could actually rebuild trust.',
    'Replacement process simple ho toh main chance dunga.',
  ],
}
export const languages = [
  'English',
  'Hindi',
  'Hinglish',
  'Kannada',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Other',
]
export function emotionWeights(day: number, cohort = -1) {
  return [
    0.13 + 0.51 * bell(day, 3) + 0.1 * bell(day, 27),
    0.17 + 0.37 * bell(day, 8) + 0.16 * bell(day, 21),
    0.11 + 0.55 * bell(day, 12) + 0.07 * bell(day, 15),
    0.07 + 0.48 * bell(day, 12),
    0.08 + 0.34 * bell(day, 12.6),
    0.065 + 0.19 * bell(day, 13) + 0.14 * bell(day, 27),
    0.12 + 0.22 * bell(day, 15) + 0.5 * bell(day, 20),
  ].map((v, i) => v * (cohort < 0 ? 1 : 0.86 + ((i + cohort * 3) % 7) * 0.057))
}
function pick(weights: number[], random: number) {
  let x = random * weights.reduce((a, b) => a + b, 0)
  return weights.findIndex((v) => (x -= v) < 0)
}
export interface Post {
  id: string
  day: number
  platform: (typeof platforms)[number]
  handle: string
  text: string
  timestamp: string
  emotion: Emotion
  scores: Record<Emotion, number>
  language: string
  hashtags: string[]
  likes: number
  shares: number
  community: number
}
let cachedPosts: Post[] | undefined
export const postCount = 12480
export function getPosts() {
  if (cachedPosts) return cachedPosts
  const p = rng(4217)
  cachedPosts = Array.from({ length: postCount }, (_, i) => {
    const day = 1 + Math.floor(i / 416),
      hour = Math.floor(((i % 416) * 24) / 416),
      user = users[Math.floor(p() * 150)]
    const emotion = EMOTIONS[pick(emotionWeights(day, user.community), p())]
    const variant = Math.floor(p() * 3),
      text = texts[emotion][variant]
    const topic =
      day >= 11 && day <= 16
        ? 1
        : day >= 19 && day <= 22
          ? 3
          : day >= 26
            ? 4
            : day >= 7 && day <= 9
              ? 2
              : 0
    const scores = Object.fromEntries(
      EMOTIONS.map((e) => [e, +(e === emotion ? 0.65 + p() * 0.34 : p() * 0.39).toFixed(2)]),
    ) as Record<Emotion, number>
    return {
      id: `evt-${i + 1}`,
      day,
      platform: platforms[pick([45, 30, 10, 8, 4, 3], ((i * 37) % 100) / 100)],
      handle: user.handle,
      text,
      timestamp: stamp(day, hour, Math.floor(((i % 416) * 24 * 60) / 416) % 60),
      emotion,
      scores,
      language: /\b(ka|kyun|Wah|toh|itna|hisaab)\b/i.test(text)
        ? 'Hinglish'
        : languages[pick([88, 3, 0, 2, 2, 2, 1, 1, 1], p())],
      hashtags: [`#${narrative[topic]}`],
      likes: Math.floor(p() ** 3 * 2200),
      shares: Math.floor(p() ** 3 * 630),
      community: user.community,
    }
  })
  return cachedPosts
}
const seriesCache = new Map<number, ReturnType<typeof makeSeries>>()
function makeSeries(cohort: number) {
  const result = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    ...(Object.fromEntries(EMOTIONS.map((e) => [e, 0])) as Record<Emotion, number>),
  }))
  for (const post of getPosts()) {
    if (cohort === -1 || post.community === cohort) result[post.day - 1][post.emotion]++
  }
  return result
}
export function getEmotionSeries(cohort = -1) {
  if (!seriesCache.has(cohort)) seriesCache.set(cohort, makeSeries(cohort))
  return seriesCache.get(cohort)!
}
export const trends = narrative.map((keyword, i) => {
  const random = rng(900 + i)
  return {
    keyword,
    hashtag: `#${keyword}`,
    hourly: Array.from({ length: 720 }, (_, h) =>
      Math.round(
        7 + random() * 7 + trendAmplitude(i) * bell(h / 24 + 1, peakDays[i], i === 1 ? 2.5 : 2.1),
      ),
    ),
    peak: peakDays[i],
  }
})
export function getTopTrends(day: number, cohort = -1) {
  return trends
    .map((t, i) => {
      const weight = cohort < 0 ? 1 : 0.7 + ((i * 3 + cohort * 5) % 13) / 20
      const hour = day * 24 - 1
      const at = (h: number) => t.hourly[Math.max(0, Math.min(719, h))]
      const history = Array.from({ length: 12 }, (_, j) =>
        Math.round(at(hour - 6 * (11 - j)) * weight),
      )
      const velocity = Math.round(((history.at(-1)! - history[7]) / (history[7] + 6)) * 100)
      const stage =
        day === t.peak && i < 5
          ? 'Viral'
          : Math.abs(day - t.peak) <= 1
            ? 'Peaking'
            : day < t.peak
              ? t.peak - day < 5
                ? 'Rising'
                : 'Emerging'
              : 'Declining'
      const forecast = Array.from({ length: 8 }, (_, j) =>
        Math.round(
          weight * (10 + trendAmplitude(i) * bell(day + j / 7, t.peak, i === 1 ? 2.5 : 2.1)),
        ),
      )
      return {
        ...t,
        history,
        velocity,
        stage,
        forecast,
        low: forecast.map((x) => Math.max(0, x - 12)),
        high: forecast.map((x) => x + 12),
        confidence: 72 + ((i * 7 + day * 3) % 24),
        score: history.at(-1)! + Math.max(0, velocity) * 0.22,
      }
    })
    .sort((a, b) => b.score - a.score)
}
export const ageGroups = ['13–17', '18–24', '25–34', '35–44', '45–54', '55+']
export const interests = [
  'Tech',
  'Finance',
  'Students',
  'Creators',
  'Healthcare',
  'Politics',
  'Sports',
  'Gaming',
]
export const regions = [
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Kerala',
  'Madhya Pradesh',
  'Bihar',
  'Odisha',
  'Punjab',
  'Haryana',
  'Assam',
  'Jharkhand',
  'Chhattisgarh',
  'Andhra Pradesh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Goa',
  'Sikkim',
  'Arunachal Pradesh',
  'Nagaland',
  'Manipur',
  'Mizoram',
  'Tripura',
  'Meghalaya',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
  'Andaman and Nicobar Islands',
  'Lakshadweep',
  'Dadra and Nagar Haveli and Daman and Diu',
]
export function getDemographics(day: number, cohort = -1) {
  const r = rng(day * 51 + cohort + 2)
  const mix = (base: number[]) => {
    const a = base.map((v) => v * (0.78 + r() * 0.44))
    const total = a.reduce((x, y) => x + y, 0)
    return a.map((v) => +((v / total) * 100).toFixed(1))
  }
  return {
    ages: mix([7, cohort === 1 ? 64 : 33, 34, 17, 7, 3]),
    languages: mix([40, 19, 23, 4, 3, 3, 3, 3, 2]),
    interests: mix([28, 10, 15, 12, 5, 5, 7, 18].map((n, i) => (i === cohort ? n * 1.5 : n))),
    regions: mix(regions.map((_, i) => (i < 10 ? 30 - i * 2.3 : 3.5))),
    world: mix([67, 12, 8, 7, 4, 2]),
  }
}
export function getGraph(day: number, cohort = -1) {
  return {
    nodes: users,
    edges: edges.filter(
      (e) =>
        e.day <= day &&
        (cohort < 0 ||
          users[e.source].community === cohort ||
          users[e.target].community === cohort),
    ),
  }
}
export function shortestPath(seed: number, targetCommunity: number, day: number) {
  const queue = [[seed]],
    seen = new Set([seed])
  const active = getGraph(day).edges
  for (const path of queue) {
    const v = path.at(-1)!
    if (path.length > 1 && users[v].community === targetCommunity) return path
    for (const e of active) {
      if (e.source !== v || seen.has(e.target)) continue
      seen.add(e.target)
      queue.push([...path, e.target])
    }
  }
  return []
}
export const tones = ['Neutral', 'Empathetic', 'Urgent'] as const
export type Tone = (typeof tones)[number]
export function simulateCascade(seedId: number, tone: Tone, day = 30, cohort = -1) {
  const seed = users[seedId]
  if (!seed) return { waves: [], links: [], reach: 0 }
  const random = rng(seedId * 763 + day * 97)
  const graph = getGraph(day, cohort).edges
  // Use the same edge rolls for each tone so the baseline is a paired comparison.
  const outgoing = users.map(() => [] as { edge: Edge; roll: number }[])
  for (const edge of graph) outgoing[edge.source].push({ edge, roll: random() })
  const waves = [[seedId]],
    seen = new Set([seedId])
  const links: Edge[][] = [[]]
  for (let h = 0; h < 14 && waves[h].length; h++) {
    const next: number[] = [],
      step: Edge[] = []
    for (const from of waves[h])
      for (const { edge: e, roll } of outgoing[from]) {
        if (seen.has(e.target)) continue
        const chance =
          (tone === 'Empathetic' ? 0.79 : tone === 'Urgent' ? 0.68 : 0.56) *
          (users[e.source].community === users[e.target].community ? 1 : 0.76)
        if (roll < chance) {
          seen.add(e.target)
          next.push(e.target)
          step.push(e)
        }
      }
    if (!next.length) break
    waves.push(next)
    links.push(step)
  }
  return { waves, links, reach: [...seen].reduce((sum, id) => sum + users[id].followers, 0) }
}
export const narratives = [
  {
    topic: 'NovaBattery',
    title: 'The overheating inflection',
    day: 12,
    cohort: 5,
    emotion: 'anxiety',
    tag: 'HIGH PRIORITY',
    brief:
      'Battery concern crossed from reviewers into general discussion. The strongest signal is uncertainty about safe charging, not dislike of the product.',
    action: 'Publish a verified safety FAQ and put it in the threads already carrying the story.',
  },
  {
    topic: 'NovaX1',
    title: 'A launch worth talking about',
    day: 3,
    cohort: 1,
    emotion: 'excitement',
    tag: 'LAUNCH MOMENT',
    brief:
      'The display and camera reveal drove a concentrated excitement spike. Student and creator circles amplified short, visual demonstrations.',
    action: 'Lead with real camera samples and keep the launch thread easy to share.',
  },
  {
    topic: 'ShotOnNova',
    title: 'Trust through independent reviews',
    day: 8,
    cohort: 0,
    emotion: 'support',
    tag: 'BREAKOUT',
    brief:
      'Independent reviewers moved discussion from launch speculation to everyday performance. Positive reactions clustered around battery endurance and camera quality.',
    action: 'Link to complete reviews and separate tested claims from marketing copy.',
  },
  {
    topic: 'NovaReplace',
    title: 'A credible route back to trust',
    day: 20,
    cohort: 4,
    emotion: 'hope',
    tag: 'RECOVERY',
    brief:
      'Clear replacement criteria made the recovery tangible. Support rose faster in brand-loyalist circles, while skeptics requested proof of fulfillment.',
    action: 'Publish replacement turnaround times and answer eligibility questions in public.',
  },
  {
    topic: 'FlagshipFaceoff',
    title: 'The comparison cycle returns',
    day: 27,
    cohort: 2,
    emotion: 'opposition',
    tag: 'WATCHLIST',
    brief:
      'Comparison clips brought the conversation back to benchmarks. Gaming communities are debating sustained performance rather than headline specifications.',
    action: 'Share independent benchmarks with reproducible test conditions.',
  },
] satisfies {
  topic: string
  title: string
  day: number
  cohort: number
  emotion: Emotion
  tag: string
  brief: string
  action: string
}[]
export const copilotPrompts = [
  {
    prompt: 'Why did sentiment drop on Day 12?',
    section: 'emotions',
    cite: 'Emotion timeline',
    answer:
      'On Day 12, overheating reports spread beyond early reviewers. Anxiety and anger displaced launch excitement, while sarcastic posts about the phone doubling as a heater amplified the story. The demo signal comes from the synthetic emotion timeline and the #NovaBattery volume peak.',
  },
  {
    prompt: 'Who is driving the #NovaBattery conversation?',
    section: 'network',
    cite: 'Influence network',
    answer:
      'Tech Reviewers seeded the conversation. The Skeptics community amplified the safety angle, and cross-community replies carried the discussion into the student cohort. Explore the anonymized graph to compare bridges and replay the cascade.',
  },
  {
    prompt: 'Which cohort is most excited?',
    section: 'audience',
    cite: 'Audience breakdown',
    answer:
      'Students are a standout in the launch narrative, with excitement around the camera and display. Select the Students cohort and scrub to Day 3 to compare its emotion mix with the overall audience. All figures in this replay are aggregate and synthetic.',
  },
]
