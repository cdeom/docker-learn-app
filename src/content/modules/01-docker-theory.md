---
title: "Docker, Docker Compose et WSL2"
description: "Comprendre les concepts fondamentaux de Docker, Docker Compose et WSL2"
order: 1
duration: "30 min"
icon: "🐳"
xpReward: 100
objectives:
  - "Comprendre ce qu'est Docker et pourquoi l'utiliser"
  - "Connaître Docker Compose et son utilité"
  - "Installer WSL2 et Docker"
---

## 1.1 C'est quoi Docker ?

### Analogie simple

Imagine que tu cuisines un gâteau. Pour le réussir, il te faut :
- La bonne recette
- Les bons ingrédients
- Le bon four à la bonne température

Si tu donnes juste la recette à un ami, il risque d'avoir un four différent, des ingrédients
différents... et le gâteau ne sera pas pareil.

**Docker, c'est comme si tu envoyais le gâteau AVEC le four, les ingrédients et la recette.**
Ton ami n'a qu'à appuyer sur "start" et ça marche pareil que chez toi.

### Définition technique

Docker est un outil qui permet de **packager une application avec tout ce dont elle a besoin**
(code, libraries, configuration, OS) dans un **conteneur** isolé.

```
+--------------------------------------------------+
|              Ton ordinateur (HOST)                |
|                                                  |
|   +------------------+  +------------------+     |
|   |   Conteneur 1    |  |   Conteneur 2    |     |
|   |   (Site web)     |  |   (Base de       |     |
|   |                  |  |    données)       |     |
|   |  - Nginx         |  |  - MySQL         |     |
|   |  - HTML/CSS      |  |  - Données       |     |
|   |  - Config        |  |  - Config        |     |
|   +------------------+  +------------------+     |
|                                                  |
|              Docker Engine                       |
+--------------------------------------------------+
```

### Les concepts clés

| Concept        | Analogie                  | Définition                                      |
|----------------|---------------------------|------------------------------------------------|
| **Image**      | La recette du gâteau      | Un modèle en lecture seule pour créer un conteneur |
| **Conteneur**  | Le gâteau cuit            | Une instance en cours d'exécution d'une image   |
| **Dockerfile** | Les instructions écrites  | Fichier texte qui décrit comment construire l'image |
| **Registry**   | Le livre de recettes      | Un dépôt d'images (ex: Docker Hub)              |

### Image vs Conteneur

```
   IMAGE (modèle)                    CONTENEUR (instance)
   +----------------+               +----------------+
   | nginx:latest   | --- docker run ---> | nginx en cours |
   | (en lecture     |               | d'exécution    |
   |  seule)        |               | (modifiable)   |
   +----------------+               +----------------+
                                    +----------------+
                     --- docker run ---> | autre nginx    |
                                    | indépendant    |
                                    +----------------+

   1 image peut créer N conteneurs !
```

---

## 1.2 C'est quoi Docker Compose ?

### Le problème

Une application réelle a souvent besoin de **plusieurs services** :
- Un serveur web (Nginx)
- Un backend (Node.js, Python...)
- Une base de données (MySQL, PostgreSQL...)

Sans Docker Compose, tu devrais lancer chaque conteneur à la main avec de longues commandes.

### La solution : Docker Compose

Docker Compose permet de **définir et lancer plusieurs conteneurs en une seule commande**
grâce à un fichier `docker-compose.yml`.

```yaml
# docker-compose.yml - Exemple simple
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  database:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: secret
```

```bash
# Une seule commande pour tout lancer !
docker compose up
```

### Comparaison

```
SANS Docker Compose :                 AVEC Docker Compose :

docker run -d \                       docker compose up -d
  --name web \
  -p 8080:80 \                        # C'est tout ! Les 2 services
  nginx                               # démarrent ensemble.

docker run -d \
  --name db \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql
```

---

## 1.3 C'est quoi WSL2 ?

### Le problème

Docker est né sous **Linux**. Si tu es sous **Windows**, Docker ne peut pas fonctionner
directement car Windows et Linux ont des noyaux (kernels) différents.

### La solution : WSL2 (Windows Subsystem for Linux 2)

