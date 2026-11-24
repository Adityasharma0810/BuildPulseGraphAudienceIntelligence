export const emotionKeys = [
  'anxiety',
  'excitement',
  'sarcasm',
  'support',
  'opposition',
  'anger',
  'hope',
] as const
export type LabEmotion = (typeof emotionKeys)[number]
export type LabResults = {
  emotions: {
    posts: {
      index: number
      scores: Record<LabEmotion, number>
      dominant: LabEmotion
      reason: string
      tokens: string[]
    }[]
  }
  demographics: {
    ages: { label: string; value: number }[]
    languages: { label: string; value: number }[]
    regions: string[]
    interests: string[]
    confidence: number
    note: string
  }
  trends: {
    topics: {
      label: string
      keywords: string[]
      hashtags: string[]
      velocity: 'low' | 'medium' | 'high'
      stage: 'Emerging' | 'Rising' | 'Viral' | 'Peaking' | 'Declining'
      prediction: string
      forecast: number[]
    }[]
  }
  network: {
    nodes: { id: string; label: string; community: string; influence: number }[]
    edges: { source: string; target: string; type: 'reply' | 'mention' | 'amplification' }[]
    influencer: string | null
    path: string[]
    note: string
  }
  brief: { title: string; insight: string; actions: string[] }
}
export type Engine = Exclude<keyof LabResults, 'brief'>
export type Report = LabResults & {
  meta: {
    model: string
    totalLatencyMs: number
    totalTokens: number
    mode: 'live' | 'demo'
    reason?: 'unconfigured' | 'rate-limited' | 'upstream' | 'mock'
    retryAfter?: number
    sample?: string
    illustrative?: boolean
  }
}
export const engineNames: Record<Engine, string> = {
  emotions: 'Emotion engine',
  demographics: 'Demographic engine',
  trends: 'Trend engine',
  network: 'Influence engine',
}
export const engines = Object.keys(engineNames) as Engine[]
export type Stage = {
  id: string
  label: string
  state: 'started' | 'done' | 'fallback'
  detail?: string
  latencyMs?: number
  tokens?: number
}
export type AnalyzePayload = { posts: string[]; context: string }
export const samples = [
  {
    name: 'Product launch hype',
    context: 'Nova X1 launch',
    posts: [
      'Finally got a Nova X1. That screen looks incredible! #NovaX1',
      'Camera samples are sharp. I can actually recommend this one.',
      'If the launch price holds, this could be the phone to beat.',
      'Already shared the launch clip in my student group!',
    ],
    dominants: ['excitement', 'support', 'hope', 'excitement'],
    topic: '#NovaX1',
    brief:
      'Visual demos are doing the heavy lifting. Enthusiasm for the display and camera is reinforced by a tentative value story.',
    actions: [
      'Share real camera and display samples.',
      'Clarify launch pricing and inventory.',
      'Measure whether excitement persists after the first reviews.',
    ],
  },
  {
    name: 'Crisis thread with sarcasm',
    context: 'Nova X1 battery reports',
    posts: [
      'Love that my Nova doubles as a hand warmer. Premium feature 😂 #NovaBattery',
      'My X1 gets hot on charge. Is it safe to plug in tonight?',
      'Stop sending scripted replies. We need a real fix.',
      'I would wait for the official replacement policy.',
    ],
    dominants: ['sarcasm', 'anxiety', 'anger', 'opposition'],
    topic: '#NovaBattery',
    brief:
      'What looks like product praise in isolation is criticism. Across the thread, the central concern is whether customers can safely charge their device.',
    actions: [
      'Publish verified charging and safety guidance.',
      'Pin a plain-language update where the thread is spreading.',
      'Give a timeline for replacement eligibility and follow-up.',
    ],
  },
  {
    name: 'Hinglish mixed thread',
    context: 'Nova X1 owner reactions',
    posts: [
      'Nova X1 ka camera dekha? Itna crisp! #ShotOnNova',
      'Battery itni garam kyun ho rahi hai? Anyone else?',
      'Wah Nova, complimentary heater bhi mil gaya.',
      'Replacement process simple ho toh main chance dunga.',
    ],
    dominants: ['excitement', 'anxiety', 'sarcasm', 'hope'],
    topic: '#ShotOnNova',
    brief:
      'Hinglish posts show a split reaction: delight with the camera and concern about charging. A literal translation can erase the sarcastic heater reference.',
    actions: [
      'Publish updates in both English and Hinglish.',
      'Separate camera advocacy from battery-related questions.',
      'Share concrete replacement steps in the original discussion.',
    ],
  },
] satisfies {
  name: string
  context: string
  posts: string[]
  dominants: LabEmotion[]
  topic: string
  brief: string
  actions: string[]
}[]
const demos: LabResults[] = samples.map((s, i) => ({
  emotions: {
    posts: s.dominants.map((dominant, index) => ({
      index: index + 1,
      dominant,
      scores: Object.fromEntries(
        emotionKeys.map((e, j) => [
          e,
          e === dominant ? 0.92 - index * 0.045 : (2 + ((i * 7 + j * 4 + index * 3) % 29)) / 100,
        ]),
      ) as Record<LabEmotion, number>,
      reason:
        dominant === 'sarcasm'
          ? 'Apparent praise conflicts with the negative overheating reference.'
          : {
              anxiety: 'The writer expresses uncertainty about a battery symptom.',
              excitement: 'Emphatic wording signals delight.',
              support: 'The writer endorses a feature.',
              opposition: 'The writer explicitly recommends waiting.',
              anger: 'The demand for a fix conveys frustration.',
              hope: 'A better outcome is described as possible.',
            }[dominant],
      tokens:
        dominant === 'sarcasm'
          ? [i === 1 ? 'Love' : 'Wah Nova', i === 1 ? 'hand warmer' : 'complimentary heater']
          : [],
    })),
  },
  demographics: {
    ages: [],
    languages: i === 2 ? [{ label: 'Hinglish', value: 100 }] : [{ label: 'English', value: 100 }],
    regions: [],
    interests:
      i === 0
        ? ['Mobile photography', 'Consumer tech']
        : i === 1
          ? ['Consumer safety', 'Product support']
          : ['Mobile photography', 'Product support'],
    confidence: 0.79,
    note: 'Illustrative thread language and topics only. No age or location can be established from this sample.',
  },
  trends: {
    topics: [
      {
        label: s.topic.slice(1),
        keywords: i === 1 ? ['overheating', 'battery safety'] : ['camera', 'first impressions'],
        hashtags: [s.topic],
        velocity: i === 1 ? 'high' : 'medium',
        stage: i === 1 ? 'Viral' : 'Rising',
        prediction:
          i === 1
            ? 'Unanswered charging questions could sustain attention.'
            : 'Hands-on samples could increase interest in the next 24 hours.',
        forecast: [16, 21, 20, 29, 32, 38, 46].map((n, j) => (i === 1 ? n + j * 5 : n)),
      },
    ],
  },
  network: {
    nodes: [
      { id: 'p1', label: 'Post 1', community: 'Seed discussion', influence: 0.92 },
      { id: 'p2', label: 'Post 2', community: 'Follow-up', influence: 0.63 },
      { id: 'p3', label: 'Post 3', community: 'Follow-up', influence: 0.41 },
      { id: 'p4', label: 'Post 4', community: 'Response', influence: 0.53 },
    ],
    edges: [
      { source: 'p1', target: 'p2', type: 'amplification' },
      { source: 'p2', target: 'p3', type: 'reply' },
      { source: 'p2', target: 'p4', type: 'mention' },
    ],
    influencer: 'p1',
    path: ['p1', 'p2', 'p4'],
    note: 'Illustrative links only; these are not verified social interactions.',
  },
  brief: {
    title:
      i === 1
        ? 'Heat, uncertainty, and a trust gap'
        : i === 2
          ? 'The mixed-language signal'
          : 'First impressions drive momentum',
    insight: s.brief,
    actions: s.actions,
  },
}))
export function getTryItDemo(posts: string[], context: string) {
  const exact = samples.findIndex(
    (s) => s.posts.length === posts.length && s.posts.every((p, i) => p === posts[i]),
  )
  const text = `${context} ${posts.join(' ')}`
  const i =
    exact >= 0
      ? exact
      : /\b(kyun|itna|toh|hinglish|wah)\b/i.test(text)
        ? 2
        : /crisis|overheat|battery|hand warmer/i.test(text)
          ? 1
          : 0
  return { data: demos[i], sample: samples[i].name, illustrative: exact < 0 }
}
