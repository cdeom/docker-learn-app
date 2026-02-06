---
title: "CI/CD avec GitHub Actions"
description: "Automatiser le build et le deploiement de ses images Docker"
order: 11
duration: "40 min"
icon: "🚀"
xpReward: 350
objectives:
  - "Comprendre les principes CI/CD"
  - "Creer un workflow GitHub Actions pour Docker"
  - "Automatiser le build et le push d'images"
---

# CI/CD avec GitHub Actions

Bienvenue dans le module sur l'automatisation ! Tu vas apprendre à faire travailler les robots à ta place pour builder et déployer tes images Docker automatiquement.

## 11.1 C'est quoi CI/CD ?

Imagine que tu dois construire ton image Docker à chaque fois que tu modifies ton code. Tu dois :
1. Tester ton code
2. Builder l'image
3. La pousser sur Docker Hub
4. La déployer sur ton serveur

C'est long, répétitif, et tu peux oublier une étape. Le CI/CD automatise tout ça !

### Les trois piliers

**Continuous Integration (CI)** : À chaque push, on teste automatiquement le code.
- Lance les tests
- Vérifie le code (lint)
- S'assure que tout compile

**Continuous Delivery (CD)** : Si les tests passent, on déploie automatiquement en staging (environnement de test).
- Build automatique de l'image
- Push sur un registry
- Déploiement sur un environnement de test

**Continuous Deployment** : On va jusqu'à déployer en production automatiquement.
- Déploiement automatique après validation
- Mise à jour sans intervention humaine

### Le pipeline visualisé

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Code   │────▶│   Test   │────▶│  Build   │────▶│   Push   │────▶│  Deploy  │
│  commit  │     │  & lint  │     │  Docker  │     │  Docker  │     │  Server  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                 │                 │                 │                 │
     │                 ├─ ❌ STOP        │                 │                 │
     │                 └─ ✅ Continue ───┘                 │                 │
     │                                                      │                 │
     └──────────────────────────────────────────────────────┴─────────────────┘
                           Tout automatique ! 🎉
```

Si une étape échoue, le pipeline s'arrête. Pas de déploiement d'un code cassé !

### Pourquoi c'est génial ?

- **Gain de temps** : Plus besoin de tout faire manuellement
- **Moins d'erreurs** : Les machines ne se trompent pas
- **Feedback rapide** : Tu sais en 2 minutes si ton code est cassé
- **Confiance** : Tu peux déployer sans stress

## 11.2 GitHub Actions : Les bases

GitHub Actions, c'est l'outil CI/CD intégré à GitHub. Pas besoin d'installer quoi que ce soit !

### Anatomie d'un workflow

Un **workflow**, c'est un fichier YAML dans `.github/workflows/` qui décrit les étapes à automatiser.

```
.github/
└── workflows/
    ├── docker.yml     ← Workflow Docker
    └── tests.yml      ← Workflow tests
```

Un workflow contient :

**1. Trigger** : Quand lancer le workflow ?
```yaml
on:
  push:              # À chaque push
    branches: [main] # Uniquement sur la branche main
  pull_request:      # Ou quand on ouvre une PR
```

**2. Jobs** : Les tâches à exécuter (peuvent tourner en parallèle)
```yaml
jobs:
  build:             # Nom du job
    runs-on: ubuntu-latest  # Machine virtuelle à utiliser
```

**3. Steps** : Les étapes du job (s'exécutent dans l'ordre)
```yaml
    steps:
      - name: Checkout code      # Étape 1
        uses: actions/checkout@v4

      - name: Say hello          # Étape 2
        run: echo "Hello!"
```

### Ton premier workflow

Créons un workflow simple pour comprendre :

```yaml
# .github/workflows/hello.yml
name: Hello World

# Trigger: à chaque push
on: [push]

jobs:
  greet:
    # Utilise une machine Ubuntu
    runs-on: ubuntu-latest

    steps:
      # Étape 1: récupère le code
      - name: Checkout repository
        uses: actions/checkout@v4

      # Étape 2: dit bonjour
      - name: Say hello
        run: echo "Hello from GitHub Actions! 👋"

      # Étape 3: affiche la date
      - name: Show date
        run: date
