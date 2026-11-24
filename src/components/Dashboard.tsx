'use client'
import dynamic from 'next/dynamic'
import { MotionConfig } from 'motion/react'
import { useEffect, useRef } from 'react'
import { AudioLines } from 'lucide-react'
import Hero, { Header } from './Hero'
import { Audience, Pipeline, Timeline, Trends } from './Signals'
import { Architecture, Copilot, Crisis, Footer, Narratives } from './Stories'
const Influence = dynamic(() => import('./Influence'))
const TryItOut = dynamic(() => import('./try-it/TryItOut'))
export default function Dashboard() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const app = root.current
    if (!app) return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    let cleanup = () => {},
      disposed = false
    async function init() {
      if (mq.matches || disposed || !app) return
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/dist/ScrollTrigger'),
      ])
      if (mq.matches || disposed) return
      gsap.registerPlugin(ScrollTrigger)
      const lenis = new Lenis({ anchors: true, lerp: 0.14 })
      lenis.on('scroll', ScrollTrigger.update)
      const loop = (t: number) => lenis.raf(t * 1000)
      gsap.ticker.add(loop)
      const media = gsap.matchMedia()
      const ctx = gsap.context(() => {
        for (const el of app.querySelectorAll<HTMLElement>('[data-depth]')) {
          const section = el.closest('section,footer')
          gsap.to(el, {
            y: Number(el.dataset.depth),
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
          })
        }
        gsap.fromTo(
          '.arch-trace path',
          { strokeDashoffset: 900 },
          {
            strokeDashoffset: 0,
            duration: 1.25,
            ease: 'power1.inOut',
            scrollTrigger: { trigger: '.arch-trace', start: 'top 83%' },
          },
        )
        media.add('(min-width: 1050px) and (min-height: 760px)', () => {
          const track = app.querySelector<HTMLElement>('.narrative-track')
          if (!track) return
          const state = { x: 0 }
          gsap.to(state, {
            x: () => track.scrollWidth - track.clientWidth,
            ease: 'none',
            onUpdate: () => {
              track.scrollLeft = state.x
            },
            scrollTrigger: {
              trigger: track,
              start: 'top 24%',
              end: '+=430',
              pin: true,
              scrub: 0.45,
            },
          })
        })
      }, app)
      const dot = app.querySelector<HTMLElement>('.cursor-trail')
      let target: HTMLElement | null = null
      const release = () => {
        target?.style.removeProperty('--pointer-x')
        target?.style.removeProperty('--pointer-y')
        target = null
      }
      const onMove = (event: PointerEvent) => {
        if (dot && event.pointerType === 'mouse') {
          dot.style.left = `${event.clientX}px`
          dot.style.top = `${event.clientY}px`
          gsap.fromTo(
            dot,
            { opacity: 0.45, scale: 1 },
            { opacity: 0, scale: 0.45, duration: 0.55, overwrite: true },
          )
          const next =
            event.target instanceof Element
              ? event.target.closest<HTMLElement>('.magnetic:not(:disabled), .tilt-card')
              : null
          if (target !== next) release()
          if (next && app.contains(next)) {
            target = next
            const box = next.getBoundingClientRect()
            next.style.setProperty(
              '--pointer-x',
              String((event.clientX - box.left) / box.width - 0.5),
            )
            next.style.setProperty(
              '--pointer-y',
              String((event.clientY - box.top) / box.height - 0.5),
            )
          }
        }
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      app.addEventListener('pointerleave', release)
      cleanup = () => {
        window.removeEventListener('pointermove', onMove)
        app.removeEventListener('pointerleave', release)
        release()
        media.revert()
        ctx.revert()
        gsap.ticker.remove(loop)
        lenis.destroy()
      }
    }
    void init().catch(() => {})
    const change = () => {
      cleanup()
      cleanup = () => {}
      void init().catch(() => {})
    }
    mq.addEventListener('change', change)
    return () => {
      disposed = true
      mq.removeEventListener('change', change)
      cleanup()
    }
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <div ref={root} className="pulse-app">
        <a className="figma-bypass-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        <main id="main-content">
          <Hero />
          <Pipeline />
          <Timeline />
          <Audience />
          <Trends />
          <Influence />
          <Narratives />
          <TryItOut />
          <Copilot />
          <Architecture />
        </main>
        <Footer />
        <Crisis />
        <div className="boot-flash" aria-hidden="true">
          <AudioLines size={16} /> SIGNAL READY / 100%
        </div>
        <div className="cursor-trail" aria-hidden="true" />
      </div>
    </MotionConfig>
  )
}
