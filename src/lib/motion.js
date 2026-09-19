import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** True when the visitor has asked their OS to cut animation. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The standard section reveal: a short rise and fade, staggered across
 * the given elements, fired once when the section comes into view.
 *
 * The hidden state is set by GSAP at runtime, never in CSS — so if the
 * script fails or motion is reduced, every word still renders at full
 * opacity instead of sitting invisible waiting for an observer.
 */
export function revealOnScroll(targets, { trigger, start = 'top 75%', y = 34, stagger = 0.09, ...rest } = {}) {
  const els = gsap.utils.toArray(targets).filter(Boolean)
  if (!els.length || prefersReducedMotion()) return

  gsap.from(els, {
    y,
    opacity: 0,
    duration: 0.95,
    ease: 'power3.out',
    stagger,
    scrollTrigger: { trigger: trigger || els[0], start, once: true },
    ...rest,
  })
}

export { gsap, ScrollTrigger }
