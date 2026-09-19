# She Ships

One-page site for the She Ships developer club. React + Vite, CSS Modules, GSAP.

Built by Whelk Works. Sponsored by Securipolis.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Layout

```
src/
  main.jsx                 entry + router
  App.jsx                  routes: / and the 404 catch-all
  styles/global.css        brand tokens, resets, .wrap / .section / .btn / .eyebrow
  lib/motion.js            gsap + ScrollTrigger, reduced-motion check, revealOnScroll
  lib/events.js            event data, date helpers, Google Calendar fetch
  hooks/useGsap.js         runs GSAP in a scope and reverts it on unmount
  assets/logo.png          the mark, background removed
  components/
    NavBar/                file-explorer nav
    LandingPage/           hero, waves, starfield, logo sail-in
    AboutSec/              four pillars
    QuoteSec/              pull-quote band
    EventSec/              calendar + upcoming list
    Form/                  join form
    Footer/                Meetup, Whelk Works, Securipolis
    NotFound/              404
```

Each component is `Name.jsx` + `Name.module.css`. Anything shared by more than
one component lives in `styles/global.css`; everything else is scoped.

## Motion

GSAP timelines run inside `useGsap`, which wraps them in a `gsap.context()` and
reverts on unmount. That matters in React: without it, StrictMode's double-mount
in dev stacks two copies of every timeline on the same elements.

Hidden states are set by GSAP at runtime, never in CSS. If the script fails,
every section still renders at full opacity instead of sitting invisible waiting
for an observer. `prefers-reduced-motion` short-circuits all of it.

## Two things still to wire

**Google Calendar** — the calendar is live and reads from Google. Nothing is
hard-coded, so the site never shows an event that doesn't exist. For a public
calendar, put these in `.env`:

```
VITE_GCAL_ID=…@group.calendar.google.com
VITE_GCAL_KEY=…
```

Until those are set — or while the calendar is genuinely empty — `EventSec`
renders its empty state, and the "Add to your calendar" / "See all events"
buttons stay hidden. They appear on their own once there are events to point at.

Two conventions it reads off each Google Calendar entry:

- the **first line of the description** becomes the chip (`Workshop`, `Hack day`,
  `Social`); anything else falls back to `Meetup`
- the **location field** becomes the city line

A private calendar needs OAuth and a server-side proxy so the client secret never
reaches the browser.

**Form submission** — `Form.jsx` has a `submitSignup()` stub with the payload
already shaped for HubSpot's Forms API. Loading, error and success states all
work against it today.

> Securipolis and Whelk Works have separate HubSpot portals and their IDs differ
> by only a few digits — check the full number before wiring it. She Ships has no
> portal of its own, so which one this lands in is a decision to make on purpose.

## Deploying

`npm run build` emits a static `dist/`. The router uses real paths, so the host
needs a rewrite of all unmatched routes to `index.html` or the 404 page will be
the host's instead of this one. On Netlify that's `/* /index.html 200` in
`_redirects`; on Vercel it's the default for SPAs.
