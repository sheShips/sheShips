import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../../lib/motion'
import { prefersReducedMotion } from '../../lib/motion'
import { useGsap } from '../../hooks/useGsap'
import logo from '../../assets/logo.png'
import styles from './NavBar.module.css'

const FILES = [
  { id: 'about',  name: 'readme', ext: '.md',   label: 'About' },
  { id: 'events', name: 'events', ext: '.json', label: 'Events' },
  { id: 'connect', name: 'connect', ext: '.md', label: 'Connect' },
  { id: 'faq',    name: 'faq',    ext: '.md',   label: 'FAQ', page: '/faq' },
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
  const explorerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const pinnedRef = useRef(false)
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const hrefFor = (file) => file.page || (onHome ? `#${file.id}` : `/#${file.id}`)
  const timerRef = useRef(null)

  useGsap(scope, () => {
    if (prefersReducedMotion()) return
    gsap.from(`.${styles.navInner} > *`, {
      y: -26,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    })
  })

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const close = () => {
    clearTimer()
    pinnedRef.current = false
    setIsOpen(false)
  }

  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const onPointerEnter = (e) => {
    if (e.pointerType !== 'mouse' || !canHover()) return
    clearTimer()
    timerRef.current = window.setTimeout(() => setIsOpen(true), 70)
  }

  const onPointerLeave = (e) => {
    if (e.pointerType !== 'mouse' || pinnedRef.current) return
    clearTimer()
    timerRef.current = window.setTimeout(() => setIsOpen(false), 260)
  }

  const toggle = () => {
    clearTimer()
    if (isOpen && !pinnedRef.current) {
      pinnedRef.current = true
      return
    }
    pinnedRef.current = !isOpen
    setIsOpen(!isOpen)
  }

  const onFocus = (e) => {
    if (e.target.matches(':focus-visible')) setIsOpen(true)
  }
  const onBlur = (e) => {
    if (!explorerRef.current?.contains(e.relatedTarget)) close()
  }

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        explorerRef.current?.querySelector('button')?.focus()
        close()
      }
    }
    const onDown = (e) => {
      if (!explorerRef.current?.contains(e.target)) close()
    }
    const startY = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 120) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isOpen])

  useEffect(() => clearTimer, [])

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

  return (
    <header className={styles.nav} ref={scope}>
      <nav className={styles.navInner} aria-label="Primary">
        <div
          ref={explorerRef}
          className={`${styles.explorer} ${isOpen ? styles.isOpen : ''}`}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
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
                    href={hrefFor(file)}
                    aria-label={file.label}
                    aria-current={(file.page ? pathname === file.page : activeId === file.id) ? 'true' : undefined}
                    className={(file.page ? pathname === file.page : activeId === file.id) ? styles.active : undefined}
                    onClick={close}
                    tabIndex={isOpen ? undefined : -1}
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

        <a className={`btn ${styles.cta}`} href={onHome ? '#events' : '/#events'}>
          Get involved
        </a>
      </nav>
    </header>
  )
}
