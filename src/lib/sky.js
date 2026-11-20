
const LAT = 27.34
const LNG = -82.53
const RAD = Math.PI / 180

export function sunAltitude(date = new Date()) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0
  const g = (357.529 + 0.98560028 * d) * RAD
  const q = 280.459 + 0.98564736 * d
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD
  const e = (23.439 - 0.00000036 * d) * RAD

  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))
  const dec = Math.asin(Math.sin(e) * Math.sin(L))
  const gmst = (18.697374558 + 24.06570982441908 * d) * 15
  const H = (gmst + LNG) * RAD - ra

  const alt = Math.asin(
    Math.sin(LAT * RAD) * Math.sin(dec) + Math.cos(LAT * RAD) * Math.cos(dec) * Math.cos(H)
  )
  return alt / RAD
}

const smooth = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

export function nightFactor(date = skyNow()) {
  return smooth(2, -12, sunAltitude(date))
}

export function skyNow() {
  const now = new Date()
  if (typeof window === 'undefined') return now
  const hour = parseFloat(new URLSearchParams(window.location.search).get('hour'))
  if (Number.isNaN(hour)) return now
  const preview = new Date(now)
  preview.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0)
  return preview
}
