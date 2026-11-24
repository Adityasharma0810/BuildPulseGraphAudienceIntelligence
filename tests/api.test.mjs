import { test } from 'node:test'
import assert from 'node:assert/strict'
const endpoint = new URL('/api/analyze', process.env.PULSE_TEST_URL || 'http://localhost:3000')
const request = (body) =>
  fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(52_000),
  })

test('analyze rejects unknown fields and invalid limits', async () => {
  for (const input of [
    { posts: [] },
    { posts: ['a'.repeat(501)] },
    { posts: Array(20).fill('b'.repeat(400)) },
    { posts: ['ok'], platform: 'not allowed' },
  ]) {
    assert.equal((await request(input)).status, 400)
  }
})

test('analysis streams a complete report without sending private configuration', async () => {
  const res = await request({
    posts: [
      'Mock battery report from @example_writer; contact test@example.invalid, call +1 (202) 555-0184, or see https://example.invalid/report.',
    ],
    context: 'Synthetic smoke test',
  })
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type'), /text\/event-stream/)
  const text = await res.text()
  assert.doesNotMatch(
    text,
    /GROQ_API_KEY|@example_writer|test@example\.invalid|555-0184|https:\/\/example\.invalid/,
  )
  const events = text
    .split('\n\n')
    .filter((frame) => frame.startsWith('event: '))
    .map((frame) => {
      const [name, body] = frame.split('\n')
      return [name.slice(7), JSON.parse(body.slice(6))]
    })
  assert.deepEqual(
    events.slice(0, 3).map(([, s]) => s.id),
    ['input', 'sanitize', 'security'],
  )
  assert.match(events[1][1].detail, /4 matches/)
  assert.equal(events.at(-1)[0], 'done')
  assert.deepEqual(
    [...new Set(events.filter(([name]) => name === 'engine').map(([, e]) => e.engine))].sort(),
    ['demographics', 'emotions', 'network', 'trends'],
  )
  const report = events.find(([type]) => type === 'result')[1]
  assert.ok(['live', 'demo'].includes(report.meta.mode))
  assert.equal(report.brief.actions.length, 3)
  if (report.meta.mode === 'demo') assert.equal(report.meta.illustrative, true)
  if (process.env.PULSE_EXPECT_MODE) assert.equal(report.meta.mode, process.env.PULSE_EXPECT_MODE)
})
