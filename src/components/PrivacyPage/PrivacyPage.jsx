import { useEffect } from 'react'
import NavBar from '../NavBar/NavBar'
import Footer from '../Footer/Footer'
import { SHORE_WAVES } from './waves'
import styles from './PrivacyPage.module.css'

const TITLE = 'Privacy Policy | She Ships'
const DESCRIPTION =
  'How She Ships and ManaSota Tech Network handle information on sheships.dev: analytics, cookies, Luma event registration and your privacy choices.'
const UPDATED = 'October 19, 2026'
const PRIVACY_EMAIL = 'privacy@manasotatech.org'
const URL = 'https://sheships.dev/privacy'

function setMeta(name, content, attr = 'name') {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  const previous = tag.getAttribute('content')
  tag.setAttribute('content', content)
  return () => {
    if (previous === null) tag.remove()
    else tag.setAttribute('content', previous)
  }
}

export default function PrivacyPage() {
  useEffect(() => {
    const prevTitle = document.title
    document.title = TITLE
    const restore = [
      setMeta('description', DESCRIPTION),
      setMeta('og:title', TITLE, 'property'),
      setMeta('og:description', DESCRIPTION, 'property'),
      setMeta('og:url', URL, 'property'),
    ]
    const canonical = document.head.querySelector('link[rel="canonical"]')
    const prevCanonical = canonical?.getAttribute('href')
    canonical?.setAttribute('href', URL)
    window.scrollTo(0, 0)
    return () => {
      document.title = prevTitle
      restore.forEach((undo) => undo())
      if (prevCanonical) canonical?.setAttribute('href', prevCanonical)
    }
  }, [])

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        <div className={`wrap ${styles.inner}`}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Legal</p>
            <h1 className={styles.title}>Privacy Policy</h1>
          </header>
          <article className={styles.body}>
            <p className={styles.updated}>Last updated: {UPDATED}</p>
            <p>
              She Ships is a women in tech community group of ManaSota Tech Network (&ldquo;we,&rdquo;
              &ldquo;us&rdquo;), meeting in Sarasota, Tampa, and St. Pete. ManaSota Tech Network operates
              this site and is responsible for the information described here. ManaSota Tech Network is
              organized by Michael Quirk. Securipolis LLC handles privacy requests on its behalf.
            </p>

            <h2>What we collect</h2>
            <p>
              We do not run forms on this site. Event registration and calendar follows happen on Luma.
              When you register for an event or follow our calendar, Luma collects your information under
              its own privacy policy and shares your registration details (such as your name and email)
              with us as the event host.
            </p>

            <h2>Information collected automatically</h2>
            <ul>
              <li>
                <strong>Hosting logs:</strong> your IP address, browser type, pages viewed, and time
                stamps. Our hosting provider records these to keep the site secure and running.
              </li>
              <li>
                <strong>Analytics:</strong> Google Analytics records pages viewed, time on page, the site
                that referred you, device type, and approximate location derived from your IP address.
              </li>
              <li>
                <strong>Performance monitoring:</strong> our hosting provider, GoDaddy, measures how
                quickly pages load.
              </li>
              <li>
                <strong>Fonts:</strong> pages load fonts from Google Fonts, so your browser sends your IP
                address to Google when the page loads.
              </li>
              <li>
                <strong>Luma event widgets:</strong> our events calendar and the Register button are
                embedded from Luma, so Luma&rsquo;s code runs on our homepage and may set its own cookies.
              </li>
            </ul>

            <h2>Cookies</h2>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Cookie</th>
                    <th scope="col">Provider</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>_ga</code>, <code>_ga_MN380ZMSG0</code></td>
                    <td>Google Analytics</td>
                    <td>Distinguish visitors and sessions for aggregate statistics</td>
                    <td>Up to 2 years</td>
                  </tr>
                  <tr>
                    <td><code>_tccl_visitor</code></td>
                    <td>GoDaddy</td>
                    <td>Hosting performance monitoring</td>
                    <td>Set by GoDaddy</td>
                  </tr>
                  <tr>
                    <td>Luma cookies</td>
                    <td>Luma</td>
                    <td>Embedded event calendar and registration</td>
                    <td>Set by Luma</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              We do not show a cookie banner on this site. You can block or delete cookies in your browser
              settings, and you can opt out of Google Analytics with Google&rsquo;s{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                opt-out browser add-on
              </a>
              .
            </p>

            <h2>How we use your information</h2>
            <ul>
              <li>
                To understand in aggregate how many people visit, which pages they read, and how they found
                us, so we can plan events.
              </li>
              <li>To manage event registrations and send event updates to people who registered on Luma.</li>
            </ul>
            <p>
              We do not use advertising trackers. We do not sell personal information or share it for
              cross-context behavioral advertising.
            </p>

            <h2>Who processes it for us</h2>
            <ul>
              <li><strong>Luma:</strong> event registration, calendar, and attendee communication.</li>
              <li><strong>Google Analytics:</strong> website analytics.</li>
              <li><strong>Google Fonts:</strong> web fonts.</li>
              <li><strong>GoDaddy:</strong> website hosting and performance monitoring.</li>
            </ul>
            <p>We may disclose information if the law requires it.</p>

            <h2>How long we keep it</h2>
            <ul>
              <li><strong>Google Analytics:</strong> user-level data is kept for 14 months.</li>
              <li><strong>Event registrations:</strong> kept in Luma until we delete them.</li>
              <li><strong>Hosting logs:</strong> kept by GoDaddy under its own retention schedule.</li>
            </ul>

            <h2>Your choices and rights</h2>
            <p>
              You may ask to know what personal information we hold about you, to correct it, or to delete
              it. To unsubscribe from event emails, use the link in any Luma email. Email{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> and we will respond within 30 days.
            </p>

            <h2>Children</h2>
            <p>
              Our events and this site are for adults. We do not knowingly collect information from anyone
              under 16.
            </p>

            <h2>Changes</h2>
            <p>When we change this policy, we update the date above.</p>

            <h2>Contact</h2>
            <p>
              ManaSota Tech Network, Sarasota, Florida. Privacy requests:{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            </p>
          </article>
        </div>
        <div className={styles.shore} aria-hidden="true">
          {SHORE_WAVES.map((wave) => (
            <div key={wave.key} className={`${styles.wave} ${styles[wave.key]}`}>
              <svg viewBox={wave.viewBox} preserveAspectRatio="none">
                <path d={wave.d} fill={wave.fill} fillOpacity={wave.opacity} />
              </svg>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
