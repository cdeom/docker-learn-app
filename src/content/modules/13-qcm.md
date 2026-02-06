---
title: "QCM - Teste tes connaissances"
description: "70 questions pour valider ta compréhension de Docker"
order: 13
duration: "30 min"
icon: "❓"
xpReward: 500
objectives:
  - "Valider les connaissances Docker"
  - "Identifier les points à réviser"
---

Réponds aux questions suivantes. Les réponses sont en fin de document.

### Q1. Qu'est-ce qu'un conteneur Docker ?
- A) Un logiciel de virtualisation comme VirtualBox
- B) Un environnement isolé qui contient une application et ses dépendances
- C) Un système d'exploitation complet
- D) Un outil de compilation de code

### Q2. Quelle est la différence entre une image et un conteneur ?
- A) Il n'y a pas de différence
- B) L'image est en cours d'exécution, le conteneur est le modèle
- C) L'image est le modèle (lecture seule), le conteneur est une instance en exécution
- D) Le conteneur est plus léger que l'image

### Q3. À quoi sert WSL2 ?
- A) À remplacer Windows par Linux
- B) À faire tourner un noyau Linux sous Windows
- C) À accélérer Docker sur Mac
- D) À compiler du code C++

### Q4. Quelle commande lance un conteneur en arrière-plan ?
- A) `docker run nginx`
- B) `docker run -d nginx`
- C) `docker start -background nginx`
- D) `docker run --silent nginx`

### Q5. Que fait `-p 8080:80` dans `docker run -p 8080:80 nginx` ?
- A) Limite la mémoire à 8080 MB et le CPU à 80%
- B) Mappe le port 80 du host vers le port 8080 du conteneur
- C) Mappe le port 8080 du host vers le port 80 du conteneur
- D) Ouvre les ports 8080 et 80 sur le host

### Q6. Quelle commande permet de lister les conteneurs en cours d'exécution ?
- A) `docker list`
- B) `docker containers`
- C) `docker ps`
- D) `docker running`

### Q7. Qu'est-ce qu'un Dockerfile ?
- A) Un fichier de configuration JSON
- B) Un fichier texte contenant les instructions pour construire une image
- C) Un fichier binaire Docker
- D) Un fichier de logs

### Q8. Que fait l'instruction `FROM nginx:alpine` dans un Dockerfile ?
- A) Télécharge et installe Alpine Linux
- B) Définit l'image de base à partir de laquelle construire
- C) Lance un conteneur Nginx
- D) Copie les fichiers d'Alpine vers Nginx

### Q9. Quelle commande construit une image depuis un Dockerfile ?
- A) `docker create -t mon-image .`
- B) `docker compile -t mon-image .`
- C) `docker build -t mon-image .`
- D) `docker make -t mon-image .`

### Q10. À quoi sert Docker Compose ?
- A) À compiler du code Docker
- B) À définir et gérer des applications multi-conteneurs
- C) À remplacer Docker
- D) À créer des images plus rapidement

### Q11. Quel est le format du fichier Docker Compose ?
- A) JSON
- B) XML
- C) YAML
- D) TOML

### Q12. Quelle commande lance tous les services définis dans docker-compose.yml ?
- A) `docker compose start`
- B) `docker compose run`
- C) `docker compose up`
- D) `docker compose launch`

### Q13. Que fait `docker exec -it mon-conteneur bash` ?
- A) Supprime le conteneur
- B) Ouvre un terminal interactif dans le conteneur
- C) Exécute un script bash sur le host
- D) Redémarre le conteneur

### Q14. Pourquoi préférer `nginx:alpine` à `nginx` ?
- A) Alpine est plus sécurisé
- B) Alpine est plus rapide
- C) Alpine est beaucoup plus léger (~43 MB vs ~187 MB)
- D) Alpine supporte plus de fonctionnalités

### Q15. Que fait l'instruction `COPY index.html /usr/share/nginx/html/` ?
- A) Télécharge index.html depuis Internet
- B) Copie index.html depuis ton PC vers l'image
- C) Crée un nouveau fichier index.html vide
- D) Supprime l'ancien index.html

### Q16. Que fait `docker system prune` ?
- A) Met à jour Docker
- B) Supprime tous les conteneurs en cours
- C) Supprime les ressources Docker inutilisées (conteneurs arrêtés, images orphelines, etc.)
- D) Réinstalle Docker

