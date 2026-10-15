import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LUMA } from '../src/lib/luma.js'

const here = fileURLToPath(import.meta.url)
const OUT = resolve(dirname(here), '..', 'src', 'generated', 'events.json')
const DEFAULT_ZONE = 'America/New_York'

export function unfold(text) {
  return text.replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '')
}

function unescapeText(value) {
  return value.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1')
}

function splitLine(line) {
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') quoted = !quoted
    else if (ch === ':' && !quoted) return [line.slice(0, i), line.slice(i + 1)]
  }
  return null
}

function parseParams(parts) {
  const params = {}
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq > 0) params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1).replace(/^"|"$/g, '')
  }
  return params
}

export function parseVevents(text) {
  const events = []
  let current = null
  for (const line of unfold(text).split('\n')) {
    const trimmed = line.trim()
    if (trimmed === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (trimmed === 'END:VEVENT') {
      if (current) events.push(current)
      current = null
      continue
    }
    if (!current) continue
    const split = splitLine(line)
    if (!split) continue
    const [head, value] = split
    const [name, ...paramParts] = head.split(';')
    const key = name.toUpperCase()
    if (!current[key]) current[key] = { value: value.trim(), params: parseParams(paramParts) }
  }
  return events
}

function zoneOffset(time, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(time))
  const p = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - time
}

function zonedToUtc(fields, timeZone) {
  let zone = timeZone || DEFAULT_ZONE
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
  } catch {
    zone = DEFAULT_ZONE
  }
  const guess = Date.UTC(...fields)
  const first = zoneOffset(guess, zone)
  const time = guess - first
  const second = zoneOffset(time, zone)
  return second === first ? time : guess - second
}

export function parseIcsDate(field) {
  if (!field) return null
  const match = field.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!match) return null
  const [, y, mo, d, h, mi, s, z] = match
  const fields = [+y, +mo - 1, +d, +(h || 0), +(mi || 0), +(s || 0)]
  const time = z ? Date.UTC(...fields) : zonedToUtc(fields, field.params?.TZID)
  return { time, allDay: !h }
}

function findEventId(raw) {
  const fields = [raw.UID, ...Object.values(raw)].filter(Boolean)
  for (const field of fields) {
    const match = field.value.match(/evt-[A-Za-z0-9]+/)
    if (match) return match[0]
  }
  return null
}

function findUrl(raw, id) {
  if (raw.URL?.value) return raw.URL.value
  const text = [raw.DESCRIPTION, raw.LOCATION].filter(Boolean).map((f) => unescapeText(f.value)).join('\n')
  const links = text.match(/https:\/\/(?:lu\.ma|luma\.com)\/[^\s,;)"'<>]+/g) || []
  const eventLink = links.find((link) => !/\/(calendar|embed|ics|user)\//.test(link) && !link.endsWith(LUMA.calendarUrl.split('/').pop()))
  if (eventLink) return eventLink
  return id ? `https://luma.com/event/${id}` : LUMA.calendarUrl
}

export function toEvent(raw) {
  const start = parseIcsDate(raw.DTSTART)
  if (!start) return null
  const end = parseIcsDate(raw.DTEND)
  const endTime = end ? end.time : start.time + (start.allDay ? 86400000 : 0)
  const id = findEventId(raw)
  const location = raw.LOCATION ? unescapeText(raw.LOCATION.value).split('\n')[0].trim() : ''
  return {
    id,
    title: raw.SUMMARY ? unescapeText(raw.SUMMARY.value).trim() : 'She Ships event',
    start: new Date(start.time).toISOString(),
    end: new Date(endTime).toISOString(),
    allDay: start.allDay,
    url: findUrl(raw, id),
    location: /^https?:\/\//.test(location) ? '' : location,
  }
}

export function upcomingEvents(text, now = Date.now()) {
  return parseVevents(text)
    .map(toEvent)
    .filter((event) => event && Date.parse(event.end) > now)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
}

async function load(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: { accept: 'text/calendar' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`Luma feed responded ${response.status}`)
  const text = await response.text()
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('Luma feed did not return an iCal calendar')
  return { fetchedAt: new Date().toISOString(), events: upcomingEvents(text) }
}

export async function main() {
  let payload = null
  try {
    payload = await load(LUMA.icsFeed)
    console.log(`[fetch-events] ${payload.events.length} upcoming event(s) from Luma`)
  } catch (error) {
    console.warn(`[fetch-events] Could not read the Luma feed (${error.message}). Writing null; the site will show the calendar without event checks.`)
  }
  try {
    await mkdir(dirname(OUT), { recursive: true })
    await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`)
  } catch (error) {
    console.warn(`[fetch-events] Could not write ${OUT} (${error.message})`)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === here) {
  main().catch((error) => console.warn(`[fetch-events] ${error.message}`))
}
