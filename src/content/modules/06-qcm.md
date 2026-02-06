---
title: "QCM - Teste tes connaissances"
description: "20 questions pour valider ta compréhension de Docker"
order: 6
duration: "15 min"
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