### Q17. Qu'est-ce que le flag `-v ~/data:/app/data` fait ?
- A) Définit la version de Docker
- B) Active le mode verbose
- C) Monte un dossier du host dans le conteneur (volume)
- D) Vérifie le conteneur

### Q18. Que se passe-t-il si tu modifies un fichier HTML et que tu rafraîchis la page
(sans volume, image custom) ?
- A) Le changement est visible immédiatement
- B) Rien ne change car l'image doit être reconstruite
- C) Docker détecte automatiquement les changements
- D) Le conteneur redémarre tout seul

### Q19. Quelle version de WSL est nécessaire pour Docker ?
- A) WSL1
- B) WSL2
- C) WSL3
- D) N'importe quelle version

### Q20. Que fait `docker compose down` ?
- A) Arrête les conteneurs seulement
- B) Arrête et supprime les conteneurs et réseaux du projet (les volumes sont conservés)
- C) Supprime les images
- D) Désinstalle Docker Compose

---

### --- Multi-stage Builds ---

### Q21. Quel mot-clé permet de nommer un stage dans un Dockerfile multi-stage ?
- A) AS
- B) NAME
- C) STAGE
- D) LABEL

### Q22. Comment copier un fichier depuis un stage précédent nommé "builder" ?
- A) COPY builder:/app/dist ./dist
- B) COPY --from=builder /app/dist ./dist
- C) FROM builder COPY /app/dist ./dist
- D) GET --stage=builder /app/dist ./dist

### Q23. Quel est l'effet principal du multi-stage build sur la taille de l'image finale ?
- A) Augmentation de 20-30%
- B) Aucun effet
- C) Réduction de 70-90%
- D) Réduction de 10-20%

### Q24. Pourquoi copier package.json avant le code source dans un build Node.js ?
- A) Pour que npm fonctionne correctement
- B) Pour optimiser le cache Docker et éviter de refaire npm install à chaque modification
- C) C'est une obligation de Docker
- D) Pour accélérer le téléchargement

### Q25. À quoi sert le fichier .dockerignore ?
- A) À ignorer les erreurs Docker
- B) À lister les fichiers à exclure du contexte de build (node_modules, .git, etc.)
- C) À désactiver certaines fonctionnalités Docker
- D) À cacher des commandes sensibles

### Q26. Quelle est la différence entre ARG et ENV dans un Dockerfile ?
- A) ARG est pour les variables d'environnement, ENV pour les arguments
- B) Aucune différence
- C) ARG est disponible au build-time, ENV au runtime
- D) ARG est plus sécurisé que ENV

### Q27. Quelle image Alpine est la plus légère pour une application Node.js ?
- A) node:latest
- B) node:18-alpine
- C) node:18-slim
- D) node:18-buster

### Q28. Dans un Dockerfile multi-stage avec 3 stages, combien de stages produisent l'image finale ?
- A) Les 3 stages
- B) Le premier et le dernier
- C) Le dernier seulement
- D) Tous sauf le premier

---

### --- Networking ---

### Q29. Quel type de réseau Docker offre la résolution DNS automatique entre conteneurs ?
- A) Bridge par défaut
- B) Bridge custom (créé manuellement)
- C) Host
- D) None

### Q30. Que fait la commande `docker network create mon-reseau` ?
- A) Crée un réseau host
- B) Crée un réseau bridge custom
- C) Crée un réseau overlay
- D) Renomme un réseau existant

### Q31. Comment un conteneur en mode réseau "host" accède-t-il au port 3000 de l'application ?
- A) Via localhost:3000 sans mapping de port
- B) Avec -p 3000:3000 obligatoire
- C) Impossible en mode host
- D) Via l'IP du conteneur

### Q32. Comment isoler une base de données PostgreSQL du frontend dans Docker ?
- A) Utiliser des réseaux séparés
- B) Utiliser des volumes différents
- C) Utiliser des images différentes
- D) C'est impossible

### Q33. Quelle commande connecte un conteneur existant à un réseau ?
- A) docker network add mon-reseau mon-conteneur
- B) docker network connect mon-reseau mon-conteneur
- C) docker connect mon-conteneur mon-reseau
- D) docker attach mon-conteneur --network mon-reseau

