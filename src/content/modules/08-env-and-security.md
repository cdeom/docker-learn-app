---
title: "Variables d'environnement et Securite"
description: "Configurer et securiser ses conteneurs Docker"
order: 8
duration: "35 min"
icon: "🔒"
xpReward: 300
objectives:
  - "Maitriser les variables d'environnement"
  - "Appliquer les bonnes pratiques de securite Docker"
  - "Scanner et corriger les vulnerabilites"
---

# Variables d'environnement et Securite

Bienvenue dans le module le plus important pour devenir un pro de Docker ! On va parler de configuration et de securite. C'est peut-etre moins fun que de lancer des conteneurs, mais c'est VITAL pour eviter de te faire hacker ou de perdre des donnees.

## 8.1 Pourquoi les variables d'environnement ?

### Le probleme des valeurs en dur

Imagine ce code (MAUVAISE IDEE) :

```javascript
// app.js - DO NOT DO THIS!
const dbPassword = "super_secret_123";
const apiKey = "sk_live_ABC123XYZ";

db.connect({
  host: "localhost",
  user: "admin",
  password: dbPassword
});
```

Pourquoi c'est catastrophique ?

1. **Securite** : Tu mets ton code sur GitHub ? GG, ton mot de passe est public
2. **Flexibilite zero** : Pour changer un mot de passe, tu dois rebuild toute l'image
3. **Environnements differents** : En dev tu veux `localhost`, en prod `db.production.com`, comment faire ?
4. **Partage impossible** : Tu peux pas partager ton code sans partager tes secrets

### La solution : variables d'environnement

Les variables d'environnement (env vars) sont des valeurs injectees au moment du lancement, pas au moment du build.

```javascript
// app.js - GOOD PRACTICE
const dbPassword = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;

db.connect({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: dbPassword
});
```

Maintenant :
- Ton code ne contient AUCUN secret
- Tu peux le partager publiquement
- Chaque environnement (dev/prod) a ses propres valeurs
- Meme image Docker = configs differentes

### Le principe 12-factor app (version simple)

Les apps modernes suivent le principe "12-factor", qui dit entre autres :

> **La config change entre environnements, le code ne change pas**

Exemples de ce qui doit etre en env vars :
- Mots de passe et tokens
- URLs de bases de donnees
- Ports d'ecoute
- Niveaux de log (debug/info/error)
- Features flags (activer/desactiver des fonctionnalites)

## 8.2 ENV dans Docker

Docker te donne plusieurs facons d'injecter des variables d'environnement.

### Methode 1 : -e dans docker run

La plus simple pour tester :

```bash
docker run -e DB_PASSWORD=secret123 -e DB_HOST=localhost mon-app
```

Tu peux en mettre autant que tu veux :

```bash
docker run \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_HOST=db.example.com \
  -e DB_USER=admin \
  -e DB_PASSWORD=super_secret \
  mon-app
```

Ca marche, mais c'est vite penible avec beaucoup de variables.

### Methode 2 : --env-file

Cree un fichier `.env` :

```bash
# .env
NODE_ENV=production
PORT=3000
DB_HOST=db.example.com
DB_USER=admin
DB_PASSWORD=super_secret
API_KEY=sk_live_ABC123XYZ
```

Puis lance avec :

```bash
docker run --env-file .env mon-app
```

Beaucoup plus propre ! Et tu peux avoir plusieurs fichiers :
- `.env.dev` pour le developpement
- `.env.staging` pour les tests
- `.env.prod` pour la production

**IMPORTANT** : Ajoute `.env*` dans ton `.gitignore` pour ne JAMAIS commit ces fichiers !

```bash
# .gitignore
.env
.env.*
.env.local
```

### Methode 3 : ENV dans le Dockerfile

Tu peux aussi definir des valeurs par defaut dans le Dockerfile :

