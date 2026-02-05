# PRD - Docker Learn: Interactive Learning Platform

> Product Requirements Document

---

## 1. Vision

**Docker Learn** is an interactive web platform that transforms a static Docker course
into an engaging learning experience for 15-year-old students. The platform turns
Markdown-based educational content into a modern, gamified web application served
via Docker (eating its own dog food).

---

## 2. Personas

### Persona 1: Alex (Student, 15 years old)
- Beginner in IT, learning Docker at school
- Uses phone (60%) and laptop (40%)
- Short attention span, needs visual feedback
- Motivated by gamification (XP, badges, progress)
- French-speaking

### Persona 2: Prof. Martin (Teacher)
- Shares the platform URL with students
- Wants to see if students completed modules
- Needs a structured, self-paced course
- May customize content (stretch goal)

---

## 3. Functional Requirements

### 3.1 Content Display (Must Have)
- FR-01: Render 7 course modules from Markdown content
- FR-02: Code syntax highlighting for bash, dockerfile, yaml, php, html, css
- FR-03: Copy-to-clipboard button on code blocks
- FR-04: ASCII diagram rendering (monospace blocks)
- FR-05: Responsive layout (mobile 375px to desktop 1440px)
- FR-06: Sidebar navigation with module list and section anchors
- FR-07: Breadcrumb navigation (Module > Section)
- FR-08: Table of contents auto-generated per module

### 3.2 QCM / Quiz System (Must Have)
- FR-09: Interactive multiple-choice questions with immediate feedback
- FR-10: Visual feedback: green for correct, red for incorrect
- FR-11: Show explanation after each answer
- FR-12: Score calculation and display at end of quiz
- FR-13: Score breakdown by topic
- FR-14: Retry capability (best score saved)
- FR-15: Link to relevant module on wrong answer

### 3.3 Progress Tracking (Must Have)
- FR-16: Track module completion in localStorage
- FR-17: Overall progress bar (percentage)
- FR-18: Visual indicators on completed modules (checkmarks)
- FR-19: "Continue where you left off" on return visit

### 3.4 Theme and Appearance (Should Have)
- FR-20: Dark/light theme toggle
- FR-21: Theme preference saved in localStorage
- FR-22: Primary color: #052FAD (blue)
- FR-23: Dark theme as default (target audience preference)

### 3.5 Gamification (Should Have)
- FR-24: XP points earned per module completion
- FR-25: Level progression (Debutant -> Maitre Docker)
- FR-26: Achievement badges on milestones
- FR-27: Confetti animation on correct answers / module completion

### 3.6 Search (Could Have)
- FR-28: Full-text search across all modules
- FR-29: Search results with highlighted matches

### 3.7 PWA (Could Have)
- FR-30: Installable as PWA on mobile
- FR-31: Offline access after first load via service worker

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | First Contentful Paint | < 1.5s |
| NFR-02 | Lighthouse Performance | > 90 |
| NFR-03 | Total JS bundle | < 50KB gzipped |
| NFR-04 | WCAG 2.1 Level AA | Color contrast 4.5:1 minimum |
| NFR-05 | Browser support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| NFR-06 | Mobile responsive | 375px minimum width |
| NFR-07 | Build time | < 30 seconds |
| NFR-08 | Docker image size | < 50MB |

---

## 5. Technical Constraints

- Static site only (no backend, no database)
- Must be containerized with Docker + Nginx
- All progress data in localStorage (client-side)
- Must build with `npm run build` + serve from `dist/`
- Content source: Markdown files (7 modules)

---

## 6. Epics Overview

### Epic 1: Foundation (MVP Core)
Render all 7 modules with navigation, code highlighting, and responsive design.

### Epic 2: Interactive QCM
Quiz engine with immediate feedback, scoring, and retry.

### Epic 3: Progress and Gamification
XP system, badges, progress tracking, animations.

### Epic 4: Theme and Polish
Dark/light mode, micro-interactions, PWA.

### Epic 5: Teacher Features (Stretch)
Dashboard, content lock controls, sharing tools.

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Module completion rate | > 70% of students finish all modules |
| QCM average score | > 14/20 |
| Time on platform per session | 15-30 minutes |
| Return visit rate | > 50% come back |
| Lighthouse score | > 90 all categories |
