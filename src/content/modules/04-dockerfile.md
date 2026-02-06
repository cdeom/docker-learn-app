---
title: "Créer sa propre image Docker"
description: "Écrire un Dockerfile et déployer sa page web personnelle"
order: 4
duration: "30 min"
icon: "🏗️"
xpReward: 250
objectives:
  - "Créer un site web HTML/CSS"
  - "Écrire un Dockerfile"
  - "Construire et déployer une image custom"
---

## 4.1 Le projet : Une page web personnelle

On va créer une page web simple avec les infos :
- Nom, prénom
- École
- Photo ou avatar
- Quelques infos

Puis on va :
1. Créer le site web (HTML/CSS)
2. Écrire un Dockerfile
3. Construire (build) l'image
4. Déployer le conteneur

---

## 4.2 Étape 1 : Créer le site web

Crée cette structure de fichiers :

```
mon-projet/
  ├── Dockerfile
  ├── index.html
  └── style.css
```

### index.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma Page - Docker Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <div class="avatar">XY</div>
        <h1>Bonjour, je m'appelle <span class="name">Xavier Yamamoto</span></h1>
        <p class="school">Étudiant en informatique @ Mon École</p>

        <div class="info-grid">
            <div class="info-item">
                <span class="label">Age</span>
                <span class="value">22 ans</span>
            </div>
            <div class="info-item">
                <span class="label">Ville</span>
                <span class="value">Paris</span>
            </div>
            <div class="info-item">
                <span class="label">Passion</span>
                <span class="value">Développement Web</span>
            </div>
            <div class="info-item">
                <span class="label">Projet</span>
                <span class="value">Apprendre Docker !</span>
            </div>
        </div>

        <div class="tech-stack">
            <span class="badge">HTML</span>
            <span class="badge">CSS</span>
            <span class="badge">Docker</span>
            <span class="badge">Nginx</span>
        </div>

        <p class="footer-text">
            Cette page est servie par un conteneur Docker avec Nginx
        </p>
    </div>
</body>
</html>
```

### style.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #052FAD 0%, #6B73FF 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #052FAD, #6B73FF);
    color: white;
    font-size: 36px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 20px;
}

h1 {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 5px;
}

.name {
    color: #052FAD;
}

.school {
    color: #777;
    font-size: 0.95rem;
    margin-bottom: 25px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 25px;
}

.info-item {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 15px;
}

.label {
    display: block;
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
}

.value {
    display: block;
    font-size: 1rem;
    color: #333;
    font-weight: 600;
}

.tech-stack {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.badge {
    background: #052FAD;
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
}

.footer-text {
    color: #aaa;
    font-size: 0.8rem;
    font-style: italic;
}
```

---

## 4.3 Étape 2 : Comprendre le Dockerfile

Un **Dockerfile** est un fichier texte qui contient les **instructions** pour construire
une image Docker. Chaque ligne est une étape.

### Les instructions principales

```dockerfile
# FROM : image de base (le point de départ)
FROM nginx:alpine

# COPY : copier des fichiers de ton PC vers l'image
COPY index.html /usr/share/nginx/html/

# WORKDIR : définir le répertoire de travail
WORKDIR /app

# RUN : exécuter une commande pendant la construction
RUN apk add --no-cache curl

# EXPOSE : documenter le port utilisé (informatif)
EXPOSE 80

# CMD : commande exécutée au démarrage du conteneur
CMD ["nginx", "-g", "daemon off;"]
```

### Comment ça marche ?

```
Dockerfile          Build                    Image
+-----------+       +------------------+     +-----------+
| FROM      | ----> | Couche 1: Base   | --> |           |
| COPY      | ----> | Couche 2: Fichiers| --> |  Image    |
| RUN       | ----> | Couche 3: Install | --> |  finale   |
| CMD       | ----> | Metadata         | --> |           |
+-----------+       +------------------+     +-----------+

Chaque instruction crée une "couche" (layer).
Les couches sont mises en cache = builds plus rapides !
```

---

## 4.4 Étape 3 : Écrire notre Dockerfile

### Dockerfile

```dockerfile
# Étape 1 : Partir de l'image nginx version alpine (légère, ~40MB)
FROM nginx:alpine

# Étape 2 : Copier nos fichiers web dans le dossier de nginx
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css

# Étape 3 : Exposer le port 80 (documentation)
EXPOSE 80

# Étape 4 : La commande de démarrage est déjà définie dans l'image nginx
# Pas besoin de CMD, l'image de base s'en charge !
```

### Pourquoi `nginx:alpine` ?

| Image           | Taille  | Contenu                    |
|-----------------|---------|----------------------------|
| `nginx`         | ~187 MB | Base Debian + Nginx        |
| `nginx:alpine`  | ~43 MB  | Base Alpine + Nginx        |

Alpine Linux est une distribution ultra-légère. **Toujours préférer les images alpine
quand c'est possible.**

---

## 4.5 Étape 4 : Construire (build) l'image

```bash
# Se placer dans le dossier du projet
cd mon-projet

# Construire l'image
docker build -t ma-page-web .
```

Explication :
- `docker build` : commande pour construire une image
- `-t ma-page-web` : tag (nom) de l'image
- `.` : contexte de build (le dossier actuel, où se trouve le Dockerfile)

Tu devrais voir :
```
[+] Building 2.1s (8/8) FINISHED
 => [1/3] FROM nginx:alpine
 => [2/3] COPY index.html /usr/share/nginx/html/index.html
 => [3/3] COPY style.css /usr/share/nginx/html/style.css
 => exporting to image
 => => naming to docker.io/library/ma-page-web
```

Vérifie que l'image existe :
```bash
docker images

# REPOSITORY    TAG       IMAGE ID       SIZE
# ma-page-web   latest    abc123def      43MB
```

---

## 4.6 Étape 5 : Déployer le conteneur

```bash
# Lancer un conteneur depuis notre image
docker run -d --name mon-site -p 8080:80 ma-page-web
```

Ouvre **http://localhost:8080** dans ton navigateur.

**Tu devrais voir ta page personnelle !**

### Le cycle complet

```
  Dockerfile        docker build        Image           docker run        Conteneur
+-----------+    +---------------+   +-----------+   +-------------+   +-----------+
| FROM      |    |               |   |           |   |             |   |           |
| COPY      | -> | Construction  | ->| ma-page   | ->|  Démarrage  | ->| Site web  |
| EXPOSE    |    |  de l'image   |   |  -web     |   |             |   | en ligne! |
+-----------+    +---------------+   +-----------+   +-------------+   +-----------+
                                                                        localhost:8080
```

---

## 4.7 Étape 6 : Modifier et reconstruire

Si tu modifies `index.html` (par exemple changer ton nom) :

```bash
# 1. Arrêter et supprimer l'ancien conteneur
docker stop mon-site && docker rm mon-site

# 2. Reconstruire l'image (Docker utilise le cache pour les couches inchangées)
docker build -t ma-page-web .

# 3. Relancer
docker run -d --name mon-site -p 8080:80 ma-page-web

# 4. Rafraîchir le navigateur !
```

---

## 4.8 BONUS : Version Docker Compose

Crée un fichier `docker-compose.yml` dans le même dossier :

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Maintenant tu peux utiliser :

```bash
# Construire et lancer
docker compose up -d --build

# Voir les logs
docker compose logs -f

# Arrêter
docker compose down
```

C'est plus simple et reproductible !

---