```

Quand tu push ce fichier, GitHub lance automatiquement le workflow. Tu peux voir les résultats dans l'onglet "Actions" de ton repo !

### Vocabulaire important

- **Runner** : La machine virtuelle qui exécute le workflow (ubuntu-latest, windows-latest, macos-latest)
- **Action** : Un bloc réutilisable (`uses: actions/checkout@v4`)
- **Run** : Une commande shell à exécuter (`run: echo "Hello"`)
- **Artifact** : Un fichier produit par le workflow (image Docker, fichier ZIP...)

## 11.3 Builder une image Docker en CI

Maintenant, on passe aux choses sérieuses : builder une image Docker automatiquement !

### La recette de base

Pour builder une image Docker dans GitHub Actions, tu as besoin de :

1. **Récupérer le code** avec `actions/checkout`
2. **Configurer Docker** avec `docker/setup-buildx-action`
3. **Builder l'image** avec `docker/build-push-action`

### Workflow minimal

```yaml
# .github/workflows/docker-build.yml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # Step 1: Get the code
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Set up Docker Buildx (advanced builder)
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Step 3: Build the image
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .              # Directory with Dockerfile
          push: false             # Don't push yet, just build
          tags: myapp:latest      # Image name and tag
```

### Explication détaillée

**Buildx, c'est quoi ?**

Docker Buildx est une version améliorée du builder classique. Il permet :
- De builder pour plusieurs plateformes (ARM, x86)
- De mettre en cache les layers pour aller plus vite
- D'utiliser des fonctionnalités avancées du Dockerfile

**Les options de build-push-action**

```yaml
uses: docker/build-push-action@v5
with:
  context: .                    # Where is the Dockerfile?
  file: ./Dockerfile            # Custom Dockerfile path (optional)
  push: false                   # Push to registry?
  tags: |                       # Image tags (can be multiple)
    myapp:latest
    myapp:1.0.0
  cache-from: type=gha          # Use GitHub Actions cache
  cache-to: type=gha,mode=max   # Save cache for next run
```

### Tester le build

À chaque push sur `main`, GitHub va :
1. Créer une machine Ubuntu
2. Récupérer ton code
3. Builder ton image Docker
4. Te dire si ça a marché (✅) ou échoué (❌)

Si le build échoue, tu reçois un email et tu peux voir les logs dans l'onglet Actions.

## 11.4 Push automatique sur Docker Hub

Builder c'est bien, mais on veut aussi publier l'image sur Docker Hub automatiquement !

### Étape 1 : Créer un token Docker Hub

Va sur [Docker Hub](https://hub.docker.com) :
1. Clique sur ton avatar → **Account Settings**
2. Onglet **Security** → **New Access Token**
3. Nom : `github-actions`, Permissions : **Read, Write, Delete**
4. Copie le token (tu ne pourras plus le revoir !)

### Étape 2 : Ajouter le token dans GitHub Secrets

Dans ton repo GitHub :
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name : `DOCKERHUB_USERNAME`, Secret : ton username Docker Hub
4. **New repository secret**
5. Name : `DOCKERHUB_TOKEN`, Secret : le token copié

Les secrets sont encryptés et jamais affichés dans les logs. Parfait pour les credentials !

### Étape 3 : Se connecter à Docker Hub

```yaml
# .github/workflows/docker-push.yml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # New: Login to Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Build AND push
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true                          # Now we push!
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
```

### Syntaxe des secrets

`${{ secrets.NOM_DU_SECRET }}` permet d'accéder aux secrets GitHub. Dans les logs, ils sont remplacés par `***` pour la sécurité.

### Tagger intelligemment

Au lieu de juste `latest`, on peut créer plusieurs tags :

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
      ${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ github.sha }}
      ${{ secrets.DOCKERHUB_USERNAME }}/myapp:1.0.0
```

**Explication des tags** :
- `latest` : Toujours la dernière version
- `${{ github.sha }}` : Hash du commit Git (traçabilité parfaite !)
- `1.0.0` : Version sémantique (tu peux lire ça depuis package.json)

### Push conditionnel

Parfois, tu veux builder sur toutes les branches, mais pusher uniquement sur `main` :

