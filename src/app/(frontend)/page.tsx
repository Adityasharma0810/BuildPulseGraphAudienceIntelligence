import type { Metadata } from 'next'
import Dashboard from '@/components/Dashboard'

export const metadata: Metadata = {
  title: 'PulseGraph — Narrative Intelligence',
  description:
    'Explore how sentiment, demographics, trends and influence tell the story of the fictional Nova X1 launch.',
  icons: { icon: '/pulsegraph.svg' },
}

export default function HomePage() {
  return <Dashboard />
}
