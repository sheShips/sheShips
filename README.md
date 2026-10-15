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
  lib/luma.js              Luma calendar config (page, embed, iCal feed, checkout script)
  hooks/useGsap.js         runs GSAP in a scope and reverts it on unmount
  assets/logo.png          the mark, background removed
  components/
    NavBar/                file-explorer nav
    LandingPage/           hero, waves, starfield, logo sail-in
    AboutSec/              four pillars
    QuoteSec/              pull-quote band
    EventSec/              Luma calendar embed, register and follow buttons
    Footer/                socials (#connect), Whelk Works, Securipolis
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

## Events (Luma)

Events live on Luma at https://luma.com/sheships. All Luma values sit in
`src/lib/luma.js`.

The browser can't read Luma's data, so the event check happens at build time.
`scripts/fetch-events.mjs` runs every time Vite starts (dev or build, via a plugin in
`vite.config.js`), or on its own with `npm run fetch-events`. It reads
the iCal feed and writes `src/generated/events.json` (gitignored) with the events
that haven't ended yet. If the feed can't be reached, it writes `null` and the
build carries on.

`EventSec` then shows one of three states:

- **Upcoming events:** the Luma calendar, "Register for the next event" (Luma
  checkout) and "Follow on Luma"
- **No events:** the calendar dimmed behind a "No events yet!" overlay with a link
  to the Luma page
- **Feed unreachable:** the calendar and "Follow on Luma"

Events that end between builds drop off on their own, using the visitor's clock.
Rebuild and redeploy after adding an event on Luma so the Register button appears.

## Deploying

`npm run build` emits a static `dist/`. The router uses real paths, so the host
needs a rewrite of all unmatched routes to `index.html` or the 404 page will be
the host's instead of this one. On Netlify that's `/* /index.html 200` in
`_redirects`; on Vercel it's the default for SPAs.
