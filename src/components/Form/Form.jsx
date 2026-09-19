import { useRef, useState } from 'react'
import { revealOnScroll } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import styles from './Form.module.css'

/* The counties She Ships actually spans. */
const COUNTIES = ['Sarasota', 'Manatee', 'Charlotte', 'Lee', 'Collier', 'DeSoto', 'Hendry', 'Elsewhere']

const LEVELS = [
  'Just starting out',
  'Bootcamp or self-taught, job hunting',
  '1–3 years in',
  '4–9 years in',
  '10+ years in',
  'Career changer',
  'Student',
]

const MEETUP_URL = 'https://www.meetup.com/'

const EMPTY = {
  name: '',
  email: '',
  county: '',
  level: '',
  looking: '',
  openToWork: false,
}

export default function Form() {
  const scope = useRef(null)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  useGsap(scope, () => {
    revealOnScroll('[data-reveal-head] > *', { trigger: `.${styles.join}`, start: 'top 72%' })
    revealOnScroll(`.${styles.card}`, { trigger: `.${styles.card}`, start: 'top 82%', y: 44 })
  }, [])

  const setField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [key]: value }))
    // clear the error as soon as they start fixing it
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'We need something to call you.'
    if (!values.email.trim()) next.email = 'We need an email to send details to.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = 'That address looks incomplete.'
    if (!values.county) next.county = 'Pick the one closest to you.'
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      // put the cursor on the first thing that needs fixing
      const firstKey = Object.keys(found)[0]
      scope.current?.querySelector(`[name="${firstKey}"]`)?.focus()
      return
    }

    setStatus('submitting')
    try {
      await submitSignup(values)
      setStatus('success')
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setStatus('idle')
  }

  return (
    <section className={`section ${styles.join}`} id="join" ref={scope}>
      <div className="wrap">
        <div className={styles.layout}>
          <div className="section-head" data-reveal-head>
            <p className="eyebrow">Come aboard</p>
            <h2 className="lead">Tell us you&rsquo;re in.</h2>
            <p>
              We&rsquo;ll email you when the first meetup has a date and a place. That&rsquo;s it
              &mdash; no newsletter, no drip campaign, nothing you have to unsubscribe from twice.
            </p>
          </div>

          <div className={styles.card}>
            {status === 'success' ? (
              <div className={styles.success}>
                <span className={styles.tick} aria-hidden="true">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                </span>

                <h3 className="lead">You&rsquo;re on the crew list</h3>
                <p className={styles.successCopy}>
                  We&rsquo;ll be in touch as soon as the first date is set. Probably sooner than you
                  expect.
                </p>

                <div className={styles.handoff}>
                  <span className={styles.handoffLabel}>One more thing</span>
                  <p className={styles.successCopy}>
                    We&rsquo;ll post events there too, so you don&rsquo;t miss one if email
                    isn&rsquo;t your thing.
                  </p>
                  <a
                    className="btn"
                    href={MEETUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MeetupIcon />
                    Join us on Meetup
                  </a>
                  <button type="button" className={styles.reset} onClick={reset}>
                    Sign someone else up
                  </button>
                </div>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row}>
                  <Field
                    id="signup-name"
                    name="name"
                    label="Name"
                    error={errors.name}
                    value={values.name}
                    onChange={setField('name')}
                    autoComplete="name"
                    placeholder="Madison Callahan"
                  />
                  <Field
                    id="signup-email"
                    name="email"
                    type="email"
                    label="Email"
                    error={errors.email}
                    value={values.email}
                    onChange={setField('email')}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="signup-county">
                      County
                    </label>
                    <select
                      id="signup-county"
                      name="county"
                      className={`${styles.select} ${errors.county ? styles.invalid : ''}`}
                      value={values.county}
                      onChange={setField('county')}
                      aria-invalid={Boolean(errors.county)}
                      aria-describedby={errors.county ? 'signup-county-error' : undefined}
                    >
                      <option value="">Choose one</option>
                      {COUNTIES.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                    {errors.county ? (
                      <span className={styles.error} id="signup-county-error">
                        {errors.county}
                      </span>
                    ) : null}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="signup-level">
                      Where you&rsquo;re at <span className={styles.optional}>(optional)</span>
                    </label>
                    <select
                      id="signup-level"
                      name="level"
                      className={styles.select}
                      value={values.level}
                      onChange={setField('level')}
                    >
                      <option value="">Rather not say</option>
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="signup-looking">
                    What you&rsquo;re hoping to get out of it{' '}
                    <span className={styles.optional}>(optional)</span>
                  </label>
                  <textarea
                    id="signup-looking"
                    name="looking"
                    className={styles.textarea}
                    value={values.looking}
                    onChange={setField('looking')}
                    rows={3}
                    placeholder="Pair programming, a study group, someone to review my portfolio…"
                  />
                </div>

                <label
                  className={`${styles.check} ${values.openToWork ? styles.checkOn : ''}`}
                  htmlFor="signup-open"
                >
                  <input
                    id="signup-open"
                    name="openToWork"
                    type="checkbox"
                    checked={values.openToWork}
                    onChange={setField('openToWork')}
                  />
                  <span className={styles.box} aria-hidden="true">
                    {values.openToWork ? (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m20 6-11 11-5-5" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={styles.checkCopy}>
                    <span className={styles.checkTitle}>I&rsquo;m open for work</span>
                    <span className={styles.checkHint}>
                      We&rsquo;ll flag you when someone in the group is hiring. Nothing goes public.
                    </span>
                  </span>
                </label>

                <button className="btn" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      Sending
                    </>
                  ) : (
                    'Count me in'
                  )}
                </button>

                {status === 'error' ? (
                  <p className={styles.error} role="alert">
                    That didn&rsquo;t send. Try again, or email us directly.
                  </p>
                ) : null}

                <p className={styles.formNote}>
                  We&rsquo;ll only email you about She Ships. Unsubscribe any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- small pieces ---------------------------------------- */

function Field({ id, name, label, error, ...rest }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className={`${styles.input} ${error ? styles.invalid : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error ? (
        <span className={styles.error} id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

function MeetupIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="12" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ================================================================
   SUBMIT — not wired yet, by request.

   The payload below is already shaped for HubSpot's Forms API
   (fields as an array of {name, value}), so connecting it should be
   a matter of filling in the portal and form IDs and deleting the
   fake delay:

     const endpoint =
       `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`
     await fetch(endpoint, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload),
     })

   NOTE ON THE PORTAL ID: Securipolis and Whelk Works have separate
   HubSpot portals, and their IDs differ by only a few digits — check
   the full number before wiring this up. She Ships has no portal of
   its own, so whichever one this lands in is a decision someone has
   to make on purpose, not a default.
   ================================================================ */
async function submitSignup(values) {
  const payload = {
    fields: [
      { name: 'firstname', value: values.name },
      { name: 'email', value: values.email },
      { name: 'county', value: values.county },
      { name: 'experience_level', value: values.level },
      { name: 'what_theyre_looking_for', value: values.looking },
      { name: 'open_to_work', value: String(values.openToWork) },
    ],
    context: {
      pageUri: typeof window !== 'undefined' ? window.location.href : '',
      pageName: 'She Ships — join',
    },
  }

  // Stand-in so the loading and success states are testable. Replace
  // this whole block with the fetch above.
  console.info('[She Ships] signup payload ready to send:', payload)
  await new Promise((resolve) => setTimeout(resolve, 900))
  return payload
}
