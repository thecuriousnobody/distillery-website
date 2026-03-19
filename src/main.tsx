import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import KioskApp from './KioskApp.tsx'
import { AuthProvider } from './contexts/AuthContext'

const isKiosk = window.location.pathname === '/kiosk'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isKiosk ? (
      <KioskApp />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
)
