import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import { nightFactor } from '../../lib/sky'
import logo from '../../assets/logo.png'
import styles from './LandingPage.module.css'

/* Four bands, back to front. `speed` drives the scroll parallax. */
const WAVES = [
  {
    key: 'wave1',
    speed: 0.14,
    fill: '#14586b',
    opacity: 0.55,
    viewBox: '0 0 1440 150',
    d: 'M0,74 C180,24 340,116 520,84 C700,52 840,10 1010,44 C1180,78 1300,120 1440,86 L1440,150 L0,150 Z',
  },
  {
    key: 'wave2',
    speed: 0.3,
    fill: '#147182',
    opacity: 0.62,
    viewBox: '0 0 1440 150',
    d: 'M0,96 C150,58 300,120 470,98 C640,76 790,26 960,58 C1130,90 1290,118 1440,92 L1440,150 L0,150 Z',
  },
  {
    key: 'wave3',
    speed: 0.52,
    fill: '#113646',
    opacity: 0.82,
    viewBox: '0 0 1440 150',
    d: 'M0,88 C170,124 320,58 500,74 C680,90 820,130 1000,106 C1180,82 1310,44 1440,72 L1440,150 L0,150 Z',
  },
  {
    key: 'wave4',
    speed: 0.8,
    fill: '#0b2331',
    opacity: 1,
    viewBox: '0 0 1440 160',
    d: 'M0,70 C160,110 330,44 510,66 C690,88 830,126 1010,100 C1190,74 1320,36 1440,64 L1440,160 L0,160 Z',
  },
]

