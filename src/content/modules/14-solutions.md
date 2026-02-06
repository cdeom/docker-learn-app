---
title: "Solutions et aide-mémoire"
description: "Réponses aux QCM, cheat sheets et erreurs fréquentes"
order: 14
duration: "15 min"
icon: "✅"
xpReward: 30
objectives:
  - "Vérifier ses réponses au QCM"
  - "Avoir un aide-mémoire des commandes"
---

## 14.1 Réponses au QCM

| Question | Réponse | Explication |
|----------|---------|-------------|
| Q1  | **B** | Un conteneur isole l'application avec ses dépendances, ce n'est PAS une VM complète |
| Q2  | **C** | L'image est un modèle en lecture seule, le conteneur est une instance vivante |
| Q3  | **B** | WSL2 permet d'exécuter un vrai noyau Linux sous Windows |
| Q4  | **B** | Le flag `-d` signifie "detached" (arrière-plan) |
| Q5  | **C** | Format : `-p HOST:CONTENEUR` → 8080 sur ton PC pointe vers 80 dans le conteneur |
| Q6  | **C** | `docker ps` liste les conteneurs actifs (`-a` pour tous) |
| Q7  | **B** | Le Dockerfile est un fichier texte avec les instructions de build |
| Q8  | **B** | `FROM` définit l'image de base, le point de départ |
| Q9  | **C** | `docker build` construit une image, `-t` donne un nom (tag) |
| Q10 | **B** | Docker Compose orchestre plusieurs conteneurs ensemble |
| Q11 | **C** | Docker Compose utilise le format YAML (.yml) |
| Q12 | **C** | `docker compose up` crée et démarre tous les services |
| Q13 | **B** | `-it` = interactif + terminal, `bash` = ouvrir un shell |
| Q14 | **C** | Alpine est une distro minimaliste, image 4x plus légère |
| Q15 | **B** | COPY copie des fichiers depuis le contexte de build vers l'image |
| Q16 | **C** | Nettoie les ressources non utilisées pour libérer de l'espace |
| Q17 | **C** | `-v` monte un volume : lie un dossier host à un dossier conteneur |
| Q18 | **B** | Sans volume, les fichiers sont dans l'image, il faut rebuild |
| Q19 | **B** | Docker Desktop nécessite WSL2 pour fonctionner sous Windows |
| Q20 | **B** | `down` arrête et supprime les conteneurs et réseaux (les volumes sont conservés par défaut) |
| Q21 | **B** | `FROM node:18 AS builder` nomme le stage 'builder' |
| Q22 | **B** | `COPY --from=builder` copie depuis un stage précédent |
| Q23 | **C** | Le multi-stage réduit la taille de 70-90% |
| Q24 | **B** | Si package.json n'a pas changé, npm install est en cache |
| Q25 | **B** | .dockerignore exclut des fichiers du contexte de build |
| Q26 | **B** | ARG existe au build, ENV persiste au runtime |
| Q27 | **C** | node:18-alpine est la plus légère (~180 MB) |
| Q28 | **B** | Seul le dernier FROM produit l'image finale |
| Q29 | **B** | Seuls les bridges custom offrent le DNS automatique |
| Q30 | **B** | Par défaut, docker network create crée un bridge |
| Q31 | **B** | En mode host, pas besoin de mapper les ports |
| Q32 | **B** | Des réseaux séparés empêchent la communication directe |
| Q33 | **B** | docker network connect attache un conteneur existant |
| Q34 | **B** | EXPOSE est purement informatif, -p publie le port |
| Q35 | **C** | Le réseau none isole totalement le conteneur |
| Q36 | **B** | Compose crée un DNS où le nom du service = hostname |
| Q37 | **B** | USER change l'utilisateur d'exécution |
| Q38 | **B** | Une version précise garantit des builds reproductibles |
| Q39 | **B** | --cap-drop ALL retire toutes les capabilities Linux |
| Q40 | **B** | docker scout cves analyse les vulnérabilités |
| Q41 | **B** | Docker Secrets chiffre les données sensibles |
| Q42 | **B** | HEALTHCHECK vérifie que le service répond |
| Q43 | **B** | .env avec secrets ne doit jamais être dans l'image |
| Q44 | **B** | --read-only empêche toute écriture dans le filesystem |
| Q45 | **B** | --privileged donne un accès total au host |
| Q46 | **B** | service_healthy attend que le healthcheck passe |
| Q47 | **B** | Les profiles activent des services selon le contexte |
| Q48 | **B** | docker-compose.override.yml est chargé automatiquement |
| Q49 | **B** | deploy.resources.limits définit les limites |
| Q50 | **B** | x- est un champ d'extension YAML réutilisable |
| Q51 | **B** | -f multiple merge les fichiers compose |
| Q52 | **B** | --scale crée plusieurs replicas du service |
| Q53 | **B** | *common référence une ancre YAML |
| Q54 | **B** | pg_isready vérifie que PostgreSQL accepte les connexions |
| Q55 | **B** | Docker Hub (docker.io) est le registry par défaut |
| Q56 | **B** | v1.2.3 suit le semantic versioning |
| Q57 | **B** | docker tag crée un alias pour la même image |
| Q58 | **B** | docker push envoie l'image vers le registry |
| Q59 | **B** | Un token peut être révoqué individuellement |
| Q60 | **B** | registry:2 est le registry officiel Docker |
| Q61 | **B** | Sécurité, vitesse et contrôle total |
| Q62 | **B** | latest pointe vers le dernier push, pas forcément stable |
| Q63 | **B** | CD = Continuous Delivery / Deployment |
| Q64 | **B** | .github/workflows/ contient les fichiers workflow |
| Q65 | **B** | GitHub Secrets sont chiffrés et accessibles dans les workflows |
| Q66 | **B** | on: push: branches: [main] est le trigger standard |
| Q67 | **B** | Buildx permet les builds multi-plateformes avancés |
| Q68 | **B** | ARM64 pour Mac M1/M2 et Raspberry Pi |
| Q69 | **B** | checkout clone le code sur le runner |
| Q70 | **B** | Branch protection + CI obligatoire avant merge |

