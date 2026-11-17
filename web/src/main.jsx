import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/global.css'
import App from './App.jsx'
import { SessionProvider } from './lib/session.jsx'

// The shareable single-file preview has no server behind it, so it keeps the route in memory.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <SessionProvider>
        <App />
      </SessionProvider>
    </Router>
  </StrictMode>,
)
