---
title: "Multi-stage Builds"
description: "Optimiser ses images Docker avec les builds multi-etapes"
order: 6
duration: "30 min"
icon: "🔨"
xpReward: 250
objectives:
  - "Comprendre le probleme des images trop lourdes"
  - "Maitriser les builds multi-stage"
  - "Optimiser le cache et le contexte de build"
---

# Multi-stage Builds

Bienvenue dans le module sur les **builds multi-étapes** ! Jusqu'à présent, tu as créé des images Docker qui fonctionnent... mais qui sont parfois *énormes*. Dans ce module, on va apprendre à créer des images ultra-légères en utilisant une technique de pro : le **multi-stage build**.

Imagine que tu construis une maison : tu as besoin d'échafaudages, d'outils, de matériaux en vrac... mais une fois la maison terminée, tu ne laisses pas tout ça à l'intérieur ! C'est exactement le principe du multi-stage : on construit avec tous les outils nécessaires, puis on ne garde que le résultat final.

---

## 6.1 Le problème : images trop lourdes

### Une image Node.js typique

Prenons un exemple concret : une API Node.js simple. Voici un Dockerfile "classique" qu'on pourrait écrire :

```dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install ALL dependencies (dev + prod)
RUN npm install

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
```

Ce Dockerfile fonctionne parfaitement... mais regarde ce qui se passe quand on le build :

```bash
$ docker build -t my-api .
$ docker images

REPOSITORY   TAG       SIZE
my-api       latest    1.14 GB    😱
node         18        1.09 GB
```

**1,14 GB pour une simple API !** Pourquoi c'est si lourd ?

### Les coupables

Ton image contient tout ça :

1. **L'image de base `node:18`** → ~1,09 GB (elle inclut tout Linux + Node.js + npm + plein d'outils)
2. **Les `devDependencies`** → webpack, eslint, typescript, babel... (~200-300 MB)
3. **Les outils de build** → compilateurs, linters, etc.
4. **Le cache npm** → fichiers temporaires
5. **Les fichiers sources** → ton code TypeScript/JSX original (alors que tu n'as besoin que du JS compilé)
6. **node_modules complet** → avec des milliers de fichiers inutiles en production

### Pourquoi c'est un problème ?

- **Stockage** : Sur un serveur avec 10 apps, ça fait 11 GB juste pour les images
- **Transfert réseau** : Déployer prend 10 minutes au lieu de 30 secondes
- **Sécurité** : Plus il y a de code, plus il y a de failles potentielles
- **Performance** : Docker doit gérer plus de layers, plus de fichiers

Comparons avec ce qu'on devrait *vraiment* avoir en production :

```
✅ Ce qu'on veut :
- Node.js runtime
- Les fichiers compilés (.js)
- node_modules PRODUCTION uniquement (sans webpack, eslint, etc.)
→ Environ 150-200 MB

❌ Ce qu'on a :
- Node.js runtime
- Les fichiers sources (.ts, .jsx)
- Les fichiers compilés
- node_modules COMPLET (dev + prod)
- Les outils de build
- Le cache npm
→ 1,14 GB
```

**La solution ?** Les builds multi-stage ! On va séparer la phase de construction de la phase de production.

---

## 6.2 Comprendre le multi-stage

### Le concept de base

Un build multi-stage utilise **plusieurs `FROM`** dans un seul Dockerfile. Chaque `FROM` démarre une nouvelle "étape" (stage), et tu peux copier des fichiers d'une étape à l'autre.

```dockerfile
# Stage 1 : construction
FROM node:18 AS builder
# ... compilation, build, etc.

# Stage 2 : production (FINAL)
FROM node:18-alpine
# Copy only the compiled files from builder
COPY --from=builder /app/dist /app/dist
```

**Le truc magique** : Seule la *dernière* étape (le dernier `FROM`) devient ton image finale. Tout ce qui était dans les étapes précédentes est **jeté** !

### Syntaxe détaillée

#### 1. Nommer une étape avec `AS`

```dockerfile
FROM node:18 AS builder
#            ^^^^^^^^^^
#            Nom de cette étape
```

Tu peux lui donner n'importe quel nom : `builder`, `build-stage`, `compile`, etc.

#### 2. Copier depuis une étape avec `--from`

```dockerfile
COPY --from=builder /app/dist /app
#    ^^^^^^^^^^^^^^
#    Copie depuis l'étape "builder"
```

Tu peux même copier depuis une image externe :

```dockerfile
COPY --from=nginx:latest /etc/nginx/nginx.conf /etc/nginx/
```

### Diagramme du processus

```
┌─────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : BUILDER (node:18 - 1.09 GB)                  │
│                                                           │
│  - Install ALL dependencies (dev + prod)                 │
│  - Run tests                                             │
│  - Compile TypeScript → JavaScript                       │
│  - Bundle with webpack                                   │
│  - Optimize assets                                       │
│                                                           │
│  Résultat : /app/dist/  (fichiers compilés)             │
└─────────────────────────────────────────────────────────┘
                        │
                        │ COPY --from=builder
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : PRODUCTION (node:18-alpine - 180 MB)         │
│                                                           │
│  - Install ONLY production dependencies                  │
│  - Copy compiled files from builder                      │
│  - Configure for production                              │
│                                                           │
│  ✨ Cette étape devient l'image finale !                │
└─────────────────────────────────────────────────────────┘
```

### Exemple minimal

Voici le plus simple des multi-stage possibles :

```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json .
RUN npm install --production
CMD ["node", "dist/server.js"]
```

**Résultat** : Au lieu de 1,14 GB, tu obtiens ~180 MB ! 🚀

---

## 6.3 Exemple : API Node.js single vs multi-stage

### L'application exemple

On va utiliser une API Express ultra-simple :

```javascript
// server.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

```json
// package.json
{
  "name": "simple-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0",
    "eslint": "^8.45.0"
  }
}
```

### Version 1 : Single-stage (❌ LOURD)

```dockerfile
FROM node:18

