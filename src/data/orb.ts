import { rng } from './demo'
export function makeOrb() {
  const random = rng(5833)
  const count = 355
  const points = Array.from({ length: count }, (_, i) => {
    const a = i * 2.399963229728653 + (random() - 0.5) * 0.36
    const z = 1 - (2 * (i + 0.5)) / count
    const phi = Math.asin(z) + (random() - 0.5) * 0.18
    const r = 1.46 + (random() - 0.5) * 0.14
    const x = Math.cos(a) * Math.cos(phi) * r,
      y = Math.sin(phi) * r,
      depth = Math.sin(a) * Math.cos(phi) * r
    return {
      x,
      y,
      z: depth,
      color: x + y * 0.17 > -0.04 ? '#29deff' : x > -0.62 ? '#9b88ff' : '#ab68f4',
      size: random() > 0.96 ? 3.1 : random() * 1.4 + 0.48,
    }
  })
  const lines = points.flatMap((p, i) =>
    points
      .slice(i + 1)
      .map((q, j) => ({ from: i, to: i + j + 1, d: Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) }))
      .filter((e) => e.d < 0.43 && (e.d < 0.31 || random() > 0.76)),
  )
  return { points, lines }
}
export const orb = makeOrb()
