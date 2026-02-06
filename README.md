# Docker Learn

Interactive Docker learning platform for students. 7 modules covering Docker, Git, Docker Compose with quizzes, progress tracking and gamification.

## Quick Start with Docker

```bash
git clone https://github.com/cdeom/docker-learn-app.git
cd docker-learn-app
docker compose up -d --build
```

Open **http://localhost:9090/** in your browser.

To stop:

```bash
docker compose down
```

## Development

```bash
npm install
npm run dev
```

Open **http://localhost:4321/**

## Features

- 7 course modules (Docker, Git, Nginx, Dockerfile, Docker Compose, QCM, Solutions)
- Interactive QCM with 20 questions and immediate feedback
- Inline quizzes for Git and Docker Compose modules
- Progress tracking (localStorage)
- Gamification: XP, levels, badges, confetti
- Dark/light theme
- Search (Ctrl+K)
- Code syntax highlighting with copy button
- Responsive design

## Tech Stack

- **Astro 5.x** with TypeScript
- **Shiki** for syntax highlighting
- **CSS custom properties** for theming
- **Nginx Alpine** in Docker (62 MB image)
