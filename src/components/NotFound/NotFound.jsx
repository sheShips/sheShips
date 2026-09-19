import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import logo from '../../assets/logo.png'
import styles from './NotFound.module.css'

export default function NotFound() {
  const scope = useRef(null)
  const canvasRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = 'Off course — She Ships'
  }, [])

  /* a quieter starfield than the hero's — fewer, dimmer, still */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)
      const count = Math.round((rect.width * rect.height) / 12000)
      for (let i = 0; i < count; i += 1) {
        ctx.globalAlpha = Math.random() * 0.5 + 0.12
        ctx.fillStyle = i % 9 === 0 ? '#fdbc69' : '#ffffff'
        ctx.beginPath()
        ctx.arc(
          Math.random() * rect.width,
          Math.random() ** 2.1 * rect.height * 0.7,
          Math.random() * 1.1 + 0.25,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  useGsap(scope, () => {
    if (prefersReducedMotion()) return

    gsap.from(`.${styles.inner} > *`, {
      y: 22,
      opacity: 0,
      duration: 0.85,
      stagger: 0.09,
      ease: 'power3.out',
    })

    /* adrift: a wider, slower, less resolved version of the hero bob */
    gsap.to(`.${styles.logo}`, {
      y: -16,
      rotate: -3.5,
      duration: 4.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    gsap.to(`.${styles.logo}`, {
      x: 14,
      duration: 7.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  })

  return (
    <main className={styles.page} ref={scope}>
      <div className={styles.sky} aria-hidden="true" />
      <canvas className={styles.stars} ref={canvasRef} aria-hidden="true" />

      <div className={styles.waves} aria-hidden="true">
        <svg viewBox="0 0 1440 180" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,70 C180,20 340,112 520,80 C700,48 840,10 1010,42 C1180,74 1300,116 1440,84 L1440,180 L0,180 Z"
            fill="#147182"
            fillOpacity="0.45"
          />
          <path
            d="M0,106 C160,146 330,80 510,102 C690,124 830,162 1010,136 C1190,110 1320,72 1440,100 L1440,180 L0,180 Z"
            fill="#0b2331"
          />
        </svg>
      </div>

      <div className={`wrap ${styles.inner}`}>
        <div className={styles.logoStage}>
          <img className={styles.logo} src={logo} alt="" />
        </div>

        <span className={styles.code}>Error 404</span>

        <h1 className={styles.title}>
          Off <em>course</em>
        </h1>

        <p className={styles.copy}>
          You&rsquo;ve drifted off the map. Nothing out here but open water &mdash; let&rsquo;s get
          you back.
        </p>

        <div className={styles.actions}>
          <Link className="btn" to="/">
            Back to shore
          </Link>
          <Link className="btn btn-ghost" to="/#events">
            See upcoming events
          </Link>
        </div>

        <p className={styles.trail}>
          No file at <code>{pathname}</code>
        </p>
      </div>
    </main>
  )
}
