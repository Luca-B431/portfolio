export interface Project {
  id: string
  slug: string
  title: string
  shortDescription: string
  longDescription: string
  stack: string[]
  /** null when the project has no live deployment yet */
  liveUrl: string | null
  repoUrl: string
}

export const projects: Project[] = [
  {
    id: 'portfolio-v1',
    slug: 'portfolio-v1',
    title: 'Portfolio v1',
    shortDescription: 'Premier projet personnel pour presenter mon profil de developpeur React junior.',
    longDescription:
      "Ce portfolio est mon premier projet. Il est construit avec React, TypeScript, React Router, Docker et un deploiement Vercel.",
    stack: ['React', 'TypeScript', 'React Router', 'Three.js', 'Docker', 'Vercel'],
    liveUrl: null,
    repoUrl: 'https://github.com/Luca-B431',
  },
]

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  if (!slug) {
    return undefined
  }

  return projects.find((project) => project.slug === slug)
}
