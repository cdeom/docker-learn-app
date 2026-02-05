# Architecture - Docker Learn Platform

---

## 1. Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Framework** | Astro 5.x | Content-first, islands architecture, Markdown native |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | CSS custom properties | No framework dependency, theme-able |
| **Syntax highlighting** | Shiki (built-in) | VS Code quality, build-time, zero runtime |
| **Markdown** | Astro Content Collections | Type-safe, validated, frontmatter support |
| **Build** | Vite (via Astro) | Fast builds, HMR |
| **Server** | Nginx Alpine | Lightweight, production-grade |
| **Container** | Docker multi-stage | Build in Node, serve in Nginx |

---

## 2. Architecture Overview

```
                    Build Time                          Runtime
              ┌────────────────────┐           ┌──────────────────┐
              │                    │           │                  │
  Markdown    │   Astro + Shiki   │   dist/   │   Nginx Alpine   │
  files   ──> │   (Node.js)       │ ──────>   │   (Static files) │
              │                    │           │                  │
              └────────────────────┘           └──────────────────┘
                                                       │
              Islands Architecture:              localhost:8080
              - 90% static HTML (zero JS)              │
              - 10% interactive (quiz, progress)  ┌────┴─────┐
                                                  │ Browser  │
                                                  │ (student)│
                                                  └──────────┘
```

---

## 3. Project Structure

```
docker-learn-app/
├── docs/
│   ├── PRD.md                    # Product requirements
│   ├── ARCHITECTURE.md           # This file
│   └── ADR/                      # Architecture Decision Records
│       └── 001-astro-framework.md
├── public/
│   ├── favicon.svg
│   ├── manifest.json             # PWA manifest
│   └── images/
│       ├── icons/                # PWA icons
│       └── badges/               # Achievement badge SVGs
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro          # Top bar: logo, breadcrumb, progress
│   │   │   ├── Sidebar.astro         # Module navigation
│   │   │   ├── Footer.astro          # Links, credits
│   │   │   └── MobileNav.astro       # Bottom tab bar (mobile)
│   │   ├── content/
│   │   │   ├── CodeBlock.astro       # Code + copy button wrapper
│   │   │   ├── ModuleCard.astro      # Module card on homepage
│   │   │   ├── TableOfContents.astro # Auto-generated TOC
│   │   │   └── CheatSheet.astro      # Formatted cheat sheet display
│   │   ├── quiz/
│   │   │   ├── QuizContainer.astro   # Quiz island (client:visible)
│   │   │   ├── QuizQuestion.astro    # Single question display
│   │   │   ├── QuizScore.astro       # Score result display
│   │   │   └── quiz-engine.ts        # Client-side quiz logic
│   │   ├── gamification/
│   │   │   ├── ProgressBar.astro     # XP / completion bar
│   │   │   ├── BadgeDisplay.astro    # Badge collection
│   │   │   ├── LevelIndicator.astro  # Current level
│   │   │   └── Confetti.astro        # Celebration animation
│   │   └── ui/
│   │       ├── ThemeToggle.astro     # Dark/light switch
│   │       ├── CopyButton.astro      # Clipboard copy
│   │       └── SearchModal.astro     # Search overlay
│   ├── content/
│   │   ├── config.ts                 # Content collection schema
│   │   └── modules/
│   │       ├── 01-docker-theory.md
│   │       ├── 02-git-basics.md
│   │       ├── 03-deploy-nginx.md
│   │       ├── 04-dockerfile.md
│   │       ├── 05-docker-compose.md
│   │       ├── 06-qcm.md
│   │       └── 07-solutions.md
│   ├── data/
│   │   ├── quiz-questions.ts         # All QCM questions data
│   │   ├── badges.ts                 # Badge definitions
│   │   └── xp-config.ts             # XP values per module
│   ├── layouts/
│   │   ├── BaseLayout.astro          # HTML shell, head, meta, theme
│   │   └── ModuleLayout.astro        # Module page with sidebar + TOC
│   ├── pages/
│   │   ├── index.astro               # Homepage (module roadmap)
│   │   ├── 404.astro                 # Custom 404
│   │   └── modules/
│   │       └── [...slug].astro       # Dynamic module pages
│   ├── styles/
│   │   ├── global.css                # CSS custom properties, reset
│   │   ├── typography.css            # Content text styles
│   │   ├── components.css            # Shared component styles
│   │   └── code-theme.css            # Shiki code block customization
│   └── utils/
│       ├── progress.ts               # localStorage progress manager
│       └── theme.ts                  # Theme detection and persistence
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── Dockerfile                        # Multi-stage build
├── docker-compose.yml
├── nginx.conf                        # Custom Nginx config
├── .dockerignore
├── .gitignore
└── CLAUDE.md                         # Project-specific rules
```

