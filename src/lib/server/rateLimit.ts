import 'server-only'
import { isIP } from 'node:net'
const windowMs = 60_000
const clients = new Map<string, number[]>()
let lastSweep = 0
export function rateLimit(headers: Headers, limit: number) {
  const forwarded = headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  const candidates = [headers.get('x-real-ip')?.trim(), forwarded]
  const ip = candidates.find((v) => v && isIP(v)) ?? 'unidentified'
  const now = Date.now()
  if (now - lastSweep >= windowMs) {
    lastSweep = now
    for (const [key, entries] of clients) if (entries.at(-1)! <= now - windowMs) clients.delete(key)
  }
  const entries = (clients.get(ip) ?? []).filter((t) => t > now - windowMs)
  if (entries.length >= limit)
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((entries[0] + windowMs - now) / 1000)),
    }
  if (!clients.has(ip) && clients.size >= 10_000) return { allowed: false, retryAfter: 60 }
  clients.set(ip, [...entries, now])
  return { allowed: true, retryAfter: 0 }
}