### Q34. Que fait l'instruction EXPOSE 3000 dans un Dockerfile ?
- A) Publie automatiquement le port 3000 sur le host
- B) Bloque le port 3000
- C) Documente que le conteneur écoute sur le port 3000 (information seulement)
- D) Ouvre le port 3000 sur le firewall

### Q35. Quel réseau Docker désactive complètement le networking ?
- A) bridge
- B) host
- C) none
- D) isolated

### Q36. Comment les services Docker Compose se trouvent-ils entre eux ?
- A) Par adresse IP manuelle
- B) Par nom de service via la résolution DNS automatique
- C) Par hostname du host
- D) Ils ne peuvent pas communiquer

---

### --- Security ---

### Q37. Quelle instruction Dockerfile permet de changer l'utilisateur pour éviter de tourner en root ?
- A) USER appuser
- B) RUN useradd appuser
- C) SWITCH appuser
- D) SETUSER appuser

### Q38. Pourquoi pinner les versions exactes des dépendances (package-lock.json, Pipfile.lock) ?
- A) Pour accélérer l'installation
- B) Pour garantir des builds reproductibles et éviter les surprises
- C) C'est obligatoire
- D) Pour économiser de l'espace disque

### Q39. Que fait le flag `--cap-drop ALL` dans docker run ?
- A) Supprime toutes les données du conteneur
- B) Supprime toutes les Linux capabilities (privilèges système)
- C) Désactive tous les logs
- D) Arrête tous les processus

### Q40. Quelle commande Docker permet de scanner les vulnérabilités (CVE) d'une image ?
- A) docker scan
- B) docker security check
- C) docker scout cves
- D) docker audit

### Q41. Comment stocker des mots de passe en production avec Docker Swarm/Kubernetes ?
- A) Dans des variables ENV
- B) Dans le Dockerfile
- C) Avec Docker Secrets ou Kubernetes Secrets
- D) Dans un fichier .env committé

### Q42. Que fait l'instruction HEALTHCHECK CMD curl -f http://localhost/health ?
- A) Bloque les requêtes non sécurisées
- B) Vérifie périodiquement que l'application répond correctement
- C) Active HTTPS
- D) Crée un endpoint de santé

### Q43. Quel fichier ne doit JAMAIS être inclus dans une image Docker ?
- A) package.json
- B) Dockerfile
- C) .env contenant des secrets
- D) node_modules

### Q44. Que fait le flag `--read-only` dans docker run ?
- A) Monte le filesystem du conteneur en lecture seule
- B) Active les logs en lecture seule
- C) Empêche la modification des variables ENV
- D) Bloque les connexions réseau entrantes

### Q45. Pourquoi éviter `--privileged` dans docker run ?
- A) C'est plus lent
- B) Ça donne un accès total au host (équivalent root host)
- C) Ça consomme plus de mémoire
- D) C'est obsolète

---

### --- Advanced Compose ---

### Q46. Que fait `depends_on: db: condition: service_healthy` ?
- A) Redémarre le service si db tombe
- B) Attend que le healthcheck de db soit OK avant de démarrer
- C) Vérifie que db existe
- D) Lance db et le service en parallèle

### Q47. À quoi servent les profiles dans Docker Compose ?
- A) À définir des utilisateurs
- B) À activer/désactiver des services selon le contexte (dev, prod, test)
- C) À optimiser les performances
- D) À créer des profils de sécurité

### Q48. Quel fichier Docker Compose est automatiquement chargé s'il existe ?
- A) docker-compose.dev.yml
- B) docker-compose.local.yml
- C) docker-compose.override.yml
- D) docker-compose.custom.yml

### Q49. Comment limiter le CPU et la RAM d'un service dans Docker Compose v3+ ?
- A) resources: limits: cpus/memory
- B) deploy: resources: limits: cpus/memory
- C) constraints: cpu/memory
- D) limits: cpu/ram

### Q50. À quoi sert `x-common: &common` dans un fichier Compose ?
- A) À commenter du code
- B) À définir une extension YAML réutilisable
- C) À importer un fichier externe
- D) À créer une variable

### Q51. Comment combiner docker-compose.yml (base) et docker-compose.prod.yml (surcharge) ?
- A) docker compose -f docker-compose.yml -f docker-compose.prod.yml up
- B) docker compose --merge up
- C) docker compose --combine up
- D) C'est impossible

