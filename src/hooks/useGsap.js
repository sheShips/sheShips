import { useEffect } from 'react'
import { gsap } from '../lib/motion'

/**
 * Runs GSAP work inside a scope, and reverts every tween, ScrollTrigger
 * and inline style it created when the component unmounts. Without this,
 * React's remounts (StrictMode in dev, route changes in prod) stack
 * duplicate timelines on the same elements.
 *
 *   const scope = useRef(null)
 *   useGsap(scope, (ctx) => { gsap.from('.thing', {...}) })
 *   return <section ref={scope}>…</section>
 */
export function useGsap(scopeRef, setup, deps = []) {
  useEffect(() => {
    if (!scopeRef.current) return undefined
    const ctx = gsap.context(setup, scopeRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
