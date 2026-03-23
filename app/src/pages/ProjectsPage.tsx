import { Link } from 'react-router-dom'
import { projects } from '../data/projects'
import { projectDetailPath } from '../router/routes'

export default function ProjectsPage() {
  return (
    <section className="projects-section">
      <div className="section-head">
        <p className="eyebrow">Projets</p>
        <h1>Mes applications React</h1>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <h2>{project.title}</h2>
            <p>{project.shortDescription}</p>
            <ul className="stack-list">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="card-actions">
              <Link className="btn btn-primary" to={projectDetailPath(project.slug)}>
                Voir le détail
                <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </Link>
              {project.liveUrl ? (
                <a className="btn btn-ghost" href={project.liveUrl} target="_blank" rel="noreferrer">
                  <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.586l-9.293 9.293 1.414 1.414L19 6.414V10h2V3h-7z"/>
                  </svg>
                  App live
                </a>
              ) : null}
              {project.repoUrl ? (
                <a className="btn btn-ghost" href={project.repoUrl} target="_blank" rel="noreferrer">
                  <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5 0-.24-.01-.89-.01-1.75-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.37-2.22-.26-4.55-1.15-4.55-5.11 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.32.1-2.76 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.36 1.9-1.34 2.74-1.06 2.74-1.06.56 1.44.21 2.5.1 2.76.64.72 1.03 1.64 1.03 2.77 0 3.97-2.33 4.84-4.56 5.1.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .28.18.6.69.5A10.25 10.25 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z"/>
                  </svg>
                  Code source
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
