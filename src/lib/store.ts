import { create } from 'zustand'
type State = {
  day: number
  cohort: number
  trend: string
  node: number
  setDay: (v: number) => void
  setCohort: (v: number) => void
  setTrend: (v: string) => void
  setNode: (v: number) => void
}
export const usePulse = create<State>((set) => ({
  day: 10,
  cohort: -1,
  trend: 'NovaBattery',
  node: 0,
  setDay: (day) => set({ day }),
  setCohort: (cohort) => set({ cohort }),
  setTrend: (trend) => set({ trend }),
  setNode: (node) => set({ node }),
}))
