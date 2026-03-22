import { useEffect, useLayoutEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import SceneBackground from './components/SceneBackground'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import { ROUTES } from './router/routes'

const REVEAL_SELECTORS = [
  '.eyebrow:not(.eyebrow-animated)',
  '.hero-panel h1',
  '.hero-panel .hero-copy',
  '.hero-panel .hero-actions',
  '.section-head h1',
  '.project-card',
  '.detail-card h1',
  '.detail-card > p:not(.eyebrow)',
  '.detail-card .stack-list',
  '.detail-card .hero-actions',
  '.detail-card > .text-link',
]

function collectRevealElements(): HTMLElement[] {
  const seen = new Set<HTMLElement>()
  REVEAL_SELECTORS.forEach((sel) => {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => seen.add(el))
  })
  return Array.from(seen).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  )
}

function TextReveal() {
  const location = useLocation()

  // useLayoutEffect owns the classes: adds .rev before paint, cleans up after.
  // Must NOT be done in useEffect — its cleanup runs after useLayoutEffect effect
  // on the same render cycle, which would silently undo the hiding.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    collectRevealElements().forEach((el, i) => {
      el.classList.remove('rev-in')
      el.classList.add('rev')
      el.style.setProperty('--rev-delay', `${i * 75}ms`)
    })
    return () => {
      document.querySelectorAll<HTMLElement>('.rev').forEach((el) => {
        el.classList.remove('rev', 'rev-in')
        el.style.removeProperty('--rev-delay')
      })
    }
  }, [location.pathname])

  // useEffect only owns the IO — never touches classes.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).classList.add('rev-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
    )

    collectRevealElements().forEach((el) => io.observe(el))

    return () => { io.disconnect() }
  }, [location.pathname])

  return null
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = window.localStorage.getItem('site-theme')
    if (stored === 'light' || stored === 'dark') {
      return stored
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('site-theme', theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement

    const updateMobileStaticLock = () => {
      const isMobile = window.matchMedia('(max-width: 700px)').matches
      if (!isMobile) {
        root.classList.remove('mobile-static-lock')
        return
      }

      const shell = document.querySelector<HTMLElement>('.site-shell')
      if (!shell) {
        return
      }

      const viewportHeight = window.innerHeight
      const fitsInViewport = shell.scrollHeight <= viewportHeight + 2
      root.classList.toggle('mobile-static-lock', fitsInViewport)
    }

    updateMobileStaticLock()
    window.addEventListener('resize', updateMobileStaticLock)
    window.addEventListener('orientationchange', updateMobileStaticLock)

    return () => {
      window.removeEventListener('resize', updateMobileStaticLock)
      window.removeEventListener('orientationchange', updateMobileStaticLock)
      root.classList.remove('mobile-static-lock')
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const selector = '.hero-panel, .detail-card, .project-card'
    const directions = [
      { sx: '120%', sy: '0%', ex: '-30%', ey: '0%', angle: '112deg' },
      { sx: '-30%', sy: '0%', ex: '120%', ey: '0%', angle: '68deg' },
      { sx: '50%', sy: '-45%', ex: '50%', ey: '130%', angle: '180deg' },
      { sx: '50%', sy: '130%', ex: '50%', ey: '-45%', angle: '0deg' },
      { sx: '120%', sy: '-30%', ex: '-30%', ey: '120%', angle: '132deg' },
      { sx: '-30%', sy: '120%', ex: '120%', ey: '-30%', angle: '42deg' },
      { sx: '110%', sy: '85%', ex: '-20%', ey: '15%', angle: '22deg' },
      { sx: '-20%', sy: '15%', ex: '110%', ey: '85%', angle: '158deg' },
    ]

    const pendingTimeouts = new Set<number>()
    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        pendingTimeouts.delete(id)
        fn()
      }, delay)
      pendingTimeouts.add(id)
      return id
    }

    const triggerRandomFlare = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector))
      nodes.forEach((node, index) => {
        const direction = directions[Math.floor(Math.random() * directions.length)]
        const duration = 1400 + Math.random() * 900
        const delay = Math.random() * 2600 + index * 120

        schedule(() => {
          node.style.setProperty('--glass-start-x', direction.sx)
          node.style.setProperty('--glass-start-y', direction.sy)
          node.style.setProperty('--glass-end-x', direction.ex)
          node.style.setProperty('--glass-end-y', direction.ey)
          node.style.setProperty('--glass-angle', direction.angle)
          node.style.setProperty('--glass-duration', `${duration}ms`)

          node.classList.remove('glass-flare-active')
          void node.offsetWidth
          node.classList.add('glass-flare-active')

          schedule(() => {
            node.classList.remove('glass-flare-active')
          }, duration + 90)
        }, delay)
      })
    }

    schedule(triggerRandomFlare, 1200)
    const intervalId = window.setInterval(triggerRandomFlare, 20000)

    return () => {
      window.clearInterval(intervalId)
      pendingTimeouts.forEach((id) => window.clearTimeout(id))
      pendingTimeouts.clear()
      document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
        node.classList.remove('glass-flare-active')
      })
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="site-shell">
      <TextReveal />
      <SceneBackground isDark={theme === 'dark'} />
      <header className="site-header">
        <div className="brand-cluster brand-line-animated">
          <NavLink className="brand" to={ROUTES.home}>
            <span className="brand-main">Billat Luca</span>
          </NavLink>
          <span className="brand-meta"> Developpeur d'applications Full-Stack React Junior</span>
        </div>

        <div className="header-controls">
          <nav className="main-nav" aria-label="Navigation principale">
            <NavLink to={ROUTES.home} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            <NavLink to={ROUTES.projects} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Projects
            </NavLink>
          </nav>

          <button
            className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`}
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            <span className="theme-toggle-icon">☀</span>
            <span className="theme-toggle-icon">◐</span>
            <span className="theme-toggle-thumb" />
          </button>
        </div>
      </header>

      <div className="social-corner" aria-label="Liens sociaux">
        <a className="social-link" href="https://react.dev" target="_blank" rel="noreferrer" aria-label="React">
          <svg className="social-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="32" cy="32" r="3.6" fill="currentColor" />
            <ellipse cx="32" cy="32" rx="20" ry="7.8" fill="none" stroke="currentColor" strokeWidth="3" />
            <ellipse cx="32" cy="32" rx="20" ry="7.8" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(60 32 32)" />
            <ellipse cx="32" cy="32" rx="20" ry="7.8" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(120 32 32)" />
          </svg>
          <span className="social-name">React</span>
        </a>

        <a className="social-link" href="https://github.com/Luca-B431" target="_blank" rel="noreferrer" aria-label="GitHub">
          <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5 0-.24-.01-.89-.01-1.75-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.37-2.22-.26-4.55-1.15-4.55-5.11 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.32.1-2.76 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.36 1.9-1.34 2.74-1.06 2.74-1.06.56 1.44.21 2.5.1 2.76.64.72 1.03 1.64 1.03 2.77 0 3.97-2.33 4.84-4.56 5.1.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .28.18.6.69.5A10.25 10.25 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
          </svg>
          <span className="social-name">GitHub</span>
        </a>

        <a className="social-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M6.94 8.5v12H3.05v-12h3.89Zm.25-3.72c0 1.13-.85 2.03-2.2 2.03h-.03c-1.3 0-2.14-.9-2.14-2.03 0-1.16.87-2.03 2.2-2.03s2.14.87 2.17 2.03ZM20.95 13.62v6.88h-3.9v-6.43c0-1.62-.58-2.72-2.03-2.72-1.11 0-1.77.75-2.06 1.47-.11.26-.13.62-.13.98v6.7h-3.9s.05-10.88 0-12h3.9v1.7c.52-.8 1.45-1.95 3.54-1.95 2.58 0 4.51 1.69 4.51 5.37Z" />
          </svg>
          <span className="social-name">LinkedIn</span>
        </a>

        <a className="social-link" href="https://www.malt.fr" target="_blank" rel="noreferrer" aria-label="Malt">
          <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
            <path className="social-icon-malt-letter" d="M7.3 16V8h2.2l2.5 3.5L14.5 8h2.2v8h-2.2v-4.8L12 14.5l-2.5-3.3V16H7.3Z" />
          </svg>
          <span className="social-name">Malt</span>
        </a>
      </div>

      <main className="content-area">
        <Routes>
          <Route path={ROUTES.root} element={<Navigate to={ROUTES.home} replace />} />
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.projects} element={<ProjectsPage />} />
          <Route path={ROUTES.projectDetail} element={<ProjectDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