---

## 14.2 Solution complète de l'exercice

### Structure du projet

```
mon-projet/
  ├── Dockerfile
  ├── docker-compose.yml
  ├── index.html
  └── style.css
```

### Commandes dans l'ordre

```bash
# 1. Créer le dossier du projet
mkdir mon-projet && cd mon-projet

# 2. Créer les fichiers (index.html, style.css, Dockerfile)
#    --> copier le contenu des sections 4.2 et 4.4

# 3. Construire l'image
docker build -t ma-page-web .

# 4. Vérifier que l'image est créée
docker images | grep ma-page-web

# 5. Lancer le conteneur
docker run -d --name mon-site -p 8080:80 ma-page-web

# 6. Vérifier que le conteneur tourne
docker ps

# 7. Ouvrir dans le navigateur
#    --> http://localhost:8080

# 8. (Optionnel) Voir les logs
docker logs mon-site

# 9. Arrêter proprement
docker stop mon-site
docker rm mon-site

# --- OU AVEC DOCKER COMPOSE ---

# 10. Créer docker-compose.yml (section 4.8)
# 11. Lancer
docker compose up -d --build

# 12. Vérifier
docker compose ps

# 13. Arrêter
docker compose down
```

---

## 14.3 Aide-Mémoire (Cheat Sheet)

```
╔══════════════════════════════════════════════════════════════════╗
║                    DOCKER CHEAT SHEET                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                ║
║  IMAGES                                                        ║
║  docker pull <image>          Télécharger une image            ║
║  docker build -t <nom> .      Construire depuis Dockerfile     ║
║  docker images                Lister les images                ║
║  docker rmi <image>           Supprimer une image              ║
║                                                                ║
║  CONTENEURS                                                    ║
║  docker run -d -p H:C <img>  Lancer (détaché, ports)          ║
║  docker ps                    Lister actifs                    ║
║  docker ps -a                 Lister tous                      ║
║  docker stop <nom>            Arrêter                          ║
║  docker rm <nom>              Supprimer                        ║
║  docker logs <nom>            Voir les logs                    ║
║  docker exec -it <nom> bash   Terminal dans conteneur          ║
║                                                                ║
║  DOCKER COMPOSE                                                ║
║  docker compose up -d         Lancer tous les services         ║
║  docker compose down          Arrêter et nettoyer              ║
║  docker compose logs -f       Suivre les logs                  ║
║  docker compose ps            État des services                ║
║                                                                ║
║  NETTOYAGE                                                     ║
║  docker system prune          Supprimer inutilisé              ║
║                                                                ║
║  DOCKERFILE                                                    ║
║  FROM <image>                 Image de base                    ║
║  COPY <src> <dst>             Copier fichiers                  ║
║  RUN <cmd>                    Exécuter commande                ║
║  EXPOSE <port>                Documenter port                  ║
║  CMD ["exec","param"]         Commande de démarrage            ║
║                                                                ║
╚══════════════════════════════════════════════════════════════════╝
```