WORKDIR /app

# Copy everything
COPY package*.json ./
COPY . .

# Install EVERYTHING (dev + prod)
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
```

**Build et résultat :**

```bash
$ docker build -t api-single .
$ docker images api-single

REPOSITORY   TAG       SIZE
api-single   latest    1.14 GB  😱
```

**Problèmes :**
- Contient `nodemon`, `jest`, `eslint` → inutiles en prod
- Contient tous les fichiers sources
- Utilise `node:18` qui est énorme

### Version 2 : Multi-stage (✅ OPTIMISÉ)

```dockerfile
# ================================
# STAGE 1: Dependencies & Build
# ================================
FROM node:18 AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install ALL dependencies (needed for tests/build)
RUN npm install

# Copy source code
COPY . .

# Run tests (optional but recommended)
RUN npm test

# ================================
# STAGE 2: Production Runtime
# ================================
FROM node:18-alpine AS production

WORKDIR /app

# Copy only package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --production

# Copy application code from builder
COPY --from=builder /app/server.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
```

**Build et résultat :**

```bash
$ docker build -t api-multi .
$ docker images | grep api

REPOSITORY   TAG       SIZE
api-multi    latest    182 MB  ✨
api-single   latest    1.14 GB
```

**Comparaison :**

```
┌─────────────────────────────────────────────┐
│  RÉDUCTION DE TAILLE                        │
├─────────────────────────────────────────────┤
│  Avant (single-stage) : 1.14 GB             │
│  Après (multi-stage)  : 182 MB              │
│                                             │
│  📉 Réduction : -84%                        │
│  💾 Économie  : 958 MB par image            │
└─────────────────────────────────────────────┘
```

### Pourquoi c'est si efficace ?

1. **`node:18-alpine` au lieu de `node:18`**
   - Alpine Linux = distribution ultra-minimaliste (~5 MB)
   - `node:18` = Debian complet (~900 MB)

2. **Seulement `npm install --production`**
   - Pas de `nodemon`, `jest`, `eslint`
   - Seulement `express` et ses dépendances

3. **Copie sélective**
   - On ne copie que `server.js`, pas tout le dossier
   - Pas de `tests/`, `docs/`, `.git/`, etc.

4. **Bonus sécurité**
   - Utilisateur non-root (`nodejs`)
   - Moins de surface d'attaque (moins de packages)

---

## 6.4 Exemple réel : le Dockerfile de CE cours

### Le vrai Dockerfile de `docker-learn-app`

Tu es en train d'apprendre avec cette plateforme, et devine quoi ? Elle utilise exactement cette technique ! Voici le Dockerfile réel (simplifié) :

```dockerfile
# ================================
# STAGE 1: Build the Astro app
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ================================
# STAGE 2: Serve with Nginx
# ================================
FROM nginx:alpine AS production

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Pourquoi ce choix ?

