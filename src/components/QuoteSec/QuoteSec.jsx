import { useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import styles from './QuoteSec.module.css'

export default function QuoteSec() {
  const scope = useRef(null)

  useGsap(scope, () => {
    if (prefersReducedMotion()) return
    // this one drifts in sideways rather than rising, so it reads as a
    // beat between sections instead of another card. It sits on the
    // right, so it drifts in from the right.
    gsap.from(`.${styles.quote}`, {
      x: 40,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: `.${styles.band}`, start: 'top 78%', once: true },
    })
    // the rule draws in from the right, then the subtitle settles in under it
    gsap.from(`.${styles.rule}`, {
      scaleX: 0,
      transformOrigin: '100% 50%',
      duration: 0.9,
      delay: 0.35,
      ease: 'power3.out',
      scrollTrigger: { trigger: `.${styles.band}`, start: 'top 78%', once: true },
    })
    gsap.from(`.${styles.sub}`, {
      x: 24,
      opacity: 0,
      duration: 1.1,
      delay: 0.5,
      ease: 'power3.out',
      scrollTrigger: { trigger: `.${styles.band}`, start: 'top 78%', once: true },
    })
  })

  return (
    <section className={styles.band} ref={scope}>
      <div className="wrap">
        <div className={styles.stack}>
          <blockquote className={`${styles.quote} lead`}>
            Learn. Launch. Lift.
          </blockquote>
          <span className={styles.rule} aria-hidden="true" />
          {/* two set lines on wide screens (top one longer); wraps naturally on phones */}
          <p className={styles.sub}>
            <span className={styles.subLine}>
              A safe harbor for women in tech across the Gulf Coast. First commit or fortieth,
              there&rsquo;s a seat for you here.
            </span>{' '}
            <span className={styles.subLine}>
              We cheer the wins, share the bugs, and lift each other as we climb.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
