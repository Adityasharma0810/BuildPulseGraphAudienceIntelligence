'use client'
import {
  AudioLines,
  Check,
  Cpu,
  FileInput,
  Fingerprint,
  Network,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { engineNames, engines, type Stage } from '@/data/tryItDemo'
import { CardTitle } from '../ui'
const engineIcons = [AudioLines, Users, TrendingUp, Network]
export default function PipelineViz({ stages, ready }: { stages: Stage[]; ready: boolean }) {
  const state = (id: string) => stages.find((s) => s.id === id)?.state
  const active = stages.some((s) => s.state === 'started')
  const line = () => <div className={`pipe-connector ${active ? 'active' : ''}`} />
  const box = (id: string, label: string, Icon: LucideIcon) => {
    const done = id === 'result' ? ready : state(id) === 'done'
    return (
      <div className={`flow-step ${done ? 'complete' : state(id) === 'started' ? 'busy' : ''}`}>
        <span className="flex items-center gap-2">
          <Icon size={13} />
          {label}
        </span>
        {done && <Check size={12} />}
      </div>
    )
  }
  return (
    <div className="glass glass-pad">
      <CardTitle icon={Cpu} title="Analysis pipeline" sub="Four engines run in parallel" />
      {box('input', 'Input', FileInput)}
      {line()}
      {box('sanitize', 'PII sanitizer', Fingerprint)}
      {line()}
      <div className="grid grid-cols-2 gap-2">
        {engines.map((e, i) => (
          <div key={e}>{box(e, engineNames[e], engineIcons[i])}</div>
        ))}
      </div>
      {line()}
      {box('fusion', 'Narrative fusion', Sparkles)}
      {line()}
      {box('result', 'Report ready', Check)}
    </div>
  )
}