**Stage 1 : Builder (Node.js)**
- On a besoin de Node.js pour exécuter `npm run build`
- Astro compile nos fichiers `.astro`, `.md`, TypeScript, etc.
- Résultat : un dossier `dist/` avec du HTML/CSS/JS pur

**Stage 2 : Production (Nginx)**
- On n'a plus besoin de Node.js !
- Nginx sert les fichiers statiques ultra-rapidement
- Image finale : ~25 MB au lieu de ~400 MB

### Comparaison des tailles

```bash
# Si on avait gardé Node.js en production
FROM node:20-alpine  → ~400 MB + app = ~450 MB

# Avec Nginx uniquement
FROM nginx:alpine    → ~25 MB + app = ~35 MB

# Réduction : -92% ! 🚀
```

### Ce que ça signifie pour toi (l'utilisateur)

- **Chargement rapide** : Moins de données à télécharger du serveur
- **Déploiement éclair** : Le serveur récupère l'image en quelques secondes
- **Économies** : Sur un cloud, tu paies le stockage et la bande passante

**Message clé** : Cette technique est utilisée en production par des millions de projets. Ce n'est pas juste de la théorie, c'est un standard de l'industrie !

---

## 6.5 .dockerignore

### Le problème du contexte de build

Quand tu fais `docker build .`, Docker envoie **tout le contenu du dossier** au daemon Docker. C'est ce qu'on appelle le **build context**.

```bash
$ docker build .
Sending build context to Docker daemon  1.24GB
#                                       ^^^^^^^^
#                                       Tout ce qui est envoyé !
```

Si tu as un dossier `node_modules/` avec 300 MB de fichiers, Docker les envoie **tous**, même si tu ne les utilises jamais dans le Dockerfile !

### La solution : `.dockerignore`

C'est exactement comme `.gitignore`, mais pour Docker. Les fichiers matchés sont **exclus du build context**.

```bash
# .dockerignore
node_modules
npm-debug.log
.git
.env
.env.*
dist
coverage
.vscode
.idea
*.md
!README.md
.DS_Store
Thumbs.db
```

### Patterns expliqués

```bash
# Dossiers complets
node_modules        # Exclut tout node_modules/
dist                # Exclut dist/

# Extensions
*.log               # Tous les .log
*.md                # Tous les markdown
!README.md          # SAUF README.md (! = exception)

# Fichiers cachés/config
.git                # Pas besoin de l'historique Git
.env                # JAMAIS inclure les secrets
.env.*              # .env.local, .env.production, etc.

# IDE
.vscode             # Config VSCode
.idea               # Config IntelliJ/WebStorm

# Tests et coverage
coverage            # Rapports de tests
*.test.js           # Fichiers de tests
__tests__           # Dossier de tests
```

### Avant/Après avec .dockerignore

**Avant :**

