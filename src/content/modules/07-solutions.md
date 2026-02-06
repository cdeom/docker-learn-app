---
title: "Solutions et aide-mémoire"
description: "Réponses aux QCM, cheat sheets et erreurs fréquentes"
order: 7
duration: "10 min"
icon: "✅"
xpReward: 30
objectives:
  - "Vérifier ses réponses au QCM"
  - "Avoir un aide-mémoire des commandes"
---

## 7.1 Réponses au QCM

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

---

## 7.2 Solution complète de l'exercice

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

## 7.3 Aide-Mémoire (Cheat Sheet)

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

---

## 7.4 Erreurs fréquentes et solutions

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

> **Félicitations !** Tu as maintenant les bases pour utiliser Docker.
> Le prochain pas : explorer les réseaux Docker, les volumes persistants,
> et les applications multi-conteneurs plus complexes avec Docker Compose !

