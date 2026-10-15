import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../NavBar/NavBar'
import Footer from '../Footer/Footer'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import { FAQS, CONTACTS, answerText } from './faq'
import styles from './FaqPage.module.css'

const TITLE = 'FAQ | She Ships, Women in Tech in Sarasota, Tampa & St. Pete'
const DESCRIPTION =
  'Who can join She Ships, what it costs, how often we meet and what happens at a meetup. Answers for women in tech across Southwest Florida and Tampa Bay.'

function setMeta(name, content, attr = 'name') {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function Paragraph({ text }) {
  if (!text.includes('{contacts}')) return <p>{text}</p>
  const [before, after] = text.split('{contacts}')
  return (
    <p>
      {before}
      {CONTACTS.map((c, i) => (
        <span key={c.email}>
          {i > 0 ? ' or ' : null}
          <a href={`mailto:${c.email}`}>{c.name}</a>
        </span>
      ))}
      {after}
    </p>
  )
}

function Item({ item, open, onToggle }) {
  const panel = useRef(null)
  const inner = useRef(null)
  const first = useRef(true)

  useEffect(() => {
    const el = panel.current
    if (!el) return
    if (first.current) {
      first.current = false
      gsap.set(el, { height: open ? 'auto' : 0 })
      return
    }
    if (prefersReducedMotion()) {
      gsap.set(el, { height: open ? 'auto' : 0 })
      return
    }
    gsap.killTweensOf([el, inner.current])
    if (open) {
      gsap.fromTo(el, { height: el.offsetHeight }, { height: 'auto', duration: 0.75, ease: 'sine.inOut' })
      gsap.fromTo(inner.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.08, ease: 'sine.out' })
    } else {
      gsap.to(inner.current, { y: -6, opacity: 0, duration: 0.4, ease: 'sine.in' })
      gsap.to(el, { height: 0, duration: 0.65, ease: 'sine.inOut' })
    }
  }, [open])

  return (
    <div className={`${styles.item} ${open ? styles.open : ''}`} id={item.id}>
      <h2 className={styles.q}>
        <button
          type="button"
          className={styles.qBtn}
          aria-expanded={open}
          aria-controls={`${item.id}-answer`}
          onClick={onToggle}
        >
          <span>{item.q}</span>
          <span className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path className={styles.iconV} d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
        </button>
      </h2>
      <div className={styles.panel} id={`${item.id}-answer`} ref={panel} role="region" aria-label={item.q}>
        <div className={styles.answer} ref={inner}>
          {item.answer.map((text) => (
            <Paragraph key={text} text={text} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FaqPage() {
  const scope = useRef(null)
  const [openId, setOpenId] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash.slice(1) || null : null
  )

  useEffect(() => {
    const prevTitle = document.title
    document.title = TITLE
    setMeta('description', DESCRIPTION)
    setMeta('og:title', TITLE, 'property')
    setMeta('og:description', DESCRIPTION, 'property')
    setMeta('og:url', 'https://sheships.dev/faq', 'property')
    const canonical = document.head.querySelector('link[rel="canonical"]')
    const prevCanonical = canonical?.getAttribute('href')
    canonical?.setAttribute('href', 'https://sheships.dev/faq')
    window.scrollTo(0, 0)

    document.getElementById('faq-ld-static')?.remove()
    const tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.dataset.sheShipsFaq = ''
    tag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: answerText(item) },
      })),
    })
    document.head.appendChild(tag)

    return () => {
      document.title = prevTitle
      if (prevCanonical) canonical?.setAttribute('href', prevCanonical)
      tag.remove()
    }
  }, [])

  useGsap(scope, () => {
    if (prefersReducedMotion()) return
    gsap.from(`.${styles.head} > *`, { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' })
    gsap.from(`.${styles.item}`, { y: 26, opacity: 0, duration: 0.8, stagger: 0.06, delay: 0.25, ease: 'power3.out' })
  }, [])

  return (
    <>
      <NavBar />
      <main className={styles.page} ref={scope}>
        <div className={styles.sky} aria-hidden="true" />
        <div className={`wrap ${styles.inner}`}>
          <header className={styles.head}>
            <p className="eyebrow">Good to know</p>
            <h1 className="lead">Questions, answered.</h1>
            <p className={styles.intro}>
              Everything you might be wondering before your first She Ships meetup. Still curious?
              Come say hi at an event, or reach out anytime.
            </p>
          </header>

          <div className={styles.list}>
            {FAQS.map((item) => (
              <Item
                key={item.id}
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
              />
            ))}
          </div>

          <div className={styles.cta}>
            <p>Ready to come aboard?</p>
            <Link className="btn" to="/#events">
              See upcoming events
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
