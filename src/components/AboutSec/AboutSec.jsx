import { useRef } from 'react'
import { revealOnScroll } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import styles from './AboutSec.module.css'

/* Icons are drawn from the club's own world: a compass rose, a sail,
   a crew, and a code chevron. */
const PILLARS = [
  {
    id: 'compass',
    title: 'Trade ideas',
    body: "Bring the half-finished thing, the maybe-bad idea, the one you can't stop thinking about. Someone here wants to hear it.",
    icon: (
      <>
        <path d="M12 3v6" />
        <circle cx="12" cy="10.5" r="1.8" />
        <path d="M8.5 5.5h7" />
        <path d="M12 12.3V21" />
        <path d="M4 14a8 8 0 0 0 16 0" />
        <path d="M3 14h2.4M18.6 14H21" />
      </>
    ),
  },
  {
    id: 'sail',
    title: 'Learn out loud',
    body: "Nobody arrives knowing everything. We'd rather ask the obvious question in a room that won't flinch.",
    icon: (
      <>
        <path d="M3 17c2-1.4 3.3-1.4 5.2 0s3.6 1.4 5.5 0 3.3-1.4 5.3 0" />
        <path d="M3 21c2-1.4 3.3-1.4 5.2 0s3.6 1.4 5.5 0 3.3-1.4 5.3 0" />
        <path d="M12 13V3" />
        <path d="M12 4l6 4-6 3z" />
      </>
    ),
  },
  {
    id: 'crew',
    title: 'Find your people',
    body: 'Being the only female dev in the room gets old. Here you\u2019re one of several.',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.4" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M15.4 14.6A4.6 4.6 0 0 1 20.5 19" />
      </>
    ),
  },
  {
    id: 'craft',
    title: 'Sharpen the craft',
    body: 'Code review, pairing, portfolio feedback, mock interviews. The unglamorous reps that actually move you forward.',
    icon: (
      <>
        <path d="M8 6.5 3.5 12 8 17.5" />
        <path d="m16 6.5 4.5 5.5-4.5 5.5" />
        <path d="M13.5 4.5 10.5 19.5" />
      </>
    ),
  },
]

export default function AboutSec() {
  const scope = useRef(null)

  useGsap(scope, () => {
    revealOnScroll('[data-reveal-head] > *', {
      trigger: `.${styles.about}`,
      start: 'top 72%',
    })
    revealOnScroll(`.${styles.pillar}`, {
      trigger: `.${styles.grid}`,
      start: 'top 80%',
      y: 46,
      stagger: 0.11,
    })
  })

  return (
    <section className={`section ${styles.about}`} id="about" ref={scope}>
      <div className="wrap">
        <div className="section-head" data-reveal-head>
          <p className="eyebrow">About the club</p>
          <h2 className="lead">We&rsquo;re starting the group we wished already existed.</h2>
          <p>
            There are female devs building software all over this coast, mostly in isolation. She
            Ships is an attempt to fix that. Four things we&rsquo;re after:
          </p>
        </div>

        <div className={styles.grid}>
          {PILLARS.map((pillar) => (
            <article className={styles.pillar} key={pillar.id}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {pillar.icon}
              </svg>
              <h3 className="lead">{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
