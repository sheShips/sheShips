import { useEffect, useMemo, useRef, useState } from 'react'
import { revealOnScroll } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import {
  WARM_TAGS,
  MONTHS,
  DOW_SHORT,
  DOW_FULL,
  dayKey,
  formatTime,
  fetchUpcomingEvents,
  isCalendarConfigured,
  getCalendarSubscribeUrl,
  getCalendarViewUrl,
} from '../../lib/events'
import styles from './EventSec.module.css'

const TODAY = new Date()

/**
 * Builds the cells for one month, padded out with the tail of the
 * previous month and the head of the next so the grid always sits on
 * whole weeks.
 */
function buildMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysPrev = new Date(year, month, 0).getDate()
  const total = Math.ceil((firstDay + daysInMonth) / 7) * 7

  return Array.from({ length: total }, (_, i) => {
    if (i < firstDay) {
      const day = daysPrev - firstDay + 1 + i
      return { day, date: new Date(year, month - 1, day), outside: true }
    }
    if (i >= firstDay + daysInMonth) {
      const day = i - (firstDay + daysInMonth) + 1
      return { day, date: new Date(year, month + 1, day), outside: true }
    }
    const day = i - firstDay + 1
    return { day, date: new Date(year, month, day), outside: false }
  })
}

export default function EventSec() {
  const scope = useRef(null)
  const [cursor, setCursor] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))
  const [events, setEvents] = useState([])
  const [state, setState] = useState(isCalendarConfigured() ? 'loading' : 'empty')
  // hovering a calendar day lights the matching row in the list, and vice versa
  const [linkedDay, setLinkedDay] = useState(null)

  /* Live from Google Calendar. Nothing is hard-coded: if the calendar
     is empty or not connected yet, the section says so rather than
     inventing dates. */
  useEffect(() => {
    if (!isCalendarConfigured()) return undefined

    const controller = new AbortController()
    fetchUpcomingEvents({ signal: controller.signal })
      .then((items) => {
        setEvents(items)
        setState(items.length ? 'ready' : 'empty')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('[She Ships] calendar failed to load', error)
        setState('error')
      })

    return () => controller.abort()
  }, [])

  const eventsByDay = useMemo(() => {
    const map = new Map()
    events.forEach((event) => {
      const key = dayKey(event.start)
      map.set(key, [...(map.get(key) || []), event])
    })
    return map
  }, [events])

  const cells = useMemo(() => buildMonth(cursor.getFullYear(), cursor.getMonth()), [cursor])
  const upcoming = useMemo(() => events.slice(0, 4), [events])
  const hasEvents = events.length > 0

  useGsap(scope, () => {
    revealOnScroll('[data-reveal-head] > *', {
      trigger: `.${styles.events}`,
      start: 'top 72%',
    })
    revealOnScroll(`.${styles.cal}, .${styles.up}`, {
      trigger: `.${styles.layout}`,
      start: 'top 78%',
      y: 46,
      stagger: 0.14,
    })
  }, [])

  const shiftMonth = (delta) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))

  const todayKey = dayKey(TODAY)
  const subscribeUrl = getCalendarSubscribeUrl()
  const viewUrl = getCalendarViewUrl()

  const note = {
    loading: 'Checking the calendar…',
    error: 'Couldn’t reach the calendar just now. Try again in a minute.',
    empty: 'No dates on the books yet — this fills in as they’re set.',
    ready: 'Straight from our Google Calendar, so it’s always current.',
  }[state]

  return (
    <section className={`section ${styles.events}`} id="events" ref={scope}>
      <div className="wrap">
        <div className="section-head" data-reveal-head>
          <p className="eyebrow">What&rsquo;s on</p>
          <h2 className="lead">
            Come to the first one.
          </h2>
          <p>
            We&rsquo;re picking dates and places across the region &mdash; Sarasota, Fort Myers,
            Naples, everywhere between. Get on the list below and you&rsquo;ll know before anyone
            else.
          </p>
        </div>

        <div className={styles.layout}>
          {/* ---------- month grid ---------- */}
          <div className={styles.cal}>
            <div className={styles.calHead}>
              <div>
                <div className={styles.calMonth}>
                  {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                </div>
                <small className={styles.calSub}>Meetups &amp; workshops</small>
              </div>
              <div className={styles.calNav}>
                <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                  &#8249;
                </button>
                <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
                  &#8250;
                </button>
              </div>
            </div>

            <div className={styles.grid} role="grid" aria-label="Event calendar">
              {DOW_SHORT.map((label, i) => (
                <div
                  key={DOW_FULL[i]}
                  className={styles.dow}
                  role="columnheader"
                  aria-label={DOW_FULL[i]}
                >
                  {label}
                </div>
              ))}

              {cells.map((cell, i) => {
                const key = dayKey(cell.date)
                const dayEvents = cell.outside ? null : eventsByDay.get(key)
                const classes = [
                  styles.cell,
                  cell.outside && styles.outside,
                  key === todayKey && styles.today,
                  dayEvents && styles.hasEvent,
                  dayEvents && linkedDay === key && styles.active,
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div
                    key={`${key}-${i}`}
                    role="gridcell"
                    className={classes}
                    tabIndex={dayEvents ? 0 : undefined}
                    aria-label={
                      dayEvents
                        ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''} on ${
                            MONTHS[cell.date.getMonth()]
                          } ${cell.day}`
                        : undefined
                    }
                    onMouseEnter={dayEvents ? () => setLinkedDay(key) : undefined}
                    onMouseLeave={dayEvents ? () => setLinkedDay(null) : undefined}
                    onFocus={dayEvents ? () => setLinkedDay(key) : undefined}
                    onBlur={dayEvents ? () => setLinkedDay(null) : undefined}
                  >
                    {cell.day}
                    {dayEvents ? <span className={styles.dot} /> : null}
                  </div>
                )
              })}
            </div>

            <p className={`${styles.calNote} ${state === 'error' ? styles.calNoteWarn : ''}`}>
              <span className={styles.pip} />
              {note}
            </p>
          </div>

          {/* ---------- upcoming list ---------- */}
          <div className={styles.up}>
            <div className={styles.upHead}>
              <h3>Upcoming</h3>
              {hasEvents ? (
                <span className={styles.upCount}>{events.length} scheduled</span>
              ) : null}
            </div>

            {hasEvents ? (
              upcoming.map((event) => {
                const key = dayKey(event.start)
                return (
                  <a
                    key={event.id || `${key}-${event.title}`}
                    className={`${styles.ev} ${linkedDay === key ? styles.linked : ''}`}
                    href={event.htmlLink || '#join'}
                    target={event.htmlLink ? '_blank' : undefined}
                    rel={event.htmlLink ? 'noopener noreferrer' : undefined}
                    onMouseEnter={() => setLinkedDay(key)}
                    onMouseLeave={() => setLinkedDay(null)}
                  >
                    <span className={styles.evDate}>
                      <span className={styles.evMon}>
                        {MONTHS[event.start.getMonth()].slice(0, 3)}
                      </span>
                      <span className={styles.evDay}>{event.start.getDate()}</span>
                    </span>
                    <span className={styles.evBody}>
                      <span className={styles.evTitle}>{event.title}</span>
                      <span className={styles.evMeta}>
                        {DOW_FULL[event.start.getDay()]}
                        <span className={styles.sep}>&middot;</span>
                        {event.allDay ? 'All day' : formatTime(event.start)}
                        <span className={styles.sep}>&middot;</span>
                        {event.location}
                      </span>
                      <span
                        className={`${styles.evTag} ${
                          WARM_TAGS.has(event.tag) ? styles.evTagWarm : ''
                        }`}
                      >
                        {event.tag}
                      </span>
                    </span>
                  </a>
                )
              })
            ) : (
              <EmptyState state={state} />
            )}

            {/* These appear on their own once there's something to point at. */}
            {hasEvents ? (
              <div className={styles.cta}>
                {subscribeUrl ? (
                  <a className="btn" href={subscribeUrl} target="_blank" rel="noopener noreferrer">
                    Add to your calendar
                  </a>
                ) : null}
                {viewUrl ? (
                  <a
                    className="btn btn-ghost"
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See all events
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- empty / loading / error -------------------------------- */

function EmptyState({ state }) {
  if (state === 'loading') {
    return (
      <div className={styles.empty} aria-busy="true">
        <span className={styles.emptyPulse} aria-hidden="true" />
        <p className={styles.emptyCopy}>Loading what&rsquo;s coming up&hellip;</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className={styles.empty} role="alert">
        <p className={styles.emptyTitle}>The calendar didn&rsquo;t load</p>
        <p className={styles.emptyCopy}>
          Refresh and it&rsquo;ll probably sort itself out. If not, the list below still works.
        </p>
        <a className="btn btn-ghost" href="#join">
          Get on the list
        </a>
      </div>
    )
  }

  return (
    <div className={styles.empty}>
      <svg
        className={styles.emptyIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 17c2-1.4 3.3-1.4 5.2 0s3.6 1.4 5.5 0 3.3-1.4 5.3 0" />
        <path d="M3 21c2-1.4 3.3-1.4 5.2 0s3.6 1.4 5.5 0 3.3-1.4 5.3 0" />
        <path d="M12 13V3" />
        <path d="M12 4l6 4-6 3z" />
      </svg>
      <p className={styles.emptyTitle}>Nothing on the books yet</p>
      <p className={styles.emptyCopy}>
        We&rsquo;re working out the first date and place now. Get on the list and you&rsquo;ll hear
        about it before it goes anywhere else.
      </p>
      <a className="btn" href="#join">
        Get on the list
      </a>
    </div>
  )
}
