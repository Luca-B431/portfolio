import { generatePath } from 'react-router-dom'

export const ROUTES = {
  root: '/',
  home: '/homepage',
  projects: '/projects',
  projectDetail: '/project/:slug',
} as const

export function projectDetailPath(slug: string): string {
  return generatePath(ROUTES.projectDetail, { slug })
}