```dockerfile
FROM node:20-alpine

# Environment variables with default values
ENV NODE_ENV=development \
    PORT=3000 \
    LOG_LEVEL=info

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Use the PORT variable
EXPOSE $PORT

CMD ["node", "app.js"]
```

Ces valeurs peuvent etre overridees au runtime avec `-e` :

```bash
# Use default PORT=3000
docker run mon-app

# Override with PORT=8080
docker run -e PORT=8080 mon-app
```

### Exemple complet : connexion a une base de donnees

Voici une app Node.js qui utilise des env vars :

```javascript
// app.js
const express = require('express');
const mysql = require('mysql2');

// Read from environment variables
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'myapp'
};

// Validate required vars
if (!config.password) {
  console.error('ERROR: DB_PASSWORD is required');
  process.exit(1);
}

const db = mysql.createConnection(config);

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to database: ${config.database}`);
});
```

Dockerfile :

```dockerfile
FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

Lancement :

```bash
docker run \
  -e DB_HOST=mysql-server \
  -e DB_USER=appuser \
  -e DB_PASSWORD=secret123 \
  -e DB_NAME=production_db \
  -p 3000:3000 \
  mon-app
```

## 8.3 .env files avec Docker Compose

Avec Compose, c'est encore plus elegant !

### env_file directive

```yaml
# docker-compose.yml
services:
  app:
    build: .
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - db

  db:
    image: mysql:8
    env_file:
      - .env.db
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

Fichier `.env` :

```bash
# .env
NODE_ENV=production
PORT=3000
DB_HOST=db
DB_USER=appuser
DB_PASSWORD=super_secret_123
DB_NAME=myapp
```

Fichier `.env.db` :

```bash
# .env.db
MYSQL_ROOT_PASSWORD=root_secret_456
MYSQL_DATABASE=myapp
MYSQL_USER=appuser
MYSQL_PASSWORD=super_secret_123
```

### environment section

Tu peux aussi definir directement dans le compose :

```yaml
services:
  app:
    build: .
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: db
      DB_USER: appuser
      DB_PASSWORD: ${DB_PASSWORD}  # from .env file
      DB_NAME: myapp
    ports:
      - "3000:3000"
```

### Substitution de variables avec valeurs par defaut

Super pratique : tu peux definir des fallbacks :

```yaml
services:
  app:
    build: .
    environment:
      # If LOG_LEVEL not set, use "info"
      LOG_LEVEL: ${LOG_LEVEL:-info}

      # If PORT not set, use "3000"
      PORT: ${PORT:-3000}

      # Required variable (no default)
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${PORT:-3000}:3000"
```

### .env au niveau du Compose

Docker Compose cherche automatiquement un fichier `.env` dans le meme dossier :

```bash
# .env (at same level as docker-compose.yml)
POSTGRES_VERSION=15-alpine
APP_VERSION=1.2.3
PORT=3000
DB_PASSWORD=secret123
```

```yaml
# docker-compose.yml
services:
  app:
    image: mon-app:${APP_VERSION}
    environment:
      PORT: ${PORT}
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${PORT}:3000"

  db:
    image: postgres:${POSTGRES_VERSION}
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

Lance avec :

```bash
docker compose up
```

Pour override avec un autre fichier :

```bash
docker compose --env-file .env.staging up
```

## 8.4 Docker Secrets (introduction)

### Le probleme des env vars

Les variables d'environnement ont un gros defaut : **elles sont visibles** !

```bash
docker inspect mon-conteneur
```

Resultat : tu vois TOUTES les env vars, dont les mots de passe. Pas terrible.

Autre probleme : les env vars peuvent apparaitre dans les logs, les traces d'erreurs, etc.

### Les Docker Secrets

Docker Secrets est un systeme plus securise pour les donnees sensibles :
- Les secrets sont **chiffres** au repos et en transit
- Ils sont montes comme des fichiers dans `/run/secrets/`
- Ils ne sont **jamais** dans les logs ou `docker inspect`

### Exemple avec Docker Compose

