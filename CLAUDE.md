# CLAUDE.md - Docker Learn App

> Project-specific instructions for the Docker Learn interactive platform.

---

## Project Overview
Interactive web learning platform for a Docker course targeting 15-year-old students.
Built with Astro, served via Docker/Nginx.

## Tech Stack
- **Framework**: Astro 5.x with TypeScript
- **Styling**: CSS custom properties (no CSS framework)
- **Syntax highlighting**: Shiki (built into Astro)
- **Build**: Vite (via Astro)
- **Server**: Nginx Alpine in Docker

## Key Architecture Rules

### Islands Architecture
- Static components: `.astro` files, zero client JS
- Interactive islands: use `client:visible` or `client:load` directives
- Total client JS budget: < 50 KB gzipped

### Content
- Course content lives in `src/content/modules/*.md`
- All content is in **French** (educational content for French students)
- Code comments and variable names are in **English** (per global CLAUDE.md)
- Quiz questions are defined in `src/data/quiz-questions.ts`

### Styling
- Primary color: `#052FAD` (blue)
- Dark theme is the default
- Use CSS custom properties for theming (no CSS-in-JS)
- Mobile-first responsive design

### State
- All state is client-side via `localStorage`
- Keys prefixed with `docker-learn-`
- No backend, no database, no API

## Commands
```bash
npm run dev          # Development server (localhost:4321)
npm run build        # Build static site to dist/
npm run preview      # Preview built site locally

# Docker
docker compose up -d --build    # Build and run
docker compose down             # Stop
```

## File Size Limits
- Components: < 200 lines
- Utility files: < 100 lines
- CSS files: < 300 lines
- Markdown modules: no limit (content)

## Testing
- Visual testing in browser (mobile + desktop)
- Lighthouse audit target: > 90 all categories
- Test quiz logic with sample data

## Documentation
- PRD: `docs/PRD.md`
- Architecture: `docs/ARCHITECTURE.md`
- Epics/Stories: `docs/EPICS.md`
- ADRs: `docs/ADR/`