---

## 4. Key Design Decisions

### 4.1 Islands Architecture
- Static content (90%): rendered at build time, zero JavaScript
- Interactive islands (10%): hydrated on client
  - `client:visible` for quiz (hydrate when scrolled to)
  - `client:load` for progress bar (needs data on page load)
  - `client:load` for theme toggle (prevent flash)

### 4.2 Content Pipeline
```
Markdown files (src/content/modules/)
    │
    ├── Frontmatter: title, order, duration, objectives
    │
    v
Astro Content Collections (validated at build time)
    │
    v
Shiki syntax highlighting (build time, not runtime)
    │
    v
Static HTML pages (dist/)
```

### 4.3 State Management (Client-side)
```
localStorage
    │
    ├── docker-learn-progress    # Module completion states
    │   { "module-01": { completed: true, timestamp: ... } }
    │
    ├── docker-learn-quiz        # Quiz scores
    │   { "qcm-general": { score: 16, total: 20, best: 18 } }
    │
    ├── docker-learn-xp          # XP and level
    │   { xp: 850, level: "expert" }
    │
    ├── docker-learn-badges      # Earned badges
    │   ["first-container", "quiz-champion"]
    │
    └── docker-learn-theme       # "dark" | "light"
```

### 4.4 Docker Build (Multi-stage)
```
Stage 1: node:20-alpine (builder)
    - npm ci
    - npm run build
    - Output: dist/

Stage 2: nginx:alpine (production)
    - COPY dist/ -> /usr/share/nginx/html/
    - Custom nginx.conf (gzip, caching, security headers)
    - Final image: ~15-20MB
```

---

## 5. Component Hydration Map

| Component | Hydration | JS Size | Reason |
|-----------|-----------|---------|--------|
| Header | Static | 0 KB | Pure HTML/CSS |
| Sidebar | Static | 0 KB | Pure HTML/CSS |
| ModuleCard | Static | 0 KB | Pure HTML/CSS |
| CodeBlock | `client:idle` | ~1 KB | Copy button needs JS |
| QuizContainer | `client:visible` | ~3 KB | Full quiz interactivity |
| ProgressBar | `client:load` | ~1 KB | Reads localStorage |
| ThemeToggle | `client:load` | ~0.5 KB | Prevents theme flash |
| Confetti | `client:idle` | ~1 KB | CSS animations + trigger |
| SearchModal | `client:idle` | ~2 KB | Lazy load search |
| **Total JS** | | **~8.5 KB** | Far below 50KB budget |

---

## 6. Color System

```css
/* Light theme */
--color-primary: #052FAD;
--color-primary-light: #1A4FD6;
--color-primary-dark: #041E6F;
--color-accent: #00D4AA;
--color-success: #00C853;
--color-error: #FF1744;
--color-bg: #FAFBFF;
--color-surface: #FFFFFF;
--color-text: #1A1A2E;

/* Dark theme (default) */
--color-bg: #0D1117;
--color-surface: #161B22;
--color-text: #E6EDF3;
--color-border: #30363D;
```

---

## 7. Module Content Schema

```typescript
// src/content/config.ts
const modules = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    duration: z.string(),
    icon: z.string(),
    xpReward: z.number(),
    objectives: z.array(z.string()),
    badge: z.object({
      name: z.string(),
      icon: z.string(),
    }).optional(),
  }),
});
```