Cree des fichiers secrets :

```bash
# Create secret files
echo "super_secret_password_123" > db_password.txt
echo "sk_live_ABC123XYZ" > api_key.txt
```

Compose file :

```yaml
# docker-compose.yml
services:
  app:
    image: mon-app
    secrets:
      - db_password
      - api_key
    environment:
      # Point to secret files
      DB_PASSWORD_FILE: /run/secrets/db_password
      API_KEY_FILE: /run/secrets/api_key

  db:
    image: postgres:15-alpine
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./db_password.txt
  api_key:
    file: ./api_key.txt
```

Dans ton app, lis les fichiers secrets :

```javascript
// app.js
const fs = require('fs');

// Read secret from file
function readSecret(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    console.error(`Could not read secret: ${filePath}`);
    process.exit(1);
  }
}

// Support both env vars and secret files
const dbPassword = process.env.DB_PASSWORD_FILE
  ? readSecret(process.env.DB_PASSWORD_FILE)
  : process.env.DB_PASSWORD;

const apiKey = process.env.API_KEY_FILE
  ? readSecret(process.env.API_KEY_FILE)
  : process.env.API_KEY;

console.log('Secrets loaded successfully');
// DO NOT log the actual secrets!
```

**Note** : En Docker Swarm (mode cluster), les secrets sont encore plus puissants et geres centralement. On verra ca plus tard !

## 8.5 Security checklist

Maintenant, parlons securite generale. Voici les erreurs les plus communes (et comment les eviter).

### 1. Ne JAMAIS tourner en root

Par defaut, les conteneurs tournent en **root** (utilisateur ID 0). C'est dangereux :
- Si quelqu'un hack ton app, il a les droits root dans le conteneur
- Il peut potentiellement s'echapper du conteneur vers l'hote

**Solution** : cree et utilise un utilisateur non-root.

```dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["node", "app.js"]
```

### 2. Toujours pin les versions d'images

```dockerfile
# BAD - version can change
FROM node:latest
FROM nginx

# GOOD - specific versions
FROM node:20.11-alpine3.19
FROM nginx:1.25.4-alpine
```

Pourquoi ? Si tu utilises `latest`, ton build peut casser demain quand une nouvelle version sort. Pire, une nouvelle version peut avoir des failles de securite.

### 3. Filesystem en lecture seule

Empeche les modifications du filesystem :

```bash
docker run --read-only mon-app
```

Ou en Compose :

```yaml
services:
  app:
    image: mon-app
    read_only: true
    tmpfs:
      - /tmp  # Allow writing to /tmp only
```

### 4. Ajouter un HEALTHCHECK

Permets a Docker de verifier que ton app tourne correctement :

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

# Define health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "app.js"]
```

Fichier `healthcheck.js` :

```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`HEALTHCHECK STATUS: ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on('error', (err) => {
  console.error(`HEALTHCHECK ERROR: ${err.message}`);
  process.exit(1);
});

request.end();
```

Dans ton app, ajoute un endpoint `/health` :

```javascript
app.get('/health', (req, res) => {
  // Check database connection
  db.ping((err) => {
    if (err) {
      return res.status(503).json({ status: 'unhealthy', error: err.message });
    }
    res.json({ status: 'healthy' });
  });
});
```

### 5. Supprimer les capacites Linux

Les conteneurs ont par defaut des "capabilities" Linux (permissions speciales). Supprime-les toutes et n'ajoute que celles necessaires :

```bash
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE mon-app
```

En Compose :

```yaml
services:
  app:
    image: mon-app
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if binding to port < 1024
```

### 6. JAMAIS de mode privileged

Le mode privileged donne acces TOTAL a l'hote. Ne l'utilise JAMAIS en production :

```bash
# NEVER DO THIS IN PRODUCTION
docker run --privileged mon-app
```

C'est utile uniquement pour des cas tres specifiques (ex: Docker-in-Docker en dev).

### 7. Limiter les ressources

