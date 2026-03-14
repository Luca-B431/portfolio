# Portfolio App

Portfolio frontend en React/Vite avec routing, TypeScript, Docker et deploy Vercel.

## Stack

- React 19
- Vite 8
- React Router
- TypeScript
- Three.js (fond anime)

## Prerequis

- Node.js 20+
- npm 10+
- Docker Desktop (optionnel)

## Installation

```bash
npm install
```

## Lancer en local

```bash
npm run dev
```

URL locale: http://localhost:5173

## Scripts utiles

```bash
npm run typecheck   # verification TypeScript
npm run lint        # lint ESLint
npm run build       # build production
npm run preview     # preview du build
```

## Docker

```bash
npm run docker:dev    # lance le serveur Vite dans Docker
npm run docker:build  # lance le build dans Docker
```

## Routing

- `/` -> redirect vers `/homepage`
- `/homepage`
- `/projects`
- `/project/:slug`

Routes centralisees dans `src/router/routes.ts`.

## Donnees a personnaliser

- Projets, URLs live et repos: `src/data/projects.ts`
- Lien GitHub du hero: `src/pages/HomePage.tsx`
- Nom/branding header: `src/App.tsx`
- Titre onglet navigateur: `index.html`

## Deploiement Vercel

1. Push sur GitHub
2. Import du repo dans Vercel
3. Build command: `npm run build`
4. Output directory: `dist`

Le fichier `vercel.json` contient la rewrite SPA pour React Router.
