import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger, enableSailboat } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import { nightFactor } from '../../lib/sky'
import logo from '../../assets/logo.png'
import styles from './LandingPage.module.css'

/* Four bands, back to front. `speed` drives the scroll parallax.
   The curves are evenly rolling waves (generated, 2.5 crests across),
   each one phase-shifted so its crests sit between the crests of the
   band behind it, like layered surf. */
const WAVES = [
  {
    key: 'wave1',
    speed: 0.14,
    fill: '#14586b',
    opacity: 0.55,
    viewBox: '0 0 1440 150',
    d: 'M0,67 C9,65 34,56 51,53 C69,50 86,48 103,47 C120,47 137,48 154,49 C171,51 189,53 206,55 C223,57 240,60 257,62 C274,65 291,68 309,72 C326,75 343,80 360,83 C377,87 394,92 411,94 C429,96 446,98 463,97 C480,96 497,92 514,88 C531,84 549,76 566,71 C583,66 600,59 617,55 C634,51 651,49 669,48 C686,47 703,47 720,49 C737,50 754,52 771,54 C789,56 806,58 823,61 C840,63 857,66 874,69 C891,73 909,77 926,81 C943,85 960,90 977,92 C994,95 1011,98 1029,97 C1046,97 1063,94 1080,90 C1097,87 1114,80 1131,75 C1149,69 1166,62 1183,58 C1200,54 1217,50 1234,48 C1251,47 1269,47 1286,48 C1303,49 1320,51 1337,53 C1354,55 1371,57 1389,59 C1406,62 1431,66 1440,67 L1440,750 L0,750 Z',
  },
  {
    key: 'wave2',
    speed: 0.3,
    fill: '#147182',
    opacity: 0.62,
    viewBox: '0 0 1440 150',
    d: 'M0,63 C9,64 34,64 51,66 C69,69 86,73 103,78 C120,83 137,89 154,94 C171,99 189,104 206,106 C223,109 240,109 257,108 C274,108 291,104 309,101 C326,98 343,94 360,90 C377,87 394,83 411,80 C429,77 446,75 463,73 C480,71 497,69 514,67 C531,66 549,64 566,63 C583,63 600,63 617,65 C634,67 651,71 669,75 C686,79 703,86 720,91 C737,96 754,101 771,104 C789,107 806,109 823,109 C840,109 857,106 874,103 C891,100 909,96 926,92 C943,89 960,85 977,82 C994,79 1011,77 1029,74 C1046,72 1063,70 1080,68 C1097,67 1114,65 1131,64 C1149,63 1166,63 1183,64 C1200,65 1217,68 1234,72 C1251,76 1269,83 1286,88 C1303,93 1320,99 1337,102 C1354,106 1371,108 1389,109 C1406,109 1431,106 1440,105 L1440,750 L0,750 Z',
  },
  {
    key: 'wave3',
    speed: 0.52,
    fill: '#113646',
    opacity: 0.82,
    viewBox: '0 0 1440 150',
    d: 'M0,103 C9,103 34,104 51,105 C69,105 86,104 103,103 C120,102 137,101 154,100 C171,98 189,96 206,92 C223,89 240,85 257,81 C274,76 291,71 309,67 C326,64 343,61 360,60 C377,60 394,61 411,64 C429,67 446,72 463,77 C480,82 497,88 514,92 C531,96 549,99 566,101 C583,104 600,104 617,105 C634,105 651,104 669,104 C686,103 703,102 720,101 C737,99 754,97 771,94 C789,91 806,87 823,83 C840,79 857,74 874,70 C891,66 909,62 926,61 C943,60 960,60 977,62 C994,65 1011,70 1029,74 C1046,78 1063,85 1080,89 C1097,93 1114,97 1131,100 C1149,103 1166,104 1183,104 C1200,105 1217,105 1234,104 C1251,104 1269,103 1286,101 C1303,100 1320,98 1337,96 C1354,93 1371,90 1389,86 C1406,82 1431,75 1440,72 L1440,750 L0,750 Z',
  },
  {
    key: 'wave4',
    speed: 0.8,
    fill: '#0b2331',
    opacity: 1,
    viewBox: '0 0 1440 160',
    d: 'M0,90 C9,87 34,80 51,76 C69,72 86,68 103,66 C120,63 137,62 154,61 C171,61 189,61 206,62 C223,62 240,63 257,64 C274,65 291,66 309,69 C326,71 343,74 360,78 C377,81 394,86 411,90 C429,93 446,98 463,99 C480,101 497,102 514,101 C531,100 549,96 566,92 C583,89 600,83 617,79 C634,75 651,70 669,67 C686,64 703,63 720,62 C737,61 754,61 771,61 C789,62 806,62 823,63 C840,64 857,65 874,67 C891,69 909,72 926,75 C943,79 960,83 977,87 C994,91 1011,96 1029,98 C1046,100 1063,102 1080,101 C1097,101 1114,98 1131,95 C1149,91 1166,86 1183,82 C1200,77 1217,72 1234,69 C1251,66 1269,64 1286,62 C1303,61 1320,61 1337,61 C1354,61 1371,62 1389,63 C1406,64 1431,66 1440,66 L1440,760 L0,760 Z',
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

    let stopSailboat = () => {}
    let bob = null

    // no point bobbing a boat nobody can see: pause it once the hero
    // has scrolled out of view, resume when it comes back
    ScrollTrigger.create({
      trigger: scope.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => bob?.paused(!self.isActive),
    })

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
        bob = gsap.to(logoEl, {
          y: -11,
          rotate: 1.1,
          duration: 3.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        // interaction switches on only now, after the sail-in and first bob
        stopSailboat = enableSailboat(
          scope.current.querySelector(`.${styles.boat}`),
          scope.current,
          { ripples }
        )
      })

    /* one soft ripple as it meets the water, not an impact splash.
       immediateRender: false keeps the rings hidden until the logo
       actually lands (otherwise fromTo paints them at 0.42 the moment
       the timeline is built, sitting above the headline for ~2.5s).
       They then fade up quickly and out slowly, so there's no pop. */
    ripples.forEach((ripple, i) => {
      const at = 2.35 + i * 0.06
      const duration = 1.1 + i * 0.25
      sail
        .fromTo(
          ripple,
          { xPercent: -50, x: 0, scale: 0.25 },
          { scale: 1.15 + i * 0.35, duration, ease: 'power2.out', immediateRender: false },
          at
        )
        .fromTo(
          ripple,
          { opacity: 0 },
          {
            duration,
            ease: 'none',
            immediateRender: false,
            keyframes: { '0%': { opacity: 0 }, '18%': { opacity: 0.42, ease: 'sine.out' }, '100%': { opacity: 0, ease: 'sine.in' } },
          },
          at
        )
    })

    intro.add(sail, 0.25)
    intro.from(`.${styles.heroCopy} > *`, { y: 26, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=1.9')
    // the striped sun-path on the water only plays during the sail-in; once
    // the copy arrives it fades out so no orange lines sit behind the text
    intro.to(`.${styles.glint}`, { opacity: 0, duration: 0.9, ease: 'sine.inOut' }, '<+0.25')

    /* parallax — every layer drifts at its own rate */
    const track = {
      trigger: `.${styles.hero}`,
      start: 'top top',
      end: 'bottom top',
    }

    /* Parallax uses fromTo with explicit resting values and
       immediateRender: false. A plain .to() records its start values when
       it's created, which is mid-intro (waves still pushed down 55%, glows
       still at opacity 0), so the first scroll used to snap everything back
       to those intro start states. */
    WAVES.forEach((wave) => {
      gsap.fromTo(
        `.${styles[wave.key]}`,
        { yPercent: 0 },
        {
          yPercent: wave.speed * 62,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { ...track, scrub: 0.6 },
        }
      )
    })

    // (the glint has no scroll tween any more: it fades out after the intro)
    gsap.fromTo(
      `.${styles.sunGlow}`,
      { yPercent: 0, opacity: 1 },
      {
        yPercent: 22,
        opacity: 0.4,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { ...track, scrub: 0.8 },
      }
    )
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

    // removes the sailboat's pointer listeners on unmount
    return () => {
      stopSailboat()
      bob?.kill()
    }
  })

  return (
    <section className={styles.hero} ref={scope} data-hero id="top">
      <div className={styles.sky} aria-hidden="true" />
      <canvas className={styles.stars} ref={canvasRef} aria-hidden="true" />
      <div className={styles.sunGlow} aria-hidden="true" />
      <div className={styles.glint} aria-hidden="true" />

      <div className={styles.sea} aria-hidden="true">
        {WAVES.map((wave) => (
          <div
            key={wave.key}
            className={`${styles.wave} ${styles[wave.key]}`}
          >
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
          <span className={styles.boat}>
            <img className={styles.logo} src={logo} alt="She Ships" width="536" height="700" />
          </span>
        </div>

        <div className={styles.heroCopy}>
          <p className="eyebrow eyebrow-center">Southwest Florida</p>
          <h1 className="lead">
            Nobody ships <em>alone</em>.
          </h1>
          <p className={styles.heroSub}>
            A group for female devs around Southwest Florida. Just starting out or years in, pull
            up a chair. Bring the bug you&rsquo;ve been staring at all week and the project you
            haven&rsquo;t shown anyone yet. Someone here has been there, and she&rsquo;ll stick
            around to celebrate when it finally works.
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