Empeche un conteneur de bouffer toute la RAM/CPU :

```bash
docker run \
  --memory="512m" \
  --cpus="1.0" \
  mon-app
```

En Compose :

```yaml
services:
  app:
    image: mon-app
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 8. Reduire la surface d'attaque

- Utilise des images **Alpine** (beaucoup plus petites)
- Supprime les outils inutiles (curl, wget, etc.)
- N'installe que les dependances de production

```dockerfile
# Multi-stage build to reduce image size
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

# Install only production dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app/dist ./dist

USER node
CMD ["node", "dist/index.js"]
```

## 8.6 Dockerfile securise complet

Comparons un Dockerfile AVANT et APRES securisation.

### AVANT (INSECURE)

```dockerfile
# Insecure Dockerfile - DO NOT USE!

FROM node:latest

WORKDIR /app

# Running as root (default)
# No version pinning
# Copying everything including secrets
COPY . .

# Installing dev dependencies in production
RUN npm install

# Hardcoded secrets (TERRIBLE!)
ENV DB_PASSWORD=secret123
ENV API_KEY=sk_live_ABC123XYZ

# No healthcheck
# Exposing unnecessary ports
EXPOSE 3000 9229

CMD ["npm", "start"]
```

Problemes :
- ❌ `node:latest` - version non fixee
- ❌ Root user
- ❌ `COPY . .` copie tout, meme `.env` et `.git`
- ❌ `npm install` inclut les devDependencies
- ❌ Secrets hardcodes dans l'image
- ❌ Pas de healthcheck
- ❌ Port debug 9229 expose

### APRES (SECURE)

```dockerfile
# Secure Dockerfile - Best Practices

# Pin specific version
FROM node:20.11-alpine3.19 AS builder

# Set working directory
WORKDIR /app

# Copy only dependency files first (better caching)
COPY package*.json ./

# Install all dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build && \
    npm prune --production

# ============================================
# Production stage
# ============================================
FROM node:20.11-alpine3.19

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy production dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Expose only necessary port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
```

Ameliorations :
- ✅ Version specifique `20.11-alpine3.19`
- ✅ Multi-stage build (image plus petite)
- ✅ Utilisateur non-root `nodejs`
- ✅ Pas de secrets dans l'image
- ✅ Healthcheck inclus
- ✅ Seulement port 3000
- ✅ `dumb-init` pour gerer les signaux proprement
- ✅ Production dependencies seulement

### docker-compose.yml associe

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: mon-app:secure

    # Security settings
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true

    # Environment from file (no hardcoded secrets)
    env_file:
      - .env

    # Or use secrets
    secrets:
      - db_password
      - api_key

    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      API_KEY_FILE: /run/secrets/api_key

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

    # Writable tmpfs volumes
    tmpfs:
      - /tmp
      - /app/logs

    ports:
      - "3000:3000"

    depends_on:
      db:
        condition: service_healthy

    restart: unless-stopped

  db:
    image: postgres:15.5-alpine3.19

    secrets:
      - db_password

    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_USER: appuser
      POSTGRES_DB: myapp

    volumes:
      - db-data:/var/lib/postgresql/data

    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser"]
      interval: 10s
      timeout: 5s
      retries: 5

    restart: unless-stopped

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt

volumes:
  db-data:
    driver: local
```

## 8.7 Scanner les vulnerabilites

Docker inclut un outil de scanning : **Docker Scout**.

### Installation et setup

Docker Scout est inclus dans Docker Desktop 4.17+. Verifie :

```bash
docker scout --version
```

### Scan rapide d'une image

```bash
docker scout quickview mon-app:latest
```

Resultat :

```
    ✓ Image stored for indexing
    ✓ Indexed 137 packages

  Target      │  mon-app:latest  │    0C     3H     5M    12L
```

Legende :
- **C** = Critical (critique)
- **H** = High (haute)
- **M** = Medium (moyenne)
- **L** = Low (basse)

