export interface Project {
  id: string
  slug: string
  title: string
  shortDescription: string
  longDescription: string
  stack: string[]
  /** null when the project has no live deployment yet */
  liveUrl: string | null
  /** null for private repositories */
  repoUrl: string | null
}

export const projects: Project[] = [
  {
    id: 'alphoto',
    slug: 'alphoto',
    title: 'ALphoto',
    shortDescription: "Site vitrine pour Angéla Linck, photographe à Bordeaux — hero 3D R3F, galerie lightbox filtrée, dark mode et animations GSAP + Framer Motion.",
    longDescription:
      "Site vitrine réalisé pour Angéla Linck, photographe portrait & animaux basée à Bordeaux. SPA React 19 + TypeScript, bundlée par Vite et déployée sur Vercel. La page d'accueil intègre un hero 3D (React Three Fiber) avec nuage de particules animées et orbs flottants, un titre révélé ligne par ligne via GSAP ScrollTrigger, des compteurs animés et une grille de photos asymétrique en stagger. La galerie propose un filtrage par catégorie (portrait, chien, chat) avec AnimatePresence, et une lightbox plein écran (yet-another-react-lightbox) avec plugins Zoom et Captions. L'app gère le dark mode via localStorage + prefers-color-scheme, un écran de chargement avec transition de logo Framer Motion (layoutId), le smooth scroll Lenis, la navigation multi-pages React Router et un overlay grain CSS. Déploiement statique sans backend, avec headers de sécurité configurés dans vercel.json.",
    stack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'GSAP', 'Framer Motion', 'Lenis', 'Tailwind CSS v4'],
    liveUrl: 'https://a-lphoto.vercel.app/',
  },
  {
    id: 'wealthealth',
    slug: 'wealthealth',
    title: 'WealthHealth',
    shortDescription: 'Application RH de gestion des employés avec tableau interactif et module npm custom publié en monorepo.',
    longDescription:
      "Application de gestion des ressources humaines pour une entreprise fictive. Les données employés s'affichent dans un tableau trié/filtré construit avec TanStack Table, extrait en package npm réutilisable via un monorepo pnpm. Déployé sur Vercel.",
    stack: ['React', 'TypeScript', 'React Router v7', 'TanStack Table', 'Tailwind CSS', 'pnpm monorepo'],
    liveUrl: 'https://wealthealth.vercel.app/',
    repoUrl: 'https://github.com/Luca-B431/wealthealth',
  },
  {
    id: 'sportsee',
    slug: 'sportsee',
    title: 'SportSee',
    shortDescription: 'Dashboard de suivi sportif avec graphiques de performance, connecté à une API REST.',
    longDescription:
      "Tableau de bord de suivi d'activité physique. Les données de sessions, calories et performances sont visualisées via Recharts (bar chart, line chart, radar). Le frontend consomme une API Node.js locale et gère les erreurs réseau. Déployé sur Vercel.",
    stack: ['React', 'TypeScript', 'React Router v7', 'Recharts', 'Tailwind CSS', 'Docker'],
    liveUrl: 'https://sport-see-front-seven.vercel.app/',
    repoUrl: 'https://github.com/Luca-B431/SportSee',
  },
  {
    id: 'argentbank',
    slug: 'argentbank',
    title: 'ArgentBank',
    shortDescription: 'Application bancaire full-stack avec authentification JWT, gestion de profil et doc API Swagger.',
    longDescription:
      "Application bancaire full-stack. L'authentification est gérée avec JWT via Redux, les routes privées sont protégées côté frontend. Le backend Node/Express expose une API documentée avec Swagger et persiste les données dans MongoDB. Conteneurisé avec Docker.",
    stack: ['React', 'TypeScript', 'React Router v7', 'Redux', 'Node.js', 'MongoDB', 'Swagger', 'Docker'],
    liveUrl: null,
    repoUrl: 'https://github.com/Luca-B431/argentbank',
  },
  {
    id: 'portfolio-v1',
    slug: 'portfolio-v1',
    title: 'Portfolio',
    shortDescription: 'Ce portfolio — construit avec React, Three.js et un shader GLSL pour le fond animé.',
    longDescription:
      "Mon portfolio personnel. Construit avec React, TypeScript, React Router et Three.js pour le fond shader animé en GLSL. Conteneurisé avec Docker et déployé sur Vercel.",
    stack: ['React', 'TypeScript', 'React Router', 'Three.js', 'GLSL', 'Docker', 'Vercel'],
    liveUrl: null,
    repoUrl: 'https://github.com/Luca-B431/portfolio',
  },
]

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  if (!slug) {
    return undefined
  }

  return projects.find((project) => project.slug === slug)
}