```bash
$ ls -lh
total 1.2G
drwxr-xr-x  node_modules/   (350M)
drwxr-xr-x  .git/           (120M)
drwxr-xr-x  coverage/       (45M)
-rw-r--r--  src/            (2M)

$ docker build .
Sending build context... 1.24GB
Step 1/8: FROM node:18-alpine
Time: 45 seconds
```

**Après :**

```bash
$ cat .dockerignore
node_modules
.git
coverage

$ docker build .
Sending build context... 2.1MB
Step 1/8: FROM node:18-alpine
Time: 3 seconds
```

**Résultat :**
- Build context : 1.24 GB → 2.1 MB (**-99.8%**)
- Temps de build : 45s → 3s (**-93%**)

### Exemple complet pour un projet Node.js

```bash
# .dockerignore - Complete example

# Dependencies (will be reinstalled in Docker)
node_modules
bower_components

# Build outputs
dist
build
.next
.nuxt
out

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage
.nyc_output
*.test.js
*.spec.js
__tests__
__mocks__

# Environment files (SECURITY!)
.env
.env.*
!.env.example

# Version control
.git
.gitignore
.gitattributes

# IDE and editors
.vscode
.idea
*.swp
*.swo
*~
.DS_Store

# Documentation
*.md
!README.md
docs

# CI/CD
.github
.gitlab-ci.yml
.travis.yml

# Docker files (no need to include Docker files in Docker!)
Dockerfile
Dockerfile.*
docker-compose*.yml
.dockerignore
```

### Règle d'or

> Si tu ne `COPY` pas explicitement un fichier dans ton Dockerfile, il devrait probablement être dans `.dockerignore`.

---

## 6.6 Build arguments (ARG, --build-arg)

### ARG vs ENV : quelle différence ?

```dockerfile
ARG NODE_VERSION=18
#   ^^^^^^^^^^^^
#   Disponible PENDANT le build uniquement

ENV PORT=3000
#   ^^^^^^^^
#   Disponible pendant le build ET au runtime
```

**Tableau comparatif :**

| Caractéristique | `ARG` | `ENV` |
|----------------|-------|-------|
| Visible pendant le build | ✅ | ✅ |
| Visible au runtime (conteneur) | ❌ | ✅ |
| Peut être changé avec `docker build` | ✅ | ❌ |
| Persiste dans l'image | ❌ | ✅ |
| Utilisation | Versions, flags de build | Configuration runtime |

### Utilisation basique de ARG

```dockerfile
# Define build argument with default value
ARG NODE_VERSION=18
ARG NODE_ENV=production

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Use ARG in RUN commands
RUN echo "Building for environment: ${NODE_ENV}"

COPY package*.json ./

# Install dependencies based on environment
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --production; \
    else \
      npm ci; \
    fi

COPY . .

# Set as ENV if needed at runtime
ENV NODE_ENV=${NODE_ENV}

CMD ["npm", "start"]
```

**Build avec différentes valeurs :**

```bash
# Build avec les valeurs par défaut (NODE_VERSION=18, NODE_ENV=production)
$ docker build -t myapp:prod .

# Build avec Node.js 20
$ docker build -t myapp:node20 --build-arg NODE_VERSION=20 .

# Build pour développement
$ docker build -t myapp:dev --build-arg NODE_ENV=development .

# Combiner plusieurs arguments
$ docker build -t myapp:custom \
    --build-arg NODE_VERSION=20 \
    --build-arg NODE_ENV=staging .
```

### Exemple réel : builds dev vs prod