export default function LandingPage() {
  const scope = useRef(null)
  const canvasRef = useRef(null)

  /* ---------------- starfield ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduced = prefersReducedMotion()
    let points = []
    let frame
    let clock

    /* How dark it is right now. `target` follows the real sun (checked
       every minute); `night` eases toward it so dusk fades in rather
       than snapping. Daytime keeps a faint handful so the sky never
       looks empty. */
    let target = nightFactor()
    let night = target
    const visibleShare = () => 0.25 + 0.75 * night   // how many stars are out
    const brightness = () => 0.5 + 0.5 * night        // how bright they are

    const size = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const count = Math.round((rect.width * rect.height) / 7000)
      points = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        // squared distribution keeps them near the top of the sky
        y: Math.random() ** 2.1 * rect.height * 0.62,
        r: Math.random() * 1.1 + 0.25,
        a: Math.random() * 0.55 + 0.15,
        tw: Math.random() * 0.02 + 0.004,
        p: Math.random() * Math.PI * 2,
        // rank: the brightest stars come out first at dusk
        k: Math.random(),
      }))
      // brighter stars get the low ranks
      points.forEach((s) => { s.k = s.k * 0.6 + (1 - s.a / 0.7) * 0.4 })
      draw(0)
    }

    const draw = (t) => {
      const rect = canvas.getBoundingClientRect()
      const share = visibleShare()
      const glow = brightness()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)
      points.forEach((s, i) => {
        // soft edge so stars fade in one by one as `share` rises
        const out = Math.min(Math.max((share - s.k) * 10, 0), 1)
        if (out <= 0) return
        const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * s.tw + s.p)
        ctx.globalAlpha = Math.max(s.a * twinkle * glow * out, 0)
        ctx.fillStyle = i % 9 === 0 ? '#fdbc69' : '#ffffff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * (0.85 + 0.25 * night), 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    const loop = (t) => {
      night += (target - night) * 0.02
      draw(t)
      frame = requestAnimationFrame(loop)
    }

    const tick = () => {
      target = nightFactor()
      if (reduced) {
        night = target
        draw(0)
      }
    }

    size()
    window.addEventListener('resize', size)
    clock = window.setInterval(tick, 60000)
    // coming back to a tab left open for hours should show the right sky
    document.addEventListener('visibilitychange', tick)
    if (!reduced) frame = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', size)
      document.removeEventListener('visibilitychange', tick)
      window.clearInterval(clock)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  /* ---------------- entrance + parallax ---------------- */
  useGsap(scope, () => {
    if (prefersReducedMotion()) return

    const logoEl = `.${styles.logo}`
    const ripples = gsap.utils.toArray(`.${styles.ripple}`)

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })

    intro
      .from(`.${styles.sunGlow}, .${styles.glint}, .${styles.halo}`, { opacity: 0, duration: 1.4 }, 0)
      .from(`.${styles.wave}`, { yPercent: 55, opacity: 0, duration: 1.3, stagger: 0.09 }, 0.1)

    /* The sail-in. Four tweens run together on the same element and
       blend into one motion: a long decelerating descent, a lateral
       tack that drifts left-right-centre, a heel that leans into each
       turn, and a slow scale-up for distance. No bounce — it glides
       down and settles onto its waterline. */
    const fall = Math.max(window.innerHeight * 0.62, 420)
    const sail = gsap.timeline()

    sail
      .fromTo(logoEl, { y: -fall, opacity: 0 }, { y: 0, opacity: 1, duration: 2.9, ease: 'power2.out' }, 0)
      .fromTo(
        logoEl,
        { x: -76 },
        { duration: 3.1, ease: 'none', keyframes: { x: [-76, 44, -15, 4, 0], easeEach: 'sine.inOut' } },
        0
      )
      .fromTo(
        logoEl,
        { rotate: -9 },
        { duration: 3.4, ease: 'none', keyframes: { rotate: [-9, 6.5, -2.6, 1, 0], easeEach: 'sine.inOut' } },
        0
      )
      .fromTo(logoEl, { scale: 0.84 }, { scale: 1, duration: 2.9, ease: 'power2.out' }, 0)
      .add(() => {
        gsap.to(logoEl, {
          y: -11,
          rotate: 1.1,
          duration: 3.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

    /* one soft ripple as it meets the water, not an impact splash */
    ripples.forEach((ripple, i) => {
      sail.fromTo(
        ripple,
        { scale: 0.25, opacity: 0.42 },
        { scale: 1.15 + i * 0.35, opacity: 0, duration: 1.1 + i * 0.25, ease: 'power2.out' },
        2.35 + i * 0.06
      )
    })

    intro.add(sail, 0.25)
    intro.from(`.${styles.heroCopy} > *`, { y: 26, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=1.9')

    /* parallax — every layer drifts at its own rate */
    const track = {
      trigger: `.${styles.hero}`,
      start: 'top top',
      end: 'bottom top',
    }

    WAVES.forEach((wave) => {
      gsap.to(`.${styles[wave.key]}`, {
        yPercent: wave.speed * 62,
        ease: 'none',
        scrollTrigger: { ...track, scrub: 0.6 },
      })
    })

    gsap.to(`.${styles.glint}`, {
      yPercent: 18,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { ...track, scrub: 0.7 },
    })
    gsap.to(`.${styles.sunGlow}`, {
      yPercent: 22,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: { ...track, scrub: 0.8 },
    })
    gsap.to(`.${styles.stars}`, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { ...track, scrub: 1 },
    })
    gsap.to(`.${styles.heroInner}`, {
      yPercent: 16,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: { ...track, scrub: 0.5 },
    })
  })

  return (
    <section className={styles.hero} ref={scope} data-hero id="top">
      <div className={styles.sky} aria-hidden="true" />
      <canvas className={styles.stars} ref={canvasRef} aria-hidden="true" />
      <div className={styles.sunGlow} aria-hidden="true" />
      <div className={styles.glint} aria-hidden="true" />

      <div className={styles.sea} aria-hidden="true">
        {WAVES.map((wave) => (
          <div key={wave.key} className={`${styles.wave} ${styles[wave.key]}`}>
            <svg viewBox={wave.viewBox} preserveAspectRatio="none" aria-hidden="true">
              <path d={wave.d} fill={wave.fill} fillOpacity={wave.opacity} />
            </svg>
          </div>
        ))}
      </div>

      <div className={`${styles.heroInner} wrap`}>
        <div className={styles.logoStage}>
          <span className={styles.halo} aria-hidden="true" />
          <span className={styles.ripple} aria-hidden="true" />
          <span className={`${styles.ripple} ${styles.ripple2}`} aria-hidden="true" />
          <img className={styles.logo} src={logo} alt="She Ships" width="536" height="700" />
        </div>

        <div className={styles.heroCopy}>
          <p className="eyebrow eyebrow-center">Southwest Florida</p>
          <h1 className="lead">
            Nobody ships <em>alone</em>.
          </h1>
          <p className={styles.heroSub}>
            A new group for female developers across Southwest Florida &mdash; Sarasota down to
            Naples. Bring whatever you&rsquo;re working on, or nothing at all.
          </p>
          <div className={styles.heroActions}>
            <a className="btn" href="#events">
              See upcoming events
            </a>
            <a className="btn btn-ghost" href="#about">
              What we&rsquo;re about
            </a>
          </div>
        </div>
      </div>

    </section>
  )
}
