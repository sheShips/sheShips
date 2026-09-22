/* ============================================================
   Event data
   ------------------------------------------------------------
   The calendar is live: it reads from Google Calendar and shows
   whatever is actually on it. Nothing is hard-coded, so the site
   never advertises an event that doesn't exist.

   Until the two env vars below are set, the calendar renders its
   empty state — which is the correct, honest zero-state, not a
   placeholder.
   ============================================================ */

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DOW_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const DOW_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

/** Tags that get the warm chip rather than the cool one. */
export const WARM_TAGS = new Set(['Workshop', 'Hack day'])

/** Stable per-day key, used to match events to calendar cells. */
export function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function formatTime(date) {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/* ------------------------------------------------------------
   GOOGLE CALENDAR

   Setup for a PUBLIC calendar — no OAuth, just a browser key:
     1. Calendar settings -> "Make available to public"
     2. Copy the Calendar ID from "Integrate calendar"
     3. Google Cloud console -> enable the Calendar API -> create an
        API key -> restrict it to the Calendar API and this domain
     4. Put both in .env (local) and in the repo's Actions settings (deploy):
          VITE_GCAL_ID=…@group.calendar.google.com
          VITE_GCAL_KEY=…

   A PRIVATE calendar needs OAuth 2.0 and a small server-side proxy,
   so the client secret never ships to the browser.

   Event type conventions, read off each Google Calendar entry:
     - the first line of the description becomes the chip ("Workshop",
       "Hack day", "Social"); anything else falls back to "Meetup"
     - the location field becomes the city line
   ------------------------------------------------------------ */

const CALENDAR_ID = import.meta.env.VITE_GCAL_ID
const API_KEY = import.meta.env.VITE_GCAL_KEY

/** False until the calendar is connected — drives the note under the grid. */
export function isCalendarConfigured() {
  return Boolean(CALENDAR_ID && API_KEY)
}

/** The "add this calendar to yours" link, once there's a calendar to add. */
export function getCalendarSubscribeUrl() {
  if (!CALENDAR_ID) return null
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(CALENDAR_ID)}`
}

/** The public web view of the calendar, for "see all events". */
export function getCalendarViewUrl() {
  if (!CALENDAR_ID) return null
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}`
}

/**
 * Everything upcoming, oldest first. Returns [] when the calendar
 * isn't connected yet or has nothing on it — both are the same thing
 * as far as the UI is concerned.
 */
/* All-day events arrive as a bare "2026-10-03". `new Date()` reads that as
   UTC midnight, which in Florida is the evening before — so the event would
   land on the wrong day. Parse it as a local date instead. */
function parseLocalDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export async function fetchUpcomingEvents({ maxResults = 50, signal } = {}) {
  if (!isCalendarConfigured()) return []

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
    `?key=${API_KEY}` +
    `&timeMin=${new Date().toISOString()}` +
    `&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Google Calendar responded ${response.status}`)
  }

  const data = await response.json()
  return (data.items || []).map((item) => ({
    id: item.id,
    start: item.start.dateTime ? new Date(item.start.dateTime) : parseLocalDate(item.start.date),
    allDay: !item.start.dateTime,
    title: item.summary || 'Untitled',
    location: item.location || 'Location TBA',
    tag: (item.description || '').split('\n')[0].trim() || 'Meetup',
    htmlLink: item.htmlLink,
  }))
}
