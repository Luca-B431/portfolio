import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../router/routes'
import { projects } from '../data/projects'
import { projectDetailPath } from '../router/routes'

function useIsDark() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

const alphoto = projects.find((p) => p.id === 'alphoto')!

export default function HomePage() {
  const isDark = useIsDark()
  return (
    <>
      <section className="hero-panel">
        <p className="eyebrow eyebrow-animated" aria-label="Portfolio React Junior">
          <span className="eyebrow-word delay-0">Portfolio</span>
          <span className="eyebrow-word delay-1">React</span>
          <span className="eyebrow-word delay-2">Junior</span>
        </p>
        <h1>Developpeur d'applications full-stack junior, je cree des interfaces React propres et des API fiables.</h1>
        <p className="hero-copy">
          Sur ce portfolio, je presente des projets concrets realises avec React, TypeScript et Node,
          avec une attention particuliere a la qualite du code, au deploiement et a l'experience utilisateur.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to={ROUTES.projects}>
            Voir mes projets
          </Link>
          <a className="btn btn-ghost" href="https://github.com/Luca-B431" target="_blank" rel="noreferrer">
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5 0-.24-.01-.89-.01-1.75-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.37-2.22-.26-4.55-1.15-4.55-5.11 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.32.1-2.76 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.36 1.9-1.34 2.74-1.06 2.74-1.06.56 1.44.21 2.5.1 2.76.64.72 1.03 1.64 1.03 2.77 0 3.97-2.33 4.84-4.56 5.1.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .28.18.6.69.5A10.25 10.25 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
            </svg>
            Mon GitHub
          </a>
        </div>
      </section>

      <section className="featured-project">
        <div className="featured-project-body">
          <div className="featured-project-text">
            <p className="eyebrow">Projet en avant</p>
            <h2>{alphoto.title}</h2>
            <p>{alphoto.shortDescription}</p>
            <ul className="stack-list">
              {alphoto.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <Link className="btn btn-primary" to={projectDetailPath(alphoto.slug)}>
                Voir le détail
                <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </Link>
            </div>
          </div>

          <figure className="featured-project-preview">
            <Link
              to={alphoto.liveUrl ?? projectDetailPath(alphoto.slug)}
              {...(alphoto.liveUrl ? { target: '_blank', rel: 'noreferrer' } : {})}
              style={{ position: 'absolute', inset: 0 }}
            >
              <img
                src={isDark ? '/alphoto-preview-dark.png' : '/alphoto-preview-light.png'}
                alt="Aperçu de l'application ALphoto"
                className="featured-project-img"
                loading="lazy"
              />
            </Link>
          </figure>
        </div>
      </section>
    </>
  )
}