```dockerfile
# ================================
# Multi-environment Dockerfile
# ================================
ARG NODE_VERSION=20
ARG NODE_ENV=production

# ================================
# STAGE 1: Dependencies
# ================================
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install based on environment
RUN if [ "$NODE_ENV" = "production" ]; then \
      echo "📦 Installing production dependencies only..."; \
      npm ci --production; \
    else \
      echo "📦 Installing ALL dependencies (dev mode)..."; \
      npm ci; \
    fi

# ================================
# STAGE 2: Builder
# ================================
FROM node:${NODE_VERSION}-alpine AS builder

ARG NODE_ENV

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build with appropriate mode
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm run build:prod; \
    else \
      npm run build:dev; \
    fi

# ================================
# STAGE 3: Production Runtime
# ================================
FROM node:${NODE_VERSION}-alpine AS production

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY package*.json ./

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

**Utilisation :**

```bash
# Production (optimisé, minifié)
$ docker build -t myapp:prod \
    --build-arg NODE_ENV=production \
    --target production .
# → Petite image, code minifié

# Development (avec sourcemaps, debugging)
$ docker build -t myapp:dev \
    --build-arg NODE_ENV=development \
    --target production .
# → Plus grosse, mais debuggable

# Staging (mix des deux)
$ docker build -t myapp:staging \
    --build-arg NODE_ENV=staging .
```

### ARG avec scope

**Important** : `ARG` ne traverse pas automatiquement les stages !

```dockerfile
# ❌ INCORRECT
ARG NODE_VERSION=18

FROM node:${NODE_VERSION} AS builder
# NODE_VERSION est disponible ici ✅

FROM node:${NODE_VERSION}-alpine AS production
# NODE_VERSION n'est PAS disponible ici ❌
```

**✅ CORRECT :**

```dockerfile
ARG NODE_VERSION=18

FROM node:${NODE_VERSION} AS builder
# NODE_VERSION disponible ici

FROM node:${NODE_VERSION}-alpine AS production
ARG NODE_VERSION=18
# Redéclarer ARG pour ce stage
```

### Cas d'usage avancé : build pour différentes plateformes

```dockerfile
ARG TARGETPLATFORM
ARG BUILDPLATFORM

FROM --platform=${BUILDPLATFORM} node:20 AS builder

RUN echo "Building on ${BUILDPLATFORM} for ${TARGETPLATFORM}"

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM --platform=${TARGETPLATFORM} node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

**Build multi-platform :**

```bash
$ docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t myapp:multiarch .
# → Crée 2 images (Intel et ARM) en un seul build
```

---

## 6.7 Stratégies de cache

### Comment fonctionne le cache Docker

Docker construit les images **layer par layer** (couche par couche). Chaque instruction (`FROM`, `RUN`, `COPY`, etc.) crée une nouvelle layer.

**Règle d'or** : Si une layer n'a pas changé, Docker réutilise le cache. Dès qu'une layer change, **toutes les layers suivantes** sont reconstruites.

```dockerfile
FROM node:18-alpine          # Layer 1
WORKDIR /app                 # Layer 2
COPY . .                     # Layer 3 ⚠️
RUN npm install              # Layer 4 🐌
CMD ["npm", "start"]         # Layer 5
```

**Problème** : Si tu modifies un seul fichier de code, la layer 3 change, donc les layers 4 et 5 sont reconstruites. `npm install` se relance **à chaque fois** (lent !).

### ❌ Mauvaise stratégie (pas de cache)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy EVERYTHING first
COPY . .
# ⚠️ Dès que tu changes server.js, cette layer change !

# Install dependencies
RUN npm install
# 🐌 npm install se relance TOUJOURS (30-60 secondes)

CMD ["npm", "start"]
```

**Résultat :**

```bash
# Premier build
$ docker build -t app .
[+] Building 45.2s
 => CACHED [1/4] FROM node:18-alpine
 => [2/4] WORKDIR /app
 => [3/4] COPY . .                    2.1s
 => [4/4] RUN npm install            38.5s  🐌

# Change server.js, rebuild
$ docker build -t app .
[+] Building 42.8s
 => CACHED [1/4] FROM node:18-alpine
 => CACHED [2/4] WORKDIR /app
 => [3/4] COPY . .                    1.9s
 => [4/4] RUN npm install            37.2s  🐌 ENCORE !
