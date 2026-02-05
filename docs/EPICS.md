# Epics and Stories - Docker Learn Platform

---

## Epic 1: Foundation (MVP Core)
> Render all 7 modules with navigation, code highlighting, and responsive design.

### Stories

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| STORY-001 | Initialize Astro project with TypeScript, configure build | Must | 2 |
| STORY-002 | Create BaseLayout and ModuleLayout with responsive CSS | Must | 3 |
| STORY-003 | Set up Content Collections and migrate 7 modules to MD | Must | 5 |
| STORY-004 | Build Sidebar navigation with module list | Must | 3 |
| STORY-005 | Build Header with breadcrumb and mobile navigation | Must | 3 |
| STORY-006 | Configure Shiki syntax highlighting and CodeBlock component | Must | 2 |
| STORY-007 | Build Homepage with module roadmap cards | Must | 3 |
| STORY-008 | Build TableOfContents auto-generated from headings | Must | 2 |
| STORY-009 | Create Docker setup (Dockerfile, docker-compose, nginx.conf) | Must | 2 |
| STORY-010 | Build dark/light theme system with CSS custom properties | Should | 3 |

**Epic 1 Total: 28 points**

---

## Epic 2: Interactive QCM
> Quiz engine with immediate feedback, scoring, and retry.

### Stories

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| STORY-011 | Create quiz data structure (questions, options, answers) | Must | 2 |
| STORY-012 | Build QuizContainer island component (client:visible) | Must | 5 |
| STORY-013 | Implement immediate feedback (green/red, explanation) | Must | 3 |
| STORY-014 | Build score calculation and result display | Must | 3 |
| STORY-015 | Add score breakdown by topic | Should | 2 |
| STORY-016 | Implement retry with best score saved | Should | 2 |
| STORY-017 | Add Module 5 inline QCM (10 questions) | Should | 2 |
| STORY-018 | Add Module 2 Git QCM (10 questions) | Should | 2 |

**Epic 2 Total: 21 points**

---

## Epic 3: Progress and Gamification
> XP system, badges, progress tracking, animations.

### Stories

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| STORY-019 | Build localStorage progress manager utility | Must | 3 |
| STORY-020 | Build ProgressBar component (overall completion %) | Must | 2 |
| STORY-021 | Add module completion checkmarks in sidebar | Must | 2 |
| STORY-022 | Implement "Continue where you left off" | Should | 2 |
| STORY-023 | Build XP system (points per module, level calculation) | Should | 3 |
| STORY-024 | Build Badge system and display | Should | 3 |
| STORY-025 | Add confetti animation on module completion | Could | 2 |
| STORY-026 | Add +XP floating animation on interactions | Could | 2 |

**Epic 3 Total: 19 points**

---

## Epic 4: Polish and PWA
> Theme, micro-interactions, offline support.

### Stories

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| STORY-027 | Implement copy-to-clipboard on all code blocks | Must | 2 |
| STORY-028 | Add smooth scroll and section highlight on navigation | Should | 2 |
| STORY-029 | Build search modal with full-text search | Could | 5 |
| STORY-030 | Add PWA manifest and service worker | Could | 3 |
| STORY-031 | Add print-friendly CSS for cheat sheets | Could | 2 |
| STORY-032 | Accessibility audit and fixes (WCAG AA) | Should | 3 |

**Epic 4 Total: 17 points**

---

## Epic 5: Teacher Features (Stretch)
> Dashboard and content management.

### Stories

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| STORY-033 | Build teacher preview mode (access all modules) | Could | 3 |
| STORY-034 | Add share feature (URL copy, QR code) | Could | 2 |
| STORY-035 | Build basic analytics dashboard | Won't (v1) | 8 |

**Epic 5 Total: 13 points**

---

## Sprint Planning Recommendation

### Sprint 1 (Epic 1 - Foundation)
STORY-001, 002, 003, 004, 005, 006, 007, 008, 009
**Target: Navigable site with all 7 modules rendered**

### Sprint 2 (Epic 2 - QCM + Epic 1 finish)
STORY-010, 011, 012, 013, 014, 015, 016
**Target: Interactive quizzes working with scoring**

### Sprint 3 (Epic 3 - Progress + Epic 4 partial)
STORY-017, 018, 019, 020, 021, 022, 023, 027
**Target: Progress tracking and copy-to-clipboard**

### Sprint 4 (Epic 3 finish + Epic 4)
STORY-024, 025, 026, 028, 029, 030, 031, 032
**Target: Gamification and polish**

---

## Total Project Estimate
- **Must Have**: ~50 story points
- **Should Have**: ~25 story points
- **Could Have**: ~20 story points
- **Grand Total**: ~95 story points
