import { useEffect, useMemo, useRef, useState } from 'react'
import { revealOnScroll } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import { LUMA } from '../../lib/luma'
import logo from '../../assets/logo.png'
import styles from './EventSec.module.css'

const MAX_TIMER = 2147483647
const GENERATED = import.meta.glob('../../generated/events.json', { eager: true, import: 'default' })
const feed = Object.values(GENERATED)[0] ?? null

function readEvents(source) {
  if (!source || !Array.isArray(source.events)) return null
  return source.events
    .map((event) => ({ ...event, startTime: Date.parse(event.start), endTime: Date.parse(event.end || event.start) }))
    .filter((event) => Number.isFinite(event.startTime) && Number.isFinite(event.endTime))
}

function useUpcoming(source) {
  const all = useMemo(() => readEvents(source), [source])
  const [now, setNow] = useState(() => Date.now())

  const upcoming = useMemo(
    () => (all ? all.filter((event) => event.endTime > now).sort((a, b) => a.startTime - b.startTime) : null),
    [all, now],
  )

  useEffect(() => {
    if (!upcoming || !upcoming.length) return undefined
    const nextEnd = Math.min(...upcoming.map((event) => event.endTime))
    const delay = Math.min(Math.max(nextEnd - Date.now(), 0) + 1000, MAX_TIMER)
    const timer = window.setTimeout(() => setNow(Date.now()), delay)
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(Date.now())
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [upcoming])

  return upcoming
}

function useLumaCheckout(eventId) {
  useEffect(() => {
    if (!eventId) return
    const init = () => window.luma?.initCheckout?.()
    const existing = document.getElementById(LUMA.checkoutScriptId)
    if (existing) {
      init()
      existing.addEventListener('load', init, { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = LUMA.checkoutScriptId
    script.src = LUMA.checkoutScript
    script.async = true
    script.addEventListener('load', init, { once: true })
    document.body.appendChild(script)
  }, [eventId])
}

function useEventSchema(events) {
  useEffect(() => {
    if (!events || !events.length) return undefined
    const data = {
      '@context': 'https://schema.org',
      '@graph': events.slice(0, 20).map((event) => ({
        '@type': 'Event',
        name: event.title,
        startDate: event.start,
        endDate: event.end,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        isAccessibleForFree: true,
        location: event.location
          ? { '@type': 'Place', name: event.location, address: event.location }
          : { '@type': 'Place', name: 'Southwest Florida' },
        organizer: { '@id': 'https://sheships.dev/#org' },
        url: event.url,
        description: 'A free She Ships event for women in tech in Southwest Florida.',
      })),
    }
    const tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.dataset.sheShipsEvents = ''
    tag.textContent = JSON.stringify(data)
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [events])
}

export default function EventSec({ data = feed }) {
  const scope = useRef(null)
  const upcoming = useUpcoming(data)
  const state = upcoming === null ? 'unknown' : upcoming.length ? 'upcoming' : 'empty'
  const next = state === 'upcoming' ? upcoming[0] : null

  useLumaCheckout(next?.id)
  useEventSchema(upcoming)

  useGsap(scope, () => {
    revealOnScroll('[data-reveal-head] > *', {
      trigger: `.${styles.events}`,
      start: 'top 72%',
    })
    revealOnScroll(`.${styles.frame}, .${styles.actions}`, {
      trigger: `.${styles.frame}`,
      start: 'top 82%',
      y: 40,
      stagger: 0.12,
    })
  }, [])

  return (
    <section className={`section ${styles.events}`} id="events" ref={scope}>
      <div className="wrap">
        <div className="section-head" data-reveal-head>
          <p className="eyebrow">Upcoming events</p>
          <h2 className="lead">See what&rsquo;s coming up.</h2>
          {state === 'empty' ? (
            <p>Always free to attend. New dates go up on Luma first.</p>
          ) : (
            <p>
              Meetups, workshops and hack days across the region &mdash; Sarasota, Fort Myers,
              Naples, everywhere between. Always free to attend.
            </p>
          )}
        </div>

        <div className={`${styles.frame} ${state === 'empty' ? styles.frameEmpty : ''}`}>
          <iframe
            className={styles.calendar}
            src={LUMA.calendarEmbed}
            title="She Ships events calendar on Luma"
            loading="lazy"
            allow="fullscreen; payment"
            aria-hidden={state === 'empty' ? 'true' : undefined}
            tabIndex={state === 'empty' ? -1 : undefined}
          />
          {state === 'empty' ? (
            <div className={styles.overlay}>
              <div className={styles.harbor} aria-hidden="true">
                <img className={styles.boat} src={logo} alt="" width="536" height="700" />
                <svg className={styles.water} viewBox="0 0 120 16" preserveAspectRatio="none">
                  <path d="M0 8 C10 2 20 2 30 8 S50 14 60 8 S80 2 90 8 S110 14 120 8 V16 H0 Z" />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>No events yet!</h3>
              <p className={styles.emptyCopy}>
                The next one is in the works. Sail over to our Luma so you don&rsquo;t miss a thing.
              </p>
              <a className={`btn ${styles.action}`} href={LUMA.calendarUrl} target="_blank" rel="noopener noreferrer">
                Follow for the next event!
              </a>
            </div>
          ) : null}
        </div>

        {state === 'empty' ? null : (
          <div className={styles.actions}>
            {next ? (
              <a
                className={`btn ${styles.action}`}
                href={next.url}
                target="_blank"
                rel="noopener noreferrer"
                data-luma-action="checkout"
                data-luma-event-id={next.id || undefined}
              >
                Register for the next event
              </a>
            ) : null}
            <a
              className={`btn btn-ghost ${styles.action}`}
              href={LUMA.calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow on Luma
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
