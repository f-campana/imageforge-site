# ImageForge CLI Landing Site

Marketing landing page for **ImageForge CLI** built with Next.js App Router, TypeScript, Tailwind CSS, and pnpm.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- pnpm
- Vercel-ready defaults
- Node >= 22

## Product messaging scope

This site intentionally describes ImageForge as:

- Build-time image optimization (not runtime generation)
- WebP/AVIF conversion
- `blurDataURL` placeholder generation
- Hash-based caching
- Concurrency control
- `--check` CI guard mode
- `--json` machine-readable run report to stdout
- `imageforge.json` manifest output by default

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev         # run dev server
pnpm lint        # eslint
pnpm typecheck   # typescript checks
pnpm build       # production build
pnpm start       # run production server
pnpm format      # prettier check
pnpm format:write
```

## Environment variables

`NEXT_PUBLIC_IMAGEFORGE_VERSION` is used for public version display in the UI.

Example:

```bash
NEXT_PUBLIC_IMAGEFORGE_VERSION=0.1.3
```

If unset, the site falls back to `local-dev`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, create a new project and import the repository.
3. Keep framework preset as **Next.js**.
4. Set environment variable `NEXT_PUBLIC_IMAGEFORGE_VERSION` (optional but recommended).
5. Deploy.

Vercel build command and output settings can remain default for Next.js.
