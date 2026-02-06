---
title: "Docker Hub et Registries"
description: "Publier et partager ses images Docker"
order: 10
duration: "25 min"
icon: "📦"
xpReward: 200
objectives:
  - "Comprendre Docker Hub et les registries"
  - "Maitriser le tagging et le push d'images"
  - "Decouvrir les registries prives"
---

# Docker Hub et Registries

Maintenant que tu sais créer des images Docker, il est temps d'apprendre à les partager avec le monde entier. C'est là que Docker Hub entre en jeu.

## 10.1 C'est quoi Docker Hub ?

Docker Hub, c'est un peu comme GitHub mais pour les images Docker. C'est le **registry public** par défaut où tout le monde peut publier et télécharger des images.

### Le concept

Quand tu fais `docker pull nginx`, Docker va chercher l'image sur Docker Hub automatiquement. C'est là que se trouvent :

- **Les images officielles** : nginx, python, node, postgres, etc.
- **Les images communautaires** : créées par des développeurs du monde entier
- **Tes propres images** : que tu vas apprendre à publier

### Explorer Docker Hub

Va sur [hub.docker.com](https://hub.docker.com) et regarde autour de toi :

- **Stars** : comme sur GitHub, ça montre la popularité
- **Pulls** : le nombre de téléchargements (ex: nginx a des milliards de pulls)
- **Verified Publishers** : badge bleu = éditeur vérifié par Docker
- **Official Images** : badge "Official" = maintenu par Docker Inc. ou l'éditeur officiel

```bash
# Search for images from the command line
docker search nginx

# Get detailed info
docker search --filter=is-official=true nginx
```

### Images officielles vs communautaires

Les images officielles sont dans le namespace `library/` :
- `library/nginx` (ou juste `nginx`)
- `library/python`
- `library/node`

Les images communautaires ont un username :
- `bitnami/nginx`
- `johnwick/myapp`
- `entreprise/api`

## 10.2 Nommage des images

Le nommage des images Docker suit une structure précise. Comprends-la bien, car c'est crucial.

### Le format complet

```
[registry]/[namespace]/[repository]:[tag]
```

Décomposons :

1. **registry** : l'adresse du registry (par défaut : `docker.io`)
2. **namespace** : ton username ou organization
3. **repository** : le nom de ton image
4. **tag** : la version ou variante

### Exemples concrets

```bash
# Format minimal (defaults implicites)
nginx
# → équivaut à: docker.io/library/nginx:latest

# Avec un tag spécifique
nginx:1.25-alpine
# → équivaut à: docker.io/library/nginx:1.25-alpine

# Avec ton username
johnwick/myapp
# → équivaut à: docker.io/johnwick/myapp:latest

# Nom complet avec version
johnwick/myapp:v1.0.0
# → docker.io/johnwick/myapp:v1.0.0

# Autre registry (Google Container Registry)
gcr.io/myproject/api:prod
```

### Le tag `latest`

Le tag `latest` est **automatiquement ajouté** si tu n'en spécifies pas. Mais attention, c'est un piège :

```bash
# Ces deux commandes sont identiques
docker pull nginx
docker pull nginx:latest

# latest ne signifie PAS "la dernière version"
# C'est juste le tag par défaut !
```

Le tag `latest` ne veut pas dire "la plus récente version". C'est juste une convention. Si quelqu'un oublie de mettre à jour le tag `latest`, tu peux avoir une vieille version.

**Best practice** : toujours utiliser des tags de version explicites en production.

## 10.3 Login et authentification

Pour publier tes images, tu dois d'abord créer un compte et te connecter.

### Créer un compte

1. Va sur [hub.docker.com](https://hub.docker.com)
2. Clique sur "Sign Up"
3. Choisis un username (tu l'utiliseras dans tes images)
4. Vérifie ton email

### Se connecter

```bash
# Login classique (demande ton mot de passe)
docker login

# Login with specific username
docker login -u tonusername

# Login to another registry
docker login registry.example.com
```

Tu verras :

```
Login with your Docker ID to push and pull images from Docker Hub.
Username: tonusername
Password:
Login Succeeded
```

### Access Tokens (recommandé)

Plutôt que ton mot de passe, utilise des **access tokens** (comme sur GitHub) :

1. Va dans Account Settings > Security
2. Clique sur "New Access Token"
3. Donne-lui un nom (ex: "mon-laptop")
4. Copie le token (tu ne le reverras plus)

```bash
docker login -u tonusername
# Colle le token au lieu du mot de passe
```

**Pourquoi c'est mieux ?**
- Tu peux révoquer un token sans changer ton mot de passe
- Tu peux créer des tokens avec des permissions limitées
- Plus sécurisé pour les scripts et CI/CD

### Se déconnecter

```bash
docker logout

# Logout from specific registry
docker logout registry.example.com
```

Tes credentials sont stockés dans `~/.docker/config.json`. Sois prudent avec ce fichier.

## 10.4 Strategies de tagging

Le tagging, c'est un art. Une bonne stratégie de tags rend tes images faciles à utiliser et à maintenir.

### Semantic Versioning (SemVer)

C'est la méthode la plus répandue : `MAJOR.MINOR.PATCH`

```bash
# Version complète
myapp:1.2.3

# Version majeure + mineure
myapp:1.2

# Version majeure seulement
myapp:1

# Latest (pointe vers la dernière version stable)
myapp:latest
```

**Stratégie multi-tags** : un même build peut avoir plusieurs tags

```bash
# Build ton image
docker build -t tonusername/myapp:1.2.3 .

# Ajoute les tags alternatifs
docker tag tonusername/myapp:1.2.3 tonusername/myapp:1.2
docker tag tonusername/myapp:1.2.3 tonusername/myapp:1
docker tag tonusername/myapp:1.2.3 tonusername/myapp:latest

# Push tous les tags
docker push tonusername/myapp:1.2.3
docker push tonusername/myapp:1.2
docker push tonusername/myapp:1
docker push tonusername/myapp:latest
```

**Avantage** : les utilisateurs peuvent choisir leur niveau de précision :
- `myapp:1` → auto-update des minor et patch
- `myapp:1.2` → auto-update des patches
- `myapp:1.2.3` → version fixe, jamais de surprise

### Git SHA tags

Pour la traçabilité, tag avec le commit Git :

```bash
# Get current git commit
GIT_SHA=$(git rev-parse --short HEAD)

# Tag with git SHA
docker build -t tonusername/myapp:$GIT_SHA .
docker build -t tonusername/myapp:commit-abc123f .

# Tu sais exactement quel code est dans l'image
```

### Environment tags

Pour différencier les environnements :

```bash
myapp:dev
myapp:staging
myapp:prod

# Ou combiné avec la version
myapp:1.2.3-dev
myapp:1.2.3-prod
```

### Date tags

Utile pour les backups ou builds quotidiens :

```bash
myapp:2025-02-06
myapp:20250206-1430
```

### Exemple complet : stratégie réelle

```bash
#!/bin/bash
# Script de build avec tagging complet

VERSION="1.2.3"
GIT_SHA=$(git rev-parse --short HEAD)
DATE=$(date +%Y%m%d)
USERNAME="tonusername"
APP="myapp"

# Build
docker build -t $USERNAME/$APP:$VERSION .

# Multiple tags
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:latest
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:1.2
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:1
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:git-$GIT_SHA
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:$DATE

# Push all
docker push $USERNAME/$APP --all-tags
```

## 10.5 Push vers Docker Hub

Maintenant, passons à la pratique : publier ta première image.

### Étape par étape

**Étape 1 : Build ton image avec le bon nom**

```bash
# Remplace "tonusername" par ton vrai username Docker Hub
docker build -t tonusername/myapp:v1.0.0 .
```

**Étape 2 : Vérifie que l'image existe**

```bash
docker images | grep myapp
```

Tu dois voir :

```
tonusername/myapp   v1.0.0    abc123def456   2 minutes ago   150MB
```

**Étape 3 : Login (si pas déjà fait)**

```bash
docker login
```

**Étape 4 : Push l'image**

```bash
docker push tonusername/myapp:v1.0.0
```

Tu verras les layers être uploadées :

```
The push refers to repository [docker.io/tonusername/myapp]
5f70bf18a086: Pushed
d8d3f2a4a1e3: Pushed
v1.0.0: digest: sha256:abc123... size: 1234
```

**Étape 5 : Vérifie sur le site**

Va sur `hub.docker.com/r/tonusername/myapp` et admire ton travail.

### Si tu as oublié de nommer correctement

Pas de panique, utilise `docker tag` :

```bash
# Tu as build sans le username
docker build -t myapp:v1.0.0 .

# Ajoute un tag avec le bon nom
docker tag myapp:v1.0.0 tonusername/myapp:v1.0.0

# Maintenant tu peux push
docker push tonusername/myapp:v1.0.0
```

### Push multiple tags

```bash
# Push tous les tags d'un coup
docker push tonusername/myapp --all-tags

# Ou un par un
docker push tonusername/myapp:v1.0.0
docker push tonusername/myapp:latest
```

### Erreurs courantes

**❌ "denied: requested access to the resource is denied"**
- Tu n'es pas login : `docker login`
- Le username ne correspond pas : vérifie le nom de l'image
- Le repository n'existe pas encore (normal la première fois)

**❌ "repository name must be lowercase"**
- Les noms d'images doivent être en minuscules : `myApp` → `myapp`

**❌ Layer already exists**
- C'est normal et **c'est bien** : Docker réutilise les layers déjà présents
- Seuls les layers modifiés sont uploadés

## 10.6 Registries privés

Docker Hub c'est cool, mais parfois tu veux garder tes images privées. Plusieurs options s'offrent à toi.

### Pourquoi un registry privé ?

- **Sécurité** : code propriétaire, pas public
- **Vitesse** : registry local = téléchargement ultra-rapide
- **Conformité** : certaines entreprises doivent garder leurs images sur leurs serveurs
- **Pas de limite** : Docker Hub limite les pulls gratuits

### Option 1 : Docker Hub privé

Docker Hub offre un repository privé gratuit :

1. Crée un repository sur hub.docker.com
2. Coche "Private"
3. Push comme d'habitude

```bash
docker push tonusername/private-app:v1.0.0
```

Seuls toi et les personnes invitées peuvent pull l'image.

### Option 2 : Registry local (self-hosted)

Docker fournit une image officielle `registry` pour héberger ton propre registry :

```bash
# Start a local registry on port 5000
docker run -d -p 5000:5000 --name registry registry:2

# Build an image
docker build -t myapp:v1.0.0 .

# Tag for local registry
docker tag myapp:v1.0.0 localhost:5000/myapp:v1.0.0

# Push to local registry
docker push localhost:5000/myapp:v1.0.0

# Pull from local registry
docker pull localhost:5000/myapp:v1.0.0
```

**Avec persistence** (pour ne pas perdre les images au restart) :

```bash
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v /path/to/registry/data:/var/lib/registry \
  registry:2
```

**Avec authentification basique** :

```bash
# Create password file
mkdir auth
docker run --entrypoint htpasswd \
  httpd:2 -Bbn testuser testpassword > auth/htpasswd

# Run registry with auth
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v $(pwd)/auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  registry:2

# Login to your registry
docker login localhost:5000
# Username: testuser
# Password: testpassword
```

### Option 3 : Cloud providers

Les grands cloud providers offrent des registries managés :

**AWS ECR (Elastic Container Registry)**
```bash
# Login
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.eu-west-1.amazonaws.com

# Tag and push
docker tag myapp:v1.0.0 123456789.dkr.ecr.eu-west-1.amazonaws.com/myapp:v1.0.0
docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/myapp:v1.0.0
```

**Google GCR (Google Container Registry)**
```bash
# Authenticate
gcloud auth configure-docker

# Tag and push
docker tag myapp:v1.0.0 gcr.io/my-project/myapp:v1.0.0
docker push gcr.io/my-project/myapp:v1.0.0
```

**Azure ACR (Azure Container Registry)**
```bash
# Login
az acr login --name myregistry

# Tag and push
docker tag myapp:v1.0.0 myregistry.azurecr.io/myapp:v1.0.0
docker push myregistry.azurecr.io/myapp:v1.0.0
```

**GitHub Container Registry (GHCR)**
```bash
# Login with Personal Access Token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag and push
docker tag myapp:v1.0.0 ghcr.io/username/myapp:v1.0.0
docker push ghcr.io/username/myapp:v1.0.0
```

### Comparaison rapide

| Registry | Avantage | Inconvénient |
|----------|----------|--------------|
| Docker Hub | Simple, gratuit, public | Limites de pull, 1 seul repo privé gratuit |
| Self-hosted | Contrôle total, rapide en local | Maintenance, sécurité à gérer |
| AWS ECR | Intégration AWS, illimité | Payant, complexité AWS |
| GitHub GHCR | Gratuit, lié aux repos GitHub | Nécessite GitHub |
| Google GCR | Intégration GCP, rapide | Payant, complexité GCP |

## 10.7 Exercice pratique

On va mettre en pratique tout ce que tu viens d'apprendre.

### Mission : Publier ta page perso sur Docker Hub

Tu te souviens de la page HTML que tu as créée dans le module 4 ? On va la publier sur Docker Hub.

**Étape 1 : Prépare ton projet**

```bash
# Create a directory
mkdir ~/docker-publish-demo
cd ~/docker-publish-demo

# Create your HTML page
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma Page Docker Hub</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin-bottom: 10px; }
        .badge {
            display: inline-block;
            background: #4CAF50;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin: 10px 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Je suis sur Docker Hub 🎉</h1>
        <p>Cette page est servie depuis une image Docker que j'ai créée et publiée moi-même !</p>

        <div class="badge">Version 1.0.0</div>
        <div class="badge">Published on Docker Hub</div>

        <p>Skills débloquées :</p>
        <ul>
            <li>✅ Build d'images Docker</li>
            <li>✅ Tagging sémantique</li>
            <li>✅ Push vers Docker Hub</li>
            <li>✅ Partage avec le monde entier</li>
        </ul>
    </div>
</body>
</html>
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine

# Copy HTML file
COPY index.html /usr/share/nginx/html/index.html

# Expose port
EXPOSE 80

# Default command (already in nginx image, but explicit is better)
CMD ["nginx", "-g", "daemon off;"]
EOF
```

**Étape 2 : Build avec plusieurs tags**

```bash
# Remplace "tonusername" par ton vrai username Docker Hub
USERNAME="tonusername"
APP="docker-learning-page"
VERSION="1.0.0"

# Build with main version tag
docker build -t $USERNAME/$APP:$VERSION .

# Add alternative tags
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:1.0
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:1
docker tag $USERNAME/$APP:$VERSION $USERNAME/$APP:latest
```

**Étape 3 : Test en local**

```bash
# Run container
docker run -d -p 8080:80 --name test-publish $USERNAME/$APP:$VERSION

# Open browser at http://localhost:8080
# Verify it works

# Stop and remove
docker stop test-publish
docker rm test-publish
```

**Étape 4 : Login à Docker Hub**

```bash
docker login
# Enter your username and password/token
```

**Étape 5 : Push toutes les versions**

```bash
# Push all tags
docker push $USERNAME/$APP:1.0.0
docker push $USERNAME/$APP:1.0
docker push $USERNAME/$APP:1
docker push $USERNAME/$APP:latest

# Ou en une commande (Docker 20.10+)
docker push $USERNAME/$APP --all-tags
```

**Étape 6 : Vérifie sur Docker Hub**

1. Va sur `https://hub.docker.com/r/tonusername/docker-learning-page`
2. Tu dois voir tes 4 tags
3. Regarde les layers dans l'onglet "Tags"
4. Note le nombre de pulls (bientôt 1 de plus)

**Étape 7 : Simule un téléchargement sur une autre machine**

```bash
# Remove local images
docker rmi $USERNAME/$APP:1.0.0
docker rmi $USERNAME/$APP:1.0
docker rmi $USERNAME/$APP:1
docker rmi $USERNAME/$APP:latest

# Pull from Docker Hub
docker pull $USERNAME/$APP:latest

# Run it
docker run -d -p 8080:80 --name from-hub $USERNAME/$APP:latest

# It works! Your image is now public and shareable
```

### Challenge bonus

Ajoute des métadonnées à ton image avec des labels :

```dockerfile
FROM nginx:alpine

# Add metadata labels
LABEL maintainer="tonusername"
LABEL version="1.0.0"
LABEL description="Ma première image publiée sur Docker Hub"
LABEL org.opencontainers.image.source="https://github.com/tonusername/docker-learning"

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Rebuild, retag, et repush :

```bash
docker build -t $USERNAME/$APP:1.0.1 .
docker tag $USERNAME/$APP:1.0.1 $USERNAME/$APP:latest
docker push $USERNAME/$APP:1.0.1
docker push $USERNAME/$APP:latest
```

### Ce que tu dois retenir

✅ **Docker Hub** = le registry public par défaut
✅ **Format** = `registry/username/repository:tag`
✅ **Semantic versioning** = `1.2.3` avec tags multiples
✅ **Push** = `docker push username/app:tag`
✅ **Private registries** = pour la sécurité et la vitesse

Tu sais maintenant comment partager tes créations avec le monde entier. C'est une compétence énorme dans l'écosystème Docker. Prêt pour le prochain module ?
