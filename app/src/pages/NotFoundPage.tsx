import { Link } from 'react-router-dom'
import { ROUTES } from '../router/routes'

export default function NotFoundPage() {
  return (
    <section className="detail-card">
      <p className="eyebrow">404</p>
      <h1>Page non trouvee</h1>
      <Link className="btn btn-primary" to={ROUTES.home}>
        Retour a l'accueil
      </Link>
    </section>
  )
}
