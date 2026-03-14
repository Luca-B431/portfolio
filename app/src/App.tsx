import { lazy, Suspense } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import { ROUTES } from './router/routes'

const WaveBackground = lazy(() => import('./components/WaveBackground'))

function App() {
  return (
    <div className="site-shell">
      <Suspense fallback={null}>
        <WaveBackground />
      </Suspense>
      <header className="site-header">
        <NavLink className="brand" to={ROUTES.home}>
          Billat Luca
        </NavLink>
        <nav className="main-nav" aria-label="Navigation principale">
          <NavLink
            to={ROUTES.home}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>
          <NavLink
            to={ROUTES.projects}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Projects
          </NavLink>
        </nav>
      </header>

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
