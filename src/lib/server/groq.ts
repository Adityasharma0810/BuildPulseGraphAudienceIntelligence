import 'server-only'
import type { ZodType } from 'zod'
export async function groq<T>({
  key,
  model,
  prompt,
  data,
  schema,
  signal,
}: {
  key: string
  model: string
  prompt: string
  data: unknown
  schema: ZodType<T>
  signal: AbortSignal
}) {
  const start = performance.now()
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    redirect: 'error',
    cache: 'no-store',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    signal: AbortSignal.any([signal, AbortSignal.timeout(20_000)]),
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_completion_tokens: 4600,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify(data) },
      ],
    }),
  })
  if (!response.ok) {
    void response.body?.cancel()
    throw new Error('Provider unavailable')
  }
  const envelope = await response.json()
  const message = envelope?.choices?.[0]?.message?.content
  if (typeof message !== 'string') throw new Error('Invalid provider response')
  return {
    data: schema.parse(JSON.parse(message)),
    latencyMs: Math.round(performance.now() - start),
    tokens: Number.isSafeInteger(envelope?.usage?.total_tokens)
      ? Math.max(0, envelope.usage.total_tokens)
      : 0,
  }
}
