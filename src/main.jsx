import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

const rootEl = document.getElementById('root')

// The served HTML already contains a pre-built copy of the page (for search
// engines and AI crawlers). createRoot replaces it with the live app.
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// reveal once the live app has painted (see the inline style in index.html);
// the timeout is a safety net for background tabs where frames are paused
const reveal = () => rootEl.setAttribute('data-ready', '')
requestAnimationFrame(reveal)
setTimeout(reveal, 120)