### Scan detaille des CVE

CVE = Common Vulnerabilities and Exposures (failles de securite connues)

```bash
docker scout cves mon-app:latest
```

Resultat detaille :

```
## Overview

                    │           Analyzed Image
────────────────────┼───────────────────────────
  Target            │  mon-app:latest
    digest          │  sha256:abc123...
    platform        │  linux/amd64
    vulnerabilities │    0C     3H     5M    12L
    size            │  145 MB
    packages        │  137

## Packages and Vulnerabilities

   0C     1H     0M     0L  npm 8.19.2
pkg:npm/npm@8.19.2

    ✗ HIGH CVE-2022-29244
      https://scout.docker.com/v/CVE-2022-29244
      Affected range : <8.19.4
      Fixed version  : 8.19.4

   0C     2H     3M     5L  openssl 3.0.7-r0
pkg:apk/alpine/openssl@3.0.7-r0

    ✗ HIGH CVE-2023-0464
      https://scout.docker.com/v/CVE-2023-0464
      Affected range : <3.0.8-r0
      Fixed version  : 3.0.8-r0
```

### Comprendre les niveaux de severite

- **CRITICAL** : Exploitable a distance, peut compromettre tout le systeme. **FIX IMMEDIATELY**
- **HIGH** : Impact important, peut permettre acces non autorise. **Fix dans les 24-48h**
- **MEDIUM** : Risque moyen, necessite conditions specifiques. **Fix dans la semaine**
- **LOW** : Impact limite ou difficile a exploiter. **Fix quand possible**

### Comment corriger les vulnerabilites

#### 1. Mettre a jour l'image de base

```dockerfile
# Before
FROM node:18-alpine3.17

# After - use latest patch version
FROM node:18-alpine3.19
```

```bash
# Rebuild
docker build -t mon-app:latest .

# Rescan
docker scout cves mon-app:latest
```

#### 2. Mettre a jour les packages systeme

```dockerfile
FROM node:20-alpine

# Update system packages
RUN apk upgrade --no-cache

WORKDIR /app
# ...
```

#### 3. Mettre a jour les dependances applicatives

```bash
# Update npm packages
npm audit
npm audit fix

# Or update specific package
npm update package-name
```

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Audit before install
RUN npm audit --audit-level=high && \
    npm ci --omit=dev

COPY . .

CMD ["node", "app.js"]
```

#### 4. Utiliser des images minimales

Alpine est deja bien, mais tu peux aller plus loin avec **distroless** :

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage with distroless
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER nonroot

CMD ["dist/index.js"]
```

Distroless = **ZERO** packages inutiles, seulement ton app et le runtime.

### Automatiser le scanning

Ajoute un scan dans ton CI/CD :

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t mon-app:${{ github.sha }} .

      - name: Run Docker Scout
        uses: docker/scout-action@v1
        with:
          command: cves
          image: mon-app:${{ github.sha }}
          exit-code: true  # Fail if critical/high CVEs found
          only-severities: critical,high
```

## 8.8 .dockerignore pour la securite

Le fichier `.dockerignore` est comme `.gitignore`, mais pour Docker. Il empeche de copier des fichiers sensibles ou inutiles dans l'image.

### .dockerignore securise complet

```dockerignore
# .dockerignore

# ============================================
# SECURITY - Never include these!
# ============================================

# Environment files with secrets
.env
.env.*
.env.local
.env.production
.env.staging
*.env

# Private keys and certificates
*.pem
*.key
*.crt
*.p12
*.pfx
id_rsa*
*.pub

# Cloud credentials
.aws/
.gcloud/
.azure/
credentials.json
service-account.json

# Database dumps (may contain sensitive data)
*.sql
*.dump
*.db

# Configuration files that may have secrets
config.json
secrets.yaml
docker-compose.override.yml

# ============================================
# Development files (not needed in image)
# ============================================

# Git
.git/
.gitignore
.gitattributes

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm/

