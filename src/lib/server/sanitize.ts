import 'server-only'
import { z } from 'zod'
const input = z
  .object({
    posts: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
    context: z.string().trim().max(240).optional().default(''),
  })
  .strict()
  .refine((v) => v.posts.reduce((a, p) => a + p.length, 0) <= 6000)
export async function readInput(request: Request) {
  if (
    !request.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .match(/^application\/json$/i)
  )
    return null
  const reader = request.body?.getReader()
  if (!reader) return null
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true })
    let text = '',
      size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 48_000) {
        void reader.cancel()
        return null
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
    const parsed = input.safeParse(JSON.parse(text))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  } finally {
    reader.releaseLock()
  }
}
export function masker() {
  const handles = new Map<string, string>()
  let count = 0
  const mask = (value: string) =>
    value
      .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
      .replace(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/giu, () => {
        count++
        return '[email]'
      })
      .replace(
        /(?:\b(?:https?|ftp):\/\/|\bwww\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|in|co|app|me|edu)(?:\/[^\s<>"']*)?\b/gi,
        () => {
          count++
          return '[url]'
        },
      )
      .replace(/(?<![\w])(?:\+?\d[\d(). -]{6,}\d)(?![\w])/g, (m) => {
        const size = m.replace(/\D/g, '').length
        if (size < 8 || size > 16) return m
        count++
        return '[phone]'
      })
      .replace(/(?<![\w@])@[\p{L}\p{N}_][\p{L}\p{N}_.-]{0,62}/gu, (m) => {
        count++
        const key = m.toLowerCase()
        if (!handles.has(key)) handles.set(key, `@user_${handles.size + 1}`)
        return handles.get(key)!
      })
  return { mask, count: () => count }
}
export function sanitize(input: { posts: string[]; context: string }) {
  const { mask, count } = masker()
  const posts = input.posts.map(mask),
    context = mask(input.context)
  return { posts, context, masked: count() }
}
