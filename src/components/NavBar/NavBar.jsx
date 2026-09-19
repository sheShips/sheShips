import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/motion'
import { prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import logo from '../../assets/logo.png'
import styles from './NavBar.module.css'

/** The sections the explorer lists, in page order. */
const FILES = [
  { id: 'about',  name: 'readme', ext: '.md',   label: 'About' },
  { id: 'events', name: 'events', ext: '.json', label: 'Events' },
  { id: 'join',   name: 'join',   ext: '.md',   label: 'Join' },
]

function FileIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

export default function NavBar() {
  const scope = useRef(null)
  // open at rest so the sections are visible without interaction
  const [isOpen, setIsOpen] = useState(true)
  const [activeId, setActiveId] = useState(null)
  // once the visitor decides for themselves, stop auto-collapsing on them
  const pinnedRef = useRef(false)

  useGsap(scope, () => {
    if (prefersReducedMotion()) return
    gsap.from(`.${styles.navInner} > *`, {
      y: -26,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
    })
  })

  /* collapse once you scroll into the page; start collapsed on phones */
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 640px)')
    if (narrow.matches) setIsOpen(false)

    const hero = document.querySelector('[data-hero]')
    const onScroll = () => {
      if (pinnedRef.current || narrow.matches) return
      const threshold = hero ? hero.offsetHeight * 0.55 : 400
      setIsOpen(window.scrollY < threshold)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* mark the file you're currently "in", the way an editor does */
  useEffect(() => {
    const sections = FILES.map((f) => document.getElementById(f.id)).filter(Boolean)
    if (!sections.length || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    pinnedRef.current = true
    setIsOpen((open) => !open)
  }

  return (
    <header className={styles.nav} ref={scope}>
      <nav className={styles.navInner} aria-label="Primary">
        <div className={`${styles.explorer} ${isOpen ? styles.isOpen : ''}`}>
          <button
            type="button"
            className={styles.explorerRoot}
            onClick={toggle}
            aria-expanded={isOpen}
            aria-controls="explorer-tree"
          >
            <img className={styles.navLogo} src={logo} alt="" />
            <span className={styles.repo}>
              she-ships<i>/</i>
            </span>
            <svg
              className={styles.caret}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          <div className={styles.explorerBody}>
            <ul className={styles.tree} id="explorer-tree">
              {FILES.map((file) => (
                <li key={file.id}>
                  <a
                    href={`#${file.id}`}
                    aria-label={file.label}
                    aria-current={activeId === file.id ? 'true' : undefined}
                    className={activeId === file.id ? styles.active : undefined}
                  >
                    <FileIcon className={styles.ficon} />
                    <span className={styles.fname}>
                      {file.name}
                      <span className={styles.ext}>{file.ext}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a className="btn" href="#join">
          Get involved
        </a>
      </nav>
    </header>
  )
}
