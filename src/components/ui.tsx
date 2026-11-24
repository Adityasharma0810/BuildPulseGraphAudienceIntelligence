'use client'
import { ArrowUpRight, AudioLines, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
export function Brand() {
  return (
    <a className="brand" href="#top" aria-label="PulseGraph home">
      <span className="brand-icon">
        <AudioLines size={20} />
      </span>
      <span>
        Pulse<span className="text-pulse">Graph</span>
      </span>
    </a>
  )
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>
}
export function SectionTitle({
  index,
  label,
  title,
  accent,
  description,
  aside,
}: {
  index: string
  label: string
  title: string
  accent?: string
  description: string
  aside?: ReactNode
}) {
  return (
    <div className="section-title">
      <div>
        <Eyebrow>
          <span className="section-index">{index}</span>
          <span className="eyeline" />
          {label}
        </Eyebrow>
        <h2>
          {title}
          {accent && (
            <>
              {' '}
              <span>{accent}</span>
            </>
          )}
        </h2>
        <p>{description}</p>
      </div>
      {aside}
    </div>
  )
}
export function CardTitle({
  icon: Icon,
  title,
  sub,
  aside,
}: {
  icon?: LucideIcon
  title: string
  sub?: string
  aside?: ReactNode
}) {
  return (
    <div className="card-title">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="tile-icon">
            <Icon size={17} />
          </span>
        )}
        <div>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      {aside}
    </div>
  )
}
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
export function Citation({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="chip cite"
      onClick={() => {
        const el = document.querySelector(href)
        el?.classList.remove('citation-highlight')
        requestAnimationFrame(() => el?.classList.add('citation-highlight'))
      }}
    >
      {children}
      <ArrowUpRight size={12} />
    </a>
  )
}
