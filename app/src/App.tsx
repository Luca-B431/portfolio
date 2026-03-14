import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import ReactAtomLogo3D from './components/ReactAtomLogo3D'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import { ROUTES } from './router/routes'

function App() {
  return (
    <div className="site-shell">
      {/* Background-only 3D atom logo, anchored visually at bottom-right. */}
      <div className="bg-atom-wrap" aria-hidden="true">
        <ReactAtomLogo3D />
      </div>
      {/* Foreground app content. */}
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