```

### ✅ Bonne stratégie (cache optimisé)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Step 1: Copy ONLY dependency manifests
COPY package*.json ./
# 📦 Cette layer ne change que si package.json change

# Step 2: Install dependencies
RUN npm install
# ⚡ Cette layer est cachée tant que package.json ne change pas

# Step 3: Copy application code
COPY . .
# 📝 Seulement ici on copie le code qui change souvent

CMD ["npm", "start"]
```

**Résultat :**

```bash
# Premier build
$ docker build -t app .
[+] Building 43.1s
 => CACHED [1/5] FROM node:18-alpine
 => [2/5] WORKDIR /app
 => [3/5] COPY package*.json ./       0.1s
 => [4/5] RUN npm install            38.2s
 => [5/5] COPY . .                    1.8s

# Change server.js (pas package.json), rebuild
$ docker build -t app .
[+] Building 2.3s
 => CACHED [1/5] FROM node:18-alpine
 => CACHED [2/5] WORKDIR /app
 => CACHED [3/5] COPY package*.json ./ ⚡
 => CACHED [4/5] RUN npm install       ⚡ CACHE !
 => [5/5] COPY . .                    1.9s

# 🚀 43s → 2s (réduction de 95% !)
```

### Ordre optimal pour un projet Node.js

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 1️⃣ COPY dependency files FIRST (least frequently changed)
COPY package.json package-lock.json ./

# 2️⃣ INSTALL dependencies (cached if package.json unchanged)
RUN npm ci

# 3️⃣ COPY config files (occasionally changed)
COPY tsconfig.json ./
COPY .eslintrc.js ./

# 4️⃣ COPY source code LAST (most frequently changed)
COPY src/ ./src/

# 5️⃣ BUILD (re-run only if code/deps changed)
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Same principle: package.json first, then code
COPY package.json package-lock.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/server.js"]
```

### Visualisation du cache

```
┌─────────────────────────────────────────────────────┐
│  Fréquence de changement (du moins au plus fréquent) │
└─────────────────────────────────────────────────────┘

🟦 FROM node:18-alpine
   ↓ Change presque jamais (upgrade Node.js)

🟦 COPY package*.json
   ↓ Change 1-2 fois par semaine (nouvelles dépendances)

🟦 RUN npm install
   ↓ Recalculé seulement si package.json change

🟨 COPY tsconfig.json
   ↓ Change parfois (config TypeScript)

🟧 COPY src/
   ↓ Change TRÈS SOUVENT (chaque commit)

🟥 RUN npm run build
   ↓ Recalculé à chaque changement de code

PRINCIPE : Les layers qui changent rarement doivent être AU DÉBUT
           Les layers qui changent souvent doivent être À LA FIN
```

### Astuce : .dockerignore pour un cache encore meilleur

Si tu as des fichiers qui changent souvent mais qui n'affectent pas le build (tests, docs), exclus-les avec `.dockerignore` :

```bash
# .dockerignore
*.test.js
*.spec.js
__tests__
docs
README.md
.git
```

Comme ça, modifier un test ne va pas invalider la layer `COPY . .` !

### Stratégie avancée : cache mounts (BuildKit)

Docker BuildKit (activé par défaut depuis Docker 20.10) offre des cache mounts :

```dockerfile
# syntax=docker/dockerfile:1.4

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Mount npm cache from host
RUN --mount=type=cache,target=/root/.npm \
    npm install
# ⚡ Le cache npm persiste entre les builds !

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

**Avantage** : Même si `package.json` change, npm peut réutiliser une partie de son cache interne.

### Comparaison des temps de build

```
┌──────────────────────────────────────────────────────┐
│  Scénario : Modifier server.js et rebuild            │
├──────────────────────────────────────────────────────┤
│  ❌ Sans optimisation    : 43s                       │
│  ✅ Avec cache layers    : 2.3s  (-95%)             │
│  🚀 Avec cache mounts    : 1.8s  (-96%)             │
└──────────────────────────────────────────────────────┘
```

