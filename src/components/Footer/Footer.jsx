import { useRef } from 'react'
import { gsap, prefersReducedMotion, revealOnScroll } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import styles from './Footer.module.css'

const MEETUP_URL = 'https://www.meetup.com/'

export default function Footer() {
  const scope = useRef(null)

  useGsap(scope, () => {
    revealOnScroll(`.${styles.inner} > *`, {
      trigger: `.${styles.footer}`,
      start: 'top 78%',
    })

    if (prefersReducedMotion()) return
    gsap.to(`.${styles.waves}`, {
      yPercent: -26,
      ease: 'none',
      scrollTrigger: {
        trigger: `.${styles.footer}`,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0.7,
      },
    })
  })

  return (
    <footer className={styles.footer} ref={scope}>
      <div className={styles.waves} aria-hidden="true">
        <svg viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,60 C180,10 340,102 520,70 C700,38 840,0 1010,32 C1180,64 1300,106 1440,74 L1440,170 L0,170 Z"
            fill="#113646"
            fillOpacity="0.7"
          />
          <path
            d="M0,96 C160,136 330,70 510,92 C690,114 830,152 1010,126 C1190,100 1320,62 1440,90 L1440,170 L0,170 Z"
            fill="#0b2331"
          />
        </svg>
      </div>

      <div className={`wrap ${styles.inner}`}>
        <p className={styles.mark}>
          She <em>Ships</em>
        </p>
        <p style={{ maxWidth: '42ch' }}>
          Female developers, up and down the Southwest Florida coast.
        </p>

        <a className={styles.meetup} href={MEETUP_URL} target="_blank" rel="noopener noreferrer">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 3v4M16 3v4" />
            <circle cx="12" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
          </svg>
          Join us on Meetup
        </a>

        <div className={styles.colophon}>
          <p>
            Made by{' '}
            <a href="https://whelkworks.com" target="_blank" rel="noopener noreferrer">
              Whelk Works
            </a>
          </p>
          <p className={styles.sponsor}>
            Sponsored by{' '}
            <a href="https://securipolis.com" target="_blank" rel="noopener noreferrer">
              Securipolis.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
