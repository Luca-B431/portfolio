import { Link } from 'react-router-dom'
import { ROUTES } from '../router/routes'

export default function HomePage() {
  return (
    <section className="hero-panel">
      <p className="eyebrow">Portfolio React Junior</p>
      <h1>Je construis des applications React claires, utiles et bien structurees.</h1>
      <p className="hero-copy">
        Ce portfolio me sert de terrain d'entrainement pour React, le routing, Docker
        et le deploiement continu avec Vercel.
      </p>
      <div className="hero-actions">
        <Link className="btn btn-primary" to={ROUTES.projects}>
          Voir mes projets
        </Link>
        <a className="btn btn-ghost" href="https://github.com/Luca-B431" target="_blank" rel="noreferrer">
          Mon GitHub
        </a>
      </div>
    </section>
  )
}