WSL2 est une fonctionnalité de Windows qui permet de faire tourner un **vrai noyau Linux**
directement dans Windows, sans machine virtuelle lourde.

```
+------------------------------------------+
|            Windows 10/11                 |
|                                          |
|   +----------------------------------+   |
|   |         WSL2 (Linux)             |   |
|   |                                  |   |
|   |   +----------+ +----------+     |   |
|   |   |Conteneur | |Conteneur |     |   |
|   |   |   1      | |   2      |     |   |
|   |   +----------+ +----------+     |   |
|   |                                  |   |
|   |      Docker Engine               |   |
|   +----------------------------------+   |
|                                          |
+------------------------------------------+
```

### Pourquoi WSL2 et pas WSL1 ?

| Critère                  | WSL1          | WSL2              |
|--------------------------|---------------|-------------------|
| Vrai noyau Linux         | Non           | **Oui**           |
| Compatibilité Docker     | Partielle     | **Complète**      |
| Performance fichiers     | Rapide Windows| **Rapide Linux**  |
| Utilisation mémoire      | Légère        | Plus lourde       |

### Installation de WSL2 (Windows)

```powershell
# Étape 1 : Ouvrir PowerShell en Administrateur et taper :
wsl --install

# Cela installe WSL2 + Ubuntu par défaut
# Redémarrer le PC quand demandé

# Étape 2 : Vérifier l'installation
wsl --list --verbose

# Tu devrais voir :
#   NAME      STATE    VERSION
#   Ubuntu    Running  2          <-- "2" = WSL2 OK !
```

> **Note** : Si tu es sous **Linux ou Mac**, tu n'as pas besoin de WSL2.
> Docker fonctionne nativement.

---

## 1.4 Installation de Docker

### Sur Windows (avec WSL2)

1. Télécharger **Docker Desktop** : https://www.docker.com/products/docker-desktop/
2. Installer et cocher "Use WSL 2 based engine"
3. Redémarrer
4. Ouvrir un terminal et vérifier :

```bash
docker --version
# Docker version 27.x.x

docker compose version
# Docker Compose version v2.x.x
```

### Sur Linux (Ubuntu/Debian)

```bash
# Méthode rapide officielle
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter ton user au groupe docker (pour ne pas mettre sudo à chaque fois)
sudo usermod -aG docker $USER

# Déconnecter/reconnecter ta session, puis vérifier :
docker --version
docker compose version
```

### Sur Mac

1. Télécharger **Docker Desktop pour Mac**
2. Installer et lancer
3. Vérifier dans le terminal :

```bash
docker --version
docker compose version
```

---

## 1.5 Les commandes essentielles Docker

```bash
# --- IMAGES ---
docker pull nginx              # Télécharger une image depuis Docker Hub
docker images                  # Lister les images locales
docker rmi nginx               # Supprimer une image

# --- CONTENEURS ---
docker run nginx               # Créer et démarrer un conteneur
docker run -d nginx             # Pareil, mais en arrière-plan (détaché)
docker run -d -p 8080:80 nginx  # Mapper le port 8080 (host) vers 80 (conteneur)
docker run -d --name monsite nginx  # Donner un nom au conteneur

docker ps                      # Lister les conteneurs en cours
docker ps -a                   # Lister TOUS les conteneurs (même arrêtés)

docker stop monsite            # Arrêter un conteneur
docker start monsite           # Redémarrer un conteneur arrêté
docker rm monsite              # Supprimer un conteneur (doit être arrêté)

docker logs monsite            # Voir les logs d'un conteneur
docker exec -it monsite bash   # Entrer DANS un conteneur (terminal interactif)

# --- NETTOYAGE ---
docker system prune            # Supprimer tout ce qui est inutilisé
```

### Le flag `-p` (ports) expliqué

```
docker run -d -p 8080:80 nginx
                  |    |
                  |    +-- Port DANS le conteneur (Nginx écoute sur 80)
                  +------- Port sur TON PC (tu accèdes via localhost:8080)

Ton navigateur --> localhost:8080 --> Docker --> conteneur:80 --> Nginx
```

---