```yaml
on:
  push:                     # Build on all branches
  pull_request:             # And on PRs

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        # Only login if we're on main
        if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          # Push only on main branch
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
```

La condition `if: github.ref == 'refs/heads/main'` vérifie qu'on est bien sur la branche main.

## 11.5 Multi-platform builds

Ton Mac M1 utilise une puce ARM. Ton serveur Linux utilise du x86. Comment faire une image qui marche partout ?

### Le problème

Une image Docker buildée sur ARM ne fonctionne pas sur x86, et vice-versa. C'est comme essayer de lire un DVD sur un lecteur Blu-ray.

### La solution : Multi-platform builds

Docker Buildx peut créer **une seule image** qui contient les versions ARM **et** x86 !

```
                    ┌─────────────────┐
                    │  Docker Image   │
                    │  myapp:latest   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼──────┐          ┌──────▼──────┐
         │ linux/amd64 │          │ linux/arm64 │
         │   (x86)     │          │   (ARM)     │
         └─────────────┘          └─────────────┘
```

Quand tu `docker pull`, Docker télécharge automatiquement la bonne version pour ton système.

### Setup QEMU et Buildx

QEMU est un émulateur qui permet de builder pour d'autres architectures. Setup complet :

```yaml
# .github/workflows/docker-multiplatform.yml
name: Multi-platform Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 1: Set up QEMU (emulator for ARM)
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      # Step 2: Set up Buildx with multi-platform support
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Step 3: Build for multiple platforms
      - name: Build and push multi-platform
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64   # AMD64 (x86) + ARM64
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
```

### Plateformes disponibles

Les plus courantes :
- `linux/amd64` : Serveurs Intel/AMD, PC Windows/Linux
- `linux/arm64` : Raspberry Pi 4, Mac M1/M2/M3, serveurs ARM
- `linux/arm/v7` : Raspberry Pi 3 et anciens
- `windows/amd64` : Windows Server (rare)

Tu peux en spécifier autant que tu veux, séparées par des virgules.

### Pourquoi c'est plus long ?

Builder pour plusieurs plateformes prend du temps (2-3x plus long) car il faut :
1. Émuler l'architecture avec QEMU
2. Compiler les binaires pour chaque plateforme
3. Créer les layers pour chaque plateforme

Mais ça en vaut la peine : ton image fonctionne partout !

## 11.6 Workflow complet

Maintenant, on assemble tout : tests, lint, build, push. Le workflow de pro !

### Workflow production-ready

```yaml
# .github/workflows/docker.yml
name: Docker CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  # Also trigger on tags for releases
  tags:
    - 'v*'

env:
  # Environment variables for all jobs
  DOCKER_IMAGE: ${{ secrets.DOCKERHUB_USERNAME }}/myapp
  NODE_VERSION: '20'

jobs:
  # Job 1: Run tests and linting
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]  # Test on multiple Node versions

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

  # Job 2: Build and push Docker image
  build-and-push:
    runs-on: ubuntu-latest
    # Only run if tests pass
    needs: test
    # Only push on main branch
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Extract version from package.json
      - name: Get version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      # Generate Docker tags
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      # Build and push
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ steps.version.outputs.VERSION }}
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}

      # Add summary
      - name: Job summary
        run: |
          echo "### 🚀 Docker image built successfully!" >> $GITHUB_STEP_SUMMARY
          echo "**Image:** \`${{ env.DOCKER_IMAGE }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Tags:** ${{ steps.meta.outputs.tags }}" >> $GITHUB_STEP_SUMMARY
          echo "**Platforms:** linux/amd64, linux/arm64" >> $GITHUB_STEP_SUMMARY
```

### Décortiquons ce workflow

**1. Strategy Matrix**
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```
Lance le job 3 fois en parallèle avec Node 18, 20 et 22. Pratique pour tester la compatibilité !

**2. Job Dependencies**
```yaml
needs: test
```
Le job `build-and-push` attend que `test` soit terminé avec succès.

**3. Docker Metadata**
```yaml
uses: docker/metadata-action@v5
```
Génère automatiquement des tags intelligents :
- `main` pour les commits sur main
- `1.2.3` pour le tag git `v1.2.3`
- `main-abc1234` pour le commit `abc1234` sur main

**4. Build Args**
```yaml
build-args: |
  VERSION=${{ steps.version.outputs.VERSION }}
  BUILD_DATE=${{ github.event.head_commit.timestamp }}
