---
title: "QCM - Teste tes connaissances"
description: "20 questions pour valider ta comprehension de Docker"
order: 6
duration: "15 min"
icon: "❓"
xpReward: 500
objectives:
  - "Valider les connaissances Docker"
  - "Identifier les points a reviser"
---

Reponds aux questions suivantes. Les reponses sont en fin de document.

### Q1. Qu'est-ce qu'un conteneur Docker ?
- A) Un logiciel de virtualisation comme VirtualBox
- B) Un environnement isole qui contient une application et ses dependances
- C) Un systeme d'exploitation complet
- D) Un outil de compilation de code

### Q2. Quelle est la difference entre une image et un conteneur ?
- A) Il n'y a pas de difference
- B) L'image est en cours d'execution, le conteneur est le modele
- C) L'image est le modele (lecture seule), le conteneur est une instance en execution
- D) Le conteneur est plus leger que l'image

### Q3. A quoi sert WSL2 ?
- A) A remplacer Windows par Linux
- B) A faire tourner un noyau Linux sous Windows
- C) A accelerer Docker sur Mac
- D) A compiler du code C++

### Q4. Quelle commande lance un conteneur en arriere-plan ?
- A) `docker run nginx`
- B) `docker run -d nginx`
- C) `docker start -background nginx`
- D) `docker run --silent nginx`

### Q5. Que fait `-p 8080:80` dans `docker run -p 8080:80 nginx` ?
- A) Limite la memoire a 8080 MB et le CPU a 80%
- B) Mappe le port 80 du host vers le port 8080 du conteneur
- C) Mappe le port 8080 du host vers le port 80 du conteneur
- D) Ouvre les ports 8080 et 80 sur le host

### Q6. Quelle commande permet de lister les conteneurs en cours d'execution ?
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
- A) Telecharge et installe Alpine Linux
- B) Definit l'image de base a partir de laquelle construire
- C) Lance un conteneur Nginx
- D) Copie les fichiers d'Alpine vers Nginx

### Q9. Quelle commande construit une image depuis un Dockerfile ?
- A) `docker create -t mon-image .`
- B) `docker compile -t mon-image .`
- C) `docker build -t mon-image .`
- D) `docker make -t mon-image .`

### Q10. A quoi sert Docker Compose ?
- A) A compiler du code Docker
- B) A definir et gerer des applications multi-conteneurs
- C) A remplacer Docker
- D) A creer des images plus rapidement

### Q11. Quel est le format du fichier Docker Compose ?
- A) JSON
- B) XML
- C) YAML
- D) TOML

### Q12. Quelle commande lance tous les services definis dans docker-compose.yml ?
- A) `docker compose start`
- B) `docker compose run`
- C) `docker compose up`
- D) `docker compose launch`

### Q13. Que fait `docker exec -it mon-conteneur bash` ?
- A) Supprime le conteneur
- B) Ouvre un terminal interactif dans le conteneur
- C) Execute un script bash sur le host
- D) Redemarre le conteneur

### Q14. Pourquoi preferer `nginx:alpine` a `nginx` ?
- A) Alpine est plus securise
- B) Alpine est plus rapide
- C) Alpine est beaucoup plus leger (~43 MB vs ~187 MB)
- D) Alpine supporte plus de fonctionnalites

### Q15. Que fait l'instruction `COPY index.html /usr/share/nginx/html/` ?
- A) Telecharge index.html depuis Internet
- B) Copie index.html depuis ton PC vers l'image
- C) Cree un nouveau fichier index.html vide
- D) Supprime l'ancien index.html

### Q16. Que fait `docker system prune` ?
- A) Met a jour Docker
- B) Supprime tous les conteneurs en cours
- C) Supprime les ressources Docker inutilisees (conteneurs arretes, images orphelines, etc.)
- D) Reinstalle Docker

### Q17. Qu'est-ce que le flag `-v ~/data:/app/data` fait ?
- A) Definit la version de Docker
- B) Active le mode verbose
- C) Monte un dossier du host dans le conteneur (volume)
- D) Verifie le conteneur

### Q18. Que se passe-t-il si tu modifies un fichier HTML et que tu rafraichis la page
(sans volume, image custom) ?
- A) Le changement est visible immediatement
- B) Rien ne change car l'image doit etre reconstruite
- C) Docker detecte automatiquement les changements
- D) Le conteneur redemarre tout seul

### Q19. Quelle version de WSL est necessaire pour Docker ?
- A) WSL1
- B) WSL2
- C) WSL3
- D) N'importe quelle version

### Q20. Que fait `docker compose down` ?
- A) Arrete les conteneurs seulement
- B) Arrete et supprime les conteneurs, reseaux et volumes anonymes du projet
- C) Supprime les images
- D) Desinstalle Docker Compose

---

