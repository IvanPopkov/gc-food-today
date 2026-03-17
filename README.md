# Food Today

A simple food ranking app. Pick from a set of foods and drag (or tap on mobile) them into a 1–10 priority list.

## Tech stack

- React 19 + TypeScript 5.9
- Vite 8
- Bun
- Vitest + React Testing Library

## Getting started

```bash
bun install
bun run dev
```

## Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `bun run dev`      | Start dev server                    |
| `bun run build`    | Type-check and build for production |
| `bun run preview`  | Preview production build locally    |
| `bun run test`     | Run tests in watch mode             |
| `bun run test:run` | Run tests once                      |
| `bun run lint`     | Lint with ESLint                    |

## Deployment

Deployed to GitHub Pages via GitHub Actions. Every push to `main` triggers a build and deploy.

To set up: repo **Settings > Pages > Source > GitHub Actions**.