```
Passe des variables au Dockerfile :
```dockerfile
ARG VERSION
ARG BUILD_DATE
LABEL version=$VERSION build_date=$BUILD_DATE
```

**5. Cache GitHub Actions**
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```
Utilise le cache GitHub pour accélérer les builds. La première fois prend 5 minutes, les suivantes 30 secondes !

**6. Job Summary**
```yaml
echo "### 🚀 Docker image built!" >> $GITHUB_STEP_SUMMARY
```
Ajoute un résumé visuel dans l'interface GitHub Actions. Classe !

### Workflow pour les tags

Si tu veux déployer uniquement quand tu crées un tag git :

```yaml
on:
  push:
    tags:
      - 'v*'    # Triggers on v1.0.0, v2.1.3, etc.

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      # ... build and push ...

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

Commande pour créer un tag :
```bash
git tag v1.0.0
git push origin v1.0.0
```

Boom, release automatique ! 🎉

## 11.7 Badges de status

Tu veux afficher fièrement que ton build fonctionne ? Ajoute un badge !

### Badge GitHub Actions

Le badge affiche l'état du dernier workflow :
- ✅ Passing (vert) : tout va bien
- ❌ Failing (rouge) : il y a un problème
- ⚫ No status (gris) : jamais lancé

### Syntaxe du badge

```markdown
![Docker Build](https://github.com/USERNAME/REPO/actions/workflows/WORKFLOW.yml/badge.svg)
```

Remplace :
- `USERNAME` : ton nom d'utilisateur GitHub
- `REPO` : le nom de ton repository
- `WORKFLOW.yml` : le nom du fichier workflow (ex: `docker.yml`)

### Exemple dans README.md

```markdown
# Mon Super Projet 🚀

![Docker Build](https://github.com/johndoe/myapp/actions/workflows/docker.yml/badge.svg)
![Tests](https://github.com/johndoe/myapp/actions/workflows/tests.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Une application Docker géniale qui fait des trucs cool !

## Installation

\`\`\`bash
docker pull johndoe/myapp:latest
docker run -p 3000:3000 johndoe/myapp
\`\`\`
```

### Badges pour une branche spécifique

Par défaut, le badge affiche l'état de la branche par défaut (main). Pour une autre branche :

```markdown
![Build](https://github.com/USERNAME/REPO/actions/workflows/docker.yml/badge.svg?branch=develop)
```

### Autres badges utiles

**Docker Hub**
```markdown
![Docker Pulls](https://img.shields.io/docker/pulls/USERNAME/IMAGE)
![Docker Image Size](https://img.shields.io/docker/image-size/USERNAME/IMAGE)
```

**Shields.io**

[Shields.io](https://shields.io) propose des milliers de badges personnalisables :

```markdown
![Node Version](https://img.shields.io/badge/node-20.x-green)
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
```

Les badges, c'est comme les stickers sur ton laptop : ça montre que tu es sérieux !

## 11.8 Bonnes pratiques CI/CD

Des conseils pour avoir un workflow rapide, sécurisé et maintenable.

### 1. Garde le workflow rapide

**Problème** : Un workflow qui prend 30 minutes, personne ne l'attend.

**Solutions** :
```yaml
# Use cache for dependencies
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'        # Cache node_modules

# Use GitHub Actions cache for Docker layers
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max

# Run jobs in parallel
jobs:
  test-unit:
    # ...
  test-e2e:
    # ...
  lint:
    # ...
```

**Objectif** : Moins de 5 minutes pour un build complet.

### 2. Utilise des versions spécifiques

**Mauvais** ❌
```yaml
uses: actions/checkout@main  # Version instable !
```

**Bon** ✅
```yaml
uses: actions/checkout@v4  # Version stable
```

Encore mieux avec le SHA exact :
```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

Pourquoi ? Si l'action est compromise, ton workflow reste sécurisé.

### 3. Gère les secrets correctement

**Jamais ça** ❌
```yaml
run: echo "Mon token: ${{ secrets.TOKEN }}"  # Visible dans les logs !
```

**Toujours ça** ✅
```yaml
# Use secrets in action inputs (automatically masked)
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

# Or pass as environment variable
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: ./deploy.sh
```

GitHub masque automatiquement les secrets dans les logs (`***`), mais seulement s'ils sont utilisés correctement.

### 4. Limite les déclenchements

**Évite ça** ❌
```yaml
on: [push]  # Tous les commits de toutes les branches !
```

**Préfère ça** ✅
```yaml
on:
  push:
    branches: [main, develop]      # Only important branches
    paths-ignore:                  # Skip if only docs changed
      - '**.md'
      - 'docs/**'
  pull_request:
    branches: [main]
```

Moins de builds = moins de temps d'attente et moins de ressources consommées.

### 5. Protège tes branches

Dans GitHub : **Settings → Branches → Add rule**

Règles recommandées pour `main` :
- ☑️ Require a pull request before merging
- ☑️ Require status checks to pass before merging
  - Sélectionne tes jobs (test, build)
- ☑️ Require branches to be up to date
- ☑️ Do not allow bypassing the above settings

Résultat : Impossible de merger si les tests échouent. Safety first !

### 6. Utilise des environnements

Pour gérer staging vs production :

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: ./deploy.sh staging

  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    needs: deploy-staging
    steps:
      - name: Deploy to production
        run: ./deploy.sh production
```

Dans **Settings → Environments**, tu peux configurer :
- Des secrets spécifiques (clés API différentes)
- Des reviewers obligatoires avant déploiement prod
- Des timers de protection

### 7. Nettoie les anciennes images

Docker Hub a des limites de stockage. Nettoie régulièrement :

```yaml
# .github/workflows/cleanup.yml
name: Cleanup old images

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2am

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete old images
        uses: snok/container-retention-policy@v2
        with:
          image-names: myapp
          cut-off: 1 week ago
          keep-at-least: 3
          account-type: personal
          token: ${{ secrets.DOCKERHUB_TOKEN }}
```

### 8. Monitore tes workflows

Utilise des outils pour surveiller la santé de tes workflows :

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    text: 'Build failed! 🔥'
```

Ou avec Discord, Teams, email, etc.

### Checklist CI/CD

Avant de pousser en production, vérifie :

- [ ] Les secrets sont dans GitHub Secrets (pas dans le code)
- [ ] Le workflow utilise le cache (npm, Docker layers)
- [ ] Les branches importantes sont protégées
- [ ] Le workflow ne se déclenche que sur les bonnes branches
- [ ] Les versions des actions sont fixées (`@v4`, pas `@main`)
- [ ] Multi-platform build si nécessaire
- [ ] Les tests passent avant le push
- [ ] Un système de notification en cas d'échec
- [ ] Nettoyage régulier des anciennes images

## 11.9 Exercice pratique

À toi de jouer ! On va créer un workflow complet pour ton projet.

### Contexte

Tu as une app Node.js avec un Dockerfile. Tu veux :
1. Lancer les tests à chaque push
2. Builder l'image Docker
3. La pousser sur Docker Hub uniquement sur `main`
4. Builder pour ARM et x86
5. Ajouter un badge dans le README

### Étape 1 : Prépare ton projet

Structure attendue :
```
myapp/
├── .github/
│   └── workflows/
│       └── docker.yml       ← À créer
├── src/
│   └── app.js
├── Dockerfile
├── package.json
└── README.md
```

### Étape 2 : Crée le Dockerfile

Si tu n'en as pas déjà un :

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "src/app.js"]
```

### Étape 3 : Ajoute des scripts dans package.json

```json
{
  "name": "myapp",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/app.js",
    "test": "echo 'Running tests...' && exit 0",
    "lint": "echo 'Linting code...' && exit 0"
  }
}
```

(Remplace les `echo` par de vrais tests si tu en as !)

### Étape 4 : Configure Docker Hub

1. Crée un compte sur [Docker Hub](https://hub.docker.com)
2. Crée un **Access Token** (Account Settings → Security)
3. Dans ton repo GitHub → **Settings → Secrets → Actions**
4. Ajoute deux secrets :
   - `DOCKERHUB_USERNAME` : ton username
   - `DOCKERHUB_TOKEN` : le token

### Étape 5 : Crée le workflow

Fichier `.github/workflows/docker.yml` :

```yaml
name: Docker CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DOCKER_IMAGE: ${{ secrets.DOCKERHUB_USERNAME }}/myapp

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm test

  build-and-push:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ${{ env.DOCKER_IMAGE }}:latest
            ${{ env.DOCKER_IMAGE }}:${{ steps.version.outputs.VERSION }}
            ${{ env.DOCKER_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Summary
        run: |
          echo "### ✅ Docker image pushed!" >> $GITHUB_STEP_SUMMARY
          echo "**Image:** \`${{ env.DOCKER_IMAGE }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Tags:** latest, ${{ steps.version.outputs.VERSION }}, ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
```

### Étape 6 : Ajoute le badge

Dans ton `README.md` :

```markdown
# Mon App Docker 🐳

![Docker Build](https://github.com/TON_USERNAME/myapp/actions/workflows/docker.yml/badge.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/TON_USERNAME/myapp)

Une application Node.js Dockerisée avec CI/CD automatique.

## Installation

\`\`\`bash
docker pull TON_USERNAME/myapp:latest
docker run -p 3000:3000 TON_USERNAME/myapp
\`\`\`

## Développement

\`\`\`bash
npm install
npm run dev
\`\`\`
```

Remplace `TON_USERNAME` par ton vrai username !

### Étape 7 : Teste !

```bash
git add .
git commit -m "feat: add Docker CI/CD workflow"
git push origin main
```

Va sur GitHub → onglet **Actions**. Tu devrais voir ton workflow se lancer !

### Vérifications

✅ Le workflow se lance automatiquement
✅ Les tests passent (job `test`)
✅ L'image se build (job `build-and-push`)
✅ L'image est poussée sur Docker Hub
✅ Le badge dans le README affiche "passing"

### Bonus : Déploiement sur tag

Ajoute ce workflow pour déployer uniquement sur les versions taggées :

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract tag name
        id: tag
        run: echo "TAG=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Build and push release
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ steps.tag.outputs.TAG }}
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
```

Créer une release :
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Défi supplémentaire

Pour aller plus loin, essaie d'ajouter :

1. **Security scan** : Scanne les vulnérabilités avec Trivy
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.DOCKER_IMAGE }}:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
```

2. **Image signature** : Signe tes images avec Cosign

3. **Deploy to staging** : Déploie automatiquement sur un serveur de test

4. **Notifications Slack/Discord** : Envoie un message quand le build réussit

## Récapitulatif

Tu as appris à :

✅ **Comprendre CI/CD** : Integration, Delivery, Deployment
✅ **GitHub Actions** : Workflows, jobs, steps, triggers
✅ **Builder en CI** : Automatiser le build Docker
✅ **Pusher sur Docker Hub** : Authentification avec secrets
✅ **Multi-platform** : Images ARM + x86 avec Buildx
✅ **Workflow complet** : Tests, build, push, cache
✅ **Badges** : Afficher le statut du build
✅ **Bonnes pratiques** : Sécurité, performance, monitoring

### Prochaines étapes

1. **Terraform/Pulumi** : Infrastructure as Code pour déployer automatiquement
2. **Kubernetes** : Orchestration de conteneurs à grande échelle
3. **ArgoCD/Flux** : GitOps pour le déploiement continu
4. **Monitoring** : Prometheus, Grafana pour surveiller tes apps

### Ressources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build-Push Action](https://github.com/docker/build-push-action)
- [Awesome GitHub Actions](https://github.com/sdras/awesome-actions)
- [CI/CD Best Practices](https://github.com/microsoft/code-with-engineering-playbook)

Félicitations ! Tu maîtrises maintenant l'art de l'automatisation. Tes images Docker se buildent et se déploient toutes seules pendant que tu dors. Le futur, c'est maintenant ! 🚀

**+350 XP débloqués !** Tu es maintenant un DevOps Apprentice.
