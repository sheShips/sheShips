import { useRef } from 'react'
import { gsap, prefersReducedMotion, revealOnScroll } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import meetupSymbol from '../../assets/meetup-symbol-white.png'
import linkedinBug from '../../assets/linkedin-bug-white.png'
import styles from './Footer.module.css'

const MEETUP_URL = 'https://www.meetup.com/she-ships-swfl/'

const LINKEDIN_URL = 'https://www.linkedin.com/groups/33350020/'
const INSTAGRAM_URL = 'https://www.instagram.com/sarasotasheships/'

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
    <footer className={styles.footer} id="connect" ref={scope}>
      <div className={styles.waves} aria-hidden="true">
        <svg viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,58 C9,58 34,56 51,56 C69,55 86,55 103,55 C120,55 137,56 154,57 C171,59 189,61 206,64 C223,67 240,71 257,75 C274,79 291,84 309,87 C326,90 343,93 360,94 C377,96 394,96 411,94 C429,93 446,90 463,87 C480,84 497,80 514,77 C531,73 549,70 566,67 C583,64 600,62 617,61 C634,59 651,58 669,57 C686,56 703,56 720,55 C737,55 754,55 771,55 C789,56 806,57 823,59 C840,60 857,63 874,67 C891,70 909,74 926,78 C943,82 960,87 977,89 C994,92 1011,95 1029,95 C1046,96 1063,95 1080,93 C1097,91 1114,88 1131,85 C1149,81 1166,77 1183,74 C1200,71 1217,67 1234,65 C1251,63 1269,61 1286,59 C1303,58 1320,57 1337,57 C1354,56 1371,55 1389,55 C1406,55 1431,56 1440,56 L1440,170 L0,170 Z"
            fill="#113646"
            fillOpacity="0.7"
          />
          <path
            d="M0,131 C9,132 34,135 51,136 C69,137 86,138 103,138 C120,139 137,139 154,139 C171,139 189,139 206,138 C223,137 240,136 257,133 C274,131 291,128 309,124 C326,121 343,117 360,113 C377,110 394,107 411,105 C429,103 446,103 463,103 C480,104 497,106 514,108 C531,110 549,114 566,117 C583,120 600,124 617,126 C634,129 651,131 669,133 C686,135 703,136 720,137 C737,138 754,138 771,139 C789,139 806,139 823,139 C840,139 857,139 874,137 C891,136 909,134 926,131 C943,129 960,125 977,121 C994,118 1011,114 1029,111 C1046,108 1063,105 1080,104 C1097,103 1114,103 1131,104 C1149,105 1166,108 1183,110 C1200,113 1217,117 1234,120 C1251,123 1269,126 1286,128 C1303,131 1320,133 1337,134 C1354,136 1371,137 1389,137 C1406,138 1431,139 1440,139 L1440,170 L0,170 Z"
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

        <nav className={styles.socials} aria-label="Find She Ships online">
          <a className={styles.socialLink} href={MEETUP_URL} target="_blank" rel="noopener noreferrer">
            <span className={`${styles.dot} ${styles.dotMeetup}`}>
              <img src={meetupSymbol} alt="" width="26" height="26" />
            </span>
            <span className={styles.socialLabel}>
              Meetup
            </span>
          </a>
          <a className={styles.socialLink} href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            <span className={styles.dot}>
              <img src={linkedinBug} alt="" width="26" height="24" />
            </span>
            <span className={styles.socialLabel}>LinkedIn</span>
          </a>
          <a
            className={styles.socialLink}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="@sarasotasheships"
          >
            <span className={styles.dot}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className={styles.socialLabel}>Instagram</span>
          </a>
        </nav>

        <div className={styles.colophon}>
          <p>
            <span className={styles.credit}>
              Created by{' '}
              <a href="https://whelkworks.com" target="_blank" rel="noopener noreferrer">
                Whelk Works
              </a>
            </span>
            <span className={styles.credit}>
              Presented by{' '}
              <a href="https://securipolis.com" target="_blank" rel="noopener noreferrer">
                Securipolis
              </a>{' '}
              &amp;{' '}
              <a href="https://whelkworks.com" target="_blank" rel="noopener noreferrer">
                Whelk Works
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