```
╔══════════════════════════════════════════════════════════════════╗
║                 DOCKER AVANCE CHEAT SHEET                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                ║
║  MULTI-STAGE                                                   ║
║  FROM node:18 AS builder       Nommer un stage                 ║
║  COPY --from=builder ...       Copier depuis un stage          ║
║  ARG VERSION=1.0               Variable de build               ║
║                                                                ║
║  RESEAUX                                                       ║
║  docker network create net     Créer un réseau                 ║
║  docker network ls             Lister les réseaux              ║
║  docker network inspect net    Détails d'un réseau             ║
║  docker network connect net c  Connecter un conteneur          ║
║  --network=mon-reseau          Lancer sur un réseau            ║
║                                                                ║
║  SECURITE                                                      ║
║  USER appuser                  Ne pas exécuter en root         ║
║  HEALTHCHECK CMD curl ...      Vérification de santé           ║
║  --read-only                   Filesystem lecture seule        ║
║  --cap-drop ALL                Supprimer les capabilities      ║
║  docker scout cves <image>     Scanner les vulnérabilités      ║
║                                                                ║
║  COMPOSE AVANCE                                                ║
║  depends_on: condition:        Attendre le healthcheck         ║
║    service_healthy                                             ║
║  profiles: [dev]               Activer par profil              ║
║  --profile dev                 Lancer un profil                ║
║  -f base.yml -f prod.yml       Combiner des fichiers           ║
║  --scale web=3                 Scaler un service               ║
║                                                                ║
║  REGISTRY                                                      ║
║  docker login                  Se connecter à Docker Hub       ║
║  docker tag img user/img:v1    Tagger pour push                ║
║  docker push user/img:v1       Pousser vers le registry        ║
║  docker pull user/img:v1       Télécharger une image           ║
║                                                                ║
║  CI/CD                                                         ║
║  .github/workflows/*.yml       Fichiers workflow               ║
║  on: push: branches: [main]   Trigger sur push                ║
║  secrets.DOCKER_TOKEN          Accéder aux secrets             ║
║  docker/build-push-action      Build + push en CI              ║
║                                                                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 14.4 Erreurs fréquentes et solutions

### Erreur : "port is already allocated"
```bash
# Un autre programme utilise déjà le port 8080
# Solution : utiliser un autre port
docker run -d -p 9090:80 nginx
# Ou trouver et arrêter ce qui utilise le port :
# Linux/Mac : lsof -i :8080
# Windows : netstat -ano | findstr :8080
```

### Erreur : "permission denied" (Linux)
```bash
# Tu n'es pas dans le groupe docker
sudo usermod -aG docker $USER
# Puis déconnecter/reconnecter ta session
```

### Erreur : "Cannot connect to the Docker daemon"
```bash
# Docker n'est pas démarré
# Linux :
sudo systemctl start docker
# Windows/Mac : Lancer Docker Desktop
```

### Erreur : "no such file or directory" pendant le build
```bash
# Vérifie que tu es dans le bon dossier
ls
# Tu dois voir : Dockerfile  index.html  style.css

# Vérifie que le Dockerfile est bien nommé (majuscule D, pas d'extension)
```

### Erreur : "image not found" pendant docker run
```bash
# Vérifie le nom exact de ton image
docker images
# Utilise le nom exact dans docker run
```

---

## 14.5 Erreurs avancées et solutions

### Erreur : "COPY --from=builder failed"
```bash
# Le stage 'builder' n'existe pas ou le chemin est incorrect
# Vérifie que FROM ... AS builder est bien défini
# Vérifie le chemin exact dans le stage builder
```

### Erreur : "network not found"
```bash
# Le réseau n'existe pas encore
docker network create mon-reseau
# Ou vérifier les réseaux existants :
docker network ls
```

### Erreur : "service unhealthy"
```bash
# Le healthcheck échoue
# Vérifier les logs du service :
docker compose logs service-name
# Vérifier le healthcheck :
docker inspect --format='{{.State.Health}}' container-name
```

### Erreur : "denied: requested access to the resource is denied"
```bash
# Tu n'es pas connecté ou le nom d'image est incorrect
docker login
# Vérifie que l'image est taggée avec ton username :
docker tag myapp myuser/myapp:v1.0
docker push myuser/myapp:v1.0
```

### Erreur : "no matching manifest for linux/arm64"
```bash
# L'image n'existe pas pour ton architecture (M1/M2 Mac)
# Utiliser --platform pour forcer :
docker run --platform linux/amd64 myimage
# Ou builder en multi-plateforme avec buildx
```

---

> **Félicitations !** Tu as terminé le cours complet Docker en 14 modules.
> Tu maîtrises maintenant Docker, Docker Compose, la sécurité, le networking,
> les registries et le CI/CD. Tu es prêt pour construire et déployer
> des applications professionnelles !