# Testing
coverage/
.nyc_output/
test/
tests/
*.test.js
*.spec.js
jest.config.js

# Documentation
README.md
CHANGELOG.md
CONTRIBUTING.md
docs/
*.md

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml
Jenkinsfile

# Docker
Dockerfile*
docker-compose*.yml
.dockerignore

# Logs
logs/
*.log

# Build artifacts
dist/
build/
*.tmp
*.cache

# Large media files (unless needed)
*.mp4
*.mov
*.avi
```

### Tester ton .dockerignore

Construis ton image et verifie qu'aucun fichier sensible n'est present :

```bash
# Build
docker build -t test-ignore .

# Check what files are inside
docker run --rm test-ignore ls -la

# Check for sensitive files
docker run --rm test-ignore find . -name ".env*" -o -name "*.key"
```

Resultat attendu : **aucun fichier trouve**.

### Verification avec dive

Installe `dive` pour inspecter les layers d'une image :

```bash
# Install dive
brew install dive  # macOS
# or
apt install dive   # Ubuntu

# Analyze image
dive mon-app:latest
```

Dive te montre TOUS les fichiers de chaque layer. Verifie qu'il n'y a pas de secrets !

## 8.9 Exercice pratique

C'est l'heure de mettre en pratique ! Tu vas prendre un Dockerfile **completement insecure** et le corriger en 5 etapes.

### Preparation

Cree un dossier pour l'exercice :

```bash
mkdir security-demo && cd security-demo
```

Tu vas creer 3 fichiers :

```
security-demo/
├── Dockerfile         # On va le corriger en 5 etapes
├── .dockerignore      # A creer a l'etape 4
└── .env               # Les vrais secrets (PAS dans l'image !)
```

### Dockerfile de depart (INSECURE)

```dockerfile
# insecure.dockerfile
FROM node

WORKDIR /app

# Copy everything including .env
COPY . .

# Install with dev dependencies
RUN npm install

# Hardcoded secrets
ENV DB_PASSWORD=SuperSecret123!
ENV API_KEY=sk_live_1234567890ABCDEF

# No healthcheck

# Expose debug port
EXPOSE 3000 9229

# Run as root
CMD ["npm", "start"]
```

Fichier `.env` (present dans le dossier) :

```bash
# .env
DB_PASSWORD=ProductionPassword456!
API_KEY=sk_live_REAL_KEY_HERE
AWS_SECRET_KEY=aws_secret_xyz
```

### Etape 1 : Ajouter un utilisateur non-root

**Objectif** : Ne plus tourner en root.

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .
RUN npm install

ENV DB_PASSWORD=SuperSecret123!
ENV API_KEY=sk_live_1234567890ABCDEF

EXPOSE 3000 9229

# ADD THIS:
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

CMD ["npm", "start"]
```

Test :

```bash
docker build -f insecure.dockerfile -t mon-app:step1 .
docker run mon-app:step1 whoami
# Should print: nodejs (not root)
```

### Etape 2 : Pin les versions et nettoyer

**Objectif** : Utiliser des versions specifiques et multi-stage build.

```dockerfile
# Build stage
FROM node:20.11-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20.11-alpine3.19

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Etape 3 : Ajouter HEALTHCHECK et supprimer secrets hardcodes

**Objectif** : Healthcheck + pas de secrets dans l'image.

```dockerfile
# Build stage
FROM node:20.11-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20.11-alpine3.19

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production

# ADD HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3000

# REMOVED: hardcoded DB_PASSWORD and API_KEY

CMD ["node", "dist/index.js"]
```

### Etape 4 : Utiliser .dockerignore

**Objectif** : Ne jamais copier `.env` dans l'image.

Cree `.dockerignore` :

```dockerignore
# .dockerignore

# Security - Never include!
.env
.env.*
*.key
*.pem
credentials.json

# Development
.git/
.vscode/
node_modules/
npm-debug.log

