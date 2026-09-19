import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from './lib/motion'

import NavBar from './components/NavBar/NavBar'
import LandingPage from './components/LandingPage/LandingPage'
import AboutSec from './components/AboutSec/AboutSec'
import QuoteSec from './components/QuoteSec/QuoteSec'
import EventSec from './components/EventSec/EventSec'
import Form from './components/Form/Form'
import Footer from './components/Footer/Footer'
import NotFound from './components/NotFound/NotFound'

function Home() {
  const { hash } = useLocation()

  /* Images settle after mount and change every section's height, so the
     ScrollTrigger start/end positions have to be recalculated once. */
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 250)
    window.addEventListener('load', ScrollTrigger.refresh)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('load', ScrollTrigger.refresh)
    }
  }, [])

  /* arriving at /#events from the 404 page should land on that section */
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
        <AboutSec />
        <QuoteSec />
        <EventSec />
        <Form />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
