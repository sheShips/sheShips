import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from './lib/motion'

import NavBar from './components/NavBar/NavBar'
import LandingPage from './components/LandingPage/LandingPage'
import AboutSec from './components/AboutSec/AboutSec'
import QuoteSec from './components/QuoteSec/QuoteSec'
import EventSec from './components/EventSec/EventSec'
import Footer from './components/Footer/Footer'
import NotFound from './components/NotFound/NotFound'
import FaqPage from './components/FaqPage/FaqPage'
import PrivacyPage from './components/PrivacyPage/PrivacyPage'

function Home() {
  const { hash } = useLocation()

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 250)
    window.addEventListener('load', ScrollTrigger.refresh)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('load', ScrollTrigger.refresh)
    }
  }, [])

  useEffect(() => {
    if (!hash) return
    const target = document.querySelector(hash)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <>
      <NavBar />
      <main>
        <LandingPage />
        <QuoteSec />
        <AboutSec />
        <EventSec />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
