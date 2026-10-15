import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** True when the visitor has asked their OS to cut animation. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** True on a device with a real hover-capable pointer (mouse / trackpad). */
function hasFinePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
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

/**
 * Makes the hero sailboat respond to the visitor. Call it only once the
 * sail-in has finished, so none of this runs during the first paint.
 *
 *   boat     the wrapper around the logo (NOT the logo itself — the idle
 *            bob owns the logo's y/rotation, so the two never fight)
 *   area     the element whose pointer movement steers the boat (the hero)
 *   ripples  optional ripple elements to replay when the boat tacks
 *
 * What it does:
 *   - mouse/trackpad: the boat heels and drifts gently toward the cursor,
 *     and settles back when the cursor leaves the hero
 *   - click or tap: the boat tacks (a quick swing across and back) and
 *     sends out one ripple
 *
 * Cost: transforms only (no layout), one reused tween per axis via
 * quickTo, and pointer events only fire while the cursor is over the
 * hero. Returns a cleanup function that removes every listener.
 */
export function enableSailboat(boat, area, { ripples = [], maxTilt = 5, maxDrift = 12 } = {}) {
  if (!boat || !area || prefersReducedMotion()) return () => {}

  const cleanups = []
  const listen = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts)
    cleanups.push(() => el.removeEventListener(type, fn, opts))
  }

  gsap.set(boat, { transformOrigin: '50% 85%', cursor: 'pointer' })

  /* ---- steer toward the cursor (hover devices only) ---- */
  let steering = true
  if (hasFinePointer()) {
    const tilt = gsap.quickTo(boat, 'rotation', { duration: 0.7, ease: 'power3.out' })
    const drift = gsap.quickTo(boat, 'x', { duration: 0.9, ease: 'power3.out' })

    listen(area, 'pointermove', (e) => {
      if (!steering) return
      const rect = area.getBoundingClientRect()
      const t = ((e.clientX - rect.left) / rect.width - 0.5) * 2 // -1 … 1
      tilt(t * maxTilt)
      drift(t * maxDrift)
    }, { passive: true })

    listen(area, 'pointerleave', () => {
      tilt(0)
      drift(0)
    })
  }

  /* ---- click / tap to tack ---- */
  let tacking = null
  listen(boat, 'click', () => {
    if (tacking?.isActive()) return
    steering = false
    tacking = gsap.timeline({ onComplete: () => { steering = true } })
    tacking
      .to(boat, {
        duration: 1.3,
        ease: 'none',
        keyframes: { rotation: [0, -8, 6, -2, 0], x: [0, -18, 14, -4, 0], easeEach: 'sine.inOut' },
      })
    ripples.forEach((ripple, i) => {
      // same as the landing ripple: stay hidden until it fires, fade up, fade out
      const at = 0.35 + i * 0.06
      const duration = 1 + i * 0.2
      tacking
        .fromTo(
          ripple,
          { xPercent: -50, x: 0, scale: 0.25 },
          { scale: 1.1 + i * 0.3, duration, ease: 'power2.out', immediateRender: false },
          at
        )
        .fromTo(
          ripple,
          { opacity: 0 },
          {
            duration,
            ease: 'none',
            immediateRender: false,
            keyframes: { '0%': { opacity: 0 }, '18%': { opacity: 0.36, ease: 'sine.out' }, '100%': { opacity: 0, ease: 'sine.in' } },
          },
          at
        )
    })
  })

  return () => {
    cleanups.forEach((fn) => fn())
    tacking?.kill()
  }
}

export { gsap, ScrollTrigger }
