'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { BufferGeometry, Float32BufferAttribute, Color, Group, AdditiveBlending } from 'three'
import { orb } from '@/data/orb'
function Field() {
  const group = useRef<Group>(null)
  const [nodes, edges] = useMemo(() => {
    const xyz: number[] = [],
      rgb: number[] = [],
      positions: number[] = [],
      edgeColors: number[] = []
    for (const p of orb.points) {
      xyz.push(p.x, p.y, p.z)
      const c = new Color(p.color)
      rgb.push(c.r, c.g, c.b)
    }
    for (const { from, to } of orb.lines) {
      for (const i of [from, to]) {
        const p = orb.points[i]
        positions.push(p.x, p.y, p.z)
        const c = new Color(p.color)
        edgeColors.push(c.r, c.g, c.b)
      }
    }
    return [
      new BufferGeometry()
        .setAttribute('position', new Float32BufferAttribute(xyz, 3))
        .setAttribute('color', new Float32BufferAttribute(rgb, 3)),
      new BufferGeometry()
        .setAttribute('position', new Float32BufferAttribute(positions, 3))
        .setAttribute('color', new Float32BufferAttribute(edgeColors, 3)),
    ]
  }, [])
  useFrame(({ clock, pointer }) => {
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.11 + pointer.x * 0.14
      group.current.rotation.x = 0.22 + pointer.y * 0.14
    }
  })
  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial transparent opacity={0.33} vertexColors blending={AdditiveBlending} />
      </lineSegments>
      <points geometry={nodes}>
        <pointsMaterial
          size={0.025}
          transparent
          opacity={0.8}
          vertexColors
          blending={AdditiveBlending}
        />
      </points>
      <Line
        points={[
          [0, 0, 1.47],
          [0.13, 0.145, 1.45],
          [0.28, 0.16, 1.43],
        ]}
        color="#6ee7ff"
        transparent
        opacity={0.4}
      />
    </group>
  )
}
export default function Orb3D() {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 0, 5.8], fov: 34 }}
      gl={{ alpha: true, antialias: true }}
      fallback={null}
    >
      <Field />
    </Canvas>
  )
}
