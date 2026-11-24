'use client'
import { CodeXml, LockKeyhole } from 'lucide-react'
import type { AnalyzePayload } from '@/data/tryItDemo'
export default function RequestInspector({
  payload,
  model,
}: {
  payload: AnalyzePayload | null
  model: string
}) {
  return (
    <details className="glass glass-pad mt-4">
      <summary className="font-display text-base font-semibold text-pulse">
        <CodeXml className="mr-2 inline" size={15} />
        Request Inspector
      </summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mono-label mb-2">POST /api/analyze · private to this browser view</div>
          <pre className="max-h-48 overflow-auto rounded-lg border border-[#27364e] bg-[#0a101c] p-3 font-mono text-[11px] break-words whitespace-pre-wrap text-[#bcd3ea]">
            {payload ? JSON.stringify(payload, null, 2) : 'No request sent yet.'}
          </pre>
        </div>
        <div className="space-y-2 text-xs leading-relaxed text-[#b7c5da]">
          <div className="flex items-center gap-2 font-mono text-pulse">
            <LockKeyhole size={13} /> gsk_••••••••••••••••
          </div>
          <p>
            Key is stored on the server and never sent to your browser. The prefix above is
            illustrative.
          </p>
          <p>
            <b>Model:</b> {model || 'Pending analysis'} · <b>Temperature:</b> 0.2 for live runs.
          </p>
          <p>
            <b>Prompt summary:</b> validate and mask input, extract four structured reports, then
            fuse their findings into a cited-by-category narrative. Platform chips are local labels
            and not sent.
          </p>
        </div>
      </div>
    </details>
  )
}
