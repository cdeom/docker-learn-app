---
title: "Docker, Docker Compose et WSL2"
description: "Comprendre les concepts fondamentaux de Docker, Docker Compose et WSL2"
order: 1
duration: "30 min"
icon: "🐳"
xpReward: 100
objectives:
  - "Comprendre ce qu'est Docker et pourquoi l'utiliser"
  - "Connaitre Docker Compose et son utilite"
  - "Installer WSL2 et Docker"
---

## 1.1 C'est quoi Docker ?

### Analogie simple

Imagine que tu cuisines un gateau. Pour le reussir, il te faut :
- La bonne recette
- Les bons ingredients
- Le bon four a la bonne temperature

Si tu donnes juste la recette a un ami, il risque d'avoir un four different, des ingredients
differents... et le gateau ne sera pas pareil.

**Docker, c'est comme si tu envoyais le gateau AVEC le four, les ingredients et la recette.**
Ton ami n'a qu'a appuyer sur "start" et ca marche pareil que chez toi.

### Definition technique

Docker est un outil qui permet de **packager une application avec tout ce dont elle a besoin**
(code, libraries, configuration, OS) dans un **conteneur** isole.

```
+--------------------------------------------------+
|              Ton ordinateur (HOST)                |
|                                                  |
|   +------------------+  +------------------+     |
|   |   Conteneur 1    |  |   Conteneur 2    |     |
|   |   (Site web)     |  |   (Base de       |     |
|   |                  |  |    donnees)       |     |
|   |  - Nginx         |  |  - MySQL         |     |
|   |  - HTML/CSS      |  |  - Donnees       |     |
|   |  - Config        |  |  - Config        |     |
|   +------------------+  +------------------+     |
|                                                  |
|              Docker Engine                       |
+--------------------------------------------------+
```

### Les concepts cles

| Concept        | Analogie                  | Definition                                      |
|----------------|---------------------------|------------------------------------------------|
| **Image**      | La recette du gateau      | Un modele en lecture seule pour creer un conteneur |
| **Conteneur**  | Le gateau cuit            | Une instance en cours d'execution d'une image   |
| **Dockerfile** | Les instructions ecrites  | Fichier texte qui decrit comment construire l'image |
| **Registry**   | Le livre de recettes      | Un depot d'images (ex: Docker Hub)              |

### Image vs Conteneur

```
   IMAGE (modele)                    CONTENEUR (instance)
   +----------------+               +----------------+
   | nginx:latest   | --- docker run ---> | nginx en cours |
   | (en lecture     |               | d'execution    |
   |  seule)        |               | (modifiable)   |
   +----------------+               +----------------+
                                    +----------------+
                     --- docker run ---> | autre nginx    |
                                    | independant    |
                                    +----------------+

   1 image peut creer N conteneurs !
```

---

## 1.2 C'est quoi Docker Compose ?

### Le probleme

Une application reelle a souvent besoin de **plusieurs services** :
- Un serveur web (Nginx)
- Un backend (Node.js, Python...)
- Une base de donnees (MySQL, PostgreSQL...)

Sans Docker Compose, tu devrais lancer chaque conteneur a la main avec de longues commandes.

### La solution : Docker Compose

Docker Compose permet de **definir et lancer plusieurs conteneurs en une seule commande**
grace a un fichier `docker-compose.yml`.

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
  nginx                               # demarrent ensemble.

docker run -d \
  --name db \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql
```

---

## 1.3 C'est quoi WSL2 ?

### Le probleme

Docker est ne sous **Linux**. Si tu es sous **Windows**, Docker ne peut pas fonctionner
directement car Windows et Linux ont des noyaux (kernels) differents.

### La solution : WSL2 (Windows Subsystem for Linux 2)

WSL2 est une fonctionnalite de Windows qui permet de faire tourner un **vrai noyau Linux**
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

| Critere                  | WSL1          | WSL2              |
|--------------------------|---------------|-------------------|
| Vrai noyau Linux         | Non           | **Oui**           |
| Compatibilite Docker     | Partielle     | **Complete**      |
| Performance fichiers     | Rapide Windows| **Rapide Linux**  |
| Utilisation memoire      | Legere        | Plus lourde       |

### Installation de WSL2 (Windows)

```powershell
# Etape 1 : Ouvrir PowerShell en Administrateur et taper :
wsl --install

# Cela installe WSL2 + Ubuntu par defaut
# Redemarrer le PC quand demande

# Etape 2 : Verifier l'installation
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

1. Telecharger **Docker Desktop** : https://www.docker.com/products/docker-desktop/
2. Installer et cocher "Use WSL 2 based engine"
3. Redemarrer
4. Ouvrir un terminal et verifier :

```bash
docker --version
# Docker version 27.x.x

docker compose version
# Docker Compose version v2.x.x
```

### Sur Linux (Ubuntu/Debian)

```bash
# Methode rapide officielle
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter ton user au groupe docker (pour ne pas mettre sudo a chaque fois)
sudo usermod -aG docker $USER

# Deconnecter/reconnecter ta session, puis verifier :
docker --version
docker compose version
```

### Sur Mac

1. Telecharger **Docker Desktop pour Mac**
2. Installer et lancer
3. Verifier dans le terminal :

```bash
docker --version
docker compose version
```

---

## 1.5 Les commandes essentielles Docker

```bash
# --- IMAGES ---
docker pull nginx              # Telecharger une image depuis Docker Hub
docker images                  # Lister les images locales
docker rmi nginx               # Supprimer une image

# --- CONTENEURS ---
docker run nginx               # Creer et demarrer un conteneur
docker run -d nginx             # Pareil, mais en arriere-plan (detache)
docker run -d -p 8080:80 nginx  # Mapper le port 8080 (host) vers 80 (conteneur)
docker run -d --name monsite nginx  # Donner un nom au conteneur

docker ps                      # Lister les conteneurs en cours
docker ps -a                   # Lister TOUS les conteneurs (meme arretes)

docker stop monsite            # Arreter un conteneur
docker start monsite           # Redemarrer un conteneur arrete
docker rm monsite              # Supprimer un conteneur (doit etre arrete)

docker logs monsite            # Voir les logs d'un conteneur
docker exec -it monsite bash   # Entrer DANS un conteneur (terminal interactif)

# --- NETTOYAGE ---
docker system prune            # Supprimer tout ce qui est inutilise
```

### Le flag `-p` (ports) explique

```
docker run -d -p 8080:80 nginx
                  |    |
                  |    +-- Port DANS le conteneur (Nginx ecoute sur 80)
                  +------- Port sur TON PC (tu accedes via localhost:8080)

Ton navigateur --> localhost:8080 --> Docker --> conteneur:80 --> Nginx
```

---

