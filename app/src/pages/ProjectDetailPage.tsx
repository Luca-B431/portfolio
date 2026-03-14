import { Link, useParams } from 'react-router-dom'
import { getProjectBySlug } from '../data/projects'
import { ROUTES } from '../router/routes'

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = getProjectBySlug(slug)

  if (!project) {
    return (
      <section className="detail-card">
        <p className="eyebrow">Projet introuvable</p>
        <h1>Ce projet n'existe pas encore.</h1>
        <Link className="btn btn-primary" to={ROUTES.projects}>
          Retour a la liste
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-card">
      <p className="eyebrow">Detail projet</p>
      <h1>{project.title}</h1>
      <p>{project.longDescription}</p>
      <ul className="stack-list">
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="hero-actions">
        {project.liveUrl ? (
          <a className="btn btn-primary" href={project.liveUrl} target="_blank" rel="noreferrer">
            Ouvrir l'app
          </a>
        ) : null}
        <a className="btn btn-ghost" href={project.repoUrl} target="_blank" rel="noreferrer">
          Voir le code
        </a>
      </div>
      <Link className="text-link" to={ROUTES.projects}>
        Retour aux projets
      </Link>
    </section>
  )
}
