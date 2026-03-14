import { Link } from 'react-router-dom'
import { projects } from '../data/projects'
import { projectDetailPath } from '../router/routes'

export default function ProjectsPage() {
  return (
    <section>
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
              <Link className="text-link" to={projectDetailPath(project.slug)}>
                Voir le detail
              </Link>
              {project.liveUrl ? (
                <a className="text-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                  App live
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
