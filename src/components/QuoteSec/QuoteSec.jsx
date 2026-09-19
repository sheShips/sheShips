import { useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import styles from './QuoteSec.module.css'

export default function QuoteSec() {
  const scope = useRef(null)

  useGsap(scope, () => {
    if (prefersReducedMotion()) return
    // this one drifts in sideways rather than rising, so it reads as a
    // beat between sections instead of another card
    gsap.from(`.${styles.quote}`, {
      x: -40,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: `.${styles.band}`, start: 'top 78%', once: true },
    })
  })

  return (
    <section className={styles.band} ref={scope}>
      <div className="wrap">
        <blockquote className={`${styles.quote} lead`}>
          You don&rsquo;t have to feel ready to belong here.
        </blockquote>
      </div>
    </section>
  )
}
