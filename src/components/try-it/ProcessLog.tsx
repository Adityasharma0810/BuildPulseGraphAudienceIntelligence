'use client'
import { Check, CircleAlert, LoaderCircle, Terminal } from 'lucide-react'
import { motion } from 'motion/react'
import type { Stage } from '@/data/tryItDemo'
import { CardTitle } from '../ui'
export default function ProcessLog({ stages }: { stages: Stage[] }) {
  return (
    <div className="glass glass-pad">
      <CardTitle
        icon={Terminal}
        title="Live process log"
        sub="Server-sent events · no secret material"
      />
      <div
        className="space-y-2 rounded-lg border border-[#253b39] bg-[#091713] p-3 font-mono text-[10px] text-[#97efbe]"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {!stages.length && <p className="text-[#9bb4ad]">› Waiting for input…</p>}
        {stages.map((s) => (
          <motion.div
            initial={{ x: -3, opacity: 0.55 }}
            animate={{ x: 0, opacity: 1 }}
            key={s.id}
            className="grid grid-cols-[14px_minmax(0,1fr)_auto] items-start gap-1.5"
          >
            <span>
              {s.state === 'started' ? (
                <LoaderCircle size={12} className="animate-spin" />
              ) : s.state === 'fallback' ? (
                <CircleAlert size={12} className="text-[#ffce91]" />
              ) : (
                <Check size={12} />
              )}
            </span>
            <span>
              {s.label}
              {s.detail && <span className="mt-0.5 block text-[#a3b6ad]">{s.detail}</span>}
            </span>
            <span className="text-[#a3b6ad]">
              {s.latencyMs !== undefined && `${s.latencyMs}ms`}
              {s.tokens !== undefined && ` · ${s.tokens} tok`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
