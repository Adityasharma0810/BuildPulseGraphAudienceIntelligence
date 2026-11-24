import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  EMOTIONS,
  edges,
  getDemographics,
  getEmotionSeries,
  getGraph,
  getPosts,
  getTopTrends,
  postCount,
  simulateCascade,
  trends,
  users,
} from '../src/data/demo.ts'
import { getTryItDemo, samples } from '../src/data/tryItDemo.ts'

test('fixtures cover all 720 hours and approximate the platform split', () => {
  const posts = getPosts()
  assert.equal(posts.length, postCount)
  assert.equal(new Set(posts.map((p) => p.timestamp.slice(0, 13))).size, 720)
  assert.equal(new Set(posts.map((p) => p.id)).size, postCount)
  for (const [platform, share] of Object.entries({
    X: 0.45,
    Telegram: 0.3,
    Instagram: 0.1,
    Facebook: 0.08,
    Reddit: 0.04,
    YouTube: 0.03,
  })) {
    assert.ok(
      Math.abs(posts.filter((p) => p.platform === platform).length / posts.length - share) < 0.002,
    )
  }
})

test('launch and crisis appear in emotion distribution and the cohort filter changes counts', () => {
  const series = getEmotionSeries()
  assert.ok(series[2].excitement > series[0].excitement)
  assert.ok(series[11].anxiety > series[7].anxiety)
  assert.ok(series[11].anger > series[7].anger)
  assert.ok(series[19].hope > series[11].hope)
  assert.equal(
    series.reduce((n, row) => n + EMOTIONS.reduce((m, e) => m + row[e], 0), 0),
    postCount,
  )
  assert.ok(getEmotionSeries(1)[2].excitement < series[2].excitement)
  assert.ok(getDemographics(12, 1).ages[1] > getDemographics(12).ages[1])
  assert.equal(getTopTrends(12)[0].keyword, 'NovaBattery')
  assert.equal(trends.length, 20)
  assert.ok(trends.every((t) => t.hourly.length === 720))
})

test('cascade activates each node at most once and only uses edges available on that day', () => {
  assert.equal(users.length, 150)
  assert.equal(edges.length, 408)
  assert.ok(getGraph(12).edges.every((e) => e.day <= 12))
  const cascade = simulateCascade(0, 'Empathetic', 12)
  assert.deepEqual(cascade, simulateCascade(0, 'Empathetic', 12))
  assert.equal(new Set(cascade.waves.flat()).size, cascade.waves.flat().length)
  assert.ok(cascade.links.flat().every((e) => e.day <= 12))
  assert.equal(
    cascade.reach,
    cascade.waves.flat().reduce((a, id) => a + users[id].followers, 0),
  )
})

test('cached samples are distinct, and unmatched posts are explicitly illustrative', () => {
  const reports = samples.map((s) => getTryItDemo(s.posts, s.context))
  assert.ok(reports.every((r) => !r.illustrative))
  assert.equal(new Set(reports.map((r) => r.data.brief.title)).size, 3)
  assert.equal(getTryItDemo(['An unrelated thread'], '').illustrative, true)
})
