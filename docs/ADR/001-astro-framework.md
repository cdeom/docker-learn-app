# ADR-001: Use Astro as the web framework

## Status
Accepted

## Context
We need a framework to build an interactive learning platform for a Docker course.
The platform serves Markdown content with interactive quizzes, code highlighting,
and progress tracking. It must produce a static site served via Nginx in Docker.

## Options Evaluated

| Option | Score (weighted) |
|--------|-----------------|
| Vanilla HTML/CSS/JS | 3.15/5 |
| **Astro** | **4.60/5** |
| Next.js SSG | 3.45/5 |
| Vite + Vanilla TS | 3.65/5 |
| Hugo / Eleventy | 3.75/5 |

## Decision
Use **Astro 5.x** with TypeScript.

## Rationale
1. Markdown-native via Content Collections (type-safe, validated)
2. Islands architecture: 90% static HTML (zero JS), 10% interactive
3. Shiki built-in for syntax highlighting (build-time, no runtime cost)
4. Vite-powered builds (fast HMR, optimized output)
5. Clean project structure (pedagogical value)
6. Trivial Docker integration (npm run build -> dist/ -> Nginx)
7. Total client JS estimated at ~8.5 KB (far below 50 KB budget)

## Consequences
- Requires Node.js 20+ for building
- Team needs to learn Astro concepts (Content Collections, islands)
- Multi-stage Docker build needed (builder + production)
- Content authors edit Markdown files only (low barrier)
