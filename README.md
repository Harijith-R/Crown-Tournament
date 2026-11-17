# Crown Tournament 2026

Official static web application for **Crown Tournament 2026**, a Men's Doubles Badminton Championship hosted at **Muthooth Badminton Academy, Kerala, India** (28 November – 13 December 2026).

## Architecture & Highlights

- **Persistent 3D Experience**: Root-mounted React Three Fiber `<Canvas>` featuring a procedural PBR Golden Crown and 16-feather Shuttlecock choreographed with GSAP ScrollTrigger across sections and preserved across routes.
- **Static & Zero-Backend**: Built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and `HashRouter` for reliable static hosting on GitHub Pages and custom domains.
- **Tournament Data Engine**: Decoupled data modules (`tournament.ts`, `categories.ts`, `players.ts`, `pairs.ts`, `groups.ts`, `fixtures.ts`, `results.ts`) with automated standings, 3-tier tie-breaker resolution (Head-to-Head, Point Difference, Total Points Scored), top-2 qualifier detection, and knockout bracket seeding.
- **Pre-Release & Demo Preview**: Displays `"OFFICIAL FIXTURES WILL BE PUBLISHED SOON."` until official draws go live, with a clearly marked **Demo Preview** switch for testing standings and brackets.

## Installation & Local Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Typecheck
npm run lint
```

## Production Build

```bash
# Build static HTML, CSS, JS, and assets into ./dist
npm run build

# Preview production build locally
npm run preview
```

## GitHub Pages Deployment

1. Push the repository to GitHub on the `main` branch.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (do **not** use "Deploy from a branch" on `main`, as that serves raw uncompiled `.tsx` source files and causes a blank page).
3. Verify the **Deploy Crown Tournament 2026 to GitHub Pages** workflow runs and succeeds in the **Actions** tab, automatically building and publishing `./dist`.
4. Because `vite.config.ts` uses `base: './'` and routing uses `HashRouter` (`/#/` and `/#/fixtures-results`), the application supports:
   - GitHub project URLs (`https://<username>.github.io/<repo>/`)
   - Direct page refreshes on any route
   - Custom domains (configured via `public/CNAME`, currently `crown.harijith.com`)

## Updating Official Tournament Data

To publish official draws, schedules, and match scores:
1. Update `src/data/players.ts`, `src/data/pairs.ts`, `src/data/groups.ts`, `src/data/fixtures.ts`, and `src/data/results.ts`.
2. Switch `OFFICIAL_FIXTURES_PUBLISHED` in `src/data/tournament.ts` to `true`.
3. Commit and push to `main` to trigger automatic deployment.