---

## 6.8 Exercice pratique

### Ton mission

Tu as hérité d'un projet avec un Dockerfile **horrible**. Ton job : le transformer en un Dockerfile optimisé en appliquant tout ce que tu as appris.

### Fichiers de départ

**server.js**

```javascript
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

app.use(compression());
app.use(helmet());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 },
    { id: 3, name: 'Keyboard', price: 79 }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**package.json**

```json
{
  "name": "product-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}
```

**Dockerfile (HORRIBLE - à optimiser)**

```dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
```

### Étape 1 : Créer .dockerignore

Crée un fichier `.dockerignore` pour exclure les fichiers inutiles.

**Ce qu'il devrait contenir :**

<details>
<summary>💡 Solution</summary>

```bash
node_modules
npm-debug.log
.git
.env
coverage
*.test.js
*.spec.js
README.md
.vscode
.idea
.DS_Store
```

</details>

### Étape 2 : Transformer en multi-stage

Modifie le Dockerfile pour utiliser :
1. **Stage builder** : avec `node:18` pour installer TOUTES les dépendances
2. **Stage production** : avec `node:18-alpine` pour seulement les dépendances de prod

**Contraintes :**
- Utilise `npm ci` au lieu de `npm install`
- Dans production, fais `npm ci --production`
- Ajoute un utilisateur non-root
- Optimise le cache (package.json avant le reste du code)

<details>
<summary>💡 Solution complète</summary>

```dockerfile
# ================================
# STAGE 1: Builder
# ================================
FROM node:18 AS builder

WORKDIR /app

# Copy dependency manifests for cache optimization
COPY package*.json ./

# Install ALL dependencies (dev + prod)
RUN npm ci

# Copy source code
COPY . .

# Run tests (optional but good practice)
RUN npm test

# ================================
# STAGE 2: Production
# ================================
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --production

# Copy application code
COPY --from=builder /app/server.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
```

</details>

### Étape 3 : Build et comparer

```bash
# Build l'ancienne version
$ docker build -t product-api:old -f Dockerfile.old .

# Build la nouvelle version
$ docker build -t product-api:new .

# Comparer les tailles
$ docker images | grep product-api

REPOSITORY      TAG    SIZE
product-api     new    182 MB  ✅
product-api     old    1.14 GB ❌
```

**Calcule la réduction :**

```
Réduction = (1140 MB - 182 MB) / 1140 MB × 100
          = 84%
```

### Étape 4 : Tester

```bash
# Lance le conteneur
$ docker run -p 3000:3000 product-api:new

# Dans un autre terminal, teste l'API
$ curl http://localhost:3000/health
{"status":"healthy","uptime":5.2,"timestamp":1704654321000}

$ curl http://localhost:3000/api/products
[{"id":1,"name":"Laptop","price":999}, ...]
```

### Étape 5 : Analyser les layers

```bash
# Voir les layers du Dockerfile
$ docker history product-api:new

IMAGE          CREATED BY                                      SIZE
abc123def456   CMD ["node" "server.js"]                        0B
abc123def456   HEALTHCHECK ...                                 0B
abc123def456   EXPOSE 3000                                     0B
abc123def456   USER nodejs                                     0B
abc123def456   RUN addgroup ...                                4.6kB
abc123def456   COPY --from=builder /app/server.js ./           2.1kB
abc123def456   RUN npm ci --production                         15.2MB
abc123def456   COPY package*.json ./                           1.8kB
abc123def456   WORKDIR /app                                    0B
abc123def456   FROM node:18-alpine                             167MB
```

**Questions à te poser :**
- Quelle layer est la plus grosse ? → `node:18-alpine` (167 MB)
- Quelle layer change le plus souvent ? → `COPY server.js` (ton code)
- Le cache est-il bien optimisé ? → Oui, `package.json` est copié avant le code

### Bonus : Utiliser ARG pour des builds flexibles

Modifie ton Dockerfile pour accepter `NODE_ENV` :

```dockerfile
ARG NODE_ENV=production

FROM node:18 AS builder

ARG NODE_ENV

WORKDIR /app
COPY package*.json ./

# Install based on environment
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci; \
    else \
      npm ci && npm install; \
    fi

COPY . .

# Only run tests in production builds
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm test; \
    fi

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/server.js ./

ENV NODE_ENV=${NODE_ENV}

USER node

EXPOSE 3000
CMD ["node", "server.js"]
```

**Build pour différents environnements :**

```bash
# Production (avec tests)
$ docker build -t product-api:prod \
    --build-arg NODE_ENV=production .

# Development (sans tests, plus rapide)
$ docker build -t product-api:dev \
    --build-arg NODE_ENV=development .
```

---

## Récapitulatif

### Ce que tu as appris

✅ **Pourquoi les images sont trop lourdes**
- devDependencies, outils de build, cache, fichiers sources inutiles

✅ **Multi-stage builds**
- Plusieurs `FROM` dans un seul Dockerfile
- Seul le dernier stage devient l'image finale
- Copier sélectivement avec `COPY --from=`

✅ **Images Alpine**
- `node:18` (1.09 GB) vs `node:18-alpine` (180 MB)
- Distribution Linux ultra-minimaliste

✅ **.dockerignore**
- Exclut les fichiers du build context
- Réduit le temps de build et la taille des layers

✅ **ARG vs ENV**
- `ARG` : variables pendant le build uniquement
- `ENV` : variables au runtime
- `--build-arg` pour passer des valeurs custom

✅ **Optimisation du cache**
- Copier `package.json` AVANT le code
- Ordre des layers : du moins changeant au plus changeant
- Cache mounts avec BuildKit

### Avant/Après en chiffres

```
┌───────────────────────────────────────────────┐
│  IMPACT DES OPTIMISATIONS                     │
├───────────────────────────────────────────────┤
│  Taille image     : 1.14 GB → 182 MB (-84%)  │
│  Build time       : 45s → 2s (-95%)           │
│  Deploy time      : 10 min → 30s (-95%)      │
│  Stockage (10 apps) : 11 GB → 1.8 GB         │
└───────────────────────────────────────────────┘
```

### Checklist de l'image optimale

Avant de déployer une image, vérifie :

- [ ] Multi-stage build utilisé
- [ ] Image Alpine ou distroless en production
- [ ] `.dockerignore` configuré
- [ ] Seulement les dépendances de prod (`npm ci --production`)
- [ ] Pas de fichiers de build/tests dans l'image finale
- [ ] Utilisateur non-root
- [ ] Cache optimisé (package.json copié en premier)
- [ ] Healthcheck configuré
- [ ] Variables sensibles via ARG/ENV (pas hardcodées)

### Commandes utiles à retenir

```bash
# Voir la taille des images
docker images

# Analyser les layers
docker history <image>

# Build avec arguments
docker build --build-arg NODE_ENV=prod -t app .

# Voir le build context envoyé
docker build --progress=plain .

# Build uniquement un stage spécifique
docker build --target builder -t app:builder .

# Nettoyer le cache
docker builder prune
```

---

## Ressources pour aller plus loin

- 📖 [Documentation officielle - Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- 📖 [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- 🎥 [Docker BuildKit: Advanced features](https://docs.docker.com/build/buildkit/)
- 🔧 [Dive - Outil pour analyser les layers](https://github.com/wagoodman/dive)

---

**Bravo !** Tu maîtrises maintenant l'art du multi-stage build. Tu peux créer des images Docker ultra-optimisées qui se déploient en quelques secondes au lieu de plusieurs minutes. C'est une compétence que tu utiliseras dans **tous** tes projets Docker professionnels ! 🚀
