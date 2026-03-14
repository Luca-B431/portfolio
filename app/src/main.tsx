import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ATOM_PALETTE } from './theme/atomPalette'

const toRgba = (hexColor: string, alpha: number) => {
  const hex = hexColor.replace('#', '')
  const value = parseInt(hex, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const applyRandomAccentFromAtomPalette = () => {
  const root = document.documentElement
  const pick = ATOM_PALETTE[Math.floor(Math.random() * ATOM_PALETTE.length)]
  const accentColor = pick.color.toLowerCase() === '#ffd84a' ? '#c6a51e' : pick.color

  root.style.setProperty('--accent', accentColor)
  root.style.setProperty('--accent-soft', toRgba(accentColor, 0.2))
  root.style.setProperty('--accent-shadow', toRgba(accentColor, 0.34))
}

applyRandomAccentFromAtomPalette()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