# Testing
test/
coverage/
*.test.js

# Documentation
README.md
docs/

# Docker files
Dockerfile*
docker-compose*.yml
```

Rebuild et verifie :

```bash
docker build -f insecure.dockerfile -t mon-app:step4 .

# Verify .env is NOT in the image
docker run --rm mon-app:step4 find . -name ".env"
# Should return nothing
```

### Etape 5 : Utiliser env vars et docker-compose avec secrets

**Objectif** : Injecter les secrets au runtime via Docker Compose.

Dockerfile final :

```dockerfile
# secure.dockerfile

# Build stage
FROM node:20.11-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20.11-alpine3.19

# Install dumb-init
RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
```

Cree les fichiers secrets :

```bash
mkdir -p secrets
echo "ProductionPassword456!" > secrets/db_password.txt
echo "sk_live_REAL_KEY_HERE" > secrets/api_key.txt
```

docker-compose.yml :

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: secure.dockerfile

    read_only: true

    cap_drop:
      - ALL

    secrets:
      - db_password
      - api_key

    environment:
      PORT: 3000
      DB_HOST: db
      DB_USER: appuser
      DB_NAME: myapp
      DB_PASSWORD_FILE: /run/secrets/db_password
      API_KEY_FILE: /run/secrets/api_key

    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

    tmpfs:
      - /tmp

    ports:
      - "3000:3000"

    depends_on:
      - db

  db:
    image: postgres:15.5-alpine3.19

    secrets:
      - db_password

    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_USER: appuser
      POSTGRES_DB: myapp

    volumes:
      - db-data:/var/lib/postgresql/data

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt

volumes:
  db-data:
```

Lance :

```bash
docker compose up --build
```

### Verification finale

Compare les deux images :

```bash
# Scan insecure version
docker scout cves mon-app:insecure

# Scan secure version
docker scout cves mon-app:secure

# Check image sizes
docker images | grep mon-app

# Verify no secrets in image
docker run --rm mon-app:secure env | grep -i password
# Should return nothing

# Verify runs as non-root
docker run --rm mon-app:secure whoami
# Should print: nodejs
```

Resultats attendus :
- ✅ Image secure = moins de vulnerabilites
- ✅ Image secure = plus petite (multi-stage)
- ✅ Pas de secrets hardcodes
- ✅ Tourne en non-root
- ✅ Healthcheck present

---

## Recapitulatif

Tu as appris :

✅ **Variables d'environnement**
- Pourquoi ne jamais hardcoder de secrets
- `-e`, `--env-file`, et `ENV` dans Dockerfile
- Gestion avec Docker Compose
- Substitution de variables `${VAR:-default}`

✅ **Docker Secrets**
- Pourquoi les env vars ne suffisent pas pour les donnees sensibles
- Secrets montes dans `/run/secrets/`
- Utilisation avec Docker Compose

✅ **Securite Docker**
- USER non-root
- Pin des versions
- Read-only filesystem
- HEALTHCHECK
- Capabilities et limits

✅ **Dockerfile securise**
- Multi-stage builds
- Images minimales (Alpine/distroless)
- Pas de secrets dans les layers

✅ **Scanning de vulnerabilites**
- Docker Scout pour detecter les CVE
- Comment corriger les failles
- Mettre a jour images et packages

✅ **.dockerignore**
- Ne jamais copier `.env`, `.git`, ou cles privees
- Reduire la taille des images
- Verifier avec `dive`

✅ **Exercice pratique**
- Transformer un Dockerfile insecure en secure
- 5 etapes de securisation
- Utilisation de secrets avec Compose

Tu es maintenant **armé** pour creer des conteneurs securises ! La securite n'est pas optionnelle, c'est la BASE. Ne skippe jamais ces etapes, meme en dev.

**Prochaine etape** : Dans le module suivant, on va voir Docker en production, avec orchestration, monitoring, et scaling. Accroche-toi, ca devient serieux ! 🚀
