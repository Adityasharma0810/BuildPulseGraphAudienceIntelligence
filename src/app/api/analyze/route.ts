import { groq } from '@/lib/server/groq'
import { rateLimit } from '@/lib/server/rateLimit'
import { prompts, schemas } from '@/lib/server/prompts'
import { readInput, sanitize } from '@/lib/server/sanitize'
import {
  engineNames,
  engines,
  getTryItDemo,
  type LabResults,
  type Report,
  type Stage,
} from '@/data/tryItDemo'

export const runtime = 'nodejs'
export const maxDuration = 60
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function POST(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return Response.json({ message: 'Please submit from the PulseGraph page.' }, { status: 403 })
  const input = await readInput(request)
  if (!input)
    return Response.json(
      { message: 'Enter 1–20 posts, each at most 500 characters and 6,000 characters total.' },
      { status: 400 },
    )
  const key = process.env.GROQ_API_KEY?.trim()
  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile'
  const rawLimit = Number(process.env.RATE_LIMIT_PER_MIN || 5)
  const limit = Number.isFinite(rawLimit) ? Math.min(60, Math.max(1, Math.floor(rawLimit))) : 5
  const mock = process.env.USE_MOCK?.toLowerCase() === 'true'
  const gate = key && !mock ? rateLimit(request.headers, limit) : { allowed: true, retryAfter: 0 }
  const encoder = new TextEncoder(),
    abort = new AbortController()
  const signal = AbortSignal.any([request.signal, abort.signal])
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const t = performance.now()
      const emit = (event: string, data: unknown) => {
        if (!signal.aborted)
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }
      const stage = (
        id: string,
        label: string,
        state: Stage['state'],
        extras: Partial<Stage> = {},
      ) => emit('stage', { id, label, state, ...extras })
      const finish = (data: LabResults, meta: Omit<Report['meta'], 'totalLatencyMs'>) =>
        emit('result', {
          ...data,
          meta: { ...meta, totalLatencyMs: Math.round(performance.now() - t) },
        })
      const demo = async (reason: NonNullable<Report['meta']['reason']>, reset = false) => {
        const { data, sample, illustrative } = getTryItDemo(input.posts, input.context)
        emit('mode', {
          mode: 'demo',
          model: 'PulseGraph cached demo',
          reason,
          retryAfter: gate.retryAfter,
          sample,
          illustrative,
          reset,
        })
        await Promise.all(
          engines.map(async (engine, i) => {
            stage(engine, engineNames[engine as keyof typeof engineNames], 'started', {
              detail: 'Cached example',
            })
            const now = performance.now()
            await sleep(185 + i * 100)
            stage(engine, engineNames[engine as keyof typeof engineNames], 'done', {
              latencyMs: Math.round(performance.now() - now),
              tokens: 0,
              detail: 'Cached example',
            })
            emit('engine', { engine, data: data[engine] })
          }),
        )
        stage('fusion', 'Fusing results into a Narrative Card', 'started')
        await sleep(140)
        stage('fusion', 'Fusing results into a Narrative Card', 'done', { tokens: 0 })
        finish(data, {
          model: 'PulseGraph cached demo',
          totalTokens: 0,
          mode: 'demo',
          reason,
          retryAfter: gate.retryAfter,
          sample,
          illustrative,
        })
      }
      const heartbeat = setInterval(() => {
        if (!signal.aborted) controller.enqueue(encoder.encode(': keep-alive\n\n'))
      }, 6500)
      const run = async () => {
        stage('input', 'Receiving input', 'done', { detail: `${input.posts.length} posts` })
        const clean = sanitize(input)
        stage('sanitize', 'Sanitizing & masking PII', 'done', {
          detail: `${clean.masked} matches masked`,
        })
        stage(
          'security',
          gate.allowed ? 'Security checks passed' : 'Live rate limit reached',
          gate.allowed ? 'done' : 'fallback',
          { detail: gate.allowed ? 'Request validated' : `Retry in ${gate.retryAfter} s` },
        )
        if (mock || !key || !gate.allowed) {
          await demo(mock ? 'mock' : !key ? 'unconfigured' : 'rate-limited')
          return
        }
        emit('mode', { mode: 'live', model })
        const parallel = new AbortController()
        const upstream = AbortSignal.any([parallel.signal, signal])
        const data = { posts: clean.posts, context: clean.context }
        try {
          const runEngine = async <E extends keyof LabResults>(
            engine: E,
            body: unknown,
            validate?: (output: LabResults[E]) => LabResults[E],
          ) => {
            const title =
              engine === 'brief'
                ? 'Fusing results into a Narrative Card'
                : engineNames[engine as keyof typeof engineNames]
            stage(engine === 'brief' ? 'fusion' : engine, title, 'started')
            const result = await groq<LabResults[E]>({
              key,
              model,
              prompt: prompts[engine],
              data: body,
              schema: schemas[engine] as unknown as import('zod').ZodType<LabResults[E]>,
              signal: upstream,
            })
            upstream.throwIfAborted()
            const checked = validate ? validate(result.data) : result.data
            stage(engine === 'brief' ? 'fusion' : engine, title, 'done', {
              latencyMs: result.latencyMs,
              tokens: result.tokens,
            })
            if (engine !== 'brief') emit('engine', { engine, data: checked })
            return { ...result, data: checked }
          }
          const [emotions, demographics, trends, network] = await Promise.all([
            runEngine('emotions', data, (out) => {
              if (
                out.posts.length !== clean.posts.length ||
                out.posts.some((p, i) => p.index !== i + 1)
              )
                throw new Error('Invalid post indices')
              return {
                posts: out.posts.map((p, i) => ({
                  ...p,
                  tokens: p.tokens.filter((token) =>
                    clean.posts[i].toLowerCase().includes(token.toLowerCase()),
                  ),
                })),
              }
            }),
            runEngine('demographics', data, (out) => ({ ...out, ages: [] })),
            runEngine('trends', data),
            runEngine('network', data, (out) => {
              const ids = new Set(out.nodes.map((n) => n.id))
              if (
                ids.size !== out.nodes.length ||
                [...ids].some((id) => Number(id.slice(1)) > clean.posts.length)
              )
                throw new Error('Invalid network IDs')
              return {
                ...out,
                edges: out.edges.filter(
                  (e) => e.source !== e.target && ids.has(e.source) && ids.has(e.target),
                ),
                path: out.path.filter((id) => ids.has(id)),
                influencer: out.influencer && ids.has(out.influencer) ? out.influencer : null,
              }
            }),
          ])
          const partial = {
            emotions: emotions.data,
            demographics: demographics.data,
            trends: trends.data,
            network: network.data,
          }
          const brief = await runEngine('brief', partial)
          finish(
            { ...partial, brief: brief.data },
            {
              model,
              totalTokens: [emotions, demographics, trends, network, brief].reduce(
                (sum, r) => sum + r.tokens,
                0,
              ),
              mode: 'live',
            },
          )
        } catch {
          parallel.abort()
          if (!signal.aborted) await demo('upstream', true)
        }
      }
      void run()
        .then(() => emit('done', {}))
        .catch(() => emit('error', { message: 'The analysis did not complete. Please try again.' }))
        .finally(() => {
          clearInterval(heartbeat)
          if (!signal.aborted) controller.close()
        })
    },
    cancel() {
      abort.abort()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, no-transform',
      'X-Accel-Buffering': 'no',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
