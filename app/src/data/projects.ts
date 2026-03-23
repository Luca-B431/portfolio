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
    shortDescription: "Site vitrine pour une photographe professionnelle — hero 3D, galerie lightbox et animations fluides.",
    longDescription:
      "Site vitrine réalisé pour Angéla Linck, photographe professionnelle. SPA React 19 avec TypeScript, bundlé par Vite et déployé sur Vercel. L'interface propose un hero immersif en 3D rendu avec React Three Fiber et Three.js, une galerie plein écran avec lightbox (yet-another-react-lightbox), des transitions fluides via Framer Motion, un smooth scroll Lenis, et une navigation multi-pages avec React Router. Pas de backend ni de Docker — déploiement statique direct sur Vercel avec des headers de sécurité personnalisés.",
    stack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Framer Motion', 'Tailwind CSS', 'Lenis'],
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