### Q52. Que fait `docker compose up --scale api=3` ?
- A) Multiplie les ressources CPU par 3
- B) Lance 3 réplicas du service api
- C) Attend 3 secondes avant de lancer api
- D) Redimensionne le conteneur à 3 GB

### Q53. Quelle syntaxe YAML permet de réutiliser une ancre &common définie plus haut ?
- A) @common
- B) *common
- C) $common
- D) #common

### Q54. Comment vérifier qu'une base PostgreSQL est prête dans un healthcheck ?
- A) curl -f http://localhost:5432
- B) pg_isready -U postgres
- C) psql --check
- D) docker inspect postgres

---

### --- Registry ---

### Q55. Quel est le registry par défaut de Docker ?
- A) GitHub Container Registry
- B) Docker Hub
- C) Google Container Registry
- D) Amazon ECR

### Q56. Quel format suit le semantic versioning ?
- A) v2024.01.15
- B) v1.2.3 (major.minor.patch)
- C) v1-2-3
- D) latest

### Q57. Que fait la commande `docker tag mon-image:latest mon-user/mon-image:v1.0.0` ?
- A) Renomme l'image
- B) Crée un alias (tag) pointant vers la même image
- C) Copie l'image
- D) Upload l'image

### Q58. Quelle commande envoie une image vers un registry ?
- A) docker upload
- B) docker send
- C) docker push
- D) docker publish

### Q59. Pourquoi utiliser un access token plutôt qu'un mot de passe pour Docker Hub ?
- A) C'est plus rapide
- B) C'est révocable et peut avoir des permissions limitées
- C) C'est obligatoire depuis 2023
- D) Ça évite les bugs

### Q60. Comment lancer un registry Docker local ?
- A) docker run -d -p 5000:5000 registry:2
- B) docker registry start
- C) docker-compose up registry
- D) docker init registry

### Q61. Quel est l'avantage d'un registry privé en entreprise ?
- A) C'est gratuit
- B) Sécurité, vitesse (cache local), contrôle des images
- C) Meilleure qualité d'image
- D) Obligatoire pour Docker Compose

### Q62. Que signifie le tag "latest" ?
- A) La version la plus récente officiellement stable
- B) Le dernier push (peut pointer vers n'importe quelle version)
- C) La version avec le plus de téléchargements
- D) La version recommandée par Docker

---

### --- CI/CD ---

### Q63. Que signifie "CD" dans CI/CD ?
- A) Code Deployment
- B) Continuous Delivery ou Continuous Deployment
- C) Container Distribution
- D) Controlled Development

### Q64. Où sont stockés les fichiers workflow GitHub Actions ?
- A) .github/actions/
- B) .github/workflows/
- C) .ci/workflows/
- D) workflows/

### Q65. Comment stocker un token Docker Hub dans GitHub Actions ?
- A) Dans le Dockerfile
- B) Dans le README
- C) Dans GitHub Secrets (Settings > Secrets)
- D) Dans un fichier .env

### Q66. Quelle syntaxe déclenche un workflow sur push vers main ?
- A) on: push: main
- B) on: push: branches: [main]
- C) trigger: push: main
- D) when: branch == main

### Q67. À quoi sert l'action `docker/setup-buildx-action` ?
- A) À installer Docker
- B) À configurer Docker Buildx pour des builds avancés (multi-plateforme, cache, etc.)
- C) À créer un Dockerfile
- D) À démarrer un conteneur

### Q68. Pourquoi builder une image pour amd64 ET arm64 ?
- A) Pour supporter à la fois les PC x86 et les Mac M1/Raspberry Pi
- B) Pour doubler les performances
- C) C'est obligatoire
- D) Pour économiser de l'espace

### Q69. Que fait l'action `actions/checkout@v4` dans un workflow ?
- A) Vérifie la syntaxe du code
- B) Clone le code du repo sur le runner GitHub
- C) Crée une nouvelle branche
- D) Fait un checkout Git en local

### Q70. Comment protéger la branche main et exiger des tests avant merge ?
- A) Ajouter un fichier .protect
- B) Branch protection rules + require status checks (CI) avant merge
- C) Utiliser git config
- D) Créer un webhook

---
